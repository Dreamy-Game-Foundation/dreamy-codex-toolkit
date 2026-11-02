import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { checkWorkflowOwnership, workflowState } from "./consumer-install.mjs";
import { inside, readJson } from "./lib/local-data.mjs";
import { listRecords } from "./knowledge/store.mjs";
import { eligible } from "./knowledge/eligibility.mjs";
import { hooksDoctor } from "./hooks/install.mjs";
import { probeNativeHooks } from "./hooks/native-probe.mjs";
import { fileURLToPath } from "node:url";

function storeStatus(root, relative) {
  try {
    let dir = inside(root, relative);
    while (!fs.existsSync(dir)) dir = path.dirname(dir);
    fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
    const destination = inside(root, relative);
    if (fs.existsSync(destination) && !fs.statSync(destination).isDirectory()) throw Error("Store path is not a directory");
    return { status: "available", path: relative, initialized: fs.existsSync(destination), mode: "explicit-cli" };
  } catch (e) { return { status: "unavailable", reason: e.message }; }
}
export async function consumerDoctor(target, { native = false, probe = probeNativeHooks, toolkitRoot = fileURLToPath(new URL("../", import.meta.url)) } = {}) {
  const root = target.root;
  const runtime = path.join(root, ".dreamy-codex/cli-runtime");
  let cli;
  try {
    checkWorkflowOwnership(target);
    const state = workflowState(target);
    const actualRuntime = state ? runtime : toolkitRoot;
    const result = spawnSync(process.execPath, [path.join(actualRuntime, "src/cli.js"), "help"], { encoding: "utf8", timeout: 10000 });
    if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr || "Installed CLI failed");
    const entriesPresent = state && ["Tools/dreamy-kit", "Tools/dreamy-kit.cmd", ".dreamy-codex/cli-runtime/src/project-entry.mjs"].every(name => fs.existsSync(path.join(root, name)));
    cli = { status: "available", entrypointStatus: entriesPresent ? "available" : "missing", entrypoint: "Tools/dreamy-kit", windowsEntrypoint: "Tools/dreamy-kit.cmd", node: process.version, runtime: actualRuntime, reason: entriesPresent ? null : "Current CLI is usable; install/update this target to add local entrypoints. A global entrypoint can operate from project cwd." };
  } catch (e) { cli = { status: "unavailable", reason: e.message }; }
  const scope = target.kind === "global" ? { status: "project-required", reason: "Run from a project cwd or install --target PROJECT; data stays project-local" } : null;
  const lessons = scope || storeStatus(root, ".dreamy/knowledge");
  if (!scope && lessons.status === "available") {
    try {
      const records = listRecords(root, "lessons");
      lessons.count = records.length;
      lessons.eligible = records.filter(l => eligible(root, l)).length;
    } catch (e) { lessons.status = "unavailable"; lessons.reason = e.message; }
  }
  const checkpoints = scope || storeStatus(root, ".dreamy/checkpoints");
  if (!scope && checkpoints.status === "available" && checkpoints.initialized) {
    try {
      const dir = inside(root, ".dreamy/checkpoints");
      for (const name of fs.readdirSync(dir).filter(n => n.endsWith(".json"))) {
        const cp = readJson(inside(dir, name));
        if (cp.schemaVersion !== 1 || !["active", "complete", "cancelled", "blocked"].includes(cp.status)) throw Error(`Invalid checkpoint: ${name}`);
      }
    } catch (e) { checkpoints.status = "unavailable"; checkpoints.reason = e.message; }
  }
  const unityPath = process.env.DREAMY_UNITY_PATH || process.env.UNITY_PATH;
  let executable = false;
  try { if (unityPath) { fs.accessSync(unityPath, fs.constants.X_OK); executable = fs.statSync(unityPath).isFile(); } } catch {}
  const harnessProbe = spawnSync(process.execPath, [path.join(toolkitRoot, "harness/dreamy-harness"), "help"], { encoding: "utf8", timeout: 10000 });
  const staticHarness = { status: harnessProbe.status === 0 && !harnessProbe.error ? "available" : "unavailable", operations: ["project-inspect", "asmdef", "package-check"], requiresUnity: false, availabilityProbe: "help", execution: "not-run", reason: harnessProbe.error?.message || (harnessProbe.status ? harnessProbe.stderr : null) };
  const unityExecution = { status: executable ? "configured" : "missing", executable: unityPath || null, operations: ["compile", "test-editmode", "test-playmode"], execution: "not-run", reason: executable ? "Editor configured; license, project compatibility and tests require actual execution" : "Set DREAMY_UNITY_PATH or UNITY_PATH to a Unity Editor executable; static checks remain available" };
  let hooks = target.kind === "global"
    ? { status: "project-required", configuration: "project-only", trust: "not-probed", discovery: "not-probed", delivery: "not-established", operational: false }
    : { ...(native ? await probe(root) : hooksDoctor(root)), status: "diagnostic", delivery: "not-established" };
  hooks.discovery ??= "not-probed";
  // Local runner receipts have no authenticated native provenance. Expose them
  // as local diagnostics only, never upgrade them to native delivery acceptance.
  const receipts = path.join(root, ".dreamy/hook-receipts");
  if (target.kind !== "global" && fs.existsSync(receipts)) {
    try {
      const files = fs.readdirSync(receipts).filter(n => n.endsWith(".json"));
      hooks.localReceiptCount = files.length;
      hooks.localReceiptProvenance = "unattributed-runner-evidence";
      hooks.deliveryEvidence = files.slice(0, 20).map(name => {
        const record = readJson(inside(receipts, name));
        return { event: record.event, observedAt: record.observedAt, source: record.source, handlerErrors: record.metrics?.errors?.length ?? null };
      });
      hooks.deliveryEvidenceLimitation = "Runner receipts can also come from explicit invocation and are not bound to the current hook definitions; verify native delivery separately";
    } catch (e) { hooks.receiptError = e.message; }
  }
  return { cli, lessons, checkpoints, staticHarness, unityExecution, hooks };
}
