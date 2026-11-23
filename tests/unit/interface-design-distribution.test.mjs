import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "../..");
const names = ["frontend-design", "tool-ui-design", "unity-editor-ui"];

function verifySkills(destination) {
  for (const name of names) {
    const source = path.join(root, "skills/design", name);
    for (const relative of fs.readdirSync(source, { recursive: true })) {
      if (!fs.statSync(path.join(source, relative)).isFile()) continue;
      const installed = path.join(destination, name, relative);
      assert.deepEqual(fs.readFileSync(installed), fs.readFileSync(path.join(source, relative)));
      if (!relative.endsWith(".md")) continue;
      for (const [, link] of fs.readFileSync(installed, "utf8").matchAll(/\]\(([^)]+)\)/g)) {
        if (/^https?:/.test(link)) continue;
        const target = path.resolve(path.dirname(installed), link.split("#")[0]);
        assert.ok(target.startsWith(destination + path.sep), `reference escapes skill installation: ${link}`);
        assert.ok(fs.existsSync(target), `missing installed reference: ${link}`);
      }
    }
  }
}

test("interface design preserves shared references through isolated global install/update/uninstall", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-interface-global-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const codex = path.join(temporary, "codex"), agents = path.join(temporary, "agents");
  const env = { ...process.env, DREAMY_CODEX_HOME: codex, DREAMY_AGENTS_HOME: agents };
  const run = (...args) => JSON.parse(execFileSync(process.execPath, [path.join(root, "src/cli.js"), ...args, "--target", "global", "--json"], { cwd: root, env, encoding: "utf8" }));
  const selected = run("list", "--resolved", "--preset", "interface-design");
  for (const name of names) assert.ok(selected.skills.includes(name));
  for (const preset of ["unity-minimal", "unity-full", "dreamy-full"]) {
    const other = run("list", "--resolved", "--preset", preset);
    for (const name of names) assert.equal(other.skills.includes(name), false);
  }
  run("install", "--preset", "interface-design", "--dry-run");
  assert.equal(fs.existsSync(agents), false);
  assert.equal(fs.existsSync(codex), false);
  const foreign = path.join(agents, "skills/user-skill/SKILL.md");
  fs.mkdirSync(path.dirname(foreign), { recursive: true });
  fs.writeFileSync(foreign, "user-owned bytes\n");
  run("install", "--preset", "interface-design");
  verifySkills(path.join(agents, "skills"));
  run("update", "--preset", "interface-design");
  verifySkills(path.join(agents, "skills"));
  assert.equal(fs.existsSync(path.join(codex, "hooks.json")), false);
  run("uninstall");
  for (const name of names) assert.equal(fs.existsSync(path.join(agents, "skills", name)), false);
  assert.equal(fs.readFileSync(foreign, "utf8"), "user-owned bytes\n");
});

test("interface design installs into a plain project without changing packages or user instructions", t => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-interface-project-"));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const original = {
    "Packages/manifest.json": '{"dependencies":{}}\n',
    "Packages/packages-lock.json": '{"dependencies":{}}\n',
    "ProjectSettings/ProjectVersion.txt": "m_EditorVersion: 6000.0.1f1\n",
    "AGENTS.md": "# User instructions\nPreserve this text.\n"
  };
  for (const [file, content] of Object.entries(original)) {
    fs.mkdirSync(path.dirname(path.join(temporary, file)), { recursive: true });
    fs.writeFileSync(path.join(temporary, file), content);
  }
  const run = (...args) => execFileSync(process.execPath, [path.join(root, "src/cli.js"), ...args, "--target", temporary, "--json"], { cwd: root, encoding: "utf8" });
  run("install", "--preset", "interface-design");
  verifySkills(path.join(temporary, ".agents/skills"));
  run("update", "--preset", "interface-design");
  verifySkills(path.join(temporary, ".agents/skills"));
  for (const [file, content] of Object.entries(original)) {
    if (file !== "AGENTS.md") assert.equal(fs.readFileSync(path.join(temporary, file), "utf8"), content);
  }
  run("uninstall");
  assert.equal(fs.readFileSync(path.join(temporary, "AGENTS.md"), "utf8"), original["AGENTS.md"]);
});
