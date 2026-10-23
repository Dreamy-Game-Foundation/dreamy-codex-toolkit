import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { codexTranscriptStatus } from "../../src/hooks/codex-transcript-status.mjs";
import { dispatch } from "../../src/hooks/dispatcher.mjs";
import { configureHooks } from "../../src/hooks/install.mjs";
import { listRecords } from "../../src/knowledge/store.mjs";
import { resolvePolicy } from "../../src/hooks/policy.mjs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { hash, readJson } from "../../src/lib/local-data.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy transcript "));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const codexHome = path.join(root, "codex-home"), session = "01a166c7-ff52-7131-82db-f6337be71daf";
  const file = path.join(codexHome, "sessions/2026/10/23", `rollout-test-${session}.jsonl`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const event = { hook_event_name: "PostToolUse", session_id: session, turn_id: "turn-one",
    tool_use_id: "exec-one", tool_name: "Bash", cwd: root, transcript_path: file,
    tool_response: "ERR_ASSERTION SECRET_MARKER", tool_input: { command: "node fixture --token=SECRET_MARKER" } };
  const meta = { type: "session_meta", payload: { id: session, cli_version: "0.163.0", cwd: root } };
  const completed = { type: "event_msg", timestamp: new Date().toISOString(), payload: {
    type: "item_completed", thread_id: session, turn_id: event.turn_id, item: {
      type: "CommandExecution", id: event.tool_use_id, cwd: pathToFileURL(root).href,
      status: "failed", exit_code: 7, aggregated_output: "ERR_ASSERTION SECRET_MARKER",
    } } };
  const write = (records = [meta, completed]) => fs.writeFileSync(file, records.map(r => JSON.stringify(r)).join("\n") + "\n");
  write();
  return { root, codexHome, file, event, meta, completed, write };
}

test("version-bound transcript adapter correlates completed commands and keeps output private", t => {
  const f = fixture(t);
  const result = codexTranscriptStatus(f.root, f.event, { codexHome: f.codexHome });
  assert.equal(result.exitCode, 7);
  assert.equal(result.signature, "ERR_ASSERTION");
  assert.ok(result.bytesRead <= 196608);
  assert.equal(JSON.stringify(result).includes("SECRET_MARKER"), false);
  const original = process.env.CODEX_HOME;
  process.env.CODEX_HOME = f.codexHome;
  t.after(() => { if (original === undefined) delete process.env.CODEX_HOME; else process.env.CODEX_HOME = original; });
  const policy = { profile: "minimal", toolStatusSource: "codex-transcript-0.163" };
  assert.equal(dispatch(f.event, { root: f.root, policy: { profile: "minimal" } }).metrics.diagnostics[0].outcome, "missing-exit-code");
  assert.equal(listRecords(f.root, "observations").length, 0);
  for (let i = 0; i < 2; i++) {
    const output = dispatch(f.event, { root: f.root, policy });
    assert.equal(output.metrics.diagnostics[0].statusSource, "codex-transcript-0.163");
    assert.equal(output.metrics.diagnostics[0].exitCode, 7);
    assert.equal(JSON.stringify(output).includes("SECRET_MARKER"), false);
  }
  const records = listRecords(f.root, "observations");
  assert.equal(records.length, 1);
  assert.equal(records[0].signature, "ERR_ASSERTION");
  assert.equal(records[0].taskId, "unassigned");
  assert.equal(JSON.stringify(records).includes("SECRET_MARKER"), false);
  f.meta.payload.base_instructions = "x".repeat(20000); f.write();
  assert.equal(codexTranscriptStatus(f.root, f.event, { codexHome: f.codexHome }).exitCode, 7);
  f.completed.payload.item.exit_code = 0; f.completed.payload.item.status = "completed"; f.write();
  assert.equal(dispatch(f.event, { root: f.root, policy }).metrics.diagnostics[0].outcome, "success");
  assert.equal(listRecords(f.root, "observations").length, 1);
});

