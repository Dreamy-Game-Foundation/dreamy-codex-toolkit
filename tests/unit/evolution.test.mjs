import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  hash,
  inside,
  readJson,
  atomicJson,
  bounded,
} from "../../src/lib/local-data.mjs";
import {
  recordObservation,
  saveLesson,
  listRecords,
  projectIdentity,
  recordPath,
  pruneObservations,
} from "../../src/knowledge/store.mjs";
import { eligible, verifyLesson } from "../../src/knowledge/eligibility.mjs";
import { recall } from "../../src/knowledge/recall.mjs";
import {
  fingerprint,
  writeCheckpoint,
  runVerification,
  checkpointPath,
} from "../../src/verification-plan.mjs";
import {
  configureHooks,
  removeHooks,
  hooksDoctor,
} from "../../src/hooks/install.mjs";
import { dispatch } from "../../src/hooks/dispatcher.mjs";
import {
  proposeSkill,
  promoteSkill,
  draftSkill,
  prepareSkillEvaluation,
  promotedSkillSnapshot,
} from "../../src/skill-evolution.mjs";
import { fixtureSmoke } from "../../scripts/hook-smoke.mjs";
import { rolloutSnapshot } from "../../src/rollout-snapshot.mjs";
import { resolvePolicy } from "../../src/hooks/policy.mjs";
import { probeNativeHooks } from "../../src/hooks/native-probe.mjs";
const toolkit = fileURLToPath(new URL("../../", import.meta.url));
function workspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy evolution "));
  fs.writeFileSync(path.join(root, "source.txt"), "original");
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function seed(root) {
  recordObservation(root, {
    schemaVersion: 1,
    id: "failure",
    taskId: "pack-task",
    operation: "pack",
    outcome: "fail",
    signature: "npm platform executable ENOENT token=secret123",
  });
  const l = saveLesson(root, {
    schemaVersion: 1,
    id: "platform-npm",
    scope: "project",
    status: "candidate",
    trigger: "npm platform executable ENOENT",
    action: "Resolve platform executable then test the target OS",
    evidenceRefs: ["failure"],
  });
  const receipt = {
    schemaVersion: 1,
    id: "fixture-receipt",
    taskId: "pack-task",
    commandId: "pack",
    platform: process.platform,
    nodeVersion: process.version,
    verificationFingerprint: fingerprint(root, ["source.txt"]),
    logHash: hash("fixture-log"),
    files: ["source.txt"],
    sourceFingerprint: fingerprint(root, ["source.txt"]),
    status: "pass",
    exitCode: 0,
    inputsUnchanged: true,
  };
  atomicJson(path.join(root, ".dreamy/evidence/fixture.json"), receipt);
  fs.writeFileSync(
    path.join(root, ".dreamy/evidence/fixture.log"),
    "fixture-log",
  );
  return { l, receipt };
}
test("lessons require failure and fresh resolution; recall is scoped, capped and deduplicated", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  assert.equal(l.status, "candidate");
  assert.equal(recall(root, "npm platform ENOENT").items.length, 0);
  assert.throws(() => verifyLesson(root, l.id, "missing"), /receipt required/);
  const verified = verifyLesson(root, l.id, receipt.id);
  assert.equal(verified.status, "verified-local");
  const found = recall(root, "npm platform ENOENT", { session: "one" });
  assert.equal(found.items.length, 1);
  assert.ok(found.bytes <= 1000);
  assert.equal(found.tokens, null);
  assert.equal(
    recall(root, "npm platform ENOENT", { session: "one" }).items.length,
    0,
  );
  assert.equal(
    recall(root, "unrelated UI camera layout", { session: "no-hit" }).items
      .length,
    0,
  );
  assert.equal(eligible(workspace(t), verified), false);
  fs.writeFileSync(path.join(root, "source.txt"), "changed");
  assert.equal(
    recall(root, "npm platform ENOENT", { session: "two" }).items.length,
    0,
  );
  assert.equal(
    JSON.stringify(listRecords(root, "observations")).includes("secret123"),
    false,
  );
});
test("record boundaries reject traversal, symlinks, duplicate overwrite and missing evidence", (t) => {
  const root = workspace(t);
  assert.throws(() => inside(root, "../escape"), /escapes/);
  assert.throws(() => recordPath(root, "lessons", "../bad"), /Invalid/);
  if (process.platform !== "win32") {
    fs.symlinkSync(os.tmpdir(), path.join(root, "linked"));
    assert.throws(() => inside(root, "linked/file"), /Symlink/);
  }
  assert.throws(
    () =>
      saveLesson(root, {
        schemaVersion: 1,
        id: "x",
        scope: "project",
        status: "approved",
        trigger: "x",
        action: "x",
        evidenceRefs: ["none"],
      }),
    /candidate/,
  );
  const { l } = seed(root);
  assert.equal(saveLesson(root, { ...l }).id, l.id);
  assert.equal(listRecords(root, "lessons").length, 1);
});
test("observation retention preserves referenced failures", (t) => {
  const root = workspace(t);
  seed(root);
  recordObservation(root, {
    schemaVersion: 1,
    id: "unreferenced",
    operation: "check",
    outcome: "fail",
  });
  const result = pruneObservations(root, {
    now: Date.now() + 30 * 86400000,
    maxBytes: 1,
  });
  assert.equal(result.removed, 1);
  assert.equal(listRecords(root, "observations").length, 1);
});
test("native protocol: silent no-op, session dedupe, Stop cap and interruption", (t) => {
  const root = workspace(t),
    base = {
      cwd: root,
      session_id: "session",
      hook_event_name: "SessionStart",
      source: "resume",
    };
  assert.equal(
    dispatch(base, { root, policy: { profile: "minimal" } }).output,
    null,
  );
  writeCheckpoint(root, "session", {
    schemaVersion: 1,
    taskId: "test",
    status: "active",
    files: ["source.txt"],
    nextAction: "Inspect source",
  });
  assert.ok(
    dispatch(base, {
      root,
      policy: { profile: "minimal" },
    }).output.hookSpecificOutput.additionalContext.includes("Inspect source"),
  );
  assert.equal(
    dispatch(base, { root, policy: { profile: "minimal" } }).output,
    null,
  );
  const stop = { ...base, hook_event_name: "Stop", stop_hook_active: false };
  assert.equal(
    dispatch(stop, { root, policy: { profile: "standard" } }).output.decision,
    "block",
  );
  assert.equal(
    dispatch(stop, { root, policy: { profile: "standard" } }).output,
    null,
  );
  dispatch(
    { ...base, hook_event_name: "Interrupt" },
    { root, policy: { profile: "standard" } },
  );
  assert.equal(readJson(checkpointPath(root, "session")).status, "cancelled");
  assert.equal(
    dispatch(
      { ...stop, session_id: "session" },
      { root, policy: { profile: "standard" } },
    ).output,
    null,
  );
  assert.equal(
    dispatch(
      { ...stop, stop_hook_active: true },
      { root, policy: { profile: "standard" } },
    ).output,
    null,
  );
});
test("hook controls, native deny shape and Unicode caps", (t) => {
  const root = workspace(t),
    event = {
      cwd: root,
      session_id: "x",
      hook_event_name: "PreToolUse",
      tool_name: "apply_patch",
      tool_input: {
        command:
          "*** Begin Patch\n*** Delete File: Assets/A.meta\n*** End Patch",
      },
    };
  assert.equal(
    dispatch(event, { root, policy: { profile: "minimal" } }).output,
    null,
  );
  assert.equal(
    dispatch(event, { root, policy: { profile: "strict" } }).output
      .hookSpecificOutput.permissionDecision,
    "deny",
  );
  assert.equal(
    dispatch(event, {
      root,
      policy: { profile: "strict", disabled: ["serialized-risk"] },
    }).output,
    null,
  );
  assert.throws(
    () => dispatch(event, { root, policy: { profile: "typo" } }),
    /Unknown/,
  );
  assert.ok(Buffer.byteLength(bounded("😀".repeat(100), 10)) <= 10);
});
test("policy applies lower resource limits and rejects typos or oversized budgets", (t) => {
  const root = workspace(t);
  assert.equal(resolvePolicy({ maxOutputBytes: 80 }).maxOutputBytes, 80);
  for (const input of [
    { deadlineMs: 251 },
    { maxInputBytes: 0 },
    { taskContextBytes: -1 },
    { maxOutputBytes: 1001 },
    { typo: true },
  ])
    assert.throws(() => resolvePolicy(input), /Invalid|Unknown/);
  const event = {
    cwd: root,
    session_id: "capped",
    hook_event_name: "SessionStart",
  };
  writeCheckpoint(root, "capped", {
    schemaVersion: 1,
    taskId: "cap",
    status: "active",
    files: ["source.txt"],
    nextAction: "Inspect source",
  });
  assert.equal(
    dispatch(event, {
      root,
      policy: { profile: "minimal", taskContextBytes: 0 },
    }).output,
    null,
  );
  assert.ok(dispatch(event, { root, policy: { profile: "minimal" } }).output);
});
test("native probe reports runtime trust and discovery without claiming event delivery", async (t) => {
  const root = workspace(t);
  configureHooks(toolkit, root);
  const config = readJson(path.join(root, ".codex/hooks.json"));
  const hooks = Object.entries(config.hooks).map(([event, groups]) => ({
    sourcePath: path.join(root, ".codex/hooks.json"),
    command: groups[0].hooks[0].command,
    eventName: event[0].toLowerCase() + event.slice(1),
    enabled: true,
    trustStatus: "untrusted",
    currentHash: "runtime-hash",
  }));
  let closed = 0;
  const client = {
    initialize: async () => ({ userAgent: "fixture-runtime" }),
    request: async (method) =>
      method === "hooks/list"
        ? { data: [{ cwd: root, hooks, errors: [], warnings: [] }] }
        : { config: { features: { hooks: true } }, layers: [] },
    close: () => closed++,
  };
  const untrusted = await probeNativeHooks(root, { client });
  assert.equal(untrusted.discovery, "complete");
  assert.equal(untrusted.trust, "requires-native-review");
  hooks.forEach((h) => (h.trustStatus = "trusted"));
  const trusted = await probeNativeHooks(root, { client });
  assert.equal(trusted.trust, "trusted");
  assert.equal(trusted.operational, false);
  assert.equal(trusted.modelCalls, 0);
  hooks.pop();
  assert.equal(
    (await probeNativeHooks(root, { client })).discovery,
    "incomplete",
  );
  client.initialize = async () => {
    throw Error("fixture offline");
  };
  assert.equal(
    (await probeNativeHooks(root, { client })).probeStatus,
    "unavailable",
  );
  assert.equal(closed, 4);
});
test("hook lifecycle preserves user hooks and refuses drift; user data survives uninstall", (t) => {
  const root = workspace(t),
    config = path.join(root, ".codex/hooks.json"),
    original = {
      description: "user",
      custom: { keep: 1 },
      hooks: {
        SessionStart: [{ hooks: [{ type: "command", command: "echo user" }] }],
      },
    };
  atomicJson(config, original);
  const planned = configureHooks(toolkit, root, { dryRun: true });
  assert.equal(planned.operational, false);
  assert.deepEqual(readJson(config), original);
  configureHooks(toolkit, root, { profile: "minimal" });
  configureHooks(toolkit, root, { profile: "standard" });
  assert.equal(readJson(config).hooks.SessionStart.length, 2);
  assert.equal(hooksDoctor(root).operational, false);
  atomicJson(path.join(root, ".dreamy/knowledge/keep.json"), { keep: true });
  removeHooks(root);
  assert.deepEqual(readJson(config), original);
  assert.equal(
    readJson(path.join(root, ".dreamy/knowledge/keep.json")).keep,
    true,
  );
  configureHooks(toolkit, root);
  const drift = readJson(config);
  drift.hooks.SessionStart.pop();
  atomicJson(config, drift);
  assert.throws(() => removeHooks(root), /drift/);
});
test("installed fixture smoke is not native lifecycle proof", () => {
  const r = fixtureSmoke();
  assert.equal(r.status, "pass");
  assert.equal(r.nativeLifecycle.status, "not-run");
});
test("runtime and policy changes alter native definitions so exact trust requires review", (t) => {
  const source = workspace(t),
    root = workspace(t);
  for (const rel of [
    "hooks",
    "src/hooks",
    "src/knowledge",
    "src/lib",
    "src/verification-plan.mjs",
  ]) {
    fs.mkdirSync(path.dirname(path.join(source, rel)), { recursive: true });
    fs.cpSync(path.join(toolkit, rel), path.join(source, rel), {
      recursive: true,
    });
  }
  const config = path.join(root, ".codex/hooks.json");
  const command = () => readJson(config).hooks.SessionStart[0].hooks[0].command;
  configureHooks(source, root);
  const first = command();
  configureHooks(source, root);
  assert.equal(command(), first);
  fs.appendFileSync(
    path.join(source, "src/hooks/handlers/session-context.mjs"),
    "\n// updated fixture runtime\n",
  );
  configureHooks(source, root);
  const second = command();
  assert.notEqual(second, first);
  configureHooks(source, root, { maxOutputBytes: 500 });
  assert.notEqual(command(), second);
  assert.equal(
    readJson(path.join(root, ".dreamy-codex/hook-policy.json")).maxOutputBytes,
    500,
  );
});
test("verification does not claim toolkit checks verify unrelated source", (t) => {
  const root = workspace(t);
  const r = runVerification(toolkit, root, {
    id: "validate",
    files: ["source.txt"],
    taskId: "task",
  });
  assert.equal(r.status, "not-run");
  assert.equal(r.exitCode, null);
});
test("candidate skills stay undiscovered until matching semantic report; stale candidates reject", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  verifyLesson(root, l.id, receipt.id);
  const file = path.join(root, "candidate.md");
  fs.writeFileSync(
    file,
    "---\nname: ci-platform\ndescription: Diagnose cross-platform npm executable failures in CI jobs.\n---\n# CI platform\nInspect the actual platform and failed operation.\n## Verification\nRun the relevant command on the affected platform.\n",
  );
  const candidate = proposeSkill(root, l.id, {
    name: "ci-platform",
    input: file,
  });
  assert.equal(
    fs.existsSync(path.join(root, ".agents/skills/ci-platform")),
    false,
  );
  const report = path.join(root, "report.json");
  atomicJson(report, {
    kind: "skill-behavior-evaluation",
    candidateHash: candidate.contentHash,
    status: "pass",
    measurement: "keyword-match",
    criticalFailures: 0,
    cases: [],
  });
  assert.throws(
    () => promoteSkill(root, "ci-platform", { reportFile: report }),
    /behavioral report/,
  );
  fs.appendFileSync(
    path.join(root, ".dreamy/knowledge/skill-candidates/ci-platform/SKILL.md"),
    "changed",
  );
  assert.throws(
    () => promoteSkill(root, "ci-platform", { reportFile: report }),
    /changed/,
  );
});

