import fs from "node:fs";
import path from "node:path";
import { validate } from "./validate.mjs";
import { catalogReportErrors } from "../src/release-evidence.js";
import { createSchemaValidator, validateWithSchema } from "../src/schema-validation.js";

const root = path.resolve(import.meta.dirname, "..");
const toolkit = JSON.parse(fs.readFileSync(path.join(root, "toolkit.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
const evalCatalogText = fs.readFileSync(path.join(root, "evals/catalog.json"), "utf8");
const evals = JSON.parse(evalCatalogText);
const errors = [];
const productionBlockers = [];
let semanticQualityClaim = "not-established";

if (toolkit.version !== pkg.version) errors.push("toolkit.json and package.json versions differ");
if (!changelog.includes(toolkit.version)) errors.push("CHANGELOG does not mention current version");
if ((evals.cases ?? []).length < 60) errors.push("release gate requires at least 60 eval cases");
const evalReportPath = path.join(root, "release/eval-report.json");
if (!fs.existsSync(evalReportPath)) {
  errors.push("release/eval-report.json is missing; run npm run eval:deterministic");
} else {
  try {
    const report = JSON.parse(fs.readFileSync(evalReportPath, "utf8"));
    errors.push(...catalogReportErrors(report, evalCatalogText, path.join(root, "schemas")));
  } catch (error) {
    errors.push(error.message);
  }
}
const benchmarkReportPath = path.join(root, "release", "benchmark-report.json");
if (!fs.existsSync(benchmarkReportPath)) {
  productionBlockers.push("release/benchmark-report.json is missing; catalog validation is not a quality score");
} else {
  try {
    const benchmark = JSON.parse(fs.readFileSync(benchmarkReportPath, "utf8"));
    const schemas = createSchemaValidator(path.join(root, "schemas"));
    validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/benchmark-run.schema.json", benchmark, "release/benchmark-report.json");
    if (benchmark.status !== "complete" || benchmark.purpose !== "quality" || !benchmark.releaseEligible || benchmark.provenance.toolkitDirty) {
      productionBlockers.push("benchmark report is not a complete, release-eligible quality run from a clean toolkit commit");
    } else {
      semanticQualityClaim = "benchmark-observed";
    }
  } catch (error) {
    productionBlockers.push(error.message);
  }
}
const unityCompatibility = JSON.parse(fs.readFileSync(path.join(root, toolkit.compatibility.unity), "utf8"));
if ((unityCompatibility.tested ?? []).length === 0) productionBlockers.push("Unity tested matrix is empty");
if (!fs.existsSync(path.join(root, "release/compatibility-drift-report.json"))) errors.push("compatibility drift JSON report is missing");
if (!fs.existsSync(path.join(root, "release/compatibility-drift-report.md"))) errors.push("compatibility drift Markdown report is missing");
if (!fs.existsSync(path.join(root, "release/npm-pack-smoke.json"))) errors.push("npm pack smoke report is missing; run npm run pack:smoke");
await validate().catch((error) => errors.push(error.message));

if (toolkit.status !== "alpha" && productionBlockers.length) errors.push(...productionBlockers);
console.log(JSON.stringify({
  status: errors.length ? "fail" : "ok",
  releaseScope: toolkit.status === "alpha" ? "alpha-package" : "production",
  version: toolkit.version,
  evalCases: evals.cases?.length ?? 0,
  semanticQualityClaim,
  productionReadiness: productionBlockers.length ? "blocked" : "ready",
  productionBlockers,
  errors
}, null, 2));
if (errors.length) process.exitCode = 1;
