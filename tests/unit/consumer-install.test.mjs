import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { consumerDoctor } from "../../src/consumer-doctor.mjs";
import { installWorkflow, contentHash } from "../../src/consumer-install.mjs";

const toolkit = fileURLToPath(new URL("../../", import.meta.url));
const cli = path.join(toolkit, "src/cli.js");
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy consumer space "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function run(args, { cwd = toolkit, env = {}, entry, code = 0 } = {}) {
  const result = spawnSync(process.execPath, [entry || cli, ...args], { cwd, encoding: "utf8", timeout: 90000, env: { ...process.env, ...env } });
  assert.equal(result.status, code, result.stderr || result.stdout || result.error?.message);
  return result.stdout ? JSON.parse(result.stdout) : null;
}
function installed(root, args, opts = {}) {
  return run(args, { entry: path.join(root, ".dreamy-codex/cli-runtime/src/project-entry.mjs"), ...opts });
}
function unity(root) {
  for (const dir of ["Packages", "ProjectSettings", "Assets"]) fs.mkdirSync(path.join(root, dir));
  fs.writeFileSync(path.join(root, "Packages/manifest.json"), '{"dependencies":{}}');
  fs.writeFileSync(path.join(root, "Packages/packages-lock.json"), '{"dependencies":{}}');
  fs.writeFileSync(path.join(root, "ProjectSettings/ProjectVersion.txt"), "m_EditorVersion: 6000.0.1f1\n");
}

test("fresh project smoke: bundled CLI, checkpoint, actual failure/receipt/lesson and uninstall retention", t => {
  const root = fixture(t);
  unity(root);
  const user = "# User\r\n\r\nKeep exact bytes.\r\n";
  fs.writeFileSync(path.join(root, "AGENTS.md"), user);
  const install = run(["install", "--target", root, "--preset", "core", "--json"]);
  assert.equal(install.hooks.profile, "off");
  assert.equal(fs.existsSync(path.join(root, ".codex/hooks.json")), false);
  const managed = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
  assert.ok(managed.length < 1300);
  assert.doesNotMatch(managed, /Installed Codex agents/);
  assert.match(managed, /docs\/agents\/dreamy-workflow.md/);
  const task = { schemaVersion: 1, taskId: "repair-lock", status: "active", files: ["Packages/packages-lock.json"], objective: "Restore missing lock", nextAction: "Check source" };
  const input = path.join(root, "task.json");
  fs.writeFileSync(input, JSON.stringify(task));
  assert.equal(installed(root, ["task", "checkpoint", "--session", "actual-fixture-session", "--input", input]).status, "active");
  fs.rmSync(path.join(root, "Packages/packages-lock.json"));
  assert.equal(installed(root, ["harness", "project-inspect"], { code: 2 }).status, "degraded");
  const obs = { schemaVersion: 1, id: "missing-lock", taskId: task.taskId, operation: "validate", outcome: "fail", signature: "Missing package lock observed" };
  const record = path.join(root, "record.json");
  fs.writeFileSync(record, JSON.stringify(obs));
  installed(root, ["lessons", "record", "--input", record]);
  const lesson = { schemaVersion: 1, id: "restore-lock", scope: "project", status: "candidate", trigger: "Missing package lock", action: "Restore the matching project lock and rerun static inspection", nonApplicability: ["Runtime bugs"], evidenceRefs: [obs.id], applicability: { platforms: [process.platform], packages: {} } };
  fs.writeFileSync(record, JSON.stringify(lesson));
  installed(root, ["lessons", "record", "--input", record]);
  fs.writeFileSync(path.join(root, "Packages/packages-lock.json"), '{"dependencies":{}}');
  const receipt = installed(root, ["task", "verify", "--command", "validate", "--input", input]);
  assert.equal(receipt.status, "pass");
  assert.equal(installed(root, ["lessons", "verify", lesson.id, "--receipt", receipt.id]).status, "verified-local");
  assert.equal(installed(root, ["lessons", "recall", "--query", "Missing package lock", "--session", "smoke"]).items.length, 1);
  assert.equal(installed(root, ["lessons", "recall", "--query", "Missing package lock", "--session", "smoke"]).items.length, 0);
  const noUnity = { DREAMY_UNITY_PATH: path.join(root, "missing editor"), UNITY_PATH: "" };
  assert.equal(installed(root, ["harness", "compile"], { env: noUnity, code: 2 }).status, "degraded");
  assert.equal(installed(root, ["task", "verify", "--command", "pack", "--input", input], { code: 2 }).status, "not-run");
  fs.writeFileSync(path.join(root, "Assets/Unsafe.asmdef"), '{"name":"Runtime.Unsafe","references":["UnityEditor"]}');
  assert.equal(installed(root, ["harness", "asmdef"], { code: 1 }).status, "fail");
  fs.rmSync(path.join(root, "Assets/Unsafe.asmdef"));
  assert.equal(installed(root, ["harness", "project-inspect", "--full"]).projectPath, root);
  const doc = installed(root, ["doctor", "--json"], { env: noUnity });
  assert.equal(doc.capabilities.cli.status, "available");
  assert.equal(doc.capabilities.cli.entrypointStatus, "available");
  assert.equal(doc.capabilities.lessons.eligible, 1);
  assert.equal(doc.capabilities.checkpoints.status, "available");
  assert.equal(doc.capabilities.staticHarness.status, "available");
  assert.equal(doc.capabilities.unityExecution.status, "missing");
  assert.equal(doc.capabilities.hooks.operational, false);
  fs.appendFileSync(path.join(root, "Packages/packages-lock.json"), "\n");
  assert.equal(installed(root, ["lessons", "recall", "--query", "Missing package lock", "--session", "changed-source"]).items.length, 0);
  for (const status of ["complete", "cancelled"]) {
    fs.writeFileSync(input, JSON.stringify({ ...task, status }));
    assert.equal(installed(root, ["task", "checkpoint", "--session", "actual-fixture-session", "--input", input]).status, status);
  }
  // A new install invocation is idempotent and keeps preset/policy and user bytes.
  installed(root, ["install", "--json"]);
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), managed);
  installed(root, ["update", "--json"]);
  installed(root, ["uninstall", "--json"]);
  assert.equal(fs.readFileSync(path.join(root, "AGENTS.md"), "utf8"), user);
  for (const name of ["knowledge/lessons/restore-lock.json", "checkpoints", "evidence"]) assert.ok(fs.existsSync(path.join(root, ".dreamy", name)));
  assert.equal(fs.existsSync(path.join(root, "Tools/dreamy-kit")), false);
  assert.equal(run(["uninstall", "--target", root, "--json"]).alreadyRemoved, true);
});