test("CLI rejects malformed records and reports measured bytes without token claims", (t) => {
  const root = workspace(t),
    input = path.join(root, "bad.json");
  fs.writeFileSync(
    input,
    '{"schemaVersion":99,"operation":"compile","outcome":"pass"}',
  );
  const r = spawnSync(
    process.execPath,
    [
      path.join(toolkit, "src/cli.js"),
      "lessons",
      "record",
      "--target",
      root,
      "--input",
      input,
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /schemaVersion/);
  const report = spawnSync(
    process.execPath,
    [
      path.join(toolkit, "src/cli.js"),
      "context",
      "report",
      "--preset",
      "core",
      "--json",
    ],
    { encoding: "utf8" },
  );
  assert.equal(report.status, 0);
  assert.equal(JSON.parse(report.stdout).tokens, null);
});
test("candidate promotion requires real behavioral artifacts and preserves unrelated skills", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  verifyLesson(root, l.id, receipt.id);
  const file = path.join(root, "candidate.md");
  fs.writeFileSync(
    file,
    "---\nname: platform-proof\ndescription: Diagnose npm executable failures that differ across CI platforms.\n---\n## Verification\nRe-run the original command on each affected platform.\n",
  );
  const candidate = proposeSkill(root, l.id, {
      name: "platform-proof",
      input: file,
    }),
    cases = [];
  for (const [kind, count] of Object.entries(candidate.requiredCases))
    for (let i = 0; i < count; i++) {
      const rel = `evaluations/${kind}-${i}.json`,
        artifact = path.join(root, ".dreamy", rel);
      atomicJson(artifact, {
        kind,
        observedResult: "fixture only; not a real semantic quality claim",
      });
      cases.push({
        id: `${kind}-${i}`,
        kind,
        status: "pass",
        artifactPath: rel,
        artifactHash: hash(fs.readFileSync(artifact)),
      });
    }
  const report = path.join(root, "behavior.json");
  atomicJson(report, {
    kind: "skill-behavior-evaluation",
    candidateHash: candidate.contentHash,
    status: "pass",
    measurement: "observed-agent-behavior",
    criticalFailures: 0,
    cases,
  });
  const dry = promoteSkill(root, "platform-proof", {
    reportFile: report,
    dryRun: true,
  });
  assert.equal(dry.status, "planned");
  assert.equal(fs.existsSync(dry.destination), false);
  fs.writeFileSync(
    path.join(root, ".dreamy", cases[0].artifactPath),
    "tampered",
  );
  assert.throws(
    () => promoteSkill(root, "platform-proof", { reportFile: report }),
    /artifact/,
  );
});
test("hook transaction recovery preserves previous bytes and runtime on interruption", async (t) => {
  const { recoverHooks } = await import("../../src/hooks/install.mjs");
  const root = workspace(t),
    config = path.join(root, ".codex/hooks.json");
  const text =
    '{\r\n  "hooks": {},\r\n  "description": "keep formatting"\r\n}\r\n';
  fs.mkdirSync(path.dirname(config), { recursive: true });
  fs.writeFileSync(config, text);
  configureHooks(toolkit, root);
  removeHooks(root);
  assert.equal(fs.readFileSync(config, "utf8"), text);
  const oldConfig = JSON.parse(text),
    nextConfig = { hooks: { Stop: [] } };
  atomicJson(path.join(root, ".dreamy-codex/hooks-transaction.json"), {
    schemaVersion: 1,
    oldConfig,
    nextConfig,
    oldText: text,
    oldState: null,
    oldPolicy: null,
    hadRuntime: false,
  });
  atomicJson(config, nextConfig);
  assert.equal(recoverHooks(root).status, "recovered");
  assert.equal(fs.readFileSync(config, "utf8"), text);
  assert.equal(
    fs.existsSync(path.join(root, ".dreamy-codex/hooks-transaction.json")),
    false,
  );
});
test("uninstall removes owned hooks but keeps project lessons and promoted skills", (t) => {
  const root = workspace(t),
    cli = path.join(toolkit, "src/cli.js");
  const run = (args) => {
    const r = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return r;
  };
  run(["install", "--target", root, "--preset", "core", "--json"]);
  configureHooks(toolkit, root);
  seed(root);
  fs.mkdirSync(path.join(root, ".agents/skills/user-skill"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(root, ".agents/skills/user-skill/SKILL.md"),
    "user",
  );
  run(["uninstall", "--target", root, "--json"]);
  assert.equal(
    fs.existsSync(path.join(root, ".dreamy-codex/hooks-runtime")),
    false,
  );
  assert.equal(listRecords(root, "lessons").length, 1);
  assert.equal(
    fs.existsSync(path.join(root, ".agents/skills/user-skill/SKILL.md")),
    true,
  );
});

test("compaction does not renew a Stop continuation budget", (t) => {
  const root = workspace(t),
    event = {
      cwd: root,
      session_id: "bounded",
      hook_event_name: "Stop",
      stop_hook_active: false,
    };
  writeCheckpoint(root, "bounded", {
    schemaVersion: 1,
    taskId: "bounded",
    status: "active",
    files: ["source.txt"],
  });
  assert.equal(
    dispatch(event, { root, policy: { profile: "standard" } }).output.decision,
    "block",
  );
  dispatch(
    { ...event, hook_event_name: "PreCompact" },
    { root, policy: { profile: "standard" } },
  );
  assert.equal(
    dispatch(event, { root, policy: { profile: "standard" } }).output,
    null,
  );
});
test("dry-run on an unsupported destructive command is rejected", (t) => {
  const root = workspace(t);
  seed(root);
  const r = spawnSync(
    process.execPath,
    [
      path.join(toolkit, "src/cli.js"),
      "lessons",
      "forget",
      "platform-npm",
      "--target",
      root,
      "--dry-run",
    ],
    { encoding: "utf8" },
  );
  assert.notEqual(r.status, 0);
  assert.equal(listRecords(root, "lessons")[0].status, "candidate");
});
test("wrong platform/command or changed log cannot verify a lesson", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root),
    file = path.join(root, ".dreamy/evidence/fixture.json");
  atomicJson(file, { ...receipt, commandId: "validate" });
  assert.throws(
    () => verifyLesson(root, l.id, receipt.id),
    /command and platform/,
  );
  atomicJson(file, { ...receipt, platform: "different-platform" });
  assert.throws(() => verifyLesson(root, l.id, receipt.id), /Fresh successful/);
  atomicJson(file, receipt);
  fs.writeFileSync(path.join(root, ".dreamy/evidence/fixture.log"), "modified");
  assert.throws(() => verifyLesson(root, l.id, receipt.id), /Fresh successful/);
});

