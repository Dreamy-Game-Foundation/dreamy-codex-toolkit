import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { inside, hash, readJson, atomicJson } from "./lib/local-data.mjs";

const stateFile = ".dreamy-codex/workflow-state.json";
const runtimeDir = ".dreamy-codex/cli-runtime";
const names = [runtimeDir, "Tools/dreamy-kit", "Tools/dreamy-kit.cmd", "docs/agents/dreamy-workflow.md"];
export function contentHash(file) {
  if (!fs.existsSync(file)) return null;
  if (fs.lstatSync(file).isSymbolicLink()) throw Error(`Symlink ownership path: ${file}`);
  if (fs.statSync(file).isFile()) return hash(fs.readFileSync(file));
  return hash(JSON.stringify(fs.readdirSync(file).sort().map(name => [name, contentHash(path.join(file, name))])));
}
export function workflowState(target) {
  return readJson(inside(target.root, stateFile));
}
export function checkWorkflowOwnership(target) {
  const state = workflowState(target);
  if (state && (state.schemaVersion !== 1 || state.targetKind !== target.kind)) throw Error("Unsupported workflow install state");
  if (state && (!state.hashes || Object.keys(state.hashes).length !== names.length || names.some(n => !/^[0-9a-f]{64}$/.test(state.hashes[n] || "")))) throw Error("Invalid workflow ownership manifest");
  for (const name of names) {
    const file = inside(target.root, name);
    if (!fs.existsSync(file)) continue;
    if (!state?.hashes?.[name]) throw Error(`Unowned workflow path: ${name}; preserve/relocate it before installing`);
    if (contentHash(file) !== state.hashes[name]) throw Error(`Workflow checksum drift: ${name}; preserve edits before update/uninstall`);
  }
}
function copyRuntime(toolkitRoot, dest) {
  const pkg = JSON.parse(fs.readFileSync(path.join(toolkitRoot, "package.json")));
  fs.mkdirSync(dest, { recursive: true });
  for (const name of [...pkg.files, "package.json"]) {
    const source = path.join(toolkitRoot, name);
    if (!fs.existsSync(source)) throw Error(`Missing distributable runtime source: ${name}`);
    fs.cpSync(source, path.join(dest, name), { recursive: true });
  }
  // Bundle only declared production dependencies and their dependency closure.
  // Resolution works from npm cache/global installs as well as this checkout.
  const seen = new Set();
  function dependency(name, from) {
    const req = createRequire(path.join(from, "package.json"));
    const manifest = req.resolve(`${name}/package.json`);
    const data = JSON.parse(fs.readFileSync(manifest));
    const key = `${data.name}@${data.version}`;
    if (seen.has(key)) return;
    if ([...seen].some(k => k.startsWith(`${data.name}@`))) throw Error(`Conflicting runtime dependency versions: ${name}`);
    seen.add(key);
    const source = path.dirname(manifest);
    fs.cpSync(source, path.join(dest, "node_modules", name), { recursive: true, dereference: true });
    for (const dep of Object.keys(data.dependencies || {})) dependency(dep, source);
  }
  for (const name of Object.keys(pkg.dependencies || {})) dependency(name, toolkitRoot);
}
export function installWorkflow(toolkitRoot, target) {
  checkWorkflowOwnership(target);
  const dest = inside(target.root, runtimeDir);
  const stage = inside(target.root, `.dreamy-codex/cli-stage-${process.pid}`);
  if (fs.existsSync(stage)) throw Error(`Runtime stage exists: ${stage}; inspect interrupted installation`);
  const old = workflowState(target);
  const backup = `${dest}.previous`;
  if (fs.existsSync(backup)) throw Error(`Runtime backup exists: ${backup}; inspect interrupted installation`);
  const originals = Object.fromEntries(names.slice(1).map(name => {
    const file = inside(target.root, name);
    return [name, fs.existsSync(file) ? { bytes: fs.readFileSync(file), mode: fs.statSync(file).mode } : null];
  }));
  const hashes = {};
  let switched = false;
  try {
    copyRuntime(toolkitRoot, stage);
    hashes[runtimeDir] = contentHash(stage);
    // Recheck after staging before replacing any owned destination.
    checkWorkflowOwnership(target);
    if (hashes[runtimeDir] !== contentHash(dest)) {
      if (fs.existsSync(dest)) fs.renameSync(dest, backup);
      try { fs.renameSync(stage, dest); switched = true; }
      catch (e) { if (fs.existsSync(backup)) fs.renameSync(backup, dest); throw e; }
    }
    for (const [source, relative] of [
      ["dreamy-kit", "Tools/dreamy-kit"],
      ["dreamy-kit.cmd", "Tools/dreamy-kit.cmd"],
      ["dreamy-workflow.md", "docs/agents/dreamy-workflow.md"],
    ]) {
      const bytes = fs.readFileSync(path.join(dest, "templates", source));
      const file = inside(target.root, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, bytes);
      if (relative === "Tools/dreamy-kit") fs.chmodSync(file, 0o755);
      hashes[relative] = hash(bytes);
    }
    atomicJson(inside(target.root, stateFile), { schemaVersion: 1, targetKind: target.kind, hashes });
  } catch (error) {
    if (switched) {
      fs.rmSync(dest, { recursive: true, force: true });
      if (fs.existsSync(backup)) fs.renameSync(backup, dest);
    }
    for (const [name, original] of Object.entries(originals)) {
      const file = inside(target.root, name);
      if (original) { fs.writeFileSync(file, original.bytes); fs.chmodSync(file, original.mode); }
      else fs.rmSync(file, { force: true });
    }
    if (old) atomicJson(inside(target.root, stateFile), old);
    else fs.rmSync(inside(target.root, stateFile), { force: true });
    throw error;
  } finally { fs.rmSync(stage, { recursive: true, force: true }); }
  fs.rmSync(backup, { recursive: true, force: true });
  return { entrypoint: "Tools/dreamy-kit", windowsEntrypoint: "Tools/dreamy-kit.cmd", workflow: "docs/agents/dreamy-workflow.md", runtime: runtimeDir };
}
export function removeWorkflow(target) {
  const state = workflowState(target);
  if (!state) return;
  checkWorkflowOwnership(target);
  for (const name of names) fs.rmSync(inside(target.root, name), { recursive: true, force: true });
  fs.rmSync(inside(target.root, stateFile));
}
