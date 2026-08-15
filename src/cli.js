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
    } else if (arg === "--resolved") {
      args.resolved = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--backup") {
      args.backup = true;
    } else if (arg === "--fix") {
      args.fix = true;
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

function detectLineEnding(text) {
  return text.includes("\r\n") ? "crlf" : "lf";
}

function lineEndingValue(lineEnding) {
  return lineEnding === "crlf" ? "\r\n" : "\n";
}

function normalizeLineEndings(text, lineEnding) {
  return text.replace(/\r\n|\n/g, lineEndingValue(lineEnding));
}

function findManagedBlock(text) {
  const startIndexes = [];
  let startFrom = 0;
  while (true) {
    const index = text.indexOf(managedStart, startFrom);
    if (index === -1) break;
    startIndexes.push(index);
    startFrom = index + managedStart.length;
  }

  const endIndexes = [];
  let endFrom = 0;
  while (true) {
    const index = text.indexOf(managedEnd, endFrom);
    if (index === -1) break;
    endIndexes.push(index);
    endFrom = index + managedEnd.length;
  }

  if (startIndexes.length !== 1 || endIndexes.length !== 1) {
    throw new Error("Malformed Dreamy managed block markers");
  }
  if (endIndexes[0] < startIndexes[0]) {
    throw new Error("Malformed Dreamy managed block markers");
  }

  return {
    start: startIndexes[0],
    end: endIndexes[0] + managedEnd.length,
  };
}

function extractManagedBlock(text) {
  const block = findManagedBlock(text);
  return text.slice(block.start, block.end);
}

function hashManagedBlock(text) {
  return sha256(extractManagedBlock(text));
}

function validateManagedBlock(text) {
  findManagedBlock(text);
  return true;
}

function replaceManagedBlock(text, newBlock) {
  const block = findManagedBlock(text);
  const lineEnding = detectLineEnding(text);
  return `${text.slice(0, block.start)}${normalizeLineEndings(newBlock, lineEnding)}${text.slice(block.end)}`;
}

function removeManagedBlock(text) {
  const block = findManagedBlock(text);
  let removeStart = block.start;
  let removeEnd = block.end;
  const before = text.slice(0, block.start);
  const after = text.slice(block.end);
  const lineEnding = lineEndingValue(detectLineEnding(text));
  if (before.endsWith(`${lineEnding}${lineEnding}`)) {
    removeStart -= lineEnding.length;
  } else if (!after && before.endsWith(lineEnding)) {
    removeStart -= lineEnding.length;
  }
  if (after.startsWith(lineEnding)) {
    removeEnd += lineEnding.length;
  }
  return `${text.slice(0, removeStart)}${text.slice(removeEnd)}`;
}

function renderManagedBlock(lineEnding = "lf") {
  return normalizeLineEndings(fs.readFileSync(path.join(root, "templates", "AGENTS.managed.md"), "utf8"), lineEnding);
}

function stateManagedBlockHash(state) {
  return state.managedBlockHash ?? state.checksums?.["AGENTS.md"]?.managedBlockHash ?? null;
}

function legacyWholeFileHash(state) {
  return state.schemaVersion === 1 ? state.checksums?.after : state.checksums?.["AGENTS.md"]?.after;
}

function hasAnyManagedBlockMarker(text) {
  return text.includes(managedStart) || text.includes(managedEnd);
}

function removeDreamyManagedFragments(text) {
  const lineEnding = lineEndingValue(detectLineEnding(text));
  let next = text.replace(new RegExp(`\\n?${escapeRegExp(managedStart)}[\\s\\S]*?${escapeRegExp(managedEnd)}\\r?\\n?`, "g"), lineEnding);
  next = next
    .split(/\r\n|\n/)
    .filter((line) => !line.includes("DREAMY-CODEX:START") && !line.includes("DREAMY-CODEX:END"))
    .join(lineEnding);
  return next.replace(new RegExp(`${escapeRegExp(lineEnding)}{3,}`, "g"), `${lineEnding}${lineEnding}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function projectHasUnityMarkers(rootDir) {
  return fs.existsSync(path.join(rootDir, "Packages", "manifest.json")) ||
    fs.existsSync(path.join(rootDir, "ProjectSettings", "ProjectVersion.txt"));
}

function profileForTarget(target, preset) {
  if (target.kind === "global") {
    return { schemaVersion: 1, engine: { name: "global" }, preset, packages: [], dreamyPackages: [] };
  }
  if (!projectHasUnityMarkers(target.root)) {
    return {
      schemaVersion: 1,
      engine: { name: "unknown" },
      preset,
      packages: [],
      dreamyPackages: [],
      diagnostics: ["No Unity project markers found; skipped deep project scan."]
    };
  }
  return { ...detectProject(target.root), preset };
}

function cleanupUninstallState(target, purge = false) {
  if (!fs.existsSync(target.stateDir)) return;
  if (purge) {
    fs.rmSync(target.stateDir, { recursive: true, force: true });
    return;
  }

  for (const fileName of ["install-state.json", "project-profile.json"]) {
    const file = path.join(target.stateDir, fileName);
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }
  if (fs.existsSync(target.stateDir) && fs.readdirSync(target.stateDir).length === 0) {
    fs.rmdirSync(target.stateDir);
  }
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

function knownManagedArtifacts(target) {
  const agents = fs.existsSync(path.join(root, "agents", "codex"))
    ? fs.readdirSync(path.join(root, "agents", "codex"))
      .filter((file) => file.endsWith(".toml"))
      .map((file) => path.join(target.agentsDir, file))
    : [];
  const skills = listSkillDirs().map((dir) => path.join(target.skillsDir, path.basename(dir)));
  return { agents, skills };
}

function skillMetadata(skillDir) {
  const file = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(file)) return {};
  const text = fs.readFileSync(file, "utf8");
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return {};
  const metadata = {};
  const packages = frontmatter[1].match(/^requires\.packages:\s*(\[.*\])\s*$/m)?.[1];
  if (packages) {
    try {
      metadata.requiredPackages = JSON.parse(packages);
    } catch {
      throw new Error(`Invalid requires.packages metadata in ${path.relative(root, file)}`);
    }
  }
  return metadata;
}

function skillAllowedForProfile(target, skillDir, detectedPackages) {
  const requiredPackages = skillMetadata(skillDir).requiredPackages ?? [];
  if (target.kind === "global" || requiredPackages.length === 0) return true;
  return requiredPackages.some((pkg) => detectedPackages.has(pkg));
}

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
      const skillDir = path.join(root, item);
      if (fs.existsSync(path.join(skillDir, "SKILL.md")) && skillAllowedForProfile(target, skillDir, detected)) {
        selected.add(skillDir);
      }
    }
  }
  return [...selected];
}

function agentFilesForInstall(preset) {
  const selected = new Set();
  for (const moduleId of resolveModules(preset)) {
    const modulePath = path.join(root, "modules", moduleId, "module.json");
    if (!fs.existsSync(modulePath)) continue;
    for (const agent of readJson(modulePath).agents ?? []) {
      const file = agent.endsWith(".toml") ? agent : `${agent}.toml`;
      const source = path.join(root, "agents", "codex", file);
      if (!fs.existsSync(source)) throw new Error(`Module ${moduleId} references missing agent: ${agent}`);
      selected.add(source);
    }
  }
  return [...selected].sort();
}

function desiredInstall(target, preset, profile) {
  const agents = agentFilesForInstall(preset)
    .map((source) => ({ source, destination: path.join(target.agentsDir, path.basename(source)) }));
  const skills = skillDirsForInstall(target, preset, profile)
    .map((source) => ({ source, destination: path.join(target.skillsDir, path.basename(source)) }));
  return { agents, skills, resolvedModules: resolveModules(preset) };
}

function writeManagedState(target, preset, profile, desired, beforeHash, afterHash, managedBlockHash, lineEnding) {
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
    managedBlockHash,
    managedTemplateVersion: "schema=1",
    lineEnding,
    checksums: { "AGENTS.md": { before: beforeHash, after: afterHash, managedBlockHash } },
    detectedPackages: profile.dreamyPackages ?? profile.packages ?? [],
    compatibilitySnapshot: Object.fromEntries((profile.dreamyPackages ?? profile.packages ?? []).map((pkg) => [pkg.name, compatibility[pkg.name]?.status ?? "unknown"]))
  });
}

function installProject(args) {
  const target = resolveTarget(args.target);
  const presetPath = path.join(root, "presets", `${args.preset}.json`);
  if (!fs.existsSync(presetPath)) throw new Error(`Unknown preset: ${args.preset}`);

  const profile = profileForTarget(target, args.preset);
  const desired = desiredInstall(target, args.preset, profile);
  if (args.dryRun) {
    return { action: "install", target: target.root, targetKind: target.kind, preset: args.preset, profile, resolvedModules: desired.resolvedModules, skills: desired.skills.length, agents: desired.agents.length, dryRun: true };
  }

  fs.mkdirSync(target.root, { recursive: true });
  const agentsMd = target.agentsMd;
  const existingAgents = fs.existsSync(agentsMd) ? fs.readFileSync(agentsMd, "utf8") : "";
  const hasManagedStart = existingAgents.includes(managedStart);
  const hasManagedEnd = existingAgents.includes(managedEnd);
  const adoptingExistingBlock = hasManagedStart || hasManagedEnd;
  if (hasManagedStart || hasManagedEnd) {
    if (!(hasManagedStart && hasManagedEnd)) throw new Error("Malformed Dreamy managed block markers");
    validateManagedBlock(existingAgents);
  }

  const stateDir = target.stateDir;
  fs.mkdirSync(stateDir, { recursive: true });
  writeJson(path.join(stateDir, "project-profile.json"), profile);

  const lineEnding = detectLineEnding(existingAgents);
  const managedBlock = renderManagedBlock(lineEnding);
  const beforeHash = fs.existsSync(agentsMd) ? sha256File(agentsMd) : "";
  const separator = existingAgents ? existingAgents.endsWith(lineEndingValue(lineEnding)) ? lineEndingValue(lineEnding) : `${lineEndingValue(lineEnding)}${lineEndingValue(lineEnding)}` : "";
  const nextAgents = adoptingExistingBlock ? replaceManagedBlock(existingAgents, managedBlock) : `${existingAgents}${separator}${managedBlock}`;
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

  writeManagedState(target, args.preset, profile, desired, beforeHash, afterHash, sha256(managedBlock), lineEnding);

  return { action: "install", target: target.root, targetKind: target.kind, preset: args.preset, status: "ok", adoptedExistingBlock: adoptingExistingBlock };
}

function uninstallProject(args) {
  const target = resolveTarget(args.target);
  const action = args.purge ? "purge" : "uninstall";
  if (args.dryRun) return { action, target: target.root, targetKind: target.kind, dryRun: true };

  const statePath = path.join(target.stateDir, "install-state.json");
  if (!fs.existsSync(statePath)) {
    const content = fs.existsSync(target.agentsMd) ? fs.readFileSync(target.agentsMd, "utf8") : "";
    if (hasAnyManagedBlockMarker(content)) {
      if (!args.force && !args.purge) throw new Error("Missing install state; rerun with --force after reviewing AGENTS.md");
      fs.writeFileSync(target.agentsMd, removeDreamyManagedFragments(content), "utf8");
    }
    if (args.purge || args.force || target.kind === "global") {
      const fallback = knownManagedArtifacts(target);
      for (const file of fallback.agents) if (fs.existsSync(file)) fs.rmSync(file, { force: true });
      for (const dir of fallback.skills) if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    }
    cleanupUninstallState(target, args.purge);
    return { action, target: target.root, targetKind: target.kind, status: "ok", alreadyRemoved: true };
  }
  const state = readJson(statePath);

  const agentsMd = target.agentsMd;
  if (fs.existsSync(agentsMd)) {
    const content = fs.readFileSync(agentsMd, "utf8");
    const expectedBlockHash = stateManagedBlockHash(state);
    if (expectedBlockHash) {
      let blockHash = null;
      try {
        blockHash = hashManagedBlock(content);
      } catch (error) {
        if (!args.force && !args.purge) throw error;
      }
      if (blockHash && blockHash !== expectedBlockHash && !args.force && !args.purge) throw new Error("Dreamy managed block checksum drift; refusing uninstall");
    } else {
      const expected = legacyWholeFileHash(state);
      if (expected && sha256(content) !== expected && !args.force && !args.purge) throw new Error("AGENTS.md checksum drift; refusing uninstall");
      try {
        validateManagedBlock(content);
      } catch (error) {
        if (!args.force && !args.purge) throw error;
      }
    }
    let nextContent;
    try {
      nextContent = removeManagedBlock(content);
    } catch {
      nextContent = removeDreamyManagedFragments(content);
    }
    fs.writeFileSync(agentsMd, nextContent, "utf8");
  }

  for (const file of state.agents ?? state.agentFiles ?? []) {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }
  for (const dir of state.skills ?? state.skillDirs ?? []) {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }
  if (args.purge || target.kind === "global") {
    const fallback = knownManagedArtifacts(target);
    for (const file of fallback.agents) if (fs.existsSync(file)) fs.rmSync(file, { force: true });
    for (const dir of fallback.skills) if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }

  cleanupUninstallState(target, args.purge);

  return { action, target: target.root, targetKind: target.kind, status: "ok" };
}

function updateProject(args) {
  const target = resolveTarget(args.target);
  const statePath = path.join(target.stateDir, "install-state.json");
  if (!fs.existsSync(statePath)) {
    const content = fs.existsSync(target.agentsMd) ? fs.readFileSync(target.agentsMd, "utf8") : "";
    if (hasAnyManagedBlockMarker(content)) return { ...installProject(args), action: "update", adoptedExistingBlock: true };
    throw new Error("Missing install state; run dreamy-kit install first");
  }
  const state = readJson(statePath);
  const preset = args.preset === "dreamy-project" ? state.preset ?? args.preset : args.preset;
  const profile = profileForTarget(target, preset);
  const desired = desiredInstall(target, preset, profile);
  if (args.dryRun) {
    return { action: "update", target: target.root, targetKind: target.kind, fromVersion: state.toolkitVersion, toVersion: readJson(path.join(root, "toolkit.json")).version, preset, resolvedModules: desired.resolvedModules, skills: desired.skills.length, agents: desired.agents.length, dryRun: true };
  }
  const currentAgents = state.agents ?? state.agentFiles ?? [];
  const currentSkills = state.skills ?? state.skillDirs ?? [];
  const agentsMd = target.agentsMd;
  const content = fs.existsSync(agentsMd) ? fs.readFileSync(agentsMd, "utf8") : "";
  const expectedBlockHash = stateManagedBlockHash(state);
  if (expectedBlockHash) {
    if (hashManagedBlock(content) !== expectedBlockHash && !args.force) throw new Error("Dreamy managed block checksum drift; rerun with --force only after reviewing managed block changes");
  } else {
    const expected = legacyWholeFileHash(state);
    if (expected && sha256(content) !== expected && !args.force) throw new Error("AGENTS.md checksum drift; rerun with --force only after reviewing user changes");
    validateManagedBlock(content);
  }
  if (args.backup && fs.existsSync(agentsMd)) fs.copyFileSync(agentsMd, `${agentsMd}.dreamy-backup`);

  const lineEnding = detectLineEnding(content || renderManagedBlock(state.lineEnding ?? "lf"));
  const nextAgents = replaceManagedBlock(content, renderManagedBlock(lineEnding));
  fs.writeFileSync(agentsMd, nextAgents, "utf8");

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
  writeManagedState(target, preset, profile, desired, beforeHash, afterHash, hashManagedBlock(nextAgents), lineEnding);
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
    const profile = profileForTarget(target, args.preset);

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
    if (result.adoptedExistingBlock) console.log("     ✔ Adopted and refreshed existing Dreamy managed block");
    console.log("     ✔ Written managed block to AGENTS.md");
    console.log("     ✔ Configured Codex agents in .codex/agents/");
    console.log("     ✔ Configured Dreamy skills in .agents/skills/");
    console.log("     ✔ Generated project profile & install state\n");
  }
  printCommandBlock("Next commands", [
    `dreamy-kit doctor${result.targetKind === "global" ? " --target global" : ""}`,
    `dreamy-kit update${result.targetKind === "global" ? " --target global" : ""}`,
    `dreamy-kit uninstall${result.targetKind === "global" ? " --target global" : ""}`
  ]);
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
  const installTarget = result.targetKind === "global" ? " --target global" : "";
  printCommandBlock(result.action === "purge" ? "Reinstall command" : "Install again", [
    `dreamy-kit install${installTarget}`
  ]);
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
    if (result.adoptedExistingBlock) console.log("     ✔ Rebuilt missing install state from existing Dreamy block");
    console.log("     ✔ Refreshed all managed Dreamy agents and skills\n");
  }
  printCommandBlock("Next commands", [
    `dreamy-kit doctor${result.targetKind === "global" ? " --target global" : ""}`,
    `dreamy-kit uninstall${result.targetKind === "global" ? " --target global" : ""}`
  ]);
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
  printCommandBlock("Copy commands", suggestedDoctorCommands(doc));
  console.log("");
}

function printCommandBlock(title, commands) {
  if (!commands.length) return;
  console.log(`\n  ${title}:`);
  console.log("```bash");
  for (const command of commands) console.log(command);
  console.log("```");
}

function suggestedDoctorCommands(doc) {
  const targetArg = doc.targetKind === "global" ? " --target global" : "";
  if (doc.status === "ok") {
    return [`dreamy-kit update${targetArg}`, `dreamy-kit uninstall${targetArg}`];
  }
  const hasStateProblem = doc.checks.some((check) => check.id === "install-state" || check.id === "managed-block");
  if (hasStateProblem) {
    return [`dreamy-kit uninstall${targetArg} --force`, `dreamy-kit install${targetArg}`];
  }
  return [`dreamy-kit doctor${targetArg} --json`, `dreamy-kit update${targetArg}`];
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
    const profile = profileForTarget(target, args.preset);
    if (wantsJson) console.log(JSON.stringify(profile));
    else formatDetectOutput(profile);
  } else if (cmd === "install") {
    const res = installProject(args);
    if (wantsJson) console.log(JSON.stringify(res));
    else formatInstallOutput(res);
  } else if (cmd === "uninstall" || cmd === "purge") {
    if (cmd === "purge" && args.target === ".") args.target = "global";
    args.purge = cmd === "purge";
    const res = uninstallProject(args);
    if (wantsJson) console.log(JSON.stringify(res));
    else formatUninstallOutput(res);
  } else if (cmd === "doctor") {
    await validateArtifacts();
    const target = resolveTarget(args.target);
    const toolkit = readJson(path.join(root, "toolkit.json"));
    const pkg = readJson(path.join(root, "package.json"));
    const profile = profileForTarget(target, args.preset);
    const checks = [];
    const add = (id, severity, message) => checks.push({ id, severity, message });
    add("node", "INFO", `Node ${process.version}`);
    add("version-agreement", toolkit.version === pkg.version ? "INFO" : "ERROR", `toolkit=${toolkit.version} package=${pkg.version}`);
    add("codex-home", fs.existsSync(codexHome()) ? "INFO" : "WARN", codexHome());
    add("user-skills", fs.existsSync(path.join(agentsHome(), "skills")) ? "INFO" : "WARN", path.join(agentsHome(), "skills"));
    add("project-agents", fs.existsSync(target.agentsDir) ? "INFO" : "WARN", target.agentsDir);
    add("project-skills", fs.existsSync(target.skillsDir) ? "INFO" : "WARN", target.skillsDir);
    try {
      const modules = resolveModules(args.preset);
      add("preset-closure", "INFO", `${args.preset}: ${modules.join(", ")}`);
      const desired = desiredInstall(target, args.preset, profile);
      const skillBasenames = desired.skills.map((entry) => path.basename(entry.destination));
      const duplicateSkills = skillBasenames.filter((name, index) => skillBasenames.indexOf(name) !== index);
      add("skill-destinations", duplicateSkills.length ? "ERROR" : "INFO", duplicateSkills.length ? `duplicate skill destinations: ${[...new Set(duplicateSkills)].join(", ")}` : `${skillBasenames.length} unique skill destinations`);
    } catch (error) {
      add("preset-closure", "ERROR", error.message);
    }
    const statePath = path.join(target.stateDir, "install-state.json");
    if (fs.existsSync(statePath)) {
      try {
        const state = readJson(statePath);
        add("install-state", state.schemaVersion === 2 ? "INFO" : "WARN", `schemaVersion=${state.schemaVersion}`);
        if (fs.existsSync(target.agentsMd)) {
          const content = fs.readFileSync(target.agentsMd, "utf8");
          const expectedBlockHash = stateManagedBlockHash(state);
          add("managed-block", expectedBlockHash && hashManagedBlock(content) === expectedBlockHash ? "INFO" : "ERROR", expectedBlockHash ? "AGENTS.md managed block ownership check" : "missing managed block hash");
        } else {
          add("managed-block", "ERROR", "AGENTS.md missing while install state exists");
        }
        const staleAgents = (state.agents ?? state.agentFiles ?? []).filter((file) => !fs.existsSync(file));
        const staleSkills = (state.skills ?? state.skillDirs ?? []).filter((dir) => !fs.existsSync(dir));
        add("managed-files", staleAgents.length || staleSkills.length ? "WARN" : "INFO", staleAgents.length || staleSkills.length ? `missing owned paths: ${staleAgents.length + staleSkills.length}` : "all recorded owned paths exist");
      } catch (error) {
        add("install-state", "ERROR", error.message);
      }
    } else {
      const content = fs.existsSync(target.agentsMd) ? fs.readFileSync(target.agentsMd, "utf8") : "";
      add("install-state", hasAnyManagedBlockMarker(content) ? "ERROR" : "WARN", hasAnyManagedBlockMarker(content) ? "managed AGENTS block exists without install state" : "not installed");
    }
    if (target.kind === "project") {
      add("unity-manifest", fs.existsSync(path.join(target.root, "Packages", "manifest.json")) ? "INFO" : "WARN", "Packages/manifest.json");
      add("unity-lock", fs.existsSync(path.join(target.root, "Packages", "packages-lock.json")) ? "INFO" : "WARN", "Packages/packages-lock.json");
      const unityPath = process.env.DREAMY_UNITY_PATH || process.env.UNITY_PATH;
      add("unity-executable", unityPath && fs.existsSync(unityPath) ? "INFO" : "WARN", unityPath || "Set DREAMY_UNITY_PATH or UNITY_PATH");
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
      targetKind: target.kind,
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
      fixApplied: args.fix ? [] : undefined,
      profile
    };
    if (wantsJson) console.log(JSON.stringify(docRes));
    else formatDoctorOutput(docRes);
  } else if (cmd === "list") {
    const kit = readJson(path.join(root, "toolkit.json"));
    if (args.resolved) {
      const target = resolveTarget(args.target);
      const profile = profileForTarget(target, args.preset);
      const desired = desiredInstall(target, args.preset, profile);
      console.log(JSON.stringify({
        preset: args.preset,
        target: target.root,
        targetKind: target.kind,
        resolvedModules: desired.resolvedModules,
        agents: desired.agents.map((entry) => path.basename(entry.destination)),
        skills: desired.skills.map((entry) => path.basename(entry.destination))
      }));
    } else {
      console.log(JSON.stringify({ presets: kit.presets, modules: kit.modules, rules: kit.rules, skills: kit.skills }));
    }
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
  doctor [--target PATH] [--json] [--fix]
  list [--resolved] [--target PATH|global] [--preset NAME]
  eval [--runner catalog]
  benchmark (use npm run benchmark -- --manifest PATH --command PATH)
  update [--target PATH|global] [--preset NAME] [--dry-run] [--json]`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
