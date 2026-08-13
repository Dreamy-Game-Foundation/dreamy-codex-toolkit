#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
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

function targetRoot(target) {
  const full = path.resolve(target);
  if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) {
    throw new Error(`Target does not exist: ${target}`);
  }
  return full;
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

function installProject(args) {
  const target = targetRoot(args.target);
  const presetPath = path.join(root, "presets", `${args.preset}.json`);
  if (!fs.existsSync(presetPath)) throw new Error(`Unknown preset: ${args.preset}`);

  const profile = { ...detectProject(target), preset: args.preset };
  if (args.dryRun) {
    return { action: "install", target, preset: args.preset, profile, dryRun: true };
  }

  const agentsMd = path.join(target, "AGENTS.md");
  const existingAgents = fs.existsSync(agentsMd) ? fs.readFileSync(agentsMd, "utf8") : "";
  if (existingAgents.includes(managedStart)) {
    throw new Error("AGENTS.md already contains a Dreamy managed block");
  }

  const stateDir = path.join(target, ".dreamy-codex");
  fs.mkdirSync(stateDir, { recursive: true });
  writeJson(path.join(stateDir, "project-profile.json"), profile);

  const managedBlock = fs.readFileSync(path.join(root, "templates", "AGENTS.managed.md"), "utf8");
  const beforeHash = fs.existsSync(agentsMd) ? sha256File(agentsMd) : "";
  const nextAgents = existingAgents ? `${existingAgents.replace(/\s*$/, "\n\n")}${managedBlock}` : managedBlock;
  const afterHash = sha256(nextAgents);
  fs.writeFileSync(agentsMd, nextAgents, "utf8");

  const agentSource = path.join(root, "agents", "codex");
  const agentTarget = path.join(target, ".codex", "agents");
  fs.mkdirSync(agentTarget, { recursive: true });
  const agentFiles = [];
  for (const file of fs.readdirSync(agentSource).filter((name) => name.startsWith("dreamy-") && name.endsWith(".toml"))) {
    const destination = path.join(agentTarget, file);
    fs.copyFileSync(path.join(agentSource, file), destination);
    agentFiles.push(destination);
  }

  const configFile = path.join(target, ".codex", "config.toml");
  const existingConfig = fs.existsSync(configFile) ? fs.readFileSync(configFile, "utf8") : "";
  const cleanedConfig = removeBlock(existingConfig, configStart, configEnd).trimEnd();
  fs.mkdirSync(path.dirname(configFile), { recursive: true });
  fs.writeFileSync(configFile, cleanedConfig ? `${cleanedConfig}\n\n${managedAgentsBlock()}` : managedAgentsBlock(), "utf8");

  writeJson(path.join(stateDir, "install-state.json"), {
    schemaVersion: 1,
    toolkitVersion: readJson(path.join(root, "toolkit.json")).version,
    target,
    preset: args.preset,
    managedBlocks: ["AGENTS.md", ".codex/config.toml"],
    agentFiles,
    codexConfig: configFile,
    checksums: { before: beforeHash, after: afterHash },
  });

  return { action: "install", target, preset: args.preset, status: "ok" };
}

function uninstallProject(args) {
  const target = targetRoot(args.target);
  if (args.dryRun) return { action: "uninstall", target, dryRun: true };

  const statePath = path.join(target, ".dreamy-codex", "install-state.json");
  if (!fs.existsSync(statePath)) throw new Error("Missing install state; refusing to remove unowned managed block");
  const state = readJson(statePath);

  const agentsMd = path.join(target, "AGENTS.md");
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

  return { action: "uninstall", target, status: "ok" };
}

async function main() {
  const { cmd, args } = parseArgs(process.argv.slice(2));
  if (cmd === "validate") {
    await validateArtifacts();
    console.log("validate: OK");
  } else if (cmd === "detect") {
    console.log(JSON.stringify(detectProject(targetRoot(args.target))));
  } else if (cmd === "install") {
    console.log(JSON.stringify(installProject(args)));
  } else if (cmd === "uninstall") {
    console.log(JSON.stringify(uninstallProject(args)));
  } else if (cmd === "doctor") {
    await validateArtifacts();
    console.log(JSON.stringify({ ...detectProject(targetRoot(args.target)), doctor: { status: "ok" } }));
  } else if (cmd === "list") {
    const kit = readJson(path.join(root, "toolkit.json"));
    console.log(JSON.stringify({ presets: kit.presets, modules: kit.modules, rules: kit.rules, skills: kit.skills }));
  } else if (cmd === "update") {
    console.log(JSON.stringify({ action: "update", status: "not-implemented", reason: "No released upgrade path in local baseline" }));
  } else {
    console.log(`dreamy-kit commands:
  validate
  detect [--target PATH] [--json]
  install [--target PATH] [--preset NAME] [--dry-run]
  uninstall [--target PATH] [--dry-run]
  doctor [--target PATH] [--json]
  list
  update`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
