import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { preflight } from "../../skills/platform/unity-mobile-first-build/scripts/preflight.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const skill = path.join(root, "skills/platform/unity-mobile-first-build");
const script = path.join(skill, "scripts/preflight.mjs");
const fixture = (name = "android") => JSON.parse(fs.readFileSync(path.join(root, `tests/fixtures/mobile-first-build/${name}.json`), "utf8"));
const codes = report => report.findings.map(f => f.code);
function scenario(name, change, expected, platform = "android") {
  test(name, () => {
    const input = fixture(platform), original = structuredClone(input);
    change(input);
    const before = structuredClone(input), report = preflight(input);
    assert.notEqual(report.status, "pass");
    for (const code of expected) assert.ok(codes(report).includes(code), JSON.stringify(report));
    assert.deepEqual(input, before, "checker must not mutate even failing inputs");
    assert.equal(report.executionAuthorized, false);
    assert.notDeepEqual(input, original);
  });
}

test("Android and iOS static snapshots pass without claiming build or authorization", () => {
  for (const platform of ["android", "ios"]) {
    const input = fixture(platform), before = structuredClone(input), report = preflight(input);
    assert.equal(report.status, "pass", JSON.stringify(report));
    assert.equal(report.scope, "normalized-input-only");
    assert.equal(report.executionAuthorized, false);
    assert.ok(report.remainingGates.includes("artifact-bytes-and-signature"));
    assert.ok(report.remainingGates.includes("platform-build"));
    assert.deepEqual(input, before);
  }
});

scenario("selected SDK cannot borrow another provider's key", i => { i.sdks[0].keyRefs = { google_app_id: "secret-manager:other" }; }, ["missing-sdk-key-reference"]);
scenario("unknown SDK requirements stay incomplete", i => { i.sdks.push({ name: "UnknownSDK", enabled: true }); }, ["unknown-sdk-requirements"]);
scenario("Firebase wrong package and wrong import path are separate failures", i => { i.firebase.applicationId = "com.example.other"; i.firebase.path = "google-services.json"; }, ["firebase-app-mismatch", "firebase-import-path-mismatch"]);
scenario("local keystore does not establish runner availability", i => { i.signing.runnerAvailable = false; }, ["check-failed"]);
scenario("alias and certificate failures cannot change signing identity", i => { i.signing.aliasExists = false; i.signing.observedFingerprint = "b".repeat(64); }, ["check-failed", "certificate-mismatch"]);
scenario("post-injection assembly mismatch and Runtime Editor leak fail", i => { i.assemblies.injectedName = "Other.SDK"; i.assemblies.runtimeReferencesEditor = true; }, ["assembly-identity-mismatch", "runtime-editor-dependency"]);
scenario("generated root mismatch is caught at template owner", i => { i.ci.rootMatchesTemplate = false; }, ["check-failed"]);
scenario("remote rename drift is found without renaming local directory", i => { i.repo.remoteUrl = "https://gitlab.example.invalid/studio/old.git"; }, ["remote-drift-review"]);
scenario("successful push source still excluded by reviewed job rule", i => { i.ci.source = "merge_request_event"; }, ["job-rule-excludes-source"]);
scenario("unreviewed external scripts and forbidden post-build Git block preflight", i => { delete i.ci.entrypointVersion; i.ci.forbiddenGitEffects = true; i.ci.propagatesExitCodes = false; }, ["missing-field", "forbidden-script-side-effects", "check-failed"]);
scenario("job green with missing artifact cannot establish handoff", i => { i.artifact = { exists: false, retrievable: false }; }, ["check-failed", "missing-comparison", "missing-artifact-signature"]);
scenario("artifact package, version and signing mismatch fail independently", i => { i.artifact = { exists: true, retrievable: true, packageId: "com.example.other", version: "0.1", buildNumber: "1", format: "apk", sha256: "f".repeat(64), fingerprint: "b".repeat(64) }; }, ["artifact-metadata-mismatch", "artifact-certificate-mismatch"]);
scenario("explicit banner call site override needs effective-source review", i => { i.banner = { configuredPosition: "BottomCenter", callsitePosition: "TopCenter" }; }, ["banner-callsite-override", "unknown-effective-banner-position"]);
scenario("IAP catalog and store must belong to this app and products", i => { i.iap = { enabled: true, applicationId: "com.example.other", store: "AppStore", catalogIds: ["coins"], gameIds: ["noads"], storeIds: ["coins"] }; }, ["iap-app-mismatch", "iap-store-mismatch", "iap-product-mismatch"]);
scenario("ad App ID, duplicate pair and excluded bidding rows are rejected", i => { i.adUnits[0].id = "ca-app-pub-0000000000000000~0000000000"; i.adUnits.push({ ...i.adUnits[0], excluded: true }); }, ["admob-unit-not-app-id", "duplicate-source-type", "excluded-ad-unit-in-active-list"]);
scenario("tier mapping cannot collapse Medium into All", i => { i.adUnits[0].tier = "Medium"; i.adUnits[0].source = "GoogleAd"; }, ["tier-source-mismatch"]);
scenario("iOS profile bundle/team mismatch cannot reuse Android identity", i => { i.signing.profileApplicationId = "OTHERTEAM.com.example.android"; i.signing.profileTeamId = "OTHERTEAM"; }, ["profile-app-mismatch", "profile-team-mismatch"], "ios");
scenario("iOS runner, Pods and private key gaps stay visible", i => { i.ci.macos = false; delete i.ci.podsVersion; i.signing.privateKeyAvailable = false; }, ["check-failed", "missing-field"], "ios");
scenario("iOS Firebase needs matching plist import", i => { i.firebase.path = "Assets/google-services.json"; }, ["firebase-import-path-mismatch"], "ios");

