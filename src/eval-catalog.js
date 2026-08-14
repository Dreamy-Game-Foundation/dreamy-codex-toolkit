import crypto from "node:crypto";
import path from "node:path";
import { createSchemaValidator, validateWithSchema } from "./schema-validation.js";

export function buildCatalogValidationReport(catalogText, schemaRoot) {
  const catalog = JSON.parse(catalogText);
  const cases = catalog.cases ?? [];
  const schemas = createSchemaValidator(path.resolve(schemaRoot));
  for (const entry of cases) {
    validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/eval-case.schema.json", entry, `eval case ${entry.id ?? "<missing-id>"}`);
  }
  const report = {
    schemaVersion: 1,
    kind: "catalog-validation",
    status: "validated",
    runner: "catalog",
    generatedAt: new Date().toISOString(),
    catalogHash: crypto.createHash("sha256").update(catalogText).digest("hex"),
    coverage: catalog.coverage,
    catalogCases: cases.length,
    validatedCases: cases.length,
    semantic: { status: "not-run", reason: "Catalog validation does not execute an agent or grade semantic output." }
  };
  validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/eval-report.schema.json", report, "eval report");
  return report;
}