test("failure hook ties a known check to its active task without retaining command secrets", (t) => {
  const root = workspace(t);
  writeCheckpoint(root, "observe", {
    schemaVersion: 1,
    taskId: "pack-task",
    status: "active",
    files: ["source.txt"],
  });
  const event = {
    cwd: root,
    session_id: "observe",
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    tool_use_id: "tool-one",
    tool_input: { command: "npm run pack:smoke --token=secret-data" },
    tool_response: {
      exit_code: 1,
      output: "spawnSync npm.cmd ENOENT password=hidden",
    },
  };
  assert.equal(
    dispatch(event, { root, policy: { profile: "minimal" } }).output,
    null,
  );
  const records = listRecords(root, "observations");
  assert.equal(records.length, 1);
  assert.equal(records[0].taskId, "pack-task");
  assert.equal(records[0].operation, "pack");
  assert.equal(records[0].signature, "ENOENT");
  assert.equal(JSON.stringify(records).includes("secret-data"), false);
});

test("candidate revisions are bounded and canonical skill names cannot be shadowed", async (t) => {
  const { reviseSkill } = await import("../../src/skill-evolution.mjs");
  const root = workspace(t),
    { l, receipt } = seed(root);
  verifyLesson(root, l.id, receipt.id);
  const file = path.join(root, "candidate.md");
  const text =
    "---\nname: bounded-author\ndescription: Diagnose platform-specific npm packaging failures in CI.\n---\n## Verification\nReproduce then verify on the affected operating system.\n";
  fs.writeFileSync(file, text);
  proposeSkill(root, l.id, { name: "bounded-author", input: file });
  assert.equal(reviseSkill(root, "bounded-author", file).revisions, 1);
  assert.equal(reviseSkill(root, "bounded-author", file).revisions, 2);
  assert.throws(
    () => reviseSkill(root, "bounded-author", file),
    /revision limit/,
  );
  assert.throws(
    () => proposeSkill(root, l.id, { name: "unity-testing", input: file }),
    /Canonical skill/,
  );
});

