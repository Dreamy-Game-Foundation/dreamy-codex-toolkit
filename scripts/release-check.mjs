import fs from "node:fs";
import path from "node:path";
import { validate } from "./validate.mjs";

const root = path.resolve(import.meta.dirname, "..");
const toolkit = JSON.parse(fs.readFileSync(path.join(root, "toolkit.json"), "utf8"));
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
const evals = JSON.parse(fs.readFileSync(path.join(root, "evals/catalog.json"), "utf8"));
const errors = [];

if (toolkit.version !== pkg.version) errors.push("toolkit.json and package.json versions differ");
if (!changelog.includes(toolkit.version)) errors.push("CHANGELOG does not mention current version");
if ((evals.cases ?? []).length < 60) errors.push("release gate requires at least 60 eval cases");
if (!fs.existsSync(path.join(root, "release/eval-report.json"))) errors.push("release/eval-report.json is missing; run npm run eval:deterministic");
if (!fs.existsSync(path.join(root, "release/compatibility-drift-report.json"))) errors.push("compatibility drift JSON report is missing");
if (!fs.existsSync(path.join(root, "release/compatibility-drift-report.md"))) errors.push("compatibility drift Markdown report is missing");
if (!fs.existsSync(path.join(root, "release/npm-pack-smoke.json"))) errors.push("npm pack smoke report is missing; run npm run pack:smoke");
await validate().catch((error) => errors.push(error.message));

console.log(JSON.stringify({ status: errors.length ? "fail" : "ok", version: toolkit.version, evalCases: evals.cases?.length ?? 0, errors }, null, 2));
if (errors.length) process.exitCode = 1;
