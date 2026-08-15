import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSchemaValidator, validateWithSchema } from "../src/schema-validation.js";

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

function walkFiles(dir, predicate = () => true) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) out.push(...walkFiles(relative, predicate));
    else if (predicate(relative)) out.push(relative);
  }
  return out.sort();
}

function assertUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    assert(!seen.has(value), `duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export async function validate() {
  const toolkit = await readJson("toolkit.json");
  const schemas = createSchemaValidator(path.join(root, "schemas"));
  validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/toolkit.schema.json", toolkit, "toolkit.json");
  assert(toolkit.schemaVersion === 1, "toolkit.schemaVersion must be 1");
  assert(Array.isArray(toolkit.schemas) && toolkit.schemas.length > 0, "toolkit.schemas must list schemas");

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

  const packageEntries = Object.entries(dreamy.packages ?? {}).sort(([a], [b]) => a.localeCompare(b));
  assert(packageEntries.length > 0, "dreamy compatibility must include package records");
  assertUnique(packageEntries.map(([name]) => name), "Dreamy package id");

  for (const [name, pkg] of packageEntries) {
    assert(/^com\.dreamy\.[a-z0-9.-]+$/.test(name), `${name} must be a canonical com.dreamy.* package id`);
    assert(ledgerIds.has(name), `${name} missing from source ledger`);
    assert(pkg.version, `${name} missing version`);
    assert(pkg.unity, `${name} missing unity`);
    assertHexCommit(pkg.verifiedCommit, `${name}.verifiedCommit`);
    assert(["observed", "drift", "known-drift", "unsupported"].includes(pkg.status), `${name} has invalid status`);
    assert(pkg.dreamyDependencies && typeof pkg.dreamyDependencies === "object", `${name} missing dreamyDependencies`);
    assert(pkg.thirdPartyDependencies && typeof pkg.thirdPartyDependencies === "object", `${name} missing thirdPartyDependencies`);
    assert(Array.isArray(pkg.capabilities) && pkg.capabilities.length > 0, `${name} missing capabilities`);
    if (pkg.status === "drift" || pkg.status === "known-drift") {
      assert(
        Array.isArray(pkg.drift) || Array.isArray(pkg.unsupportedContracts),
        `${name} drift records must explain drift or unsupported contracts`
      );
    }
  }

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
  assert(Array.isArray(rules.rules) && rules.rules.length > 0, "rules index must include rules");
  assertUnique(rules.rules.map((rule) => rule.id), "rule id");
  const indexedRuleFiles = new Set();
  for (const rule of rules.rules) {
    assert(rule.id && rule.category && rule.purpose && rule.scope && rule.priority && rule.file, "rule missing required metadata");
    assert(typeof rule.dreamyOverride === "boolean", `${rule.id} dreamyOverride must be boolean`);
    assert(!indexedRuleFiles.has(rule.file), `duplicate indexed rule file: ${rule.file}`);
    indexedRuleFiles.add(rule.file);
    await readJsonLikeText(rule.file);
  }
  const actualRuleFiles = walkFiles("rules", (file) => file.endsWith(".md"));
  for (const file of actualRuleFiles) assert(indexedRuleFiles.has(file), `rule file missing from index: ${file}`);
  for (const file of indexedRuleFiles) assert(actualRuleFiles.includes(file), `indexed rule file does not exist: ${file}`);

  const foundation = await readJson("modules/foundation/module.json");
  assert(foundation.id === "foundation", "foundation module id mismatch");
  assert(
    foundation.content.includes("rules/core") && foundation.content.includes("rules/csharp") && foundation.content.includes("rules/unity"),
    "foundation module must include core, csharp, and unity rules"
  );

  const corePreset = await readJson("presets/core.json");
  assert(corePreset.id === "core", "core preset id mismatch");
  assert(corePreset.modules.includes("foundation"), "core preset must include foundation module");

  const modulePaths = toolkit.modules ?? [];
  assertUnique(modulePaths, "module path");
  const moduleIds = new Set();
  const modules = [];
  for (const modulePath of modulePaths) {
    const module = await readJson(modulePath);
    validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/module.schema.json", module, modulePath);
    assert(!moduleIds.has(module.id), `duplicate module id: ${module.id}`);
    moduleIds.add(module.id);
    modules.push([modulePath, module]);
    for (const item of module.content ?? []) {
      const full = path.join(root, item);
      assert(fs.existsSync(full), `${module.id} references missing content path: ${item}`);
    }
    for (const agent of module.agents ?? []) {
      const file = agent.endsWith(".toml") ? agent : `${agent}.toml`;
      assert(fs.existsSync(path.join(root, "agents", "codex", file)), `${module.id} references missing agent: ${agent}`);
    }
  }
  const modulePathById = new Map(modules.map(([modulePath, module]) => [module.id, modulePath]));
  for (const [modulePath, module] of modules) {
    for (const dependency of module.dependencies ?? []) {
      assert(moduleIds.has(dependency), `${modulePath} references unknown module dependency: ${dependency}`);
    }
  }
  const visitingModules = new Set();
  const visitedModules = new Set();
  function visitModule(id, trail = []) {
    if (visitedModules.has(id)) return;
    assert(!visitingModules.has(id), `module dependency cycle: ${[...trail, id].join(" -> ")}`);
    visitingModules.add(id);
    const module = modules.find(([, candidate]) => candidate.id === id)?.[1];
    for (const dependency of module?.dependencies ?? []) visitModule(dependency, [...trail, id]);
    visitingModules.delete(id);
    visitedModules.add(id);
  }
  for (const id of moduleIds) visitModule(id);
  const actualModuleFiles = walkFiles("modules", (file) => file.endsWith("/module.json"));
  for (const file of actualModuleFiles) assert(modulePaths.includes(file), `module file missing from toolkit.json: ${file}`);
  for (const file of modulePaths) assert(actualModuleFiles.includes(file), `toolkit module path does not exist: ${file}`);

  const presetPaths = toolkit.presets ?? [];
  assertUnique(presetPaths, "preset path");
  const presetIds = new Set();
  for (const presetPath of presetPaths) {
    const preset = await readJson(presetPath);
    validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/preset.schema.json", preset, presetPath);
    assert(!presetIds.has(preset.id), `duplicate preset id: ${preset.id}`);
    presetIds.add(preset.id);
    for (const moduleId of preset.modules ?? []) {
      assert(modulePathById.has(moduleId), `${presetPath} references unknown module: ${moduleId}`);
    }
  }
  const actualPresetFiles = walkFiles("presets", (file) => file.endsWith(".json"));
  for (const file of actualPresetFiles) assert(presetPaths.includes(file), `preset file missing from toolkit.json: ${file}`);
  for (const file of presetPaths) assert(actualPresetFiles.includes(file), `toolkit preset path does not exist: ${file}`);

  const skillsIndex = await readJson(toolkit.skills);
  assert(skillsIndex.schemaVersion === 1, "skills index schemaVersion must be 1");
  assert(Array.isArray(skillsIndex.skills) && skillsIndex.skills.length > 0, "skills index must include skills");
  assertUnique(skillsIndex.skills.map((skill) => skill.name), "skill name");
  const indexedSkillFiles = new Set(skillsIndex.skills.map((skill) => skill.file));
  assertUnique([...indexedSkillFiles].map((file) => path.basename(path.dirname(file))), "skill destination basename");
  const actualSkillFiles = walkFiles("skills", (file) => file.endsWith("SKILL.md"));
  for (const file of actualSkillFiles) assert(indexedSkillFiles.has(file), `skill file missing from index: ${file}`);
  for (const file of indexedSkillFiles) assert(actualSkillFiles.includes(file), `indexed skill file does not exist: ${file}`);

  const evalCatalog = await readJson(toolkit.evals);
  for (const entry of evalCatalog.cases ?? []) {
    validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/eval-case.schema.json", entry, `eval ${entry.id ?? "<missing-id>"}`);
  }

  return {
    repositories: ledger.repositories.length,
    dreamyPackages: packageEntries.length,
    schemas: toolkit.schemas.length,
    rules: rules.rules.length,
    schemaValidatedArtifacts: 1 + toolkit.modules.length + toolkit.presets.length + (evalCatalog.cases ?? []).length
  };
}

async function readJsonLikeText(relativePath) {
  await readFile(path.join(root, relativePath), "utf8");
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  validate()
    .then((result) => {
      console.log(`W0/W1/W2 validation passed: ${result.repositories} repositories, ${result.dreamyPackages} packages, ${result.schemas} schemas, ${result.rules} rules`);
    })
    .catch((error) => {
      console.error(`W0 validation failed: ${error.message}`);
      process.exitCode = 1;
    });
}
