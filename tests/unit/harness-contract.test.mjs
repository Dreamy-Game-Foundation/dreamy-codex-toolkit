import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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
