import fs from "node:fs";
import { sourceCommit, sourceFingerprint, hash } from "../scripts/lib/source-fingerprint.mjs";
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

export function packReportErrors(report, root, artifacts, runId = null) {
  const errors = [];
  try {
    validateWithSchema(createSchemaValidator(path.join(root, 'schemas')), 'https://dreamy.tools/codex/schemas/pack-report.schema.json', report, 'pack report');
  } catch (e) { return [e.message]; }
  const version = JSON.parse(fs.readFileSync(path.join(root, 'toolkit.json'))).version;
  if (report.toolkitVersion !== version || report.packageVersion !== version) errors.push('pack report version is stale');
  if (report.sourceFingerprint !== sourceFingerprint(root) || report.sourceCommit !== sourceCommit(root)) errors.push('pack report source is stale');
  if (runId && report.runId !== runId) errors.push('pack report belongs to another run');
  if (path.basename(report.tarball) !== report.tarball) errors.push('invalid tarball path');
  else {
    const file = path.join(artifacts, report.tarball);
    if (!fs.existsSync(file) || hash(fs.readFileSync(file)) !== report.tarballSha256) errors.push('tarball missing or hash mismatch');
  }
  return errors;
}
