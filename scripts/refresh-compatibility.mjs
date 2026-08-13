import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dreamy = JSON.parse(fs.readFileSync(path.join(root, "compatibility/dreamy-packages.json"), "utf8"));
const thirdParty = JSON.parse(fs.readFileSync(path.join(root, "compatibility/third-party.json"), "utf8"));
const knownThirdParty = new Set(Object.keys(thirdParty.packages ?? {}));
const issues = [];

for (const [name, pkg] of Object.entries(dreamy.packages ?? {})) {
  if (!pkg.version) issues.push({ severity: "ERROR", package: name, issue: "missing version" });
  if (!/^[0-9a-f]{40}$/.test(pkg.verifiedCommit ?? "")) issues.push({ severity: "ERROR", package: name, issue: "invalid verifiedCommit" });
  for (const dep of Object.keys(pkg.thirdPartyDependencies ?? {})) {
    if (!knownThirdParty.has(dep)) issues.push({ severity: "ERROR", package: name, issue: `unknown third-party dependency ${dep}` });
  }
  for (const drift of pkg.drift ?? []) issues.push({ severity: "WARN", package: name, issue: drift });
  for (const unsupported of pkg.unsupportedContracts ?? []) issues.push({ severity: "WARN", package: name, issue: unsupported });
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  packages: Object.keys(dreamy.packages ?? {}).length,
  thirdParty: Object.keys(thirdParty.packages ?? {}).length,
  asmdefDependencyIssues: issues.filter((issue) => /asmdef/i.test(issue.issue)).length,
  issues,
};

fs.mkdirSync(path.join(root, "release"), { recursive: true });
fs.writeFileSync(path.join(root, "release", "compatibility-drift-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ status: issues.some((issue) => issue.severity === "ERROR") ? "error" : "ok", issues: issues.length }));
if (issues.some((issue) => issue.severity === "ERROR")) process.exitCode = 1;
