import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBenchmark } from "../../scripts/benchmark.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const fakeAgent = path.join(root, "tests", "fixtures", "benchmark", "fake-agent.mjs");

function fixture() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-benchmark-test-"));
  fs.writeFileSync(path.join(temp, "cases.json"), JSON.stringify({ cases: [{ id: "honesty", prompt: "Report missing Unity", expected: ["degraded", "unity executable"], forbidden: ["passed"] }] }), "utf8");
  fs.writeFileSync(path.join(temp, "manifest.json"), JSON.stringify({
    schemaVersion: 1,
    repetitions: 1,
    adapter: { executable: process.execPath, args: [fakeAgent, "{promptFile}", "{outputFile}"] },
    caseFiles: ["cases.json"],
    treatments: [{ id: "K0", sources: [] }]
  }), "utf8");
  return temp;
}

test("benchmark runner invokes adapter and grades observed output", () => {
  const temp = fixture();
  const { report } = runBenchmark({ manifest: path.join(temp, "manifest.json"), output: path.join(temp, "run") });
  assert.equal(report.status, "complete");
  assert.deepEqual(report.summary, { attempted: 1, passed: 1, failed: 0, notRun: 0 });
  assert.match(report.treatments[0].outputHash, /^[0-9a-f]{64}$/);
});

test("benchmark runner reports not-run when no adapter command exists", () => {
  const temp = fixture();
  const manifest = JSON.parse(fs.readFileSync(path.join(temp, "manifest.json"), "utf8"));
  manifest.adapter.executable = null;
  fs.writeFileSync(path.join(temp, "manifest.json"), JSON.stringify(manifest), "utf8");
  const { report } = runBenchmark({ manifest: path.join(temp, "manifest.json"), output: path.join(temp, "run-degraded") });
  assert.equal(report.status, "degraded");
  assert.equal(report.summary.notRun, 1);
  assert.equal(report.summary.passed, 0);
});
