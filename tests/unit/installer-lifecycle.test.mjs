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
  return execFileSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8", env: { ...process.env, ...env } });
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
  assert.match(fs.readFileSync(path.join(target, ".codex", "config.toml"), "utf8"), /dreamy_unity_developer/);

  const uninstall = JSON.parse(run(["uninstall", "--target", target]));
  assert.equal(uninstall.status, "ok");
  assert.equal(fs.readFileSync(path.join(target, "AGENTS.md"), "utf8"), before);
  assert.equal(fs.existsSync(path.join(target, ".codex", "agents", "dreamy-unity-developer.toml")), false);
  assert.doesNotMatch(fs.readFileSync(path.join(target, ".codex", "config.toml"), "utf8"), /dreamy_unity_developer/);
});

test("global target installs into user Codex home", () => {
  const codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-codex-home-"));
  const env = { DREAMY_CODEX_HOME: codexHome };

  const install = JSON.parse(run(["install", "--target", "global", "--preset", "dreamy-project"], root, env));
  assert.equal(install.status, "ok");
  assert.equal(install.targetKind, "global");
  assert.ok(fs.existsSync(path.join(codexHome, "AGENTS.md")));
  assert.ok(fs.existsSync(path.join(codexHome, "agents", "dreamy-unity-developer.toml")));
  assert.ok(fs.existsSync(path.join(codexHome, "skills", "dreamy-feature", "SKILL.md")));
  assert.match(fs.readFileSync(path.join(codexHome, "config.toml"), "utf8"), /dreamy_unity_developer/);

  const uninstall = JSON.parse(run(["uninstall", "--target", "global"], root, env));
  assert.equal(uninstall.status, "ok");
  assert.equal(fs.existsSync(path.join(codexHome, "agents", "dreamy-unity-developer.toml")), false);
  assert.equal(fs.existsSync(path.join(codexHome, "skills", "dreamy-feature")), false);
  assert.doesNotMatch(fs.readFileSync(path.join(codexHome, "config.toml"), "utf8"), /dreamy_unity_developer/);
});