test("runtime update stages a new distribution and restores prior ownership on failure", t => {
  const source = fixture(t), root = fixture(t);
  fs.mkdirSync(path.join(source, "templates"));
  fs.writeFileSync(path.join(source, "package.json"), JSON.stringify({ files: ["templates"], dependencies: {} }));
  for (const name of ["dreamy-kit", "dreamy-kit.cmd", "dreamy-workflow.md"]) fs.writeFileSync(path.join(source, "templates", name), `version one ${name}`);
  const target = { root, kind: "project" };
  installWorkflow(source, target);
  const statePath = path.join(root, ".dreamy-codex/workflow-state.json");
  fs.writeFileSync(path.join(source, "templates/dreamy-workflow.md"), "version two workflow");
  installWorkflow(source, target);
  assert.equal(fs.readFileSync(path.join(root, "docs/agents/dreamy-workflow.md"), "utf8"), "version two workflow");
  const before = contentHash(path.join(root, ".dreamy-codex/cli-runtime"));
  const state = fs.readFileSync(statePath, "utf8");
  fs.writeFileSync(path.join(source, "templates/dreamy-kit"), "broken update wrapper");
  fs.rmSync(path.join(source, "templates/dreamy-kit.cmd"));
  assert.throws(() => installWorkflow(source, target), /ENOENT/);
  assert.equal(contentHash(path.join(root, ".dreamy-codex/cli-runtime")), before);
  assert.equal(fs.readFileSync(statePath, "utf8"), state);
  assert.equal(fs.readFileSync(path.join(root, "Tools/dreamy-kit"), "utf8"), "version one dreamy-kit");
});

