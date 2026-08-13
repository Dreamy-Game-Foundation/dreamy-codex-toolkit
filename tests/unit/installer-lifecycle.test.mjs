import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const cli = path.join(root, "src", "cli.js");

function run(args, cwd = root) {
  return execFileSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
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
