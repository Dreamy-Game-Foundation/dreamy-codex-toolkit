import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const root = path.resolve(import.meta.dirname, "..");

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

export function sha256File(relativePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relativePath))).digest("hex");
}

export function collectCompatibilityIssues(dreamy = readJson("compatibility/dreamy-packages.json"), thirdParty = readJson("compatibility/third-party.json")) {
  const knownThirdParty = new Set(Object.keys(thirdParty.packages ?? {}));
  const issues = [];
  for (const [name, pkg] of Object.entries(dreamy.packages ?? {})) {
    if (!pkg.version) issues.push({ severity: "ERROR", package: name, issue: "missing version" });
    if (!/^[0-9a-f]{40}$/.test(pkg.verifiedCommit ?? "")) issues.push({ severity: "ERROR", package: name, issue: "invalid verifiedCommit" });
    if (!["observed", "tested", "drift", "known-drift", "unsupported"].includes(pkg.status)) {
      issues.push({ severity: "ERROR", package: name, issue: `invalid status ${pkg.status}` });
    }
    for (const dep of Object.keys(pkg.thirdPartyDependencies ?? {})) {
      if (!knownThirdParty.has(dep)) issues.push({ severity: "ERROR", package: name, issue: `unknown third-party dependency ${dep}` });
    }
    for (const drift of pkg.drift ?? []) issues.push({ severity: "WARN", package: name, issue: drift });
    for (const unsupported of pkg.unsupportedContracts ?? []) issues.push({ severity: "WARN", package: name, issue: unsupported });
  }
  for (const drift of dreamy.globalDrift ?? []) {
    issues.push({ severity: "WARN", package: "global", issue: drift });
  }
  return issues;
}

export function readCompatibilityEvidence() {
  const evidencePath = path.join(root, "release", "compatibility-evidence.json");
  if (!fs.existsSync(evidencePath)) return null;
  return JSON.parse(fs.readFileSync(evidencePath, "utf8"));
}