test("transcript status rejects missing, stale, mismatched, ambiguous or spoofed evidence", t => {
  const f = fixture(t), read = (event = f.event) => codexTranscriptStatus(f.root, event, { codexHome: f.codexHome });
  for (const change of [{ turn_id: "wrong" }, { tool_use_id: "wrong" }, { session_id: "wrong" },
    { cwd: os.tmpdir() }, { tool_name: "apply_patch" }, { subagent: { agent_id: "child" } },
    { transcript_path: path.join(f.root, "outside.jsonl") }, { transcript_path: null }])
    assert.equal(read({ ...f.event, ...change }).exitCode, undefined);
  f.write([f.meta, f.completed, f.completed]); assert.equal(read().reason, "ambiguous-command");
  f.meta.payload.cli_version = "0.164.0"; f.write(); assert.equal(read().reason, "session-or-version-mismatch");
  f.meta.payload.cli_version = "0.163.0";
  f.meta.payload.base_instructions = "x".repeat(70000); f.write();
  assert.equal(read().exitCode, undefined); // Oversized metadata is unsupported, never scanned unboundedly.
  delete f.meta.payload.base_instructions;
  f.completed.timestamp = new Date(Date.now() - 600000).toISOString(); f.write();
  assert.equal(read().reason, "invalid-or-stale-command");
  f.completed.timestamp = new Date().toISOString();
  f.completed.payload.item.exit_code = "7"; f.write(); assert.equal(read().exitCode, undefined);
  f.completed.payload.item.exit_code = 7;
  f.write([f.meta, { type: "response_item", payload: { type: "message", text: JSON.stringify(f.completed) } }]);
  assert.equal(read().reason, "command-not-found");
  f.write([f.meta, f.completed, { type: "padding", text: "x".repeat(140000) }]);
  assert.equal(read().reason, "command-not-found"); // No unbounded history scan.
  f.write();
  fs.renameSync(f.file, f.file + ".original"); fs.mkdirSync(f.file);
  assert.equal(read().exitCode, undefined);
  fs.rmdirSync(f.file);
  try { fs.symlinkSync(f.file + ".original", f.file); }
  catch (error) { if (["EPERM", "EACCES"].includes(error.code)) return; throw error; }
  assert.equal(read().exitCode, undefined);
});

test("transcript fallback is explicit policy and changes the reviewed native definition", t => {
  const f = fixture(t), toolkit = fileURLToPath(new URL("../../", import.meta.url));
  assert.equal(resolvePolicy({}).toolStatusSource, "response-only");
  for (const bad of [true, false, "", "auto", "codex-transcript-latest"])
    assert.throws(() => resolvePolicy({ toolStatusSource: bad }), /toolStatusSource/);
  configureHooks(toolkit, f.root, { profile: "minimal" });
  const before = fs.readFileSync(path.join(f.root, ".codex/hooks.json"), "utf8");
  configureHooks(toolkit, f.root, { profile: "minimal", toolStatusSource: "codex-transcript-0.163", recordReceipts: true });
  assert.notEqual(fs.readFileSync(path.join(f.root, ".codex/hooks.json"), "utf8"), before);
  const invocation = spawnSync(process.execPath, [
    path.join(f.root, ".dreamy-codex/hooks-runtime/src/hooks/runner.mjs"),
    "--root", f.root, "--policy", path.join(f.root, ".dreamy-codex/hook-policy.json"),
  ], { input: JSON.stringify(f.event), encoding: "utf8", env: { ...process.env, CODEX_HOME: f.codexHome } });
  assert.equal(invocation.status, 0, invocation.stderr);
  assert.equal(invocation.stdout, "");
  const receipt = readJson(path.join(f.root, `.dreamy/hook-receipts/${hash(f.event.session_id + ":PostToolUse")}.json`));
  assert.deepEqual(receipt.metrics.errors, []);
  assert.equal(receipt.metrics.diagnostics[0].statusSource, "codex-transcript-0.163");
  assert.equal(receipt.metrics.diagnostics[0].exitCode, 7);
  assert.equal(listRecords(f.root, "observations").length, 1);
  assert.equal(JSON.stringify(receipt).includes("SECRET_MARKER"), false);
});
