import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Deliberately no process execution, networking, environment-secret or project reads.
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const text = value => typeof value === "string" && value.trim().length > 0;
const placeholder = value => typeof value === "string" && /^(placeholder|todo|changeme|sample|example|missing|<.*>)$/i.test(value.trim());
const fingerprint = value => typeof value === "string" ? value.replaceAll(":", "").toLowerCase() : "";
const cert = value => /^[0-9a-f]{64}$/.test(fingerprint(value));
const urlSafe = value => {
  if (!text(value)) return true;
  try {
    const url = new URL(value);
    return !url.username && !url.password && !url.search && !url.hash;
  } catch {
    // Permit SSH Git remotes, not arbitrary colon-bearing credential URLs.
    return /^git@[^\s:]+:[^\s?&#]+$/.test(value);
  }
};

export function preflight(input) {
  const findings = [];
  const add = (code, at, severity = "error") => findings.push({ code, path: at, severity });
  const need = (value, at) => {
    if (!text(value)) { add("missing-field", at, "missing"); return false; }
    if (placeholder(value)) { add("placeholder", at); return false; }
    return true;
  };
  const truth = (value, at) => {
    if (value === false) add("check-failed", at);
    else if (value !== true) add("unproven-check", at, "missing");
  };
  const compare = (a, b, at, code = "configuration-mismatch") => {
    if (!text(a) || !text(b)) add("missing-comparison", at, "missing");
    else if (a !== b) add(code, at);
  };
  const done = () => ({
    schemaVersion: 1,
    scope: "normalized-input-only",
    status: findings.some(f => f.severity === "error") ? "fail" : findings.length ? "incomplete" : "pass",
    findings,
    executionAuthorized: false,
    remainingGates: ["source-and-owner-verification", "effective-ci-and-runner-verification", "post-injection-target-compile", "platform-build", "artifact-bytes-and-signature", "device-startup"],
  });
  if (!object(input)) { add("invalid-object", "$input"); return done(); }
  const allowed = new Set(["schemaVersion", "platform", "game", "repo", "ci", "output", "signing", "sdks", "adUnits", "firebase", "assemblies", "banner", "iap", "artifact", "sources"]);
  if (Object.keys(input).some(k => !allowed.has(k))) add("unknown-field", "$input");
  // Never print unknown property names or values: either could itself contain secrets.
  const unsafe = value => {
    if (Array.isArray(value)) return value.some(unsafe);
    if (!object(value)) return false;
    return Object.entries(value).some(([k, v]) =>
      /^(password|alias_password|aliasPassword|private_key|privateKey|token|secret|sdk_key|sdkKey|api_key|apiKey|keyData|credentials)$/i.test(k) || unsafe(v));
  };
  if (unsafe(input)) add("raw-secret-field", "$input");
  if (input.schemaVersion !== 1) add("unsupported-schema", "schemaVersion");
  if (!["Android", "iOS"].includes(input.platform)) add("unsupported-platform", "platform");
  for (const key of ["game", "repo", "ci", "output", "signing"]) {
    if (input[key] === undefined) add("missing-section", key, "missing");
    else if (!object(input[key])) add("invalid-object", key);
  }
  for (const key of ["firebase", "assemblies", "banner", "iap", "artifact"]) {
    if (input[key] !== undefined && !object(input[key])) add("invalid-object", key);
  }
  for (const key of ["sdks", "adUnits", "sources"]) {
    if (input[key] !== undefined && !Array.isArray(input[key])) add("invalid-array", key);
  }
  if (findings.some(f => ["invalid-object", "invalid-array", "raw-secret-field", "unsupported-platform", "unsupported-schema"].includes(f.code))) return done();
  const g = input.game ?? {}, r = input.repo ?? {}, c = input.ci ?? {}, o = input.output ?? {}, s = input.signing ?? {};
  for (const field of ["name", "applicationId", "unityVersion", "version", "buildNumber"]) need(g[field], `game.${field}`);
  const appPattern = input.platform === "Android" ? /^[A-Za-z]\w*(\.[A-Za-z]\w*)+$/ : /^[A-Za-z][\w-]*(\.[A-Za-z][\w-]*)+$/;
  if (text(g.applicationId) && !appPattern.test(g.applicationId)) add("invalid-application-id", "game.applicationId");
  if (text(g.buildNumber) && (input.platform === "Android" ? !/^[1-9]\d*$/.test(g.buildNumber) : !/^\d+(\.\d+){0,2}$/.test(g.buildNumber))) add("invalid-build-number", "game.buildNumber");
  for (const field of ["url", "remoteUrl", "branch", "sha"]) need(r[field], `repo.${field}`);
  if (text(r.sha) && !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i.test(r.sha)) add("invalid-revision", "repo.sha");
  for (const field of ["url", "remoteUrl"]) if (text(r[field]) && !urlSafe(r[field])) add("unsafe-url", `repo.${field}`);
  if (text(r.url) && text(r.remoteUrl)) {
    const canonical = value => value.replace(/\.git$/, "").replace(/\/$/, "");
    if (canonical(r.url) !== canonical(r.remoteUrl)) add("remote-drift-review", "repo.remoteUrl");
  }
  if (c.provider !== "gitlab") add(c.provider === undefined ? "missing-provider" : "unsupported-provider", "ci.provider", c.provider === undefined ? "missing" : "error");
  for (const field of ["source", "ruleSource", "ruleBranch", "executor", "shell", "unityVersion", "toolchainRef", "entrypointRef", "entrypointVersion"]) need(c[field], `ci.${field}`);
  for (const field of ["rulesReviewed", "ownerKnown", "licenseAvailable", "dependencyAccess", "sideEffectsReviewed", "pinsGameSha", "propagatesExitCodes"]) truth(c[field], `ci.${field}`);
  if (c.forbiddenGitEffects === true) add("forbidden-script-side-effects", "ci.forbiddenGitEffects");
  else if (c.forbiddenGitEffects !== false) add("unreviewed-script-side-effects", "ci.forbiddenGitEffects", "missing");
  if (!Array.isArray(c.runnerTags) || !c.runnerTags.length || c.runnerTags.some(v => !text(v))) add("missing-runner-tags", "ci.runnerTags", "missing");
  if (c.templateOwned === true) truth(c.rootMatchesTemplate, "ci.rootMatchesTemplate");
  else if (c.templateOwned !== false) add("unknown-template-owner", "ci.templateOwned", "missing");
  if (text(c.ruleSource) && c.ruleSource !== "any" && c.source !== c.ruleSource) add("job-rule-excludes-source", "ci.source");
  if (text(c.ruleBranch) && c.ruleBranch !== "any" && r.branch !== c.ruleBranch) add("job-rule-excludes-branch", "repo.branch");
  compare(g.unityVersion, c.unityVersion, "ci.unityVersion");
  for (const field of ["format", "variant", "destinationRef", "retention", "audience", "backend"]) need(o[field], `output.${field}`);
  if (!Array.isArray(o.architectures) || !o.architectures.length || o.architectures.some(v => !text(v))) add("missing-architectures", "output.architectures", "missing");
  const formats = input.platform === "Android" ? ["apk", "aab"] : ["xcode-project", "xcarchive", "ipa"];
  if (text(o.format) && !formats.includes(o.format)) add("wrong-artifact-format", "output.format");
  if (!Array.isArray(input.sources) || !input.sources.length || input.sources.some(v => !text(v))) add("missing-provenance", "sources", "missing");
  if (!Array.isArray(input.sdks)) add("missing-sdk-selection-inventory", "sdks", "missing");
  for (const [sdkName, section] of [["firebase", "firebase"], ["inapppurchase", "iap"]]) {
    const selected = (input.sdks ?? []).some(sdk => object(sdk) && sdk.enabled === true && String(sdk.name).toLowerCase() === sdkName);
    if (selected && input[section]?.enabled !== true) add("selected-capability-config-missing", section, "missing");
  }

  for (const [i, sdk] of (input.sdks ?? []).entries()) {
    const at = `sdks[${i}]`;
    if (!object(sdk)) { add("invalid-sdk", at); continue; }
    need(sdk.name, `${at}.name`);
    if (typeof sdk.enabled !== "boolean") { add("unknown-sdk-selection", `${at}.enabled`, "missing"); continue; }
    if (!sdk.enabled) continue;
    if (!Array.isArray(sdk.requiredKeys) || sdk.requiredKeys.some(v => !text(v))) add("unknown-sdk-requirements", `${at}.requiredKeys`, "missing");
    if (sdk.keyRefs !== undefined && !object(sdk.keyRefs)) { add("invalid-key-references", `${at}.keyRefs`); continue; }
    const builtins = { max: ["max_sdk_key"], applovin: ["max_sdk_key"], admob: ["google_app_id"], googlead: ["google_app_id"], bytebrew: ["bytebrew_game_id", "bytebrew_sdk_key"], solarsdk: ["solar_app_key"] };
    const sdkName = String(sdk.name).toLowerCase();
    const builtInKeys = Object.hasOwn(builtins, sdkName) ? builtins[sdkName] : [];
    const keys = new Set([...(Array.isArray(sdk.requiredKeys) ? sdk.requiredKeys.filter(text) : []), ...builtInKeys]);
    for (const key of keys) if (!text(sdk.keyRefs?.[key]) || placeholder(sdk.keyRefs[key])) add("missing-sdk-key-reference", `${at}.keyRefs`, "missing");
  }
  const seen = new Set();
  for (const [i, unit] of (input.adUnits ?? []).entries()) {
    const at = `adUnits[${i}]`;
    if (!object(unit)) { add("invalid-ad-unit", at); continue; }
    for (const field of ["provider", "source", "type", "id"]) need(unit[field], `${at}.${field}`);
    if (unit.excluded === true) add("excluded-ad-unit-in-active-list", at);
    const pair = JSON.stringify([unit.source, unit.type]);
    if (seen.has(pair)) add("duplicate-source-type", at);
    seen.add(pair);
    const provider = String(unit.provider).toLowerCase();
    if (["admob", "googlead"].includes(provider)) {
      if (text(unit.id) && !/^ca-app-pub-\d+\/\d+$/.test(unit.id)) add("admob-unit-not-app-id", `${at}.id`);
      const tierSource = { High: "GoogleAd_High", Medium: "GoogleAd_Medium", All: "GoogleAd" };
      if (!Object.hasOwn(tierSource, unit.tier ?? "")) add("missing-or-unsupported-tier", `${at}.tier`);
      else if (unit.source !== tierSource[unit.tier]) add("tier-source-mismatch", `${at}.source`);
    } else if (["max", "applovin"].includes(provider)) {
      if (unit.source !== "Applovin") add("provider-source-mismatch", `${at}.source`);
      if (text(unit.id) && unit.id.startsWith("ca-app-pub-")) add("provider-id-mismatch", `${at}.id`);
    } else add("unsupported-provider-mapping", `${at}.provider`, "missing");
  }
  if (input.firebase) {
    const f = input.firebase;
    if (typeof f.enabled !== "boolean") add("unknown-firebase-selection", "firebase.enabled", "missing");
    if (f.enabled === true) {
      for (const field of ["projectId", "appId", "applicationId", "path", "importPath"]) need(f[field], `firebase.${field}`);
      compare(f.applicationId, g.applicationId, "firebase.applicationId", "firebase-app-mismatch");
      compare(f.path, f.importPath, "firebase.path", "firebase-import-path-mismatch");
      truth(f.metaPresent, "firebase.metaPresent");
      if (f.imported === false) add("firebase-not-imported", "firebase.imported", "missing");
    }
  }
  need(s.mode, "signing.mode");
  if (!["new", "existing"].includes(s.appHistory)) add("missing-app-history", "signing.appHistory", "missing");
  const checkCertificate = () => {
    for (const field of ["expectedFingerprint", "observedFingerprint"]) {
      if (!text(s[field])) add("missing-certificate-evidence", `signing.${field}`, "missing");
      else if (!cert(s[field])) add("invalid-certificate-fingerprint", `signing.${field}`);
    }
    if (cert(s.expectedFingerprint) && cert(s.observedFingerprint) && fingerprint(s.expectedFingerprint) !== fingerprint(s.observedFingerprint)) add("certificate-mismatch", "signing.observedFingerprint");
  };
  if (input.platform === "Android") {
    if (s.mode === "debug") {
      if (s.appHistory !== "new" || o.format !== "apk" || o.variant !== "development") add("debug-signing-scope-conflict", "signing.mode");
    } else if (s.mode === "custom") {
      for (const field of ["fileRef", "alias", "passwordRef", "aliasPasswordRef"]) need(s[field], `signing.${field}`);
      truth(s.runnerAvailable, "signing.runnerAvailable");
      truth(s.aliasExists, "signing.aliasExists");
      checkCertificate();
    } else if (text(s.mode)) add("unsupported-signing-mode", "signing.mode");
  } else {
    if (o.format === "xcode-project") {
      if (s.mode !== "unsigned-export") add("signing-output-contract-review", "signing.mode", "missing");
    } else {
      truth(c.macos, "ci.macos");
      need(c.xcodeVersion, "ci.xcodeVersion");
      if (typeof c.podsRequired !== "boolean") add("unknown-pods-requirement", "ci.podsRequired", "missing");
      if (c.podsRequired === true) need(c.podsVersion, "ci.podsVersion");
      if (!["manual", "automatic"].includes(s.mode)) add("unsupported-signing-mode", "signing.mode");
      for (const field of ["teamId", "certificateRef", "profileRef", "profileApplicationId", "profileTeamId"]) need(s[field], `signing.${field}`);
      if (o.format === "ipa") need(s.exportMethod, "signing.exportMethod");
      for (const field of ["privateKeyAvailable", "certificateMatchesProfile", "profileValid", "entitlementsMatch"]) truth(s[field], `signing.${field}`);
      compare(s.teamId, s.profileTeamId, "signing.profileTeamId", "profile-team-mismatch");
      if (text(s.profileApplicationId) && ![g.applicationId, `${s.teamId}.${g.applicationId}`].includes(s.profileApplicationId)) add("profile-app-mismatch", "signing.profileApplicationId");
      checkCertificate();
    }
  }
  if (input.assemblies) {
    compare(input.assemblies.facadeName, input.assemblies.injectedName, "assemblies.injectedName", "assembly-identity-mismatch");
    if (input.assemblies.runtimeReferencesEditor === true) add("runtime-editor-dependency", "assemblies.runtimeReferencesEditor");
    else if (input.assemblies.runtimeReferencesEditor !== false) add("unknown-assembly-boundary", "assemblies.runtimeReferencesEditor", "missing");
  }
  if (input.banner) {
    const b = input.banner;
    if (text(b.callsitePosition) && b.callsitePosition !== "NotDefined" && b.callsitePosition !== b.configuredPosition) add("banner-callsite-override", "banner.callsitePosition");
    if (!text(b.effectivePosition)) add("unknown-effective-banner-position", "banner.effectivePosition", "missing");
  }
  if (input.iap) {
    const i = input.iap;
    if (typeof i.enabled !== "boolean") add("unknown-iap-selection", "iap.enabled", "missing");
    if (i.enabled === true) {
      compare(i.applicationId, g.applicationId, "iap.applicationId", "iap-app-mismatch");
      const expectedStore = input.platform === "Android" ? "GooglePlay" : "AppStore";
      if (i.store !== expectedStore) add("iap-store-mismatch", "iap.store");
      for (const field of ["catalogIds", "gameIds", "storeIds"]) if (!Array.isArray(i[field]) || !i[field].length || i[field].some(v => !text(v))) add("missing-iap-inventory", `iap.${field}`, "missing");
      if ([i.catalogIds, i.gameIds, i.storeIds].every(Array.isArray)) {
        if (i.gameIds.some(id => !i.catalogIds.includes(id) || !i.storeIds.includes(id))) add("iap-product-mismatch", "iap.gameIds");
      }
    }
  }
  if (input.artifact) {
    const a = input.artifact;
    truth(a.exists, "artifact.exists"); truth(a.retrievable, "artifact.retrievable");
    for (const [field, expected] of [["packageId", g.applicationId], ["version", g.version], ["buildNumber", g.buildNumber], ["format", o.format]]) compare(a[field], expected, `artifact.${field}`, "artifact-metadata-mismatch");
    if (!text(a.sha256)) add("missing-artifact-checksum", "artifact.sha256", "missing");
    else if (!/^[0-9a-f]{64}$/i.test(a.sha256)) add("invalid-artifact-checksum", "artifact.sha256");
    if (text(s.expectedFingerprint)) {
      if (!cert(a.fingerprint)) add("missing-artifact-signature", "artifact.fingerprint", "missing");
      else if (fingerprint(a.fingerprint) !== fingerprint(s.expectedFingerprint)) add("artifact-certificate-mismatch", "artifact.fingerprint");
    }
  }
  return done();
}

export function main(args) {
  const usage = () => { process.stdout.write(JSON.stringify({ status: "error", code: "usage-or-input-error" }) + "\n"); return 64; };
  if (![2, 3].includes(args.length) || args[0] !== "--input" || !args[1] || (args.length === 3 && args[2] !== "--dry-run")) return usage();
  try {
    // Bound actual reads too: a pipe/device or file that grows cannot bypass stat.
    const fd = fs.openSync(args[1], "r");
    let bytes;
    try {
      if (!fs.fstatSync(fd).isFile()) return usage();
      const buffer = Buffer.alloc(1024 * 1024 + 1);
      const count = fs.readSync(fd, buffer, 0, buffer.length, 0);
      if (count > 1024 * 1024) return usage();
      bytes = buffer.subarray(0, count);
    } finally { fs.closeSync(fd); }
    const report = preflight(JSON.parse(bytes.toString("utf8")));
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
    return report.status === "pass" ? 0 : report.status === "fail" ? 1 : 2;
  } catch { return usage(); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