test("unsigned iOS project export does not demand distribution credentials", () => {
  const input = fixture("ios");
  input.output.format = "xcode-project";
  input.signing = { mode: "unsigned-export", appHistory: "new" };
  delete input.ci.macos; delete input.ci.xcodeVersion; delete input.ci.podsVersion; delete input.ci.podsRequired;
  assert.equal(preflight(input).status, "pass");
});

test("Unity without Dreamy remains supported and no SDK inventory is invented", () => {
  const input = fixture();
  input.sdks = []; input.adUnits = [];
  delete input.assemblies; delete input.firebase;
  assert.equal(preflight(input).status, "pass");
  input.sdks = [{ name: "ByteBrew", enabled: true, requiredKeys: [], keyRefs: {} }];
  assert.equal(codes(preflight(input)).filter(c => c === "missing-sdk-key-reference").length, 2);
  for (const name of ["constructor", "__proto__", "toString"]) {
    input.sdks = [{ name, enabled: true }];
    assert.ok(codes(preflight(input)).includes("unknown-sdk-requirements"));
  }
});

test("raw credentials and malformed/unsupported sections never appear in findings", () => {
  const sentinel = "DO-NOT-PRINT-fixture-secret";
  for (const input of [null, [], { schemaVersion: 2 }, { ...fixture(), signing: [] }, { ...fixture(), sdks: [null] }, { ...fixture(), [sentinel]: sentinel }, { ...fixture(), signing: { password: sentinel } }]) {
    const report = preflight(input);
    assert.notEqual(report.status, "pass");
    assert.equal(JSON.stringify(report).includes(sentinel), false);
  }
  const input = fixture(); input.repo.url = `https://user:${sentinel}@gitlab.example.invalid/demo?token=${sentinel}`;
  const report = preflight(input);
  assert.ok(codes(report).includes("unsafe-url"));
  assert.equal(JSON.stringify(report).includes(sentinel), false);
});

test("omitted SDK selection and selected capability without config remain incomplete", () => {
  const input = fixture();
  delete input.sdks;
  assert.ok(codes(preflight(input)).includes("missing-sdk-selection-inventory"));
  input.sdks = [{ name: "Firebase", enabled: true, requiredKeys: [] }, { name: "InAppPurchase", enabled: true, requiredKeys: [] }];
  delete input.firebase;
  assert.equal(codes(preflight(input)).filter(c => c === "selected-capability-config-missing").length, 2);
});

