import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const inventory = JSON.parse(fs.readFileSync(path.join(root, "benchmarks/candidates/compact-pilot/inventory.json")));
const cases = JSON.parse(fs.readFileSync(path.join(root, "benchmarks/cases/compact-skill-pilot.json"))).cases;
assert.equal(inventory.status, "draft-not-activated");
assert.equal(inventory.skills.length, 5);
assert.equal(cases.length, 20);
for (const item of inventory.skills) {
  for (const prefix of ["baseline", "candidate"]) {
    const file = path.join(root, item[`${prefix}Path`]);
    const bytes = fs.readFileSync(file);
    assert.equal(sha(bytes), item[`${prefix}Hash`], `${item.name}: ${prefix} source drift; refresh and review the pilot`);
    assert.equal(bytes.length, item[`${prefix}Bytes`]);
  }
  const file = path.join(root, item.candidatePath), text = fs.readFileSync(file, "utf8");
  assert.ok(text.startsWith(`---\nname: ${item.name}\n`));
  assert.match(text, /^description: .{40,1024}$/m);
  assert.ok(Buffer.byteLength(text) <= 5000);
  for (const heading of ["Scope", "Decisions", "Verification", "References"]) assert.ok(text.includes(`## ${heading}`));
  for (const match of text.matchAll(/`(references\/[^`]+)`/g)) assert.ok(fs.existsSync(path.join(path.dirname(file), match[1])), match[1]);
  const selected = cases.filter(c => c.skill === item.name);
  assert.equal(selected.length, 4);
  assert.equal(selected.filter(c => c.split === "development").length, 2);
  assert.equal(selected.filter(c => c.split === "holdout").length, 2);
  for (const c of selected) {
    assert.equal(c.grader.type, "json-fields");
    assert.equal(c.treatments.baseline.sources[0].paths[0], item.baselinePath);
    assert.equal(c.treatments.candidate.sources[0].paths[0], item.candidatePath);
  }
}
console.log(JSON.stringify({ status: "draft-structure-valid", skills: 5, cases: 20, development: 10, holdout: 10, measurement: "bytes-only", reductionPercent: inventory.reductionPercent, semanticQuality: "not-established" }));