test("lexical recall respects positive, near-miss, conflict and payload budgets", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  verifyLesson(root, l.id, receipt.id);
  const samples = [
    ["npm executable ENOENT", true],
    ["platform executable ENOENT", true],
    ["npm platform executable failure", true],
    ["platform shader rendering", false],
    ["camera layout UI", false],
    ["save migration backup", false],
  ];
  let hits = 0,
    wrong = 0;
  for (let i = 0; i < samples.length; i++) {
    const [query, expected] = samples[i],
      r = recall(root, query, { session: "query-" + i });
    assert.equal(r.items.length > 0, expected);
    if (r.items.length) {
      hits++;
      if (!expected) wrong++;
    }
    assert.ok(Buffer.byteLength(JSON.stringify(r)) + 1 <= 1000);
  }
  assert.equal(wrong, 0);
  assert.equal(hits, 3);
  assert.equal(
    recall(root, "npm executable ENOENT", {
      session: "excluded",
      exclude: [l.id],
    }).items.length,
    0,
  );
});

test("checker or added test inputs invalidate a receipt even if requested source is unchanged", async (t) => {
  const { verificationFingerprint, evidenceFor } = await import(
    "../../src/verification-plan.mjs"
  );
  const root = workspace(t),
    { receipt } = seed(root);
  fs.writeFileSync(path.join(root, "toolkit.json"), "{}");
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ files: ["source.txt"] }),
  );
  const file = path.join(root, ".dreamy/evidence/fixture.json");
  atomicJson(file, {
    ...receipt,
    verificationFingerprint: verificationFingerprint(root, receipt.files),
  });
  assert.equal(evidenceFor(root, receipt.taskId, receipt.files).length, 1);
  fs.mkdirSync(path.join(root, "tests"));
  fs.writeFileSync(
    path.join(root, "tests/new.test.mjs"),
    "changed checker input",
  );
  assert.equal(evidenceFor(root, receipt.taskId, receipt.files).length, 0);
});

