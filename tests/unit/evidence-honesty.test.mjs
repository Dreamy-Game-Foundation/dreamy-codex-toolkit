import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalogValidationReport } from "../../src/eval-catalog.js";
import { catalogReportErrors } from "../../src/release-evidence.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

test("catalog validation never fabricates semantic pass fields", () => {
  const catalogText = fs.readFileSync(path.join(root, "evals", "catalog.json"), "utf8");
  const report = buildCatalogValidationReport(catalogText, path.join(root, "schemas"));
  assert.equal(report.status, "validated");
  assert.equal(report.semantic.status, "not-run");
  assert.equal("passed" in report, false);
  assert.equal("scoreReport" in report, false);
  assert.equal(report.catalogCases, report.validatedCases);
});

test("catalog validation rejects malformed eval cases through JSON Schema", () => {
  const malformed = JSON.stringify({ coverage: "test", cases: [{ id: "broken", category: "safety", prompt: "x", expected: "not-an-array", forbiddenClaims: [] }] });
  assert.throws(() => buildCatalogValidationReport(malformed, path.join(root, "schemas")), /must be array/);
});

test("release freshness rejects stale and fabricated reports", () => {
  const catalogText = fs.readFileSync(path.join(root, "evals", "catalog.json"), "utf8");
  const report = buildCatalogValidationReport(catalogText, path.join(root, "schemas"));
  assert.deepEqual(catalogReportErrors(report, catalogText, path.join(root, "schemas")), []);

  const stale = { ...report, catalogHash: "0".repeat(64) };
  assert.match(catalogReportErrors(stale, catalogText, path.join(root, "schemas")).join("\n"), /stale/);

  const fabricated = { ...report, passed: report.catalogCases };
  assert.match(catalogReportErrors(fabricated, catalogText, path.join(root, "schemas")).join("\n"), /passed boolean schema is false/);
});
