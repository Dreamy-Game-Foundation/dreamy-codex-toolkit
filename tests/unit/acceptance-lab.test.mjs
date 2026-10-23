import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { runAcceptanceLab } from "../../scripts/toolkit-acceptance-lab.mjs";
import { hash, readJson } from "../../src/lib/local-data.mjs";

test("isolated lab runs real CLI/verification workflows without claiming native or model acceptance", async t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy acceptance lab "));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const output = path.join(temporary, "run");
  const { report, runRoot } = await runAcceptanceLab({ output, onProgress: () => {} });
  assert.equal(report.summary.fail, 0, JSON.stringify(report.results.filter(r => r.status === "fail")));
  assert.equal(report.status, "partial");
  assert.equal(report.modelCalls, 0);
  assert.equal(report.operationalAcceptance, "not-established");
  assert.ok(report.results.filter(r => r.category === "external-acceptance").every(r => r.status === "not-run"));
  assert.equal(report.native.probeStatus, "not-run");
  assert.ok(fs.existsSync(path.join(runRoot, "MANUAL-EXTENSION.vi.md")));
  const policy = readJson(path.join(report.projectRoot, ".dreamy-codex/hook-policy.json"));
  assert.equal(policy.profile, "minimal");
  assert.equal(policy.recordReceipts, true);
  for (const [relative, expected] of Object.entries(report.artifactHashes))
    assert.equal(hash(fs.readFileSync(path.join(runRoot, relative))), expected);
  const before = hash(fs.readFileSync(path.join(runRoot, "report.json")));
  await assert.rejects(() => runAcceptanceLab({ output, onProgress: () => {} }), /Output exists/);
  assert.equal(hash(fs.readFileSync(path.join(runRoot, "report.json"))), before);
});
