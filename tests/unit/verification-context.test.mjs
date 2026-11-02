import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { fingerprint, verificationFingerprint, runVerification, evidenceFor, writeCheckpoint } from "../../src/verification-plan.mjs";
import { recordObservation, saveLesson, recordPath } from "../../src/knowledge/store.mjs";
import { verifyLesson, eligible } from "../../src/knowledge/eligibility.mjs";
import { explainLesson, recall } from "../../src/knowledge/recall.mjs";
import { atomicJson, hash } from "../../src/lib/local-data.mjs";
import { configureHooks } from "../../src/hooks/install.mjs";

const toolkit = fileURLToPath(new URL("../../", import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy context fixture "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const dir of ["Packages", "ProjectSettings", "Assets"]) fs.mkdirSync(path.join(root, dir));
  fs.writeFileSync(path.join(root, "Packages/manifest.json"), '{"dependencies":{}}');
  fs.writeFileSync(path.join(root, "Packages/packages-lock.json"), '{"dependencies":{}}');
  fs.writeFileSync(path.join(root, "ProjectSettings/ProjectVersion.txt"), "m_EditorVersion: 6000.0.1f1\n");
  fs.writeFileSync(path.join(root, "Assets/Probe.cs"), "// fixture source\n");
  return root;
}
function lesson(root, receipt) {
  recordObservation(root, { schemaVersion: 1, id: "observed-failure", taskId: receipt.taskId, operation: receipt.commandId, outcome: "fail", signature: "Missing package lock" });
  const candidate = saveLesson(root, { schemaVersion: 1, id: "lock-recovery", scope: "project", status: "candidate", trigger: "Missing package lock", action: "Restore the project package lock and verify inspection", nonApplicability: ["Runtime defects"], evidenceRefs: ["observed-failure"] });
  return verifyLesson(root, candidate.id, receipt.id);
}

test("consumer receipt is invalid after deleting an undeclared lock; old lesson cannot be reused", t => {
  const root = fixture(t), files = ["Assets/Probe.cs"];
  fs.rmSync(path.join(root, "Packages/packages-lock.json"));
  const originalFailure = runVerification(toolkit, root, { id: "validate", taskId: "context-repair", files });
  assert.equal(originalFailure.status, "degraded");
  recordObservation(root, { schemaVersion: 1, id: "observed-failure", taskId: "context-repair", operation: "validate", outcome: "fail", signature: "Missing package lock" });
  fs.writeFileSync(path.join(root, "Packages/packages-lock.json"), '{"dependencies":{}}');
  const receipt = runVerification(toolkit, root, { id: "validate", taskId: "context-repair", files });
  assert.equal(receipt.status, "pass");
  const verified = lesson(root, receipt);
  assert.equal(eligible(root, verified), true);
  fs.rmSync(path.join(root, "Packages/packages-lock.json"));
  const current = runVerification(toolkit, root, { id: "validate", taskId: "context-repair", files });
  assert.equal(current.status, "degraded");
  assert.equal(evidenceFor(root, receipt.taskId, files).length, 0);
  assert.equal(eligible(root, verified), false);
  assert.throws(() => verifyLesson(root, verified.id, receipt.id), /Fresh successful/);
  assert.ok(explainLesson(root, verified.id).reasons.includes("verification-context-changed"));
});

test("implicit settings/asmdef changes and checker source changes invalidate fingerprints", t => {
  const root = fixture(t), files = ["Assets/Probe.cs"];
  const baseline = verificationFingerprint(root, files);
  for (const [name, text] of [
    ["Packages/manifest.json", '{"dependencies":{"com.example":"1"}}'],
    ["ProjectSettings/ProjectVersion.txt", "m_EditorVersion: 6000.0.2f1\n"],
    ["ProjectSettings/GraphicsSettings.asset", "m_CustomRenderPipeline: {fileID: 1}"],
    ["ProjectSettings/EditorBuildSettings.asset", "m_Scenes: []"],
    ["Assets/Runtime.asmdef", '{"name":"Runtime","references":["UnityEditor"]}'],
  ]) {
    const file = path.join(root, name), original = fs.existsSync(file) ? fs.readFileSync(file) : null;
    fs.writeFileSync(file, text);
    assert.notEqual(verificationFingerprint(root, files), baseline, name);
    if (original) fs.writeFileSync(file, original); else fs.rmSync(file);
    assert.equal(verificationFingerprint(root, files), baseline);
  }
  const checker = path.join(root, "checker");
  fs.mkdirSync(path.join(checker, "harness"), { recursive: true });
  const harness = path.join(checker, "harness/dreamy-harness");
  fs.writeFileSync(harness, "checker-v1");
  const before = verificationFingerprint(root, files, { toolkitRoot: checker });
  fs.writeFileSync(harness, "checker-v2");
  assert.notEqual(verificationFingerprint(root, files, { toolkitRoot: checker }), before);
  const parser = path.join(checker, "src/lib/unity-test-results.mjs");
  fs.mkdirSync(path.dirname(parser), { recursive: true });
  fs.writeFileSync(parser, "parser-v1");
  const beforeParser = verificationFingerprint(root, files, { toolkitRoot: checker });
  fs.writeFileSync(parser, "parser-v2");
  assert.notEqual(verificationFingerprint(root, files, { toolkitRoot: checker }), beforeParser);
  // Tooling metadata must not contaminate project assembly inspection.
  fs.mkdirSync(path.join(root, ".dreamy/lab"), { recursive: true });
  fs.writeFileSync(path.join(root, ".dreamy/lab/Unsafe.asmdef"), "not project source");
  assert.equal(verificationFingerprint(root, files), baseline);
});

test("Unity execution fingerprints include other source/assets and Editor configuration", t => {
  const root = fixture(t), files = ["Assets/Probe.cs"];
  const context = { commandId: "unit" };
  const before = verificationFingerprint(root, files, context);
  fs.writeFileSync(path.join(root, "Assets/TestData.asset"), "test fixture data");
  assert.notEqual(verificationFingerprint(root, files, context), before);
  const withData = verificationFingerprint(root, files, context);
  const oldPath = process.env.DREAMY_UNITY_PATH;
  try {
    process.env.DREAMY_UNITY_PATH = path.join(root, "another Editor");
    assert.notEqual(verificationFingerprint(root, files, context), withData);
  } finally {
    if (oldPath === undefined) delete process.env.DREAMY_UNITY_PATH; else process.env.DREAMY_UNITY_PATH = oldPath;
  }
});

test("lesson explanation is read-only and agrees with recall relevance/session deduplication", t => {
  const root = fixture(t), files = ["Assets/Probe.cs"];
  const receipt = runVerification(toolkit, root, { id: "validate", taskId: "explain-lesson", files });
  const verified = lesson(root, receipt);
  const file = recordPath(root, "lessons", verified.id), original = fs.readFileSync(file);
  const options = { query: "Missing package lock", session: "new-session" };
  assert.equal(explainLesson(root, verified.id, options).selected, true);
  assert.equal(fs.existsSync(path.join(root, ".dreamy/recall")), false);
  assert.ok(explainLesson(root, verified.id, { query: "camera physics", session: "other" }).recallReasons.includes("query-no-match"));
  assert.equal(recall(root, options.query, { session: options.session }).items.length, 1);
  assert.ok(explainLesson(root, verified.id, options).recallReasons.includes("session-deduplicated"));
  assert.equal(recall(root, options.query, { session: options.session }).items.length, 0);
  assert.deepEqual(fs.readFileSync(file), original);
  const input = JSON.parse(original);
  atomicJson(file, { ...input, reviewAfter: "2000-01-01T00:00:00Z" });
  assert.ok(explainLesson(root, verified.id).reasons.includes("review-expired"));
  atomicJson(file, { ...input, applicability: { platforms: ["unsupported-platform"], packages: { "com.example": "1" } } });
  const rejected = explainLesson(root, verified.id);
  assert.ok(rejected.reasons.includes("platform-mismatch"));
  assert.ok(rejected.reasons.includes("package-version-mismatch"));
  atomicJson(file, input);
  // The CLI returns the same diagnostic through the existing command group.
  const cli = spawnSync(process.execPath, [path.join(toolkit, "src/cli.js"), "lessons", "explain", verified.id, "--target", root, "--query", options.query, "--session", options.session, "--json"], { encoding: "utf8" });
  assert.equal(cli.status, 0, cli.stderr);
  assert.ok(JSON.parse(cli.stdout).recallReasons.includes("session-deduplicated"));
});

test("legacy consumer receipts require re-verification and log changes have explicit reasons", t => {
  const root = fixture(t), files = ["Assets/Probe.cs"];
  const receipt = runVerification(toolkit, root, { id: "validate", taskId: "old-receipt", files });
  const verified = lesson(root, receipt);
  const receiptFile = path.join(root, `.dreamy/evidence/${hash(receipt.id)}.json`);
  atomicJson(receiptFile, { ...receipt, verificationFingerprint: fingerprint(root, files) });
  assert.equal(evidenceFor(root, receipt.taskId, files).length, 0);
  assert.ok(explainLesson(root, verified.id).reasons.includes("verification-context-changed"));
  atomicJson(receiptFile, receipt);
  fs.appendFileSync(path.join(root, `.dreamy/evidence/${hash(receipt.id)}.log`), "modified");
  assert.ok(explainLesson(root, verified.id).reasons.includes("receipt-log-changed"));
});

test("installed hook runtime agrees on checker freshness and rejects a stale static receipt", t => {
  const root = fixture(t), files = ["notes.txt"];
  fs.writeFileSync(path.join(root, files[0]), "fixture task");
  const receipt = runVerification(toolkit, root, { id: "validate", taskId: "hook-freshness", files });
  assert.equal(receipt.status, "pass");
  configureHooks(toolkit, root, { profile: "standard" });
  writeCheckpoint(root, "fixture-hook-session", { schemaVersion: 1, taskId: receipt.taskId, status: "active", files });
  const runner = path.join(root, ".dreamy-codex/hooks-runtime/src/hooks/runner.mjs");
  const invoke = () => spawnSync(process.execPath, [runner, "--root", root, "--policy", path.join(root, ".dreamy-codex/hook-policy.json")], { encoding: "utf8", input: JSON.stringify({ hook_event_name: "Stop", stop_hook_active: false, session_id: "fixture-hook-session", cwd: root }) });
  const fresh = invoke();
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.equal(fresh.stderr, "");
  assert.equal(fresh.stdout, "", fresh.stderr);
  fs.rmSync(path.join(root, "Packages/packages-lock.json"));
  const stale = invoke();
  assert.equal(stale.status, 0, stale.stderr);
  assert.equal(JSON.parse(stale.stdout).decision, "block");
});
