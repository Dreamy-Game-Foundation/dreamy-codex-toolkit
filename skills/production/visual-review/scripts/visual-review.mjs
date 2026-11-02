import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const owner = "visual-review";
const store = ".dreamy/visual-review";
const self = fileURLToPath(import.meta.url);
const digest = bytes => crypto.createHash("sha256").update(bytes).digest("hex");
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,95}$/;

function safe(base, relative) {
  const full = path.resolve(base, relative), rel = path.relative(base, full);
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw Error("Path escapes owned root");
  let current = path.parse(full).root;
  for (const part of full.slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    try { if (fs.lstatSync(current).isSymbolicLink()) throw Error("Symlink/junction paths are not supported"); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return full;
}
function json(file, fallback = null) {
  try {
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw Error("Invalid/oversized review record");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) { if (error.code === "ENOENT") return fallback; throw error; }
}
function atomic(file, value) {
  safe(path.dirname(file), path.basename(file));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  try { fs.writeFileSync(temp, JSON.stringify(value, null, 2) + "\n", { flag: "wx", mode: 0o600 }); fs.renameSync(temp, file); }
  finally { fs.rmSync(temp, { force: true }); }
}
function lock(ctx, fn) {
  const file = safe(ctx.root, `${store}/.lock`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let fd;
  try { fd = fs.openSync(file, "wx", 0o600); }
  catch (error) { if (error.code === "EEXIST") throw Error("Review store busy; inspect an interrupted operation before retrying"); throw error; }
  try { return fn(); } finally { fs.closeSync(fd); fs.unlinkSync(file); }
}
function git(ctx, args, { allowFailure = false, input } = {}) {
  const result = spawnSync("git", ["-C", ctx.root, ...args], { input, encoding: "utf8", windowsHide: true, timeout: 15000, maxBuffer: 16 * 1024 * 1024 });
  if ((result.error || result.status !== 0) && !allowFailure) throw Error(result.error?.message || result.stderr?.trim() || `git ${args[0]} failed`);
  return result;
}
function context(root) {
  const base = fs.realpathSync(root || process.cwd());
  const result = git({ root: base }, ["rev-parse", "--show-toplevel"]);
  const canonical = fs.realpathSync(result.stdout.trim());
  return { root: canonical, identity: digest(canonical), dir: safe(canonical, store) };
}
function owned(ctx, record) {
  if (record?.schemaVersion !== 1 || record.owner !== owner || record.worktree !== ctx.identity) throw Error("Review record ownership/worktree mismatch");
  return record;
}
const record = (ctx, fields) => ({ schemaVersion: 1, owner, worktree: ctx.identity, ...fields });
const policyPath = ctx => safe(ctx.root, `${store}/policy.json`);
function policy(ctx) { return owned(ctx, json(policyPath(ctx))); }
function checkTracked(ctx) {
  if (git(ctx, ["ls-files", "-z", "--", store]).stdout) throw Error("Tracked/staged files in review root; preserve them and reconcile manually");
}
function ignored(ctx) { return git(ctx, ["check-ignore", "--no-index", "--quiet", `${store}/probe.png`], { allowFailure: true }).status === 0; }
function runtimePath(ctx) { return safe(ctx.root, `${store}/runtime/visual-review.mjs`); }
function enabled(ctx) {
  const p = policy(ctx);
  if (!p.enabled) throw Error("Review store is disabled; run setup first");
  if (!ignored(ctx)) throw Error("Review root is not Git-ignored; run setup first");
  checkTracked(ctx);
  return p;
}
function runPath(ctx, id) {
  if (!idPattern.test(id || "")) throw Error("Invalid run ID");
  return safe(ctx.root, `${store}/runs/${id}/manifest.json`);
}
function readRun(ctx, id) {
  const run = owned(ctx, json(runPath(ctx, id)));
  if (run.id !== id || !Array.isArray(run.images) || !Array.isArray(run.files)) throw Error("Invalid run manifest");
  return run;
}
function runs(ctx) {
  const dir = safe(ctx.root, `${store}/runs`);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).sort().map(id => readRun(ctx, id));
}
function inputPath(ctx, name) {
  if (typeof name !== "string" || !name || name.includes("\\") || path.isAbsolute(name)) throw Error("Input paths must be worktree-relative with forward slashes");
  const full = safe(ctx.root, name), relative = path.relative(ctx.root, full).replaceAll("\\", "/");
  if (!relative || relative === ".git" || relative.startsWith(".git/") || relative === ".dreamy" || relative.startsWith(".dreamy/") || relative.startsWith("artifacts/visual-review/")) throw Error("Invalid source input path");
  return { full, relative };
}
function sources(ctx, names) {
  if (!Array.isArray(names) || names.length === 0 || names.length > 200 || new Set(names).size !== names.length) throw Error("Select 1–200 distinct source input paths");
  return names.map(name => {
    const { full, relative } = inputPath(ctx, name);
    if (!fs.existsSync(full)) return { path: relative, sha256: null, gitBlob: null };
    if (!fs.statSync(full).isFile()) throw Error("Source input must be a regular file");
    const bytes = fs.readFileSync(full);
    return { path: relative, sha256: digest(bytes), gitBlob: git(ctx, ["hash-object", `--path=${relative}`, "--stdin"], { input: bytes }).stdout.trim() };
  });
}
function imageBytes(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 20 * 1024 * 1024) throw Error("Screenshot must be a regular PNG/JPEG file no larger than 20 MiB");
  const bytes = fs.readFileSync(file);
  const png = bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && bytes.toString("ascii", 12, 16) === "IHDR";
  const jpeg = bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes.at(-2) === 255 && bytes.at(-1) === 217;
  if (!png && !jpeg) throw Error("Expected a PNG/JPEG screenshot signature");
  return { bytes, extension: png ? ".png" : ".jpg" };
}
function imagePath(ctx, run, image) {
  if (typeof image.name !== "string" || path.basename(image.name) !== image.name || !/\.(png|jpe?g)$/i.test(image.name)) throw Error("Invalid registered image name");
  return safe(ctx.root, `${store}/runs/${run.id}/${image.name}`);
}
function hooks(ctx) {
  const custom = git(ctx, ["config", "--get", "core.hooksPath"], { allowFailure: true });
  if (custom.status === 0) throw Error("Existing core.hooksPath: integrate helper with your hook manager; no hooks changed");
  const dir = path.resolve(ctx.root, git(ctx, ["rev-parse", "--git-path", "hooks"]).stdout.trim());
  const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
  const entries = {};
  for (const event of ["pre-commit", "post-commit"]) {
    const command = event === "pre-commit" ? "before-commit" : "after-commit";
    const invoke = `${quote(process.execPath)} "$review_helper" ${command} --root "$review_root"`;
    const text = `#!/bin/sh\n# visual-review managed hook v1\nreview_root=$(git rev-parse --show-toplevel) || exit 1\nreview_helper="$review_root/${store}/runtime/visual-review.mjs"\n[ -f "$review_helper" ] || exit 0\n${event === "pre-commit" ? `exec ${invoke}` : `${invoke} || echo 'visual-review: commit succeeded; cleanup incomplete' >&2\nexit 0`}\n`;
    const file = safe(dir, event);
    if (fs.existsSync(file) && fs.readFileSync(file, "utf8") !== text) throw Error(`Existing ${event} hook preserved; integrate helper manually`);
    entries[event] = { file, text };
  }
  return entries;
}

export function setup(root, { installHooks = false, dryRun = false } = {}) {
  const ctx = context(root);
  checkTracked(ctx);
  const old = json(policyPath(ctx));
  if (old) owned(ctx, old);
  const runtime = runtimePath(ctx), bytes = fs.readFileSync(self);
  if (fs.existsSync(runtime) && (!old?.runtimeHash || digest(fs.readFileSync(runtime)) !== old.runtimeHash)) throw Error("Review runtime ownership drift; preserve edits before setup");
  const entries = installHooks ? hooks(ctx) : {};
  const ignoreFile = safe(ctx.root, ".gitignore");
  const needsIgnore = !ignored(ctx);
  if (dryRun) return { status: "planned", root: ctx.root, addIgnore: needsIgnore, hooks: Object.keys(entries) };
  return lock(ctx, () => {
    if (needsIgnore) {
      const original = fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, "utf8") : "";
      fs.writeFileSync(ignoreFile, original + (original && !original.endsWith("\n") ? "\n" : "") + `\n# visual-review temporary screenshots\n/${store}/\n`);
      if (!ignored(ctx)) throw Error("Review root remains unignored; inspect ignore configuration");
    }
    fs.mkdirSync(path.dirname(runtime), { recursive: true });
    if (path.resolve(self) !== runtime) fs.writeFileSync(runtime, bytes, { mode: 0o600 });
    atomic(policyPath(ctx), record(ctx, { enabled: true, runtimeHash: digest(bytes) }));
    for (const { file, text } of Object.values(entries)) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      if (!fs.existsSync(file)) fs.writeFileSync(file, text, { flag: "wx", mode: 0o755 });
    }
    return { status: "ready", root: ctx.root, store: ctx.dir, hooks: Object.keys(entries) };
  });
}
export function begin(root, task, input) {
  const ctx = context(root); enabled(ctx);
  if (!idPattern.test(task || "")) throw Error("Use a short task ID with letters, digits, hyphens or underscores");
  const selected = sources(ctx, input?.files);
  return lock(ctx, () => {
    const id = crypto.randomUUID(), file = runPath(ctx, id);
    atomic(file, record(ctx, { id, task, status: "capturing", pinned: false, createdAt: new Date().toISOString(), files: selected.map(s => s.path), images: [] }));
    return { run: id, outputFolder: path.dirname(file), status: "capturing" };
  });
}
export function add(root, id, source, { role = "after", view = "" } = {}) {
  const ctx = context(root); enabled(ctx);
  if (!["before", "after"].includes(role) || typeof view !== "string" || view.length > 240) throw Error("Invalid screenshot role/view caption");
  return lock(ctx, () => {
    const run = readRun(ctx, id);
    if (run.status !== "capturing") throw Error("Run is already finalized");
    const original = path.resolve(source); safe(path.dirname(original), path.basename(original));
    const { bytes, extension } = imageBytes(original), dir = path.dirname(runPath(ctx, id));
    const adopted = path.dirname(original) === dir;
    const name = adopted ? path.basename(original) : `${role}-${crypto.randomUUID()}${extension}`;
    if (!/\.(png|jpe?g)$/i.test(name) || run.images.some(i => i.name === name)) throw Error("Invalid or duplicate screenshot name");
    const snapshot = sources(ctx, run.files);
    if (!adopted) fs.writeFileSync(safe(dir, name), bytes, { flag: "wx", mode: 0o600 });
    run.images.push({ name, sha256: digest(bytes), bytes: bytes.length, role, view, sources: snapshot });
    atomic(runPath(ctx, id), run);
    return { run: id, path: path.join(dir, name), relativePath: `${store}/runs/${id}/${name}`, originalPreserved: !adopted ? original : null };
  });
}
export function finalize(root, id) {
  const ctx = context(root); enabled(ctx);
  return lock(ctx, () => {
    const run = readRun(ctx, id), snapshot = sources(ctx, run.files);
    if (run.status !== "capturing" || !run.images.some(i => i.role === "after")) throw Error("A capturing run with an after screenshot is required");
    for (const image of run.images) {
      if (digest(imageBytes(imagePath(ctx, run, image)).bytes) !== image.sha256) throw Error("Registered screenshot changed");
      if (image.role === "after" && JSON.stringify(image.sources) !== JSON.stringify(snapshot)) throw Error("Source changed after screenshot; capture again in a new run");
    }
    run.sources = snapshot; run.status = "ready";
    atomic(runPath(ctx, id), run);
    return { status: "ready", run: id, images: run.images.map(i => ({ path: imagePath(ctx, run, i), view: i.view })) };
  });
}
export function list(root) {
  const ctx = context(root); policy(ctx);
  return runs(ctx).map(run => ({ run: run.id, task: run.task, status: run.status, pinned: run.pinned, images: run.images.map(i => ({ path: imagePath(ctx, run, i), view: i.view, role: i.role })) }));
}
export function pin(root, id, value) {
  const ctx = context(root); enabled(ctx);
  return lock(ctx, () => { const run = readRun(ctx, id); run.pinned = value; atomic(runPath(ctx, id), run); return { run: id, pinned: value }; });
}
const pendingPath = ctx => safe(ctx.root, `${store}/pending.json`);
export function beforeCommit(root) {
  const ctx = context(root), p = json(policyPath(ctx));
  if (!p || !owned(ctx, p).enabled) return { status: "disabled" };
  return lock(ctx, () => {
    fs.rmSync(pendingPath(ctx), { force: true });
    enabled(ctx);
    const staged = git(ctx, ["diff", "--cached", "--name-only", "-z"]).stdout.split("\0");
    const selected = [];
    for (const run of runs(ctx)) {
      if (run.status !== "ready" || run.pinned || !run.sources?.length || !run.files.some(f => staged.includes(f))) continue;
      const current = sources(ctx, run.files);
      if (JSON.stringify(current) !== JSON.stringify(run.sources)) continue;
      const matches = run.sources.every(s => {
        const stagedBlob = git(ctx, ["rev-parse", "--verify", `:./${s.path}`], { allowFailure: true });
        return (stagedBlob.status === 0 ? stagedBlob.stdout.trim() : null) === s.gitBlob;
      });
      if (matches) selected.push({ id: run.id, manifestHash: digest(fs.readFileSync(runPath(ctx, run.id))) });
    }
    const head = git(ctx, ["rev-parse", "--verify", "HEAD"], { allowFailure: true });
    atomic(pendingPath(ctx), record(ctx, { baseHead: head.status === 0 ? head.stdout.trim() : null, tree: git(ctx, ["write-tree"]).stdout.trim(), createdAt: Date.now(), runs: selected }));
    return { status: "armed", runs: selected.map(r => r.id) };
  });
}
export function afterCommit(root) {
  const ctx = context(root), p = json(policyPath(ctx));
  if (!p || !owned(ctx, p).enabled) return { status: "disabled" };
  return lock(ctx, () => {
    enabled(ctx);
    const ticket = json(pendingPath(ctx));
    if (!ticket) return { status: "no-ticket", deleted: [] };
    owned(ctx, ticket);
    const commit = git(ctx, ["rev-parse", "HEAD"]).stdout.trim();
    const parents = git(ctx, ["show", "-s", "--format=%P", "HEAD"]).stdout.trim().split(" ").filter(Boolean);
    const tree = git(ctx, ["rev-parse", "HEAD^{tree}"]).stdout.trim();
    if (parents.length > 1 || (parents[0] ?? null) !== ticket.baseHead || tree !== ticket.tree || Date.now() - ticket.createdAt > 60 * 60 * 1000 || ticket.createdAt > Date.now()) return { status: "unmatched-commit", deleted: [] };
    const deleted = [], preserved = [];
    for (const item of ticket.runs) {
      const file = runPath(ctx, item.id);
      if (!fs.existsSync(file) || digest(fs.readFileSync(file)) !== item.manifestHash) { preserved.push(item.id); continue; }
      const run = readRun(ctx, item.id);
      if (run.status !== "ready" || run.pinned) { preserved.push(item.id); continue; }
      const images = run.images.map(image => ({ file: imagePath(ctx, run, image), image }));
      if (images.some(({ file, image }) => !fs.existsSync(file) || digest(imageBytes(file).bytes) !== image.sha256)) { preserved.push(item.id); continue; }
      for (const image of images) fs.unlinkSync(image.file);
      atomic(safe(ctx.root, `${store}/receipts/${run.id}.json`), record(ctx, { run: run.id, commit, deletedAt: new Date().toISOString(), images: run.images.map(i => ({ name: i.name, sha256: i.sha256 })) }));
      run.status = "cleaned"; atomic(file, run); deleted.push(run.id);
    }
    fs.unlinkSync(pendingPath(ctx));
    return { status: "complete", commit, deleted, preserved };
  });
}
export function teardown(root) {
  const ctx = context(root); policy(ctx);
  return lock(ctx, () => {
    const p = policy(ctx), runtime = runtimePath(ctx);
    if (fs.existsSync(runtime) && digest(fs.readFileSync(runtime)) !== p.runtimeHash) throw Error("Review runtime drift; no files removed");
    atomic(policyPath(ctx), { ...p, enabled: false });
    fs.rmSync(runtime, { force: true }); fs.rmSync(pendingPath(ctx), { force: true });
    return { status: "disabled", imagesPreserved: true, sharedHooksPreserved: true };
  });
}
export function doctor(root) {
  const ctx = context(root), p = json(policyPath(ctx));
  if (p) owned(ctx, p);
  const runtime = runtimePath(ctx);
  return { root: ctx.root, initialized: Boolean(p), enabled: Boolean(p?.enabled), ignored: ignored(ctx), runtimeIntact: Boolean(p && fs.existsSync(runtime) && digest(fs.readFileSync(runtime)) === p.runtimeHash), capture: "use-available-tool", clientPreview: "not-verified" };
}

