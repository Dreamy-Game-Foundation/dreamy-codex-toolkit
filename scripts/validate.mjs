import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(await readFile(fullPath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertHexCommit(value, label) {
  assert(typeof value === "string" && /^[0-9a-f]{40}$/.test(value), `${label} must be a 40-char commit SHA`);
}

export async function validate() {
  const toolkit = await readJson("toolkit.json");
  assert(toolkit.schemaVersion === 1, "toolkit.schemaVersion must be 1");
  assert(Array.isArray(toolkit.schemas) && toolkit.schemas.length >= 7, "toolkit.schemas must list baseline schemas");

  for (const schemaPath of toolkit.schemas) {
    const schema = await readJson(schemaPath);
    assert(schema.$schema, `${schemaPath} missing $schema`);
    assert(schema.title, `${schemaPath} missing title`);
  }

  const ledger = await readJson(toolkit.sourceLedger);
  assert(ledger.schemaVersion === 1, "source ledger schemaVersion must be 1");
  assert(Array.isArray(ledger.repositories), "source ledger repositories must be an array");
  assert(ledger.repositories.length >= 13, "source ledger must include reference repos, template, and 9 Dreamy packages");

  const ledgerIds = new Set();
  for (const repo of ledger.repositories) {
    assert(repo.id, "ledger repo missing id");
    assert(!ledgerIds.has(repo.id), `duplicate ledger repo id: ${repo.id}`);
    ledgerIds.add(repo.id);
    assert(repo.remote?.startsWith("https://github.com/"), `${repo.id} remote must be a GitHub URL`);
    assertHexCommit(repo.commit, `${repo.id}.commit`);
    assert(["observed", "observed-external", "drift", "unsupported"].includes(repo.status), `${repo.id} has invalid status`);
    if (repo.status === "observed-external") {
      assert(repo.evidenceNote, `${repo.id} observed-external status requires evidenceNote`);
    }
    assert(repo.role, `${repo.id} missing role`);
  }

  const dreamy = await readJson(toolkit.compatibility.dreamyPackages);
  assert(dreamy.schemaVersion === 1, "dreamy compatibility schemaVersion must be 1");
  assert(dreamy.policy?.identity === "verifiedCommit", "dreamy compatibility must use verifiedCommit identity");

  const packageEntries = Object.entries(dreamy.packages ?? {});
  assert(packageEntries.length === 9, "dreamy compatibility must include exactly 9 package records for W0");

  for (const [name, pkg] of packageEntries) {
    assert(ledgerIds.has(name), `${name} missing from source ledger`);
    assert(pkg.version, `${name} missing version`);
    assert(pkg.unity, `${name} missing unity`);
    assertHexCommit(pkg.verifiedCommit, `${name}.verifiedCommit`);
    assert(["observed", "drift"].includes(pkg.status), `${name} status must be observed or drift`);
    assert(pkg.dreamyDependencies && typeof pkg.dreamyDependencies === "object", `${name} missing dreamyDependencies`);
    assert(pkg.thirdPartyDependencies && typeof pkg.thirdPartyDependencies === "object", `${name} missing thirdPartyDependencies`);
    assert(Array.isArray(pkg.capabilities) && pkg.capabilities.length > 0, `${name} missing capabilities`);
    if (pkg.status === "drift") {
      assert(
        Array.isArray(pkg.drift) || Array.isArray(pkg.unsupportedContracts),
        `${name} drift records must explain drift or unsupported contracts`
      );
    }
  }

  const dataconfig = dreamy.packages["com.dreamy.dataconfig"];
  assert(dataconfig.status === "drift", "DataConfig UniTask manifest drift must remain explicit");

  const ui = dreamy.packages["com.dreamy.ui"];
  assert(ui.status === "drift", "UI TMP manifest drift must remain explicit");

  const editorTools = dreamy.packages["com.dreamy.editor-tools"];
  assert(editorTools.unsupportedContracts?.includes("No verified public headless API"), "Editor Tools headless API must be unsupported in W0");

  await readJson(toolkit.compatibility.unity);
  const thirdParty = await readJson(toolkit.compatibility.thirdParty);
  const knownThirdParty = new Set(Object.keys(thirdParty.packages ?? {}));
  for (const [name, pkg] of packageEntries) {
    for (const dependencyName of Object.keys(pkg.thirdPartyDependencies)) {
      assert(knownThirdParty.has(dependencyName), `${name} third-party dependency missing from compatibility catalog: ${dependencyName}`);
    }
  }

  const rules = await readJson(toolkit.rules);
  assert(rules.schemaVersion === 1, "rules index schemaVersion must be 1");
  assert(Array.isArray(rules.rules) && rules.rules.length === 49, "rules index must include 49 W0-W10 rules");
  const ruleIds = new Set();
  let coreCount = 0;
  let csharpCount = 0;
  let unityCount = 0;
  for (const rule of rules.rules) {
    assert(rule.id && rule.category && rule.purpose && rule.scope && rule.priority && rule.file, "rule missing required metadata");
    assert(typeof rule.dreamyOverride === "boolean", `${rule.id} dreamyOverride must be boolean`);
    assert(!ruleIds.has(rule.id), `duplicate rule id: ${rule.id}`);
    ruleIds.add(rule.id);
    if (rule.category === "core") coreCount += 1;
    if (rule.category === "csharp") csharpCount += 1;
    if (rule.category === "unity") unityCount += 1;
    await readJsonLikeText(rule.file);
  }
  assert(coreCount === 10, "rules index must include 10 core rules");
  assert(csharpCount === 8, "rules index must include 8 csharp rules");
  assert(unityCount === 11, "rules index must include 11 unity rules");

  const foundation = await readJson("modules/foundation/module.json");
  assert(foundation.id === "foundation", "foundation module id mismatch");
  assert(
    foundation.content.includes("rules/core") && foundation.content.includes("rules/csharp") && foundation.content.includes("rules/unity"),
    "foundation module must include core, csharp, and unity rules"
  );

  const corePreset = await readJson("presets/core.json");
  assert(corePreset.id === "core", "core preset id mismatch");
  assert(corePreset.modules.includes("foundation"), "core preset must include foundation module");

  return {
    repositories: ledger.repositories.length,
    dreamyPackages: packageEntries.length,
    schemas: toolkit.schemas.length,
    rules: rules.rules.length
  };
}

async function readJsonLikeText(relativePath) {
  await readFile(path.join(root, relativePath), "utf8");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validate()
    .then((result) => {
      console.log(`W0/W1/W2 validation passed: ${result.repositories} repositories, ${result.dreamyPackages} packages, ${result.schemas} schemas, ${result.rules} rules`);
    })
    .catch((error) => {
      console.error(`W0 validation failed: ${error.message}`);
      process.exitCode = 1;
    });
}