test("setup hooks preserve foreign config; update keeps profile and status source without granting trust", async t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, ".codex"));
  const config = { userSetting: "keep", hooks: { SessionStart: [{ hooks: [{ type: "command", command: "user-owned" }] }] } };
  const original = JSON.stringify(config, null, 4);
  fs.writeFileSync(path.join(root, ".codex/hooks.json"), original);
  run(["setup", "--target", root, "--preset", "core", "--hooks", "minimal", "--json"]);
  let policy = JSON.parse(fs.readFileSync(path.join(root, ".dreamy-codex/hook-policy.json")));
  assert.equal(policy.toolStatusSource, "response-only");
  assert.equal(policy.recordReceipts, false);
  const configBefore = fs.readFileSync(path.join(root, ".codex/hooks.json"), "utf8");
  run(["update", "--target", root, "--json"]);
  assert.equal(fs.readFileSync(path.join(root, ".codex/hooks.json"), "utf8"), configBefore);
  const target = { root, kind: "project" };
  for (const trust of ["requires-native-review", "trusted"]) {
    const doc = await consumerDoctor(target, { native: true, probe: async () => ({ configuration: "detected", profile: "minimal", probeStatus: "observed", discovery: "complete", trust, operational: false }) });
    assert.equal(doc.hooks.trust, trust);
    assert.equal(doc.hooks.discovery, "complete");
    assert.equal(doc.hooks.delivery, "not-established");
    assert.equal(doc.hooks.operational, false);
  }
  run(["update", "--target", root, "--hooks", "off", "--json"]);
  assert.equal(fs.readFileSync(path.join(root, ".codex/hooks.json"), "utf8"), original);
  run(["uninstall", "--target", root, "--json"]);
  assert.equal(fs.readFileSync(path.join(root, ".codex/hooks.json"), "utf8"), original);
});

test("workflow collisions and managed edits refuse mutation, including uninstall", t => {
  const root = fixture(t);
  fs.mkdirSync(path.join(root, "Tools"));
  const file = path.join(root, "Tools/dreamy-kit");
  fs.writeFileSync(file, "user wrapper");
  const blocked = spawnSync(process.execPath, [cli, "install", "--target", root, "--preset", "core"], { encoding: "utf8" });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /Unowned workflow path/);
  assert.equal(fs.existsSync(path.join(root, "AGENTS.md")), false);
  assert.equal(fs.readFileSync(file, "utf8"), "user wrapper");
  fs.rmSync(file);
  run(["install", "--target", root, "--preset", "core", "--json"]);
  fs.appendFileSync(path.join(root, "docs/agents/dreamy-workflow.md"), "\nUser edit\n");
  for (const action of ["install", "update", "uninstall"]) {
    const result = spawnSync(process.execPath, [cli, action, "--target", root], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Workflow checksum drift/);
    assert.ok(fs.existsSync(file));
  }
});

test("agent/skill edits and unowned name collisions are preserved", t => {
  const root = fixture(t);
  run(["install", "--target", root, "--preset", "core", "--json"]);
  // Pick an actually installed skill so this remains independent of preset membership.
  const state = JSON.parse(fs.readFileSync(path.join(root, ".dreamy-codex/install-state.json")));
  const file = path.join(state.skills[0], "SKILL.md");
  fs.appendFileSync(file, "\nuser notes\n");
  for (const action of ["update", "uninstall"]) {
    const result = spawnSync(process.execPath, [cli, action, "--target", root], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Owned artifact checksum drift/);
    assert.match(fs.readFileSync(file, "utf8"), /user notes/);
  }
});

test("portable shell/Windows entrypoint and missing Node guidance", t => {
  const root = fixture(t);
  run(["install", "--target", root, "--preset", "core", "--json"]);
  const isWindows = process.platform === "win32";
  const executable = isWindows ? "cmd.exe" : "/bin/sh";
  const wrapper = path.join(root, isWindows ? "Tools/dreamy-kit.cmd" : "Tools/dreamy-kit");
  const args = isWindows ? ["/d", "/s", "/c", `""${wrapper}" lessons list --json"`] : [wrapper, "lessons", "list", "--json"];
  const good = spawnSync(executable, args, { cwd: os.tmpdir(), encoding: "utf8", env: { ...process.env, DREAMY_NODE_BINARY: process.execPath } });
  assert.equal(good.status, 0, good.stderr);
  assert.deepEqual(JSON.parse(good.stdout), { lessons: [] });
  const missing = spawnSync(executable, args, { encoding: "utf8", env: { ...process.env, DREAMY_NODE_BINARY: path.join(root, "missing node") } });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /Node.js.*20.*required/);
  assert.match(missing.stderr, /DREAMY_NODE_BINARY/);
  if (!isWindows) {
    const old = path.join(root, "old node");
    fs.writeFileSync(old, "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    const outdated = spawnSync(executable, args, { encoding: "utf8", env: { ...process.env, DREAMY_NODE_BINARY: old } });
    assert.equal(outdated.status, 2);
    assert.match(outdated.stderr, /Upgrade Node/);
  }
});

