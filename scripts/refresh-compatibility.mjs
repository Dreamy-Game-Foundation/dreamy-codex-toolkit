import fs from "node:fs";
import path from "node:path";
import { collectCompatibilityIssues, readCompatibilityEvidence, readJson, root } from "./compatibility-lib.mjs";

const dreamy = readJson("compatibility/dreamy-packages.json");
const thirdParty = readJson("compatibility/third-party.json");
const evidence = readCompatibilityEvidence();
const issues = collectCompatibilityIssues(dreamy, thirdParty);

const report = {
  schemaVersion: 1,
  evidenceRetrievedAt: evidence?.evidenceRetrievedAt ?? null,
  reportGeneratedAt: new Date().toISOString(),
  evidenceSnapshot: evidence ? {
    fetchMethod: evidence.fetchMethod,
    upstreamFetchPerformed: evidence.upstreamFetchPerformed,
    sources: evidence.sources
  } : null,
  packages: Object.keys(dreamy.packages ?? {}).length,
  thirdParty: Object.keys(thirdParty.packages ?? {}).length,
  asmdefDependencyIssues: issues.filter((issue) => /asmdef/i.test(issue.issue)).length,
  issues,
};

fs.mkdirSync(path.join(root, "release"), { recursive: true });
fs.writeFileSync(path.join(root, "release", "compatibility-drift-report.json"), `${JSON.stringify(report, null, 2)}\n`);
const markdown = [
  "# Compatibility Drift Report",
  "",
  `Report generated: ${report.reportGeneratedAt}`,
  `Evidence retrieved: ${report.evidenceRetrievedAt ?? "not refreshed from upstream"}`,
  `Packages: ${report.packages}`,
  `Third-party records: ${report.thirdParty}`,
  `Issues: ${report.issues.length}`,
  "",
  "| Severity | Package | Issue |",
  "| --- | --- | --- |",
  ...report.issues.map((issue) => `| ${issue.severity} | ${issue.package} | ${String(issue.issue).replaceAll("|", "\\|")} |`)
].join("\n");
fs.writeFileSync(path.join(root, "release", "compatibility-drift-report.md"), `${markdown}\n`);
console.log(JSON.stringify({ status: issues.some((issue) => issue.severity === "ERROR") ? "error" : "ok", issues: issues.length }));
if (issues.some((issue) => issue.severity === "ERROR")) process.exitCode = 1;
