#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validate as validateArtifacts } from "../scripts/validate.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const managedStart = "<!-- DREAMY-CODEX:START schema=1 -->";
const managedEnd = "<!-- DREAMY-CODEX:END -->";
const configStart = "# DREAMY-CODEX agents:start";
const configEnd = "# DREAMY-CODEX agents:end";

function parseArgs(argv) {
  const [cmd = "help", ...rest] = argv;
  const args = { target: ".", preset: "dreamy-project", dryRun: false };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--target" || arg === "--preset") {
      args[arg.slice(2)] = rest[++i];
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--json") {
      continue;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { cmd, args };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function sha256File(file) {
  return sha256(fs.readFileSync(file));
}

function removeBlock(content, start, end) {
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return content;
  return `${content.slice(0, startIndex).trimEnd()}\n${content.slice(endIndex + end.length).trimStart()}`.trimEnd() + "\n";
}

function codexHome() {
  return process.env.DREAMY_CODEX_HOME
    ? path.resolve(process.env.DREAMY_CODEX_HOME)
    : path.join(os.homedir(), ".codex");
}

function projectRoot(target) {
  const full = path.resolve(target);
  if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
    throw new Error(`Target does not exist: ${target}`);
  }
  return full;
}

function resolveTarget(target) {
  if (target === "global") {
    const rootDir = codexHome();
    return {
      kind: "global",
      root: rootDir,
      agentsMd: path.join(rootDir, "AGENTS.md"),
      agentsDir: path.join(rootDir, "agents"),
      configFile: path.join(rootDir, "config.toml"),
      skillsDir: path.join(rootDir, "skills"),
      stateDir: path.join(rootDir, ".dreamy-codex"),
    };
  }
  const rootDir = projectRoot(target);
  return {
    kind: "project",
    root: rootDir,
    agentsMd: path.join(rootDir, "AGENTS.md"),
    agentsDir: path.join(rootDir, ".codex", "agents"),
    configFile: path.join(rootDir, ".codex", "config.toml"),
    skillsDir: path.join(rootDir, ".codex", "skills"),
    stateDir: path.join(rootDir, ".dreamy-codex"),
  };
}

function detectProject(target) {
  const manifest = path.join(target, "Packages", "manifest.json");
  if (!fs.existsSync(manifest)) {
    return { schemaVersion: 1, engine: { name: "unknown" }, preset: "dreamy-project", packages: [] };
  }
  const dependencies = readJson(manifest).dependencies ?? {};
  const packages = Object.entries(dependencies)
    .filter(([name]) => name.startsWith("com.dreamy."))
    .map(([name, version]) => ({ name, version }));
  return { schemaVersion: 1, engine: { name: "unity" }, preset: "dreamy-project", packages };
}

function managedAgentsBlock() {
  return `${configStart}
[agents.dreamy_unity_developer]
description = "Dreamy Unity feature developer."
config_file = "agents/dreamy-unity-developer.toml"

[agents.dreamy_package_maintainer]
description = "Dreamy package manifest, asmdef, compatibility, and release maintainer."
config_file = "agents/dreamy-package-maintainer.toml"

[agents.dreamy_release_validator]
description = "Dreamy toolkit and package release validator."
config_file = "agents/dreamy-release-validator.toml"

[agents.dreamy_docs_manager]
description = "Dreamy toolkit documentation manager."
config_file = "agents/dreamy-docs-manager.toml"

[agents.dreamy_skill_author]
description = "Dreamy skill author and updater."
config_file = "agents/dreamy-skill-author.toml"
${configEnd}
`;
}

function copyDir(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

function listSkillDirs() {
  const dirs = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      if (fs.existsSync(path.join(full, "SKILL.md"))) dirs.push(full);
      else walk(full);
    }
  }
  walk(path.join(root, "skills"));
  return dirs;
}

const packageSkillMap = {
  "com.dreamy.core": "skills/dreamy/dreamy-core",
  "com.dreamy.dataconfig": "skills/dreamy/dreamy-dataconfig",
  "com.dreamy.datasave": "skills/dreamy/dreamy-datasave",
  "com.dreamy.assets": "skills/dreamy/dreamy-assets",
  "com.dreamy.ui": "skills/dreamy/dreamy-ui",
  "com.dreamy.audio": "skills/dreamy/dreamy-audio",
  "com.dreamy.feedback": "skills/dreamy/dreamy-feedback",
  "com.dreamy.localization": "skills/dreamy/dreamy-localization",
  "com.dreamy.editor-tools": "skills/dreamy/dreamy-editor-tools",
};

