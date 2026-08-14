import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const harness = path.join(root, "harness", "dreamy-harness");

function run(args, expectedCode = 0) {
  try {
    const output = execFileSync(process.execPath, [harness, ...args], { cwd: root, encoding: "utf8" });
    assert.equal(expectedCode, 0);
    return JSON.parse(output);
  } catch (error) {
    assert.equal(error.status, expectedCode);
    return JSON.parse(error.stdout.toString());
  }
}

function unityFixture({ lock = true, unsafeAsmdef = false } = {}) {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-unity-fixture-"));
  fs.mkdirSync(path.join(project, "Packages"), { recursive: true });
  fs.mkdirSync(path.join(project, "ProjectSettings"), { recursive: true });
  fs.mkdirSync(path.join(project, "Assets", "Runtime"), { recursive: true });
  fs.mkdirSync(path.join(project, "Assets", "Editor"), { recursive: true });
  fs.writeFileSync(path.join(project, "Packages", "manifest.json"), JSON.stringify({ dependencies: { "com.unity.test-framework": "1.3.9" } }), "utf8");
  if (lock) fs.writeFileSync(path.join(project, "Packages", "packages-lock.json"), JSON.stringify({ dependencies: { "com.unity.test-framework": { version: "1.3.9", depth: 0, source: "registry" } } }), "utf8");
  fs.writeFileSync(path.join(project, "ProjectSettings", "ProjectVersion.txt"), "m_EditorVersion: 6000.0.1f1\n", "utf8");
  fs.writeFileSync(path.join(project, "Assets", "Editor", "Fixture.Editor.asmdef"), JSON.stringify({ name: "Fixture.Editor", includePlatforms: ["Editor"] }), "utf8");
  fs.writeFileSync(path.join(project, "Assets", "Runtime", "Fixture.Runtime.asmdef"), JSON.stringify({ name: "Fixture.Runtime", references: unsafeAsmdef ? ["Fixture.Editor"] : [] }), "utf8");
  return project;
}

test("harness git-status emits machine-readable evidence", () => {
  const evidence = run(["git-status", root]);
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.adapter, "dreamy-harness");
  assert.equal(evidence.operation, "git-status");
  assert.equal(evidence.status, "pass");
  assert.equal(evidence.exitCode, 0);
  assert.ok(evidence.observedAt);
  assert.ok(Array.isArray(evidence.diagnostics));
});

test("Unity-dependent harness operations degrade without fake success", () => {
  const compile = run(["compile", root], 2);
  assert.equal(compile.status, "degraded");
  assert.ok(compile.degradedReason);
  assert.notEqual(compile.exitCode, 0);

  const ios = run(["build-ios", root], 2);
  assert.equal(ios.status, "degraded");
  assert.ok(ios.degradedReason);
});

test("project inspection passes only complete Unity source fixtures", () => {
  const valid = run(["project-inspect", unityFixture()]);
  assert.equal(valid.status, "pass");
  assert.equal(valid.profile.engine.version, "6000.0.1f1");
  assert.equal(valid.profile.capabilities.testFramework.status, "observed");

  const incomplete = run(["project-inspect", unityFixture({ lock: false })], 2);
  assert.equal(incomplete.status, "degraded");
  assert.equal(incomplete.profile.status, "incomplete");
  assert.match(incomplete.degradedReason, /incomplete/i);

  const invalid = run(["project-inspect", fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-invalid-fixture-"))], 1);
  assert.equal(invalid.status, "fail");
  assert.equal(invalid.profile.status, "invalid");
});

test("committed Unity vertical slice has a valid machine profile", () => {
  const fixture = path.join(root, "tests", "fixtures", "unity", "vertical-slice");
  const evidence = run(["project-inspect", fixture]);
  assert.equal(evidence.profile.status, "valid");
  assert.equal(evidence.profile.engine.version, "6000.4.12f1");
  assert.equal(evidence.profile.asmdefs.count, 3);
});

test("asmdef inspection parses graph and rejects Runtime to Editor references", () => {
  const project = unityFixture({ unsafeAsmdef: true });
  const evidence = run(["asmdef", project], 1);
  assert.equal(evidence.status, "fail");
  assert.deepEqual(evidence.profile.asmdefs.runtimeEditorViolations, [{ assembly: "Fixture.Runtime", reference: "Fixture.Editor" }]);
});
