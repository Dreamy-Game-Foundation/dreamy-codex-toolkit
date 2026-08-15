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
  assert.equal(fs.existsSync(path.join(target, ".dreamy-codex")), false);

  const repeated = JSON.parse(run(["uninstall", "--target", target]));
  assert.equal(repeated.status, "ok");
  assert.equal(repeated.alreadyRemoved, true);
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

test("agent installation follows resolved modules instead of installing every agent", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-agents-"));
  const install = JSON.parse(run(["install", "--target", target, "--preset", "core"]));
  assert.equal(install.status, "ok");
  assert.ok(fs.existsSync(path.join(target, ".codex", "agents", "dreamy-project-analyst.toml")));
  assert.equal(fs.existsSync(path.join(target, ".codex", "agents", "dreamy-unity-developer.toml")), false);
  assert.equal(fs.existsSync(path.join(target, ".codex", "agents", "dreamy-release-validator.toml")), false);
});

test("Dreamy package skills are selected from skill metadata", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-package-metadata-"));
  fs.mkdirSync(path.join(target, "Packages"));
  fs.writeFileSync(
    path.join(target, "Packages", "manifest.json"),
    JSON.stringify({ dependencies: { "com.dreamy.audio": "0.1.0" } }, null, 2)
  );

  const install = JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));
  assert.equal(install.status, "ok");
  assert.ok(fs.existsSync(path.join(target, ".agents", "skills", "dreamy-audio", "SKILL.md")));
  assert.equal(fs.existsSync(path.join(target, ".agents", "skills", "dreamy-localization", "SKILL.md")), false);
});

test("list --resolved shows deterministic preset graph", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-resolved-"));
  const resolved = JSON.parse(run(["list", "--target", target, "--preset", "unity-minimal", "--resolved"]));
  assert.equal(resolved.preset, "unity-minimal");
  assert.deepEqual(resolved.resolvedModules, ["foundation", "unity-core"]);
  assert.ok(resolved.agents.includes("dreamy-project-analyst.toml"));
  assert.ok(resolved.agents.includes("dreamy-unity-developer.toml"));
  assert.equal(resolved.agents.includes("dreamy-release-validator.toml"), false);
  assert.ok(resolved.skills.includes("unity-ui"));
});

test("purge removes Dreamy state but preserves unrelated Codex and Agents files", () => {
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-codex-purge-"));
  const agentsHome = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-agents-purge-"));
  const env = { DREAMY_CODEX_HOME: codexHome, DREAMY_AGENTS_HOME: agentsHome };
  fs.mkdirSync(path.join(codexHome, "agents"), { recursive: true });
  fs.mkdirSync(path.join(agentsHome, "skills", "user-skill"), { recursive: true });
  fs.writeFileSync(path.join(codexHome, "agents", "user-agent.toml"), "name = \"user-agent\"\n");
  fs.writeFileSync(path.join(agentsHome, "skills", "user-skill", "SKILL.md"), "# User Skill\n");

  JSON.parse(run(["install", "--target", "global", "--preset", "dreamy-project"], root, env));
  assert.ok(fs.existsSync(path.join(codexHome, ".dreamy-codex", "install-state.json")));

  const purge = JSON.parse(run(["purge"], root, env));
  assert.equal(purge.action, "purge");
  assert.equal(purge.status, "ok");
  assert.equal(fs.existsSync(path.join(codexHome, ".dreamy-codex")), false);
  assert.ok(fs.existsSync(path.join(codexHome, "agents", "user-agent.toml")));
  assert.ok(fs.existsSync(path.join(agentsHome, "skills", "user-skill", "SKILL.md")));
  assert.equal(fs.existsSync(path.join(codexHome, "agents", "dreamy-unity-developer.toml")), false);
  assert.equal(fs.existsSync(path.join(agentsHome, "skills", "dreamy-feature")), false);

  const repeated = JSON.parse(run(["purge"], root, env));
  assert.equal(repeated.status, "ok");
  assert.equal(repeated.alreadyRemoved, true);
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

test("update and uninstall tolerate user edits outside the managed block", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-owned-block-"));
  const original = "# User Instructions\n\nKeep this text.\n";
  fs.writeFileSync(path.join(target, "AGENTS.md"), original);

  JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));
  const installed = fs.readFileSync(path.join(target, "AGENTS.md"), "utf8");
  fs.writeFileSync(path.join(target, "AGENTS.md"), `Prepended by user.\n\n${installed}\nAppended by user.\n`);

  const update = JSON.parse(run(["update", "--target", target]));
  assert.equal(update.status, "ok");

  const uninstall = JSON.parse(run(["uninstall", "--target", target]));
  assert.equal(uninstall.status, "ok");
  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), `Prepended by user.\n\n${original}\nAppended by user.\n`);
});

