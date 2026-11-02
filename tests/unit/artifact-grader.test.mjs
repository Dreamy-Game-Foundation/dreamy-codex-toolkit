import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBenchmark } from "../../scripts/benchmark.mjs";
import { prepareArtifactTask, gradeArtifactTask } from "../../scripts/lib/artifact-grader.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
function fixture(t, mode = "echo", repetitions = 1) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy artifact "));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.cpSync(path.join(root, "benchmarks/fixtures/lifecycle"), path.join(dir, "fixture"), { recursive: true });
  fs.copyFileSync(path.join(root, "benchmarks/graders/subscription.mjs"), path.join(dir, "verify.mjs"));
  const grader = { type: "artifact-task", fixture: "fixture", verifier: "verify.mjs" };
  fs.writeFileSync(path.join(dir, "cases.json"), JSON.stringify({ cases: [{ id: "subscription", prompt: "Repair lifecycle", grader }] }));
  const manifest = { purpose: "selftest", releaseEligible: false, repetitions, caseFiles: ["cases.json"], treatments: [{ id: "B0", sources: [] }], adapter: { executable: process.execPath, args: [path.join(root, "tests/fixtures/benchmark/artifact-agent.mjs"), "{promptFile}", "{outputFile}", "{workspace}", mode] } };
  const manifestPath = path.join(dir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  return { dir, grader, manifestPath, manifest };
}

test("artifact benchmark rejects a correct-sounding answer when the patch is absent", t => {
  const { dir, manifestPath } = fixture(t);
  const { report } = runBenchmark({ manifest: manifestPath, output: path.join(dir, "run") });
  assert.equal(report.summary.failed, 1);
  const result = report.treatments[0];
  assert.equal(result.grading.pass, false);
  assert.deepEqual(result.grading.changedPaths, []);
  assert.match(fs.readFileSync(path.join(dir, "run/B0/subscription/1/verification.log"), "utf8"), /open must be idempotent/);
});

test("artifact benchmark executes the independent verifier and resets each repetition", t => {
  const { dir, manifestPath } = fixture(t, "fix", 2);
  const { report } = runBenchmark({ manifest: manifestPath, output: path.join(dir, "run") });
  assert.equal(report.summary.passed, 2);
  const [first, second] = report.treatments;
  assert.deepEqual(first.grading.fixtureFiles, second.grading.fixtureFiles);
  for (const item of report.treatments) {
    assert.deepEqual(item.grading.changedPaths, ["subscription.mjs"]);
    assert.match(item.grading.verifierHash, /^[0-9a-f]{64}$/);
    assert.match(item.grading.logHash, /^[0-9a-f]{64}$/);
    assert.equal(item.usage, null);
    assert.equal(item.grading.artifactFiles.length, 1);
  }
});

test("missing artifact is a failed attempted trial, and preparation never runs a verifier", t => {
  const { dir, manifestPath } = fixture(t, "remove");
  const run = runBenchmark({ manifest: manifestPath, output: path.join(dir, "run") });
  assert.equal(run.report.summary.failed, 1);
  const prepared = runBenchmark({ manifest: manifestPath, output: path.join(dir, "prepare"), prepare: true });
  assert.equal(prepared.report.summary.notRun, 1);
  assert.equal(fs.existsSync(path.join(dir, "prepare/B0/subscription/1/verification.log")), false);
});

test("artifact grader rejects changed trusted inputs and verifier-side repairs", t => {
  const { dir, grader } = fixture(t);
  const attempt = path.join(dir, "attempt");
  fs.mkdirSync(attempt);
  const task = prepareArtifactTask(grader, dir, attempt);
  fs.appendFileSync(task.verifier, "\n// changed\n");
  assert.match(gradeArtifactTask(task, attempt).reason, /Trusted artifact inputs changed/);
  fs.writeFileSync(task.verifier, 'import fs from "node:fs"; import path from "node:path"; fs.writeFileSync(path.join(process.argv[2],"repair.txt"),"fixed");');
  fs.mkdirSync(path.join(dir, "attempt2"));
  const second = prepareArtifactTask(grader, dir, path.join(dir, "attempt2"));
  assert.match(gradeArtifactTask(second, path.join(dir, "attempt2")).reason, /changed during verification/);
});

test("artifact verifier timeout cannot become a pass", t => {
  const { dir, grader } = fixture(t);
  fs.writeFileSync(path.join(dir, "verify.mjs"), "setTimeout(()=>{},10000);");
  const attempt = path.join(dir, "attempt"); fs.mkdirSync(attempt);
  const task = prepareArtifactTask({ ...grader, timeoutMs: 100 }, dir, attempt);
  const result = gradeArtifactTask(task, attempt);
  assert.equal(result.pass, false);
  assert.match(result.reason, /ETIMEDOUT/);
});
