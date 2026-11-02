import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { inspectionInputs } from "./project-profile.js";
import { checkerFingerprint, unityEnvironment } from "./lib/verification-context.mjs";
import {
  hash,
  inside,
  dataRoot,
  atomicJson,
  readJson,
  sessionKey,
  withLock,
  sanitize,
} from "./lib/local-data.mjs";
export function fingerprint(root, files) {
  const h = [];
  for (const relative of [...new Set(files)].sort()) {
    if (
      path.isAbsolute(relative) ||
      relative.startsWith(".dreamy/") ||
      relative.startsWith(".dreamy-codex/")
    )
      throw Error("Verification inputs must be relative source files");
    const file = inside(root, relative);
    const normalized = path.relative(root, file).replaceAll("\\", "/");
    if (
      normalized === ".dreamy" ||
      normalized.startsWith(".dreamy/") ||
      normalized.startsWith(".dreamy-codex/")
    )
      throw Error("Verification inputs cannot include runtime data");
    if (!fs.existsSync(file)) {
      h.push([relative, null]);
      continue;
    }
    if (!fs.statSync(file).isFile())
      throw Error("Verification input must be a file");
    h.push([relative, hash(fs.readFileSync(file))]);
  }
  return hash(JSON.stringify(h));
}
// Verification depends on the checker/configuration as well as the requested source files.
// Toolkit checks conservatively snapshot distributable inputs and tests, excluding generated outputs.
export function verificationFingerprint(root, files, {
  toolkitRoot = fileURLToPath(new URL("../", import.meta.url)),
  commandId = "validate",
} = {}) {
  if (
    !fs.existsSync(path.join(root, "toolkit.json")) ||
    !fs.existsSync(path.join(root, "package.json"))
  ) {
    const unityExecution = ["unit", "unity"].includes(commandId);
    return hash(JSON.stringify({
      version: 2,
      commandId,
      source: fingerprint(root, files),
      project: fingerprint(root, inspectionInputs(root, { unityExecution })),
      checker: checkerFingerprint(toolkitRoot),
      environment: unityExecution ? unityEnvironment() : null,
    }));
  }
  const pkg = readJson(inside(root, "package.json"));
  const selected = new Set(files);
  const visit = (relative) => {
    const full = inside(root, relative);
    if (!fs.existsSync(full)) return;
    if (fs.statSync(full).isDirectory())
      for (const name of fs.readdirSync(full).sort())
        visit(path.join(relative, name));
    else selected.add(relative.replaceAll("\\", "/"));
  };
  for (const relative of [
    ...(pkg.files || []),
    "package.json",
    "package-lock.json",
    "tests",
  ])
    visit(relative);
  return fingerprint(root, [...selected]);
}
export function commandsFor(files) {
  const required = new Set(["validate"]);
  for (const f of files) {
    if (/^(src|scripts|tests|hooks|schemas)\//.test(f)) required.add("unit");
    if (
      /^(src|scripts|skills|hooks|schemas|modules|presets)\/|^(package|toolkit)/.test(
        f,
      )
    )
      required.add("pack");
    if (/\.(cs|unity|prefab|asset)$/.test(f)) required.add("unity");
  }
  return [...required];
}
function command(root, id) {
  const npmCli = process.env.npm_execpath;
  const scripts = {
    validate: ["src/cli.js", "validate"],
    unit: ["scripts/test-unit.mjs"],
    pack: ["scripts/pack-smoke.mjs"],
  };
  if (id === "unity") return null;
  if (id === "pack" && !npmCli) return null;
  if (!scripts[id]) throw Error("Unknown verification command ID");
  return {
    executable: process.execPath,
    args: scripts[id].map((s, i) => (i === 0 ? path.join(root, s) : s)),
  };
}
export function runVerification(
  toolkitRoot,
  projectRoot,
  { id, files, taskId },
) {
  if (
    typeof taskId !== "string" ||
    !taskId ||
    !Array.isArray(files) ||
    !files.length
  )
    throw Error("Task ID and source input files required");
  const before = fingerprint(projectRoot, files),
    checkFingerprint = verificationFingerprint(projectRoot, files, { toolkitRoot, commandId: id }),
    spec = command(toolkitRoot, id),
    startedAt = new Date().toISOString();
  // Toolkit checks apply to a toolkit checkout, not arbitrary Unity source.
  const local =
    fs.existsSync(path.join(projectRoot, "toolkit.json")) &&
    fs.realpathSync(projectRoot) === fs.realpathSync(toolkitRoot);
  const unity = fs.existsSync(path.join(projectRoot, "Packages/manifest.json"));
  const unityOperation = {
    validate: "project-inspect",
    unit: "test-editmode",
    unity: "compile",
  }[id];
  const actual = local
    ? spec
    : unity && unityOperation
      ? {
          executable: process.execPath,
          args: [
            path.join(toolkitRoot, "harness/dreamy-harness"),
            unityOperation,
            projectRoot,
          ],
        }
      : null;
  const result = actual
    ? spawnSync(actual.executable, actual.args, {
        cwd: projectRoot,
        encoding: "utf8",
        timeout: 180000,
        maxBuffer: 4 * 1024 * 1024,
      })
    : null;
  const status = !result
    ? "not-run"
    : result.error || result.status === 2
      ? "degraded"
      : result.status === 0
        ? "pass"
        : "fail";
  const receipt = {
    schemaVersion: 1,
    id: `${taskId}-${id}-${Date.now()}-${hash(String(Math.random())).slice(0, 8)}`,
    taskId,
    commandId: id,
    platform: process.platform,
    files,
    sourceFingerprint: before,
    verificationFingerprint: checkFingerprint,
    nodeVersion: process.version,
    status,
    exitCode: result?.status ?? null,
    reason: !result
      ? "Verification requires the toolkit checkout or a configured Unity adapter"
      : (result.error?.message ??
        (result.status === 2
          ? "Unity verification degraded; inspect the stored log"
          : null)),
    startedAt,
    completedAt: new Date().toISOString(),
    logHash: hash((result?.stdout || "") + (result?.stderr || "")),
    inputsUnchanged:
      before === fingerprint(projectRoot, files) &&
      checkFingerprint === verificationFingerprint(projectRoot, files, { toolkitRoot, commandId: id }),
  };
  if (!receipt.inputsUnchanged) receipt.status = "stale";
  const dir = inside(dataRoot(projectRoot), "evidence");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    inside(dir, `${hash(receipt.id)}.log`),
    (result?.stdout || "") + (result?.stderr || ""),
    { mode: 0o600 },
  );
  atomicJson(inside(dir, `${hash(receipt.id)}.json`), receipt);
  return receipt;
}
function receiptEntries(root) {
  const dir = inside(dataRoot(root), "evidence");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      r: readJson(inside(dir, f)),
      log: inside(dir, `${f.slice(0, -5)}.log`),
    }));
}
function receiptReasons(root, { r, log }, taskId, files, current, checks) {
  if (!r || r.schemaVersion !== 1) return ["invalid-receipt"];
  const reasons = [];
  if (!["validate", "unit", "pack", "unity"].includes(r.commandId)) return ["invalid-command"];
  if (r.platform !== process.platform) reasons.push("receipt-platform-mismatch");
  if (r.nodeVersion !== process.version) reasons.push("node-version-changed");
  if (r.taskId !== taskId) reasons.push("receipt-task-mismatch");
  if (r.sourceFingerprint !== current) reasons.push("source-changed");
  if (!checks.has(r.commandId)) checks.set(r.commandId, verificationFingerprint(root, files, { commandId: r.commandId }));
  if (r.verificationFingerprint !== checks.get(r.commandId)) reasons.push("verification-context-changed");
  if (r.status !== "pass" || r.exitCode !== 0 || !r.inputsUnchanged) reasons.push("receipt-not-successful");
  if (!fs.existsSync(log)) reasons.push("receipt-log-missing");
  else if (hash(fs.readFileSync(log)) !== r.logHash) reasons.push("receipt-log-changed");
  return reasons;
}
export function evidenceFor(root, taskId, files) {
  const current = fingerprint(root, files), checks = new Map();
  return receiptEntries(root)
    .filter(entry => receiptReasons(root, entry, taskId, files, current, checks).length === 0)
    .map(({ r }) => r);
}
export function explainReceipt(root, receiptId, taskId, files) {
  const entry = receiptEntries(root).find(({ r }) => r?.id === receiptId);
  if (!entry) return { valid: false, reasons: ["receipt-missing"] };
  const reasons = receiptReasons(root, entry, taskId, files, fingerprint(root, files), new Map());
  return { valid: reasons.length === 0, reasons };
}
export function writeCheckpoint(root, session, input) {
  if (
    input.schemaVersion !== 1 ||
    typeof input.taskId !== "string" ||
    !input.taskId ||
    !Array.isArray(input.files) ||
    !input.files.length ||
    !["active", "blocked", "cancelled", "complete"].includes(input.status)
  )
    throw Error("Invalid task checkpoint");
  const cp = {
    schemaVersion: 1,
    taskId: input.taskId,
    status: input.status,
    files: input.files,
    sourceFingerprint: fingerprint(root, input.files),
    requiredCommands: commandsFor(input.files),
    objective: sanitize(input.objective || "", 300),
    nextAction: sanitize(input.nextAction || "", 250),
    updatedAt: new Date().toISOString(),
  };
  const file = checkpointPath(root, session);
  withLock(`${file}.lock`, () => atomicJson(file, cp));
  return cp;
}
export const checkpointPath = (root, session) =>
  inside(dataRoot(root), `checkpoints/${sessionKey(session)}.json`);