test("managed block drift refuses update and uninstall unless forced", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-block-drift-"));
  fs.writeFileSync(path.join(target, "AGENTS.md"), "# User Instructions\n");
  JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));

  const agentsPath = path.join(target, "AGENTS.md");
  fs.writeFileSync(agentsPath, fs.readFileSync(agentsPath, "utf8").replace("Dreamy Codex Toolkit", "Dreamy Codex Toolkit edited"));

  assert.throws(() => run(["update", "--target", target]), /managed block checksum drift/);
  assert.throws(() => run(["uninstall", "--target", target]), /managed block checksum drift/);

  const forced = JSON.parse(run(["update", "--target", target, "--force"]));
  assert.equal(forced.status, "ok");
  assert.match(fs.readFileSync(agentsPath, "utf8"), /## Dreamy Codex Toolkit\n/);
});

test("managed AGENTS lifecycle preserves CRLF files", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-crlf-"));
  const original = "# User Instructions\r\n\r\nKeep this text.\r\n";
  fs.writeFileSync(path.join(target, "AGENTS.md"), original);

  JSON.parse(run(["install", "--target", target, "--preset", "dreamy-project"]));
  const installed = fs.readFileSync(path.join(target, "AGENTS.md"), "utf8");
  assert.match(installed, /\r\n<!-- DREAMY-CODEX:START schema=1 -->\r\n/);
  assert.doesNotMatch(installed, /[^\r]\n/);

  const update = JSON.parse(run(["update", "--target", target]));
  assert.equal(update.status, "ok");
  const updated = fs.readFileSync(path.join(target, "AGENTS.md"), "utf8");
  assert.doesNotMatch(updated, /[^\r]\n/);

  const uninstall = JSON.parse(run(["uninstall", "--target", target]));
  assert.equal(uninstall.status, "ok");
  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), original);
});

test("malformed managed block markers are detected", () => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-malformed-"));
  fs.writeFileSync(
    path.join(target, "AGENTS.md"),
    "<!-- DREAMY-CODEX:START schema=1 -->\nfirst\n<!-- DREAMY-CODEX:END -->\n<!-- DREAMY-CODEX:START schema=1 -->\nsecond\n<!-- DREAMY-CODEX:END -->\n"
  );

  assert.throws(() => run(["install", "--target", target, "--preset", "dreamy-project"]), /Malformed Dreamy managed block markers|already contains/);

  const missingEnd = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-kit-missing-marker-"));
  fs.writeFileSync(path.join(missingEnd, "AGENTS.md"), "<!-- DREAMY-CODEX:START schema=1 -->\nunterminated\n");
  assert.throws(() => run(["install", "--target", missingEnd, "--preset", "dreamy-project"]), /Malformed Dreamy managed block markers/);
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
  assert.ok(doctor.checks.some((check) => check.id === "version-agreement"));
  assert.ok(doctor.checks.some((check) => check.id === "install-state"));
  assert.ok(doctor.checks.some((check) => check.id === "preset-closure"));
  assert.ok(doctor.checks.some((check) => check.id === "unity-lock"));
  assert.ok(doctor.capabilities.projectSkills.endsWith(path.join(".agents", "skills")));
});
