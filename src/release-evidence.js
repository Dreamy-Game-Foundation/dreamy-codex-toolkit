import crypto from "node:crypto";
import path from "node:path";
import { createSchemaValidator, validateWithSchema } from "./schema-validation.js";

export function catalogReportErrors(report, catalogText, schemaRoot) {
  const errors = [];
  try {
    const schemas = createSchemaValidator(path.resolve(schemaRoot));
    validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/eval-report.schema.json", report, "release/eval-report.json");
  } catch (error) {
    return [error.message];
  }
  const catalog = JSON.parse(catalogText);
  const catalogHash = crypto.createHash("sha256").update(catalogText).digest("hex");
  if (report.catalogHash !== catalogHash) errors.push("eval report is stale: catalog hash differs; rerun npm run eval:deterministic");
  if (report.catalogCases !== (catalog.cases ?? []).length || report.validatedCases !== report.catalogCases) errors.push("eval report case counts do not match the catalog");
  return errors;
}