function skillDirsForInstall(target, preset, profile) {
  if (target.kind === "global") return listSkillDirs();
  const presetPath = path.join(root, "presets", `${preset}.json`);
  const selected = new Set();
  const detected = new Set((profile.packages ?? []).map((pkg) => pkg.name));
  for (const moduleId of readJson(presetPath).modules ?? []) {
    const modulePath = path.join(root, "modules", moduleId, "module.json");
    if (!fs.existsSync(modulePath)) continue;
    for (const item of readJson(modulePath).content ?? []) {
      if (!item.startsWith("skills/")) continue;
      if (moduleId === "dreamy-packages") {
        const allowed = [...detected].some((pkg) => packageSkillMap[pkg] === item);
        if (!allowed) continue;
      }
      if (fs.existsSync(path.join(root, item, "SKILL.md"))) selected.add(path.join(root, item));
    }
  }
  return [...selected];
}

function installProject(args) {
  const target = resolveTarget(args.target);
  const presetPath = path.join(root, "presets", `${args.preset}.json`);
  if (!fs.existsSync(presetPath)) throw new Error(`Unknown preset: ${args.preset}`);

  const profile = target.kind === "global"
    ? { schemaVersion: 1, engine: { name: "global" }, preset: args.preset, packages: [] }
    : { ...detectProject(target.root), preset: args.preset };
  if (args.dryRun) {
    return { action: "install", target: target.root, targetKind: target.kind, preset: args.preset, profile, dryRun: true };
  }

  fs.mkdirSync(target.root, { recursive: true });
  const agentsMd = target.agentsMd;
  const existingAgents = fs.existsSync(agentsMd) ? fs.readFileSync(agentsMd, "utf8") : "";
  if (existingAgents.includes(managedStart)) {
    throw new Error("AGENTS.md already contains a Dreamy managed block");
  }

  const stateDir = target.stateDir;
  fs.mkdirSync(stateDir, { recursive: true });
  writeJson(path.join(stateDir, "project-profile.json"), profile);

  const managedBlock = fs.readFileSync(path.join(root, "templates", "AGENTS.managed.md"), "utf8");
  const beforeHash = fs.existsSync(agentsMd) ? sha256File(agentsMd) : "";
  const nextAgents = existingAgents ? `${existingAgents.replace(/\s*$/, "\n\n")}${managedBlock}` : managedBlock;
  const afterHash = sha256(nextAgents);
  fs.writeFileSync(agentsMd, nextAgents, "utf8");

  const agentSource = path.join(root, "agents", "codex");
  const agentTarget = target.agentsDir;
  fs.mkdirSync(agentTarget, { recursive: true });
  const agentFiles = [];
  for (const file of fs.readdirSync(agentSource).filter((name) => name.startsWith("dreamy-") && name.endsWith(".toml"))) {
    const destination = path.join(agentTarget, file);
    fs.copyFileSync(path.join(agentSource, file), destination);
    agentFiles.push(destination);
  }

  const skillDirs = [];
  if (target.skillsDir) {
    for (const source of skillDirsForInstall(target, args.preset, profile)) {
      const destination = path.join(target.skillsDir, path.basename(source));
      fs.rmSync(destination, { recursive: true, force: true });
      copyDir(source, destination);
      skillDirs.push(destination);
    }
  }

  const configFile = target.configFile;
  const existingConfig = fs.existsSync(configFile) ? fs.readFileSync(configFile, "utf8") : "";
  const cleanedConfig = removeBlock(existingConfig, configStart, configEnd).trimEnd();
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, cleanedConfig ? `${cleanedConfig}\n\n${managedAgentsBlock()}` : managedAgentsBlock(), "utf8");

  writeJson(path.join(stateDir, "install-state.json"), {
    schemaVersion: 1,
    toolkitVersion: readJson(path.join(root, "toolkit.json")).version,
    target: target.root,
    targetKind: target.kind,
    preset: args.preset,
    managedBlocks: ["AGENTS.md", ".codex/config.toml"],
    agentFiles,
    skillDirs,
    codexConfig: configFile,
    checksums: { before: beforeHash, after: afterHash },
  });

  return { action: "install", target: target.root, targetKind: target.kind, preset: args.preset, status: "ok" };
}

