import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../..");
const files = ["SKILL.md", "agents/openai.yaml", "references/layout-and-safe-area.md", "references/verification.md"];

test("responsive UI skill resolves, installs and updates through the global lifecycle in isolated homes", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-responsive-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const codex = path.join(temporary, "codex");
  const agents = path.join(temporary, "agents");
  const env = { ...process.env, DREAMY_CODEX_HOME: codex, DREAMY_AGENTS_HOME: agents };
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [path.join(root, "src/cli.js"), ...args, "--json"], { cwd: root, env, encoding: "utf8" }));
  for (const preset of ["unity-minimal", "unity-production", "unity-full", "dreamy-project", "dreamy-production", "dreamy-template", "dreamy-full"]) {
    assert.ok(run("list", "--resolved", "--target", "global", "--preset", preset).skills.includes("unity-ui-responsive"), preset);
  }
  run("install", "--target", "global", "--preset", "unity-minimal", "--dry-run");
  assert.equal(fs.existsSync(codex), false);
  assert.equal(fs.existsSync(agents), false);
  run("install", "--target", "global", "--preset", "unity-minimal");
  const installed = path.join(agents, "skills/unity-ui-responsive");
  for (const file of files) assert.deepEqual(fs.readFileSync(path.join(installed, file)), fs.readFileSync(path.join(root, "skills/unity-ui-responsive", file)));
  assert.match(fs.readFileSync(path.join(installed, "agents/openai.yaml"), "utf8"), /allow_implicit_invocation: true/);
  run("update", "--target", "global", "--preset", "unity-production", "--dry-run");
  run("update", "--target", "global", "--preset", "unity-production");
  for (const file of files) assert.deepEqual(fs.readFileSync(path.join(installed, file)), fs.readFileSync(path.join(root, "skills/unity-ui-responsive", file)));
  assert.equal(fs.existsSync(path.join(codex, "hooks.json")), false);
  run("uninstall", "--target", "global");
  assert.equal(fs.existsSync(installed), false);
});

test("responsive UI skill installs into a Unity consumer without Dreamy packages", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-responsive-project-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temporary, "Packages"));
  fs.mkdirSync(path.join(temporary, "ProjectSettings"));
  fs.writeFileSync(path.join(temporary, "Packages/manifest.json"), '{"dependencies":{}}');
  fs.writeFileSync(path.join(temporary, "Packages/packages-lock.json"), '{"dependencies":{}}');
  fs.writeFileSync(path.join(temporary, "ProjectSettings/ProjectVersion.txt"), 'm_EditorVersion: 6000.0.1f1\n');
  execFileSync(process.execPath, [path.join(root, "src/cli.js"), "install", "--target", temporary, "--preset", "unity-minimal", "--json"], { cwd: root, encoding: "utf8" });
  for (const file of files) assert.deepEqual(fs.readFileSync(path.join(temporary, ".agents/skills/unity-ui-responsive", file)), fs.readFileSync(path.join(root, "skills/unity-ui-responsive", file)));
});
