import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cli = path.join(root, "src", "cli.js");

function run(args, cwd = root, env = {}) {
  const finalArgs = args.includes("--json") ? args : [...args, "--json"];
  return execFileSync(process.execPath, [cli, ...finalArgs], { cwd, encoding: "utf8", env: { ...process.env, ...env } });
}

test("installer writes and removes Dreamy managed files", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-"));
  fs.mkdirSync(path.join(target, "Packages"));
  fs.writeFileSync(
    path.join(target, "Packages", "manifest.json"),
    JSON.stringify({ dependencies: { "com.dreamy.core": "1.1.2" } }, null, 2)
  );
  fs.writeFileSync(path.join(target, "AGENTS.md"), "# User Instructions\n\nKeep this text.\n");

  const before = fs.readFileSync(path.join(target, "AGENTS.md"), "utf8");
  const install = JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));
  assert.equal(install.status, "ok");
  assert.match(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), /DREAMY-CODEX:START/);
  assert.ok(fs.existsSync(path.join(target, ".dreamy-codex", "install-state.json")));
  assert.ok(fs.existsSync(path.join(target, ".codex", "agents", "dreamy-unity-developer.toml")));
  assert.ok(fs.existsSync(path.join(target, ".agents", "skills", "dreamy-core", "SKILL.md")));
  assert.equal(fs.existsSync(path.join(target, ".agents", "skills", "dreamy-audio", "SKILL.md")), false);
  assert.equal(fs.existsSync(path.join(target, ".codex", "config.toml")), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, ".dreamy-codex", "install-state.json"), "utf8")).schemaVersion, 2);

  const uninstall = JSON.parse(run(["uninstall", "--target", target]));
  assert.equal(uninstall.status, "ok");
  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), before);
  assert.equal(fs.existsSync(path.join(target, ".codex", "agents", "dreamy-unity-developer.toml")), false);
  assert.equal(fs.existsSync(path.join(target, ".agents", "skills", "dreamy-core")), false);
});

test("global target installs into user Codex home", () => {
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-codex-home-"));
  const agentsHome = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-agents-home-"));
  const env = { DREAMY_CODEX_HOME: codexHome, DREAMY_AGENTS_HOME: agentsHome };

  const install = JSON.parse(run(["install", "--target", "global", "--preset", "dreamy-project"], root, env));
  assert.equal(install.status, "ok");
  assert.equal(install.targetKind, "global");
  assert.ok(fs.existsSync(path.join(codexHome, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(codexHome, "agents", "dreamy-unity-developer.toml")));
  assert.ok(fs.existsSync(path.join(agentsHome, "skills", "dreamy-feature", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(agentsHome, "skills", "dreamy-core", "SKILL.md")));
  assert.equal(fs.existsSync(path.join(codexHome, "config.toml")), false);

  const uninstall = JSON.parse(run(["uninstall", "--target", "global"], root, env));
  assert.equal(uninstall.status, "ok");
  assert.equal(fs.existsSync(path.join(codexHome, "agents", "dreamy-unity-developer.toml")), false);
  assert.equal(fs.existsSync(path.join(agentsHome, "skills", "dreamy-feature")), false);
});

test("update refreshes an existing managed install", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-update-"));
  fs.writeFileSync(path.join(target, "AGENTS.md"), "# User Instructions\n\nKeep this text.\n");

  JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));
  const dryRun = JSON.parse(run(["update", "--target", target, "--dry-run"]));
  assert.equal(dryRun.action, "update");
  assert.equal(dryRun.dryRun, true);

  const update = JSON.parse(run(["update", "--target", target]));
  assert.equal(update.action, "update");
  assert.equal(update.status, "ok");
  assert.match(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), /DREAMY-CODEX:START/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(target, ".dreamy-codex", "install-state.json"), "utf8")).schemaVersion, 2);
});

test("update migrates v1 install state to v2", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-v1-"));
  fs.writeFileSync(path.join(target, "AGENTS.md"), "# User Instructions\n\n");
  JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));

  const statePath = path.join(target, ".dreamy-codex", "install-state.json");
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  fs.writeFileSync(
    statePath,
    JSON.stringify({
      schemaVersion: 1,
      toolkitVersion: "0.1.0-alpha.1",
      target,
      targetKind: "project",
      preset: "dreamy-project",
      managedBlocks: ["AGENTS.md"],
      agentFiles: state.agents,
      skillDirs: state.skills,
      checksums: { before: state.checksums["AGENTS.md"].before, after: state.checksums["AGENTS.md"].after }
    }, null, 2)
  );

  const update = JSON.parse(run(["update", "--target", target]));
  assert.equal(update.status, "ok");
  assert.equal(JSON.parse(fs.readFileSync(statePath, "utf8")).schemaVersion, 2);
});

test("doctor emits meaningful native-path diagnostics", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-doctor-"));
  const doctor = JSON.parse(run(["doctor", "--target", target, "--json"]));
  assert.ok(["ok", "warn", "error"].includes(doctor.status));
  assert.ok(Array.isArray(doctor.checks));
  assert.ok(doctor.capabilities.projectSkills.endsWith(path.join(".agents", "skills")));
});