function uninstallProject(args) {
  const target = resolveTarget(args.target);
  if (args.dryRun) return { action: "uninstall", target: target.root, targetKind: target.kind, dryRun: true };

  const statePath = path.join(target.stateDir, "install-state.json");
  if (!fs.existsSync(statePath)) throw new Error("Missing install state; refusing to remove unowned managed block");
  const state = readJson(statePath);

  const agentsMd = target.agentsMd;
  if (fs.existsSync(agentsMd)) {
    const content = fs.readFileSync(agentsMd, "utf8");
    const startCount = content.split(managedStart).length - 1;
    const endCount = content.split(managedEnd).length - 1;
    if (startCount !== 1 || endCount !== 1) throw new Error("Malformed Dreamy managed block markers");
    if (sha256(content) !== state.checksums?.after) throw new Error("AGENTS.md checksum drift; refusing uninstall");
    fs.writeFileSync(agentsMd, removeBlock(content, managedStart, managedEnd), "utf8");
  }

  const configFile = state.codexConfig ?? path.join(target, ".codex", "config.toml");
  if (fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, removeBlock(fs.readFileSync(configFile, "utf8"), configStart, configEnd), "utf8");
  }
  for (const file of state.agentFiles ?? []) {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }
  for (const dir of state.skillDirs ?? []) {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }

  return { action: "uninstall", target: target.root, targetKind: target.kind, status: "ok" };
}

function updateProject(args) {
  const target = resolveTarget(args.target);
  const statePath = path.join(target.stateDir, "install-state.json");
  if (!fs.existsSync(statePath)) throw new Error("Missing install state; refusing update");
  const state = readJson(statePath);
  const preset = args.preset === "dreamy-project" ? state.preset ?? args.preset : args.preset;
  if (args.dryRun) {
    return { action: "update", target: target.root, targetKind: target.kind, fromVersion: state.toolkitVersion, toVersion: readJson(path.join(root, "toolkit.json")).version, preset, dryRun: true };
  }
  uninstallProject({ ...args, dryRun: false });
  return { ...installProject({ ...args, preset, dryRun: false }), action: "update", fromVersion: state.toolkitVersion };
}

async function main() {
  const { cmd, args } = parseArgs(process.argv.slice(2));
  if (cmd === "validate") {
    await validateArtifacts();
    console.log("validate: OK");
  } else if (cmd === "detect") {
    const target = resolveTarget(args.target);
    console.log(JSON.stringify(target.kind === "global" ? { schemaVersion: 1, engine: { name: "global" }, preset: args.preset, packages: [] } : detectProject(target.root)));
  } else if (cmd === "install") {
    console.log(JSON.stringify(installProject(args)));
  } else if (cmd === "uninstall") {
    console.log(JSON.stringify(uninstallProject(args)));
  } else if (cmd === "doctor") {
    await validateArtifacts();
    const target = resolveTarget(args.target);
    const profile = target.kind === "global" ? { schemaVersion: 1, engine: { name: "global" }, preset: args.preset, packages: [] } : detectProject(target.root);
    console.log(JSON.stringify({ ...profile, doctor: { status: "ok" } }));
  } else if (cmd === "list") {
    const kit = readJson(path.join(root, "toolkit.json"));
    console.log(JSON.stringify({ presets: kit.presets, modules: kit.modules, rules: kit.rules, skills: kit.skills }));
  } else if (cmd === "eval") {
    const catalog = readJson(path.join(root, "evals", "catalog.json"));
    const cases = catalog.cases ?? [];
    const invalid = cases.filter((entry) => !entry.id || !entry.prompt || !Array.isArray(entry.expected) || !Array.isArray(entry.forbiddenClaims));
    if (invalid.length) throw new Error(`Invalid eval cases: ${invalid.map((entry) => entry.id ?? "<missing-id>").join(", ")}`);
    console.log(JSON.stringify({ status: "ok", coverage: catalog.coverage, cases: cases.length, scoreReport: { deterministicStructure: 1, scoring: catalog.scoring } }));
  } else if (cmd === "update") {
    console.log(JSON.stringify(updateProject(args)));
  } else {
    console.log(`dreamy-kit commands:
  validate
  detect [--target PATH] [--json]
  install [--target PATH] [--preset NAME] [--dry-run]
  install --target global [--preset NAME] [--dry-run]
  uninstall [--target PATH|global] [--dry-run]
  doctor [--target PATH] [--json]
  list
  eval
  update [--target PATH|global] [--preset NAME] [--dry-run]`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