test("standalone CLI returns distinct exits, does not write or follow secret references", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mobile-preflight-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const inputFile = path.join(temporary, "input.json"), secret = path.join(temporary, "private.txt");
  fs.writeFileSync(secret, "DO-NOT-PRINT-PRIVATE-FILE");
  const input = fixture(); input.signing.passwordRef = secret;
  fs.writeFileSync(inputFile, JSON.stringify(input));
  const before = fs.readdirSync(temporary).map(f => [f, fs.readFileSync(path.join(temporary, f), "utf8")]);
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: temporary, env: { PATH: "", FIXTURE_SECRET: "DO-NOT-PRINT-ENV" }, encoding: "utf8" });
  const passed = run("--input", inputFile, "--dry-run");
  assert.equal(passed.status, 0, passed.stdout + passed.stderr);
  assert.equal(passed.stdout.includes("DO-NOT-PRINT"), false);
  assert.deepEqual(fs.readdirSync(temporary).map(f => [f, fs.readFileSync(path.join(temporary, f), "utf8")]), before);
  input.signing.aliasExists = false; fs.writeFileSync(inputFile, JSON.stringify(input));
  assert.equal(run("--input", inputFile).status, 1);
  delete input.signing.aliasExists; fs.writeFileSync(inputFile, JSON.stringify(input));
  assert.equal(run("--input", inputFile).status, 2);
  for (const args of [[], ["--input", inputFile, "--build"], ["--input", temporary], ["--input", path.join(temporary, "absent.json")]]) assert.equal(run(...args).status, 64);
  fs.writeFileSync(inputFile, '{"DO-NOT-PRINT-PARSE-ERROR":');
  const malformed = run("--input", inputFile);
  assert.equal(malformed.status, 64); assert.equal(malformed.stdout.includes("DO-NOT-PRINT"), false);
  fs.writeFileSync(inputFile, " ".repeat(1024 * 1024 + 1));
  assert.equal(run("--input", inputFile).status, 64);
});

test("mobile workflow resolves only in mobile presets and ships a self-contained executable skill", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mobile-distribution-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const env = { ...process.env, DREAMY_CODEX_HOME: path.join(temporary, "codex"), DREAMY_AGENTS_HOME: path.join(temporary, "agents") };
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [path.join(root, "src/cli.js"), ...args, "--json"], { cwd: root, env, encoding: "utf8" }));
  for (const preset of ["unity-production", "unity-full", "dreamy-production", "dreamy-full"]) assert.ok(run("list", "--resolved", "--target", "global", "--preset", preset).skills.includes("unity-mobile-first-build"));
  assert.equal(run("list", "--resolved", "--target", "global", "--preset", "unity-minimal").skills.includes("unity-mobile-first-build"), false);
  run("install", "--target", "global", "--preset", "unity-production", "--dry-run");
  assert.equal(fs.existsSync(env.DREAMY_AGENTS_HOME), false);
  run("install", "--target", "global", "--preset", "unity-production");
  const installed = path.join(env.DREAMY_AGENTS_HOME, "skills/unity-mobile-first-build");
  const entry = fs.readFileSync(path.join(installed, "SKILL.md"), "utf8");
  for (const link of [...entry.matchAll(/\]\((references\/[^)]+)\)/g)].map(m => m[1])) assert.equal(fs.readFileSync(path.join(installed, link), "utf8"), fs.readFileSync(path.join(skill, link), "utf8"));
  const result = JSON.parse(execFileSync(process.execPath, [path.join(installed, "scripts/preflight.mjs"), "--input", path.join(root, "tests/fixtures/mobile-first-build/ios.json"), "--dry-run"], { cwd: temporary, encoding: "utf8" }));
  assert.equal(result.status, "pass");
  run("update", "--target", "global", "--preset", "unity-production");
  assert.equal(fs.existsSync(path.join(env.DREAMY_CODEX_HOME, "hooks.json")), false);
  run("uninstall", "--target", "global");
  assert.equal(fs.existsSync(installed), false);
});
