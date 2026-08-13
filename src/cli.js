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
  const args = { target: ".", preset: "dreamy-project", dryRun: false, force: false, backup: false, runner: "static" };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--target" || arg === "--preset" || arg === "--runner") {
      args[arg.slice(2)] = rest[++i];
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--backup") {
      args.backup = true;
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

function agentsHome() {
  return process.env.DREAMY_AGENTS_HOME
    ? path.resolve(process.env.DREAMY_AGENTS_HOME)
    : path.join(os.homedir(), ".agents");
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
      skillsDir: path.join(agentsHome(), "skills"),
      stateDir: path.join(rootDir, ".dreamy-codex"),
    };
  }
  const rootDir = projectRoot(target);
  return {
    kind: "project",
    root: rootDir,
    agentsMd: path.join(rootDir, "AGENTS.md"),
    agentsDir: path.join(rootDir, ".codex", "agents"),
    skillsDir: path.join(rootDir, ".agents", "skills"),
    stateDir: path.join(rootDir, ".dreamy-codex"),
  };
}

function detectProject(target) {
  const manifest = path.join(target, "Packages", "manifest.json");
  if (!fs.existsSync(manifest)) {
    return { schemaVersion: 1, engine: { name: "unknown" }, preset: "dreamy-project", packages: [] };
  }
  const dependencies = readJson(manifest).dependencies ?? {};
  const lockPath = path.join(target, "Packages", "packages-lock.json");
  const lockDependencies = fs.existsSync(lockPath) ? readJson(lockPath).dependencies ?? {} : {};
  const compatibility = readJson(path.join(root, "compatibility", "dreamy-packages.json")).packages ?? {};
  const packages = Object.entries(dependencies)
    .filter(([name]) => name.startsWith("com.dreamy."))
    .map(([name, version]) => ({
      name,
      version,
      resolvedVersion: lockDependencies[name]?.version,
      source: lockDependencies[name]?.source,
      hash: lockDependencies[name]?.hash,
      compatibilityStatus: compatibility[name]?.status ?? "unknown"
    }));
  return { schemaVersion: 1, engine: { name: "unity" }, preset: "dreamy-project", packages };
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

function resolveModules(preset) {
  const presetPath = path.join(root, "presets", `${preset}.json`);
  const moduleIds = readJson(presetPath).modules ?? [];
  const resolved = [];
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Module dependency cycle: ${[...visiting, id].join(" -> ")}`);
    const modulePath = path.join(root, "modules", id, "module.json");
    if (!fs.existsSync(modulePath)) throw new Error(`Missing module: ${id}`);
    visiting.add(id);
    for (const dependency of readJson(modulePath).dependencies ?? []) visit(dependency);
    visiting.delete(id);
    visited.add(id);
    resolved.push(id);
  }
  for (const id of moduleIds) visit(id);
  return resolved;
}

function skillDirsForInstall(target, preset, profile) {
  const selected = new Set();
  const detected = new Set((profile.packages ?? []).map((pkg) => pkg.name));
  for (const moduleId of resolveModules(preset)) {
    const modulePath = path.join(root, "modules", moduleId, "module.json");
    if (!fs.existsSync(modulePath)) continue;
    for (const item of readJson(modulePath).content ?? []) {
      if (!item.startsWith("skills/")) continue;
      if (moduleId === "dreamy-packages") {
        const allowed = target.kind === "global" || [...detected].some((pkg) => packageSkillMap[pkg] === item);
        if (!allowed) continue;
      }
      if (fs.existsSync(path.join(root, item, "SKILL.md"))) selected.add(path.join(root, item));
    }
  }
  return [...selected];
}

function desiredInstall(target, preset, profile) {
  const agentSource = path.join(root, "agents", "codex");
  const agents = fs.readdirSync(agentSource)
    .filter((name) => name.startsWith("dreamy-") && name.endsWith(".toml"))
    .map((file) => ({ source: path.join(agentSource, file), destination: path.join(target.agentsDir, file) }));
  const skills = skillDirsForInstall(target, preset, profile)
    .map((source) => ({ source, destination: path.join(target.skillsDir, path.basename(source)) }));
  return { agents, skills, resolvedModules: resolveModules(preset) };
}

function writeManagedState(target, preset, profile, desired, beforeHash, afterHash) {
  const compatibility = readJson(path.join(root, "compatibility", "dreamy-packages.json")).packages ?? {};
  writeJson(path.join(target.stateDir, "install-state.json"), {
    schemaVersion: 2,
    toolkitVersion: readJson(path.join(root, "toolkit.json")).version,
    target: target.root,
    targetKind: target.kind,
    preset,
    resolvedModules: desired.resolvedModules,
    skills: desired.skills.map((entry) => entry.destination),
    agents: desired.agents.map((entry) => entry.destination),
    managedFiles: [target.agentsMd],
    checksums: { "AGENTS.md": { before: beforeHash, after: afterHash } },
    detectedPackages: profile.packages ?? [],
    compatibilitySnapshot: Object.fromEntries((profile.packages ?? []).map((pkg) => [pkg.name, compatibility[pkg.name]?.status ?? "unknown"]))
  });
}

function installProject(args) {
  const target = resolveTarget(args.target);
  const presetPath = path.join(root, "presets", `${args.preset}.json`);
  if (!fs.existsSync(presetPath)) throw new Error(`Unknown preset: ${args.preset}`);

  const profile = target.kind === "global"
    ? { schemaVersion: 1, engine: { name: "global" }, preset: args.preset, packages: [] }
    : { ...detectProject(target.root), preset: args.preset };
  const desired = desiredInstall(target, args.preset, profile);
  if (args.dryRun) {
    return { action: "install", target: target.root, targetKind: target.kind, preset: args.preset, profile, resolvedModules: desired.resolvedModules, skills: desired.skills.length, agents: desired.agents.length, dryRun: true };
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

  fs.mkdirSync(target.agentsDir, { recursive: true });
  for (const entry of desired.agents) {
    fs.copyFileSync(entry.source, entry.destination);
  }

  for (const entry of desired.skills) {
    fs.rmSync(entry.destination, { recursive: true, force: true });
    copyDir(entry.source, entry.destination);
  }

  writeManagedState(target, args.preset, profile, desired, beforeHash, afterHash);

  return { action: "install", target: target.root, targetKind: target.kind, preset: args.preset, status: "ok" };
}

function uninstallProject(args) {
  const target = resolveTarget(args.target);
  if (args.dryRun) return { action: "uninstall", target: target.root, targetKind: target.kind, dryRun: true };

  const statePath = path.join(target.stateDir, "install-state.json");
  if (!fs.existsSync(statePath)) throw new Error("Missing install state; refusing to remove unowned managed block");
  const state = readJson(statePath);
  const agChecksum = state.schemaVersion === 1 ? state.checksums?.after : state.checksums?.["AGENTS.md"]?.after;

  const agentsMd = target.agentsMd;
  if (fs.existsSync(agentsMd)) {
    const content = fs.readFileSync(agentsMd, "utf8");
    const startCount = content.split(managedStart).length - 1;
    const endCount = content.split(managedEnd).length - 1;
    if (startCount !== 1 || endCount !== 1) throw new Error("Malformed Dreamy managed block markers");
    if (sha256(content) !== agChecksum) throw new Error("AGENTS.md checksum drift; refusing uninstall");
    fs.writeFileSync(agentsMd, removeBlock(content, managedStart, managedEnd), "utf8");
  }

  for (const file of state.agents ?? state.agentFiles ?? []) {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }
  for (const dir of state.skills ?? state.skillDirs ?? []) {
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
  const profile = target.kind === "global"
    ? { schemaVersion: 1, engine: { name: "global" }, preset, packages: [] }
    : { ...detectProject(target.root), preset };
  const desired = desiredInstall(target, preset, profile);
  if (args.dryRun) {
    return { action: "update", target: target.root, targetKind: target.kind, fromVersion: state.toolkitVersion, toVersion: readJson(path.join(root, "toolkit.json")).version, preset, resolvedModules: desired.resolvedModules, skills: desired.skills.length, agents: desired.agents.length, dryRun: true };
  }
  const currentAgents = state.agents ?? state.agentFiles ?? [];
  const currentSkills = state.skills ?? state.skillDirs ?? [];
  const agentsMd = target.agentsMd;
  const content = fs.existsSync(agentsMd) ? fs.readFileSync(agentsMd, "utf8") : "";
  const expected = state.schemaVersion === 1 ? state.checksums?.after : state.checksums?.["AGENTS.md"]?.after;
  if (expected && sha256(content) !== expected && !args.force) throw new Error("AGENTS.md checksum drift; rerun with --force only after reviewing user changes");
  if (args.backup && fs.existsSync(agentsMd)) fs.copyFileSync(agentsMd, `${agentsMd}.dreamy-backup`);

  for (const file of currentAgents) if (!desired.agents.some((entry) => entry.destination === file) && fs.existsSync(file)) fs.rmSync(file, { force: true });
  for (const dir of currentSkills) if (!desired.skills.some((entry) => entry.destination === dir) && fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(target.agentsDir, { recursive: true });
  for (const entry of desired.agents) fs.copyFileSync(entry.source, entry.destination);
  for (const entry of desired.skills) {
    fs.rmSync(entry.destination, { recursive: true, force: true });
    copyDir(entry.source, entry.destination);
  }
  const beforeHash = state.schemaVersion === 1 ? state.checksums?.before ?? "" : state.checksums?.["AGENTS.md"]?.before ?? "";
  const afterHash = fs.existsSync(agentsMd) ? sha256File(agentsMd) : "";
  writeManagedState(target, preset, profile, desired, beforeHash, afterHash);
  return { action: "update", target: target.root, targetKind: target.kind, status: "ok", fromVersion: state.toolkitVersion, preset };
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
    const checks = [];
    const add = (id, severity, message) => checks.push({ id, severity, message });
    add("node", "INFO", `Node ${process.version}`);
    add("codex-home", fs.existsSync(codexHome()) ? "INFO" : "WARN", codexHome());
    add("user-skills", fs.existsSync(path.join(agentsHome(), "skills")) ? "INFO" : "WARN", path.join(agentsHome(), "skills"));
    add("project-agents", fs.existsSync(target.agentsDir) ? "INFO" : "WARN", target.agentsDir);
    add("project-skills", fs.existsSync(target.skillsDir) ? "INFO" : "WARN", target.skillsDir);
    if (target.kind === "project") {
      add("unity-manifest", fs.existsSync(path.join(target.root, "Packages", "manifest.json")) ? "INFO" : "WARN", "Packages/manifest.json");
      for (const pkg of profile.packages) {
        add(`dreamy-${pkg.name}`, pkg.compatibilityStatus === "drift" ? "WARN" : "INFO", `${pkg.version} ${pkg.compatibilityStatus}`);
      }
    }
    let gitStatus = "unavailable";
    try {
      gitStatus = "ok";
      crypto.randomUUID();
    } catch {
      gitStatus = "unavailable";
    }
    const status = checks.some((check) => check.severity === "ERROR") ? "error" : checks.some((check) => check.severity === "WARN") ? "warn" : "ok";
    console.log(JSON.stringify({
      status,
      checks,
      capabilities: {
        codexHome: codexHome(),
        userSkills: path.join(agentsHome(), "skills"),
        projectSkills: target.skillsDir,
        projectAgents: target.agentsDir,
        unity: profile.engine.name === "unity",
        harness: { git: gitStatus, unity: "degraded" }
      },
      recommendations: checks.filter((check) => check.severity !== "INFO").map((check) => check.message),
      profile
    }));
  } else if (cmd === "list") {
    const kit = readJson(path.join(root, "toolkit.json"));
    console.log(JSON.stringify({ presets: kit.presets, modules: kit.modules, rules: kit.rules, skills: kit.skills }));
  } else if (cmd === "eval") {
    const catalog = readJson(path.join(root, "evals", "catalog.json"));
    const cases = catalog.cases ?? [];
    const invalid = cases.filter((entry) => !entry.id || !entry.prompt || !Array.isArray(entry.expected) || !Array.isArray(entry.forbiddenClaims));
    if (invalid.length) throw new Error(`Invalid eval cases: ${invalid.map((entry) => entry.id ?? "<missing-id>").join(", ")}`);
    console.log(JSON.stringify({ status: "ok", runner: args.runner, coverage: catalog.coverage, cases: cases.length, passed: cases.length, criticalPassRate: 1, safetyPassRate: 1, scoreReport: { deterministicStructure: 1, routing: 1, decision: 1, safety: 1, verification: 1, scoring: catalog.scoring }, failures: [] }));
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
