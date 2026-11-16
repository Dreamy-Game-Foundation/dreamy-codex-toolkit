import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../..");
const source = path.join(root, "skills/production/game-polish");

function assertPortableSkill(installed) {
  function visit(relative = "") {
    for (const entry of fs.readdirSync(path.join(source, relative), { withFileTypes: true })) {
      const file = path.join(relative, entry.name);
      if (entry.isDirectory()) visit(file);
      else {
        const actual = path.join(installed, file);
        assert.deepEqual(fs.readFileSync(actual), fs.readFileSync(path.join(source, file)), file);
        if (!file.endsWith(".md")) continue;
        for (const [, link] of fs.readFileSync(actual, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
          if (/^https?:/.test(link)) continue;
          const target = path.resolve(path.dirname(actual), link.split("#")[0]);
          assert.ok(target.startsWith(installed + path.sep), `skill link escapes installation: ${link}`);
          assert.ok(fs.existsSync(target), `missing installed reference: ${link}`);
        }
      }
    }
  }
  visit();
}

test("game polish resolves only through production and survives isolated global install/update/uninstall", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-polish-global-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const codex = path.join(temporary, "codex");
  const agents = path.join(temporary, "agents");
  const env = { ...process.env, DREAMY_CODEX_HOME: codex, DREAMY_AGENTS_HOME: agents };
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [path.join(root, "src/cli.js"), ...args, "--json"], { cwd: root, env, encoding: "utf8" }));
  for (const preset of ["unity-production", "dreamy-production", "unity-full", "dreamy-full", "dreamy-package"]) {
    assert.ok(run("list", "--resolved", "--target", "global", "--preset", preset).skills.includes("game-polish"), preset);
  }
  for (const preset of ["core", "unity-minimal", "dreamy-project", "dreamy-template"]) {
    assert.equal(run("list", "--resolved", "--target", "global", "--preset", preset).skills.includes("game-polish"), false, preset);
  }
  run("install", "--target", "global", "--preset", "unity-production", "--dry-run");
  assert.equal(fs.existsSync(agents), false);
  assert.equal(fs.existsSync(codex), false);
  const foreign = path.join(agents, "skills/user-skill/SKILL.md");
  fs.mkdirSync(path.dirname(foreign), { recursive: true });
  fs.writeFileSync(foreign, "user-owned bytes\n");
  run("install", "--target", "global", "--preset", "unity-production");
  const installed = path.join(agents, "skills/game-polish");
  assertPortableSkill(installed);
  run("update", "--target", "global", "--preset", "dreamy-production");
  assertPortableSkill(installed);
  assert.equal(fs.existsSync(path.join(codex, "hooks.json")), false);
  run("uninstall", "--target", "global");
  assert.equal(fs.existsSync(installed), false);
  assert.equal(fs.readFileSync(foreign, "utf8"), "user-owned bytes\n");
});

test("game polish installs portably into plain Unity without adding packages or changing user instructions", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-polish-project-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temporary, "Packages"));
  fs.mkdirSync(path.join(temporary, "ProjectSettings"));
  const original = {
    "Packages/manifest.json": '{"dependencies":{}}\n',
    "Packages/packages-lock.json": '{"dependencies":{}}\n',
    "ProjectSettings/ProjectVersion.txt": "m_EditorVersion: 6000.0.1f1\n",
    "AGENTS.md": "# User instructions\nKeep this text.\n"
  };
  for (const [file, content] of Object.entries(original)) fs.writeFileSync(path.join(temporary, file), content);
  const run = (...args) => execFileSync(process.execPath, [path.join(root, "src/cli.js"), ...args, "--target", temporary, "--json"], { cwd: root, encoding: "utf8" });
  run("install", "--preset", "unity-production");
  const installed = path.join(temporary, ".agents/skills/game-polish");
  assertPortableSkill(installed);
  for (const file of ["Packages/manifest.json", "Packages/packages-lock.json", "ProjectSettings/ProjectVersion.txt"]) {
    assert.equal(fs.readFileSync(path.join(temporary, file), "utf8"), original[file]);
  }
  run("uninstall");
  assert.equal(fs.existsSync(installed), false);
  assert.equal(fs.readFileSync(path.join(temporary, "AGENTS.md"), "utf8"), original["AGENTS.md"]);
});
