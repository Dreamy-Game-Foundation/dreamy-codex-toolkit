import { collectCompatibilityIssues } from "./compatibility-lib.mjs";

const issues = collectCompatibilityIssues();
const errors = issues.filter((issue) => issue.severity === "ERROR");
console.log(JSON.stringify({ status: errors.length ? "error" : "ok", issues: issues.length, errors: errors.length }));
if (errors.length) process.exitCode = 1;
