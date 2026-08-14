#!/usr/bin/env node
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { validate as validateArtifacts } from "../scripts/validate.mjs";
import { buildCatalogValidationReport } from "./eval-catalog.js";
import { inspectProject } from "./project-profile.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const managedStart = "<!-- DREAMY-CODEX:START schema=1 -->";
const managedEnd = "<!-- DREAMY-CODEX:END -->";
const configStart = "# DREAMY-CODEX agents:start";
const configEnd = "# DREAMY-CODEX agents:end";

function parseArgs(argv) {
  const [cmd = "setup", ...rest] = argv;
  const args = { target: ".", preset: "dreamy-project", dryRun: false, force: false, backup: false, runner: "catalog", json: false };
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
      args.json = true;
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
  return inspectProject(target, { compatibilityFile: path.join(root, "compatibility", "dreamy-packages.json") });
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
  const detected = new Set((profile.dreamyPackages ?? profile.packages ?? []).map((pkg) => pkg.name));
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
    detectedPackages: profile.dreamyPackages ?? profile.packages ?? [],
    compatibilitySnapshot: Object.fromEntries((profile.dreamyPackages ?? profile.packages ?? []).map((pkg) => [pkg.name, compatibility[pkg.name]?.status ?? "unknown"]))
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

async function runInteractiveSetup(args) {
  if (!process.stdin.isTTY) {
    console.log(JSON.stringify(installProject(args)));
    return;
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\n========================================================");
    console.log("✨ Welcome to Dreamy Codex Toolkit Easy Installer");
    console.log("========================================================\n");

    const answerTarget = await rl.question(`📁 Enter Unity project folder (Press ENTER for current folder '.'): `);
    const targetPath = answerTarget.trim() || args.target || ".";

    const target = resolveTarget(targetPath);
    const profile = target.kind === "global"
      ? { schemaVersion: 1, engine: { name: "global" }, preset: args.preset, packages: [] }
      : detectProject(target.root);

    console.log(`\n🔍 Project engine detected: ${profile.engine.name}`);
    const detectedDreamyPackages = profile.dreamyPackages ?? profile.packages ?? [];
    if (detectedDreamyPackages.length > 0) {
      console.log(`📦 Found ${detectedDreamyPackages.length} com.dreamy.* packages:`);
      for (const pkg of detectedDreamyPackages) {
        console.log(`   - ${pkg.name} (${pkg.declaredVersion ?? pkg.resolvedVersion ?? "unknown"})`);
      }
    }

    console.log("\n🎯 Presets:");
    console.log("   1) dreamy-project    (Recommended for Dreamy Unity Game projects)");
    console.log("   2) dreamy-package    (Recommended for UPM package development)");
    console.log("   3) dreamy-full       (Install ALL available skills & agents)");
    console.log("   4) unity-production  (Standard Unity production setup)");
    console.log("   5) core              (Minimal core setup)");

    const answerPreset = await rl.question("\nSelect preset (1-5 or name, default: dreamy-project): ");
    let preset = args.preset || "dreamy-project";
    const pChoice = answerPreset.trim();
    if (pChoice === "1") preset = "dreamy-project";
    else if (pChoice === "2") preset = "dreamy-package";
    else if (pChoice === "3") preset = "dreamy-full";
    else if (pChoice === "4") preset = "unity-production";
    else if (pChoice === "5") preset = "core";
    else if (pChoice) preset = pChoice;

    console.log(`\n🚀 Installing preset '${preset}' to '${target.root}'...`);
    const result = installProject({ target: targetPath, preset, dryRun: false });
    console.log(`\n✅ Success! Dreamy Codex agents & skills have been installed.`);
    console.log(`📄 Managed block written to: ${target.agentsMd}\n`);
  } finally {
    rl.close();
  }
}

function formatInstallOutput(result) {
  console.log("\n╭──────────────────────────────────────────────────────────╮");
  console.log("│ 🚀  DREAMY CODEX TOOLKIT - INSTALLATION                  │");
  console.log("╰──────────────────────────────────────────────────────────╯");
  console.log(`  ► Action : ${result.action}`);
  console.log(`  ► Target : ${result.target} [${result.targetKind}]`);
  console.log(`  ► Preset : ${result.preset}`);
  if (result.dryRun) {
    console.log("\n  🔍 [DRY RUN SUMMARY - No files were modified]");
    console.log(`     • Modules resolved : ${(result.resolvedModules || []).join(", ")}`);
    console.log(`     • Agents to copy   : ${result.agents}`);
    console.log(`     • Skills to copy   : ${result.skills}\n`);
  } else {
    console.log("\n  ✨ INSTALLATION COMPLETED SUCCESSFULLY!");
    console.log("     ✔ Written managed block to AGENTS.md");
    console.log("     ✔ Configured Codex agents in .codex/agents/");
    console.log("     ✔ Configured Dreamy skills in .agents/skills/");
    console.log("     ✔ Generated project profile & install state\n");
  }
}

function formatUninstallOutput(result) {
  console.log("\n╭──────────────────────────────────────────────────────────╮");
  console.log("│ 🧹  DREAMY CODEX TOOLKIT - UNINSTALLATION                │");
  console.log("╰──────────────────────────────────────────────────────────╯");
  console.log(`  ► Action : ${result.action}`);
  console.log(`  ► Target : ${result.target} [${result.targetKind}]`);
  if (result.dryRun) {
    console.log("\n  🔍 [DRY RUN SUMMARY - No files were deleted]\n");
  } else {
    console.log("\n  ✨ UNINSTALLATION COMPLETED!");
    console.log("     ✔ Removed Dreamy managed block from AGENTS.md");
    console.log("     ✔ Cleaned up owned agents and skills\n");
  }
}

function formatUpdateOutput(result) {
  console.log("\n╭──────────────────────────────────────────────────────────╮");
  console.log("│ 🔄  DREAMY CODEX TOOLKIT - UPDATE                        │");
  console.log("╰──────────────────────────────────────────────────────────╯");
  console.log(`  ► Action : ${result.action}`);
  console.log(`  ► Target : ${result.target} [${result.targetKind}]`);
  console.log(`  ► Preset : ${result.preset}`);
  if (result.fromVersion) console.log(`  ► Version: ${result.fromVersion} ➔ latest`);
  if (result.dryRun) {
    console.log("\n  🔍 [DRY RUN SUMMARY - Managed files are up to date]\n");
  } else {
    console.log("\n  ✨ UPDATE COMPLETED SUCCESSFULLY!");
    console.log("     ✔ Refreshed all managed Dreamy agents and skills\n");
  }
}

function formatDoctorOutput(doc) {
  console.log("\n╭──────────────────────────────────────────────────────────╮");
  console.log("│ 🩺  DREAMY CODEX TOOLKIT - DIAGNOSTICS                   │");
  console.log("╰──────────────────────────────────────────────────────────╯");
  const statusBadge = doc.status === "ok" ? "🟢 HEALTHY (OK)" : doc.status === "warn" ? "🟡 WARNINGS FOUND" : "🔴 ERRORS DETECTED";
  console.log(`  ► Overall Status : ${statusBadge}`);
  console.log("\n  📋 Diagnostic Checks:");
  for (const check of doc.checks) {
    const symbol = check.severity === "INFO" ? "  ✔" : check.severity === "WARN" ? "  ⚠️" : "  ✖";
    console.log(`    ${symbol} [${check.id.padEnd(20)}] ${check.message}`);
  }
  console.log("\n  ⚙️ System Capabilities:");
  console.log(`     • Unity Engine Detected  : ${doc.capabilities.unity ? "Yes" : "No"}`);
  console.log(`     • Harness Git Status     : ${doc.capabilities.harness.git}`);
  console.log(`     • Harness Unity Execution: ${doc.capabilities.harness.unity}`);
  if (doc.recommendations && doc.recommendations.length > 0) {
    console.log("\n  💡 Recommendations:");
    for (const rec of doc.recommendations) {
      console.log(`     👉 ${rec}`);
    }
  }
  console.log("");
}

function formatDetectOutput(profile) {
  console.log("\n╭──────────────────────────────────────────────────────────╮");
  console.log("│ 🔍  DREAMY CODEX TOOLKIT - PROJECT DETECTION             │");
  console.log("╰──────────────────────────────────────────────────────────╯");
  console.log(`  ► Engine Detected   : ${profile.engine?.name ?? "unknown"}`);
  console.log(`  ► Recommended Preset: ${profile.preset ?? "dreamy-project"}`);
  const dreamyPackages = profile.dreamyPackages ?? profile.packages ?? [];
  if (dreamyPackages.length > 0) {
    console.log(`\n  📦 Detected ${dreamyPackages.length} com.dreamy.* packages:`);
    for (const pkg of dreamyPackages) {
      const version = pkg.declaredVersion ?? pkg.resolvedVersion ?? "unknown";
      console.log(`     • ${pkg.name.padEnd(28)} v${version.padEnd(8)} [status: ${pkg.compatibilityStatus}]`);
    }
  } else {
    console.log("\n  📦 No com.dreamy.* packages detected in Packages/manifest.json.");
  }
  console.log("");
}

async function main() {
  const { cmd, args } = parseArgs(process.argv.slice(2));
  const wantsJson = Boolean(args.json);
  if (cmd === "setup" || cmd === "init") {
    await runInteractiveSetup(args);
  } else if (cmd === "validate") {
    await validateArtifacts();
    console.log("validate: OK");
  } else if (cmd === "detect") {
    const target = resolveTarget(args.target);
    const profile = target.kind === "global" ? { schemaVersion: 1, engine: { name: "global" }, preset: args.preset, packages: [] } : detectProject(target.root);
    if (wantsJson) console.log(JSON.stringify(profile));
    else formatDetectOutput(profile);
  } else if (cmd === "install") {
    const res = installProject(args);
    if (wantsJson) console.log(JSON.stringify(res));
    else formatInstallOutput(res);
  } else if (cmd === "uninstall" || cmd === "purge") {
    if (cmd === "purge" && args.target === ".") args.target = "global";
    const res = uninstallProject(args);
    if (wantsJson) console.log(JSON.stringify(res));
    else formatUninstallOutput(res);
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
      for (const pkg of profile.dreamyPackages ?? []) {
        add(`dreamy-${pkg.name}`, pkg.compatibilityStatus === "drift" ? "WARN" : "INFO", `${pkg.declaredVersion ?? pkg.resolvedVersion ?? "unknown"} ${pkg.compatibilityStatus}`);
      }
    }
    let gitStatus = "unavailable";
    try {
      execFileSync("git", ["--version"], { encoding: "utf8" });
      gitStatus = "ok";
    } catch {
      gitStatus = "unavailable";
    }
    const status = checks.some((check) => check.severity === "ERROR") ? "error" : checks.some((check) => check.severity === "WARN") ? "warn" : "ok";
    const docRes = {
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
    };
    if (wantsJson) console.log(JSON.stringify(docRes));
    else formatDoctorOutput(docRes);
  } else if (cmd === "list") {
    const kit = readJson(path.join(root, "toolkit.json"));
    console.log(JSON.stringify({ presets: kit.presets, modules: kit.modules, rules: kit.rules, skills: kit.skills }));
  } else if (cmd === "eval") {
    if (args.runner !== "catalog") throw new Error("The eval command validates the catalog only. Use npm run benchmark for semantic runs.");
    const catalogPath = path.join(root, "evals", "catalog.json");
    const catalogText = fs.readFileSync(catalogPath, "utf8");
    const report = buildCatalogValidationReport(catalogText, path.join(root, "schemas"));
    fs.mkdirSync(path.join(root, "release"), { recursive: true });
    writeJson(path.join(root, "release", "eval-report.json"), report);
    console.log(JSON.stringify(report));
  } else if (cmd === "update") {
    const res = updateProject(args);
    if (wantsJson) console.log(JSON.stringify(res));
    else formatUpdateOutput(res);
  } else {
    console.log(`dreamy-kit commands:
  setup / init
  validate
  detect [--target PATH] [--json]
  install [--target PATH|global] [--preset NAME] [--dry-run] [--json]
  uninstall [--target PATH|global] [--dry-run] [--json]
  purge [--dry-run] [--json]
  doctor [--target PATH] [--json]
  list
  eval [--runner catalog]
  benchmark (use npm run benchmark -- --manifest PATH --command PATH)
  update [--target PATH|global] [--preset NAME] [--dry-run] [--json]`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