test("drafts use fresh verified lessons, remain undiscovered and require concrete evaluation cases", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  assert.throws(
    () => draftSkill(root, l.id, { name: "project-ci-proof" }),
    /Fresh verified/,
  );
  verifyLesson(root, l.id, receipt.id);
  const draft = draftSkill(root, l.id, { name: "project-ci-proof" });
  assert.equal(draft.modelCalls, 0);
  assert.equal(draft.discovered, false);
  assert.equal(
    fs.existsSync(path.join(root, ".agents/skills/project-ci-proof")),
    false,
  );
  const skill = fs.readFileSync(
    path.join(
      root,
      ".dreamy/knowledge/skill-candidates/project-ci-proof/SKILL.md",
    ),
    "utf8",
  );
  assert.ok(Buffer.byteLength(skill) <= 5000);
  assert.match(skill, /platform executable/);
  assert.equal(skill.includes("secret123"), false);
  const input = path.join(root, "behavior-cases.json"),
    cases = [];
  for (const [kind, count] of Object.entries(draft.requiredCases))
    for (let i = 0; i < count; i++)
      cases.push({
        id: `${kind}-${i}`,
        kind,
        prompt: "Concrete fixture prompt; not a real model quality result.",
        expectedBehavior: "Fixture expectation",
      });
  atomicJson(input, { cases });
  const prepared = prepareSkillEvaluation(root, draft.id, input);
  assert.equal(prepared.cases, 5);
  assert.equal(prepared.modelCalls, 0);
  assert.throws(
    () => promoteSkill(root, draft.id, { reportFile: prepared.path }),
    /behavioral report/,
  );
  atomicJson(input, { cases: cases.slice(0, 4) });
  assert.throws(
    () => prepareSkillEvaluation(root, draft.id, input),
    /Missing conflict/,
  );
  const manifest = path.join(
    root,
    ".dreamy/knowledge/skill-candidates/project-ci-proof/candidate.json",
  );
  atomicJson(manifest, { ...readJson(manifest), requiredCases: {} });
  assert.throws(
    () => promoteSkill(root, draft.id, { reportFile: prepared.path }),
    /required case policy/,
  );
});
test("lesson preview does not consume recall and package-bound eligibility follows the inspected lock", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  verifyLesson(root, l.id, receipt.id);
  const lessonFile = recordPath(root, "lessons", l.id);
  atomicJson(lessonFile, {
    ...readJson(lessonFile),
    applicability: { packages: { "com.example.fixture": "1.0" } },
  });
  atomicJson(path.join(root, "Packages/packages-lock.json"), {
    dependencies: { "com.example.fixture": { version: "1.0" } },
  });
  assert.equal(eligible(root, readJson(lessonFile)), true);
  const options = { session: "preview-only", preview: true };
  assert.equal(recall(root, "npm executable ENOENT", options).items.length, 1);
  assert.equal(recall(root, "npm executable ENOENT", options).items.length, 1);
  assert.equal(
    recall(root, "npm executable ENOENT", { session: "preview-only" }).items
      .length,
    1,
  );
  assert.equal(
    recall(root, "npm executable ENOENT", { session: "preview-only" }).items
      .length,
    0,
  );
  atomicJson(path.join(root, "Packages/packages-lock.json"), {
    dependencies: { "com.example.fixture": { version: "2.0" } },
  });
  assert.equal(eligible(root, readJson(lessonFile)), false);
});
test("explicit promotion retains report provenance and rejects altered artifacts on reuse", (t) => {
  const root = workspace(t),
    { l, receipt } = seed(root);
  verifyLesson(root, l.id, receipt.id);
  const draft = draftSkill(root, l.id, { name: "promotion-proof-fixture" });
  const cases = [];
  for (const [kind, count] of Object.entries(draft.requiredCases))
    for (let i = 0; i < count; i++) {
      const rel = `fixture-evaluations/${kind}-${i}.json`,
        file = path.join(root, ".dreamy", rel);
      atomicJson(file, {
        result: "Synthetic fixture for file lifecycle, not semantic evidence",
      });
      cases.push({
        id: `${kind}-${i}`,
        kind,
        status: "pass",
        artifactPath: rel,
        artifactHash: hash(fs.readFileSync(file)),
      });
    }
  const reportFile = path.join(root, "fixture-report.json");
  atomicJson(reportFile, {
    kind: "skill-behavior-evaluation",
    status: "pass",
    measurement: "observed-agent-behavior",
    criticalFailures: 0,
    candidateHash: draft.contentHash,
    cases,
  });
  promoteSkill(root, draft.id, { reportFile });
  assert.equal(
    promotedSkillSnapshot(root, draft.id).contentHash,
    draft.contentHash,
  );
  fs.writeFileSync(
    path.join(root, ".dreamy", cases[0].artifactPath),
    "changed",
  );
  assert.throws(() => promotedSkillSnapshot(root, draft.id), /artifact/);
});
test("rollout counts distinct UTC observation days per runtime/policy without inventing acceptance", async (t) => {
  const root = workspace(t),
    probe = async () => ({
      trust: "requires-native-review",
      probeStatus: "observed",
      errors: [],
      reason: "Fixture only",
    });
  const day = Date.UTC(2026, 9, 22);
  const first = await rolloutSnapshot(root, { now: day, probe });
  const again = await rolloutSnapshot(root, { now: day + 1000, probe });
  const next = await rolloutSnapshot(root, { now: day + 86400000, probe });
  assert.equal(first.modelCalls, 0);
  assert.equal(again.observedUtcDays, 1);
  assert.equal(next.observedUtcDays, 2);
  assert.equal(next.operationalAcceptance, "not-established");
  atomicJson(path.join(root, ".dreamy-codex/hook-policy.json"), {
    schemaVersion: 1,
    profile: "minimal",
  });
  const changed = await rolloutSnapshot(root, {
    now: day + 2 * 86400000,
    probe,
  });
  assert.equal(changed.observedUtcDays, 1);
  assert.notEqual(changed.cohortHash, first.cohortHash);
  assert.equal(fs.existsSync(first.artifact), true);
});