test("global bundled entrypoint uses project cwd; project hooks remain separately configured", t => {
  const home = fixture(t), agents = fixture(t), project = fixture(t);
  const env = { DREAMY_CODEX_HOME: home, DREAMY_AGENTS_HOME: agents };
  const plan = run(["install", "--target", "global", "--preset", "core", "--dry-run", "--json"], { env });
  assert.equal(plan.hooks.configuration, "project-only");
  assert.equal(fs.existsSync(path.join(home, "Tools")), false);
  run(["install", "--target", "global", "--preset", "core", "--json"], { env });
  assert.deepEqual(installed(home, ["lessons", "list", "--json"], { cwd: project, env }), { lessons: [] });
  const projectDoctor = installed(home, ["doctor", "--json"], { cwd: project, env });
  assert.equal(projectDoctor.capabilities.cli.status, "available");
  assert.equal(projectDoctor.capabilities.cli.entrypointStatus, "missing");
  assert.equal(projectDoctor.capabilities.staticHarness.status, "available");
  assert.equal(fs.existsSync(path.join(home, ".codex/hooks.json")), false);
  const doc = run(["doctor", "--target", "global", "--json"], { env });
  assert.equal(doc.capabilities.lessons.status, "project-required");
  assert.equal(doc.capabilities.hooks.configuration, "project-only");
  const blocked = spawnSync(process.execPath, [cli, "install", "--target", "global", "--hooks", "minimal"], { encoding: "utf8", env: { ...process.env, ...env } });
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /configure --target PROJECT separately/);
  installed(home, ["uninstall", "--target", "global", "--json"], { cwd: project, env });
  assert.equal(fs.existsSync(path.join(home, "Tools/dreamy-kit")), false);
});

test("doctor warnings and ownership errors never recommend a forced uninstall", t => {
  const root = fixture(t);
  const beforeInstall = spawnSync(process.execPath, [cli, "doctor", "--target", root], { encoding: "utf8" });
  assert.equal(beforeInstall.status, 0, beforeInstall.stderr);
  const bootstrapCommands = beforeInstall.stdout.split("Copy commands:")[1];
  assert.ok(bootstrapCommands.includes(root));
  assert.match(bootstrapCommands, /install --target .*--dry-run --json/);
  assert.doesNotMatch(bootstrapCommands, /uninstall|--force/);
  run(["install", "--target", root, "--preset", "core", "--json"]);
  const env = { ...process.env, DREAMY_UNITY_PATH: path.join(root, "missing Editor"), UNITY_PATH: "" };
  const args = [cli, "doctor", "--target", root];
  const healthyOwnership = spawnSync(process.execPath, args, { encoding: "utf8", env });
  assert.equal(healthyOwnership.status, 0, healthyOwnership.stderr);
  assert.doesNotMatch(healthyOwnership.stdout, /uninstall.*--force/);
  assert.ok(healthyOwnership.stdout.split("Copy commands:")[1].includes(root));
  assert.match(healthyOwnership.stdout, /dreamy-kit(?:\.cmd)?['"]? update --dry-run --json/);
  const agents = path.join(root, "AGENTS.md");
  const changed = fs.readFileSync(agents, "utf8").replace("Dreamy Codex Toolkit", "Edited Dreamy Codex Toolkit");
  fs.writeFileSync(agents, changed);
  const drift = spawnSync(process.execPath, args, { encoding: "utf8", env });
  assert.equal(drift.status, 0, drift.stderr);
  assert.match(drift.stdout, /update --dry-run --json/);
  assert.doesNotMatch(drift.stdout, /uninstall.*--force/);
  assert.equal(fs.readFileSync(agents, "utf8"), changed);
});
