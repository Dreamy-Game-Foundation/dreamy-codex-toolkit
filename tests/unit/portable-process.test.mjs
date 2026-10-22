import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { testFiles } from "../../scripts/test-unit.mjs";
import { parseProcessJson } from "../../scripts/lib/process-result.mjs";
test("explicit discovery supports spaces, sorts files and rejects empty directories", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy discovery "));
  try {
    assert.throws(() => testFiles(d), /No unit tests/);
    fs.writeFileSync(
      path.join(d, "z.test.mjs"),
      "import test from 'node:test';test('fails',()=>{throw Error('expected')});",
    );
    fs.writeFileSync(
      path.join(d, "a space.test.mjs"),
      "import test from 'node:test';test('passes',()=>{});",
    );
    const files = testFiles(d);
    assert.equal(path.basename(files[0]), "a space.test.mjs");
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const r = spawnSync(process.execPath, ["--test", ...files], {
      encoding: "utf8",
      env,
    });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /passes/);
  } finally {
    fs.rmSync(d, { recursive: true, force: true });
  }
});
test("process diagnostics distinguish spawn failure, empty output and degraded JSON", () => {
  assert.throws(
    () =>
      parseProcessJson(
        { error: Object.assign(Error("blocked"), { code: "EPERM" }) },
        "compile",
      ),
    /EPERM/,
  );
  assert.throws(
    () => parseProcessJson({ status: 0, stdout: "" }, "compile"),
    /empty JSON/,
  );
  assert.deepEqual(
    parseProcessJson(
      { status: 2, stdout: '{"status":"degraded"}' },
      "compile",
      2,
    ),
    { status: "degraded" },
  );
  assert.throws(
    () => parseProcessJson({ status: 0, stdout: "{" }, "compile"),
    /invalid JSON/,
  );
});