if (process.argv[1] && path.resolve(process.argv[1]) === self) {
  try {
    const [command, ...argv] = process.argv.slice(2), options = {};
    const valued = new Set(["root", "task", "input", "run", "image", "view", "role"]);
    for (let i = 0; i < argv.length; i++) {
      const name = argv[i].slice(2);
      if (!argv[i].startsWith("--") || (!valued.has(name) && !["hooks", "dry-run"].includes(name)) || Object.hasOwn(options, name)) throw Error("Invalid helper arguments");
      if (valued.has(name)) { if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw Error(`Missing --${name} value`); options[name] = argv[++i]; }
      else options[name] = true;
    }
    const allowed = {
      setup: ["root", "hooks", "dry-run"], doctor: ["root"], begin: ["root", "task", "input"],
      add: ["root", "run", "image", "role", "view"], finalize: ["root", "run"], list: ["root"],
      pin: ["root", "run"], unpin: ["root", "run"], "before-commit": ["root"], "after-commit": ["root"], teardown: ["root"],
    };
    if (!Object.hasOwn(allowed, command) || Object.keys(options).some(name => !allowed[command].includes(name))) throw Error("Unknown command or option for this command");
    const actions = {
      setup: () => setup(options.root, { installHooks: options.hooks, dryRun: options["dry-run"] }),
      doctor: () => doctor(options.root),
      begin: () => begin(options.root, options.task, json(path.resolve(options.input))),
      add: () => add(options.root, options.run, options.image, options),
      finalize: () => finalize(options.root, options.run),
      list: () => list(options.root),
      pin: () => pin(options.root, options.run, true),
      unpin: () => pin(options.root, options.run, false),
      "before-commit": () => beforeCommit(options.root),
      "after-commit": () => afterCommit(options.root),
      teardown: () => teardown(options.root),
    };
    if (!Object.hasOwn(actions, command)) throw Error("Use setup, doctor, begin, add, finalize, list, pin, unpin, before-commit, after-commit or teardown");
    console.log(JSON.stringify(actions[command]()));
  } catch (error) { console.error(JSON.stringify({ status: "error", reason: error.message })); process.exitCode = 1; }
}
