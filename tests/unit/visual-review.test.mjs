import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as review from "../../skills/production/visual-review/scripts/visual-review.mjs";

// Isolate fixture Git from the machine's signing and hooks configuration.
process.env.GIT_CONFIG_GLOBAL = os.devNull;
process.env.GIT_CONFIG_SYSTEM = os.devNull;
const helper = fileURLToPath(new URL("../../skills/production/visual-review/scripts/visual-review.mjs", import.meta.url));
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7x8AAAAASUVORK5CYII=", "base64");
const git = (root, args) => execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
function fixture(t, { initial = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "visual review ")), root = path.join(dir, "project");
  fs.mkdirSync(root); t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  git(root, ["init", "-q"]); git(root, ["config", "user.name", "Fixture"]); git(root, ["config", "user.email", "fixture@example.invalid"]);
  fs.writeFileSync(path.join(root, "view.txt"), "before\n");
  if (initial) { git(root, ["add", "view.txt"]); git(root, ["commit", "-qm", "baseline"]); }
  const image = path.join(dir, "capture.png"); fs.writeFileSync(image, png);
  return { dir, root, image };
}
function capture(f, { input = "view.txt", task = "layout", role = "after" } = {}) {
  const started = review.begin(f.root, task, { files: [input] });
  const added = review.add(f.root, started.run, f.image, { view: "fixture view", role });
  if (role === "after") review.finalize(f.root, started.run);
  return { ...started, ...added };
}
const manifest = r => path.join(r.outputFolder, "manifest.json");

test("standalone helper stores real file bytes outside assets and Git ignores generated images", t => {
  const f = fixture(t); const plan = review.setup(f.root, { dryRun: true });
  assert.equal(plan.addIgnore, true); assert.equal(fs.existsSync(path.join(f.root, ".dreamy")), false);
  review.setup(f.root);
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n");
  const r = capture(f);
  assert.equal(review.doctor(f.root).runtimeIntact, true);
  assert.deepEqual(fs.readFileSync(r.path), png);
  assert.ok(fs.existsSync(f.image), "original screenshot must remain untouched");
  git(f.root, ["add", "."]);
  assert.doesNotMatch(git(f.root, ["diff", "--cached", "--name-only"]), /visual-review|\.png/);
  assert.equal(review.list(f.root)[0].images[0].view, "fixture view");
});

test("matching successful commit deletes only registered images and retains receipt and original", t => {
  const f = fixture(t); review.setup(f.root);
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n"); const r = capture(f);
  const other = path.join(r.outputFolder, "user-notes.txt"); fs.writeFileSync(other, "keep");
  git(f.root, ["add", "view.txt"]);
  assert.deepEqual(review.beforeCommit(f.root).runs, [r.run]);
  git(f.root, ["commit", "-qm", "layout"]);
  assert.deepEqual(review.afterCommit(f.root).deleted, [r.run]);
  assert.equal(fs.existsSync(r.path), false); assert.ok(fs.existsSync(other)); assert.ok(fs.existsSync(f.image));
  assert.equal(review.list(f.root)[0].status, "cleaned");
  const receipt = JSON.parse(fs.readFileSync(path.join(f.root, ".dreamy/visual-review/receipts", `${r.run}.json`)));
  assert.equal(receipt.commit, git(f.root, ["rev-parse", "HEAD"]).trim());
  assert.equal(review.afterCommit(f.root).status, "no-ticket");
});

test("partial staging and unrelated commits preserve review images", t => {
  const f = fixture(t); review.setup(f.root);
  fs.writeFileSync(path.join(f.root, "view.txt"), "staged\n"); git(f.root, ["add", "view.txt"]);
  fs.writeFileSync(path.join(f.root, "view.txt"), "captured-newer\n"); const r = capture(f);
  assert.deepEqual(review.beforeCommit(f.root).runs, []);
  git(f.root, ["commit", "-qm", "partial"]); review.afterCommit(f.root);
  assert.ok(fs.existsSync(r.path));
  fs.writeFileSync(path.join(f.root, "notes.md"), "unrelated"); git(f.root, ["add", "notes.md"]);
  assert.deepEqual(review.beforeCommit(f.root).runs, []);
  git(f.root, ["commit", "-qm", "notes"]); review.afterCommit(f.root);
  assert.ok(fs.existsSync(r.path));
});

test("before screenshot can use old source; after source drift cannot be finalized", t => {
  const f = fixture(t); review.setup(f.root);
  const r = capture(f, { role: "before" });
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n");
  review.add(f.root, r.run, f.image, { role: "after" });
  review.finalize(f.root, r.run);
  const next = review.begin(f.root, "next", { files: ["view.txt"] }); review.add(f.root, next.run, f.image);
  fs.writeFileSync(path.join(f.root, "view.txt"), "changed-again\n");
  assert.throws(() => review.finalize(f.root, next.run), /Source changed/);
});

test("modified image, pinned run and active capture are preserved", t => {
  const f = fixture(t); review.setup(f.root);
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n");
  const changed = capture(f), pinned = capture(f), active = capture(f, { role: "before" });
  review.pin(f.root, pinned.run, true); git(f.root, ["add", "view.txt"]);
  assert.deepEqual(review.beforeCommit(f.root).runs, [changed.run]);
  fs.appendFileSync(changed.path, "modified");
  git(f.root, ["commit", "-qm", "after"]);
  assert.deepEqual(review.afterCommit(f.root).preserved, [changed.run]);
  for (const r of [changed, pinned, active]) assert.ok(fs.existsSync(r.path));
});

test("tracked review files and foreign hook managers are rejected without overwriting them", t => {
  const f = fixture(t); const before = "# existing\n"; fs.writeFileSync(path.join(f.root, ".gitignore"), before);
  const hook = path.join(f.root, ".git/hooks/pre-commit"); fs.writeFileSync(hook, "#!/bin/sh\nexit 7\n", { mode: 0o755 });
  assert.throws(() => review.setup(f.root, { installHooks: true }), /Existing pre-commit/);
  assert.equal(fs.readFileSync(path.join(f.root, ".gitignore"), "utf8"), before);
  assert.equal(fs.existsSync(path.join(f.root, ".dreamy")), false);
  fs.unlinkSync(hook); git(f.root, ["config", "core.hooksPath", ".hooks"]);
  assert.throws(() => review.setup(f.root, { installHooks: true }), /core.hooksPath/);
  git(f.root, ["config", "--unset", "core.hooksPath"]);
  review.setup(f.root); const r = capture(f); git(f.root, ["add", "-f", r.path]);
  assert.throws(() => review.beforeCommit(f.root), /Tracked\/staged/);
});

test("hooks preserve images on failed commit and clean after a normal successful commit", t => {
  const f = fixture(t); review.setup(f.root, { installHooks: true });
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n"); const r = capture(f); git(f.root, ["add", "view.txt"]);
  const reject = path.join(f.root, ".git/hooks/commit-msg"); fs.writeFileSync(reject, "#!/bin/sh\nexit 9\n", { mode: 0o755 });
  assert.throws(() => git(f.root, ["commit", "-qm", "fails"]));
  assert.ok(fs.existsSync(r.path));
  fs.unlinkSync(reject); git(f.root, ["commit", "-qm", "success"]);
  assert.equal(fs.existsSync(r.path), false);
  assert.equal(review.afterCommit(f.root).status, "no-ticket");
});

test("commit tree changed after ticket and amended commits cannot trigger cleanup", t => {
  const f = fixture(t); review.setup(f.root);
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n"); const r = capture(f); git(f.root, ["add", "view.txt"]); review.beforeCommit(f.root);
  fs.writeFileSync(path.join(f.root, "extra.txt"), "late staged"); git(f.root, ["add", "extra.txt"]); git(f.root, ["commit", "-qm", "different tree"]);
  assert.equal(review.afterCommit(f.root).status, "unmatched-commit"); assert.ok(fs.existsSync(r.path));
  review.beforeCommit(f.root); git(f.root, ["commit", "--amend", "-qm", "amended"]);
  assert.equal(review.afterCommit(f.root).status, "unmatched-commit"); assert.ok(fs.existsSync(r.path));
});

test("first commit and deleted source inputs can bind cleanup", t => {
  const f = fixture(t, { initial: false }); review.setup(f.root); const r = capture(f);
  git(f.root, ["add", "view.txt"]); review.beforeCommit(f.root); git(f.root, ["commit", "-qm", "first"]);
  assert.deepEqual(review.afterCommit(f.root).deleted, [r.run]);
  fs.unlinkSync(path.join(f.root, "view.txt")); const removed = capture(f);
  git(f.root, ["add", "-u"]); review.beforeCommit(f.root); git(f.root, ["commit", "-qm", "remove source"]);
  assert.deepEqual(review.afterCommit(f.root).deleted, [removed.run]);
});

test("sibling worktrees sharing Git hooks clean only their own store", t => {
  const f = fixture(t); review.setup(f.root, { installHooks: true });
  const sibling = path.join(f.dir, "sibling"); git(f.root, ["worktree", "add", "--detach", sibling, "HEAD"]);
  review.setup(sibling, { installHooks: true });
  fs.writeFileSync(path.join(f.root, "view.txt"), "main-after\n"); const main = capture(f);
  fs.writeFileSync(path.join(sibling, "view.txt"), "sibling-after\n"); const other = capture({ ...f, root: sibling });
  git(sibling, ["add", "view.txt"]); git(sibling, ["commit", "-qm", "sibling"]);
  assert.equal(fs.existsSync(other.path), false); assert.ok(fs.existsSync(main.path));
  review.teardown(sibling);
  git(f.root, ["add", "view.txt"]); git(f.root, ["commit", "-qm", "main"]);
  assert.equal(fs.existsSync(main.path), false);
});

test("unsafe paths, non-images and symlink screenshots cannot enter cleanup ownership", { skip: process.platform === "win32" ? "symlink privilege varies; other path cases run on Linux" : false }, t => {
  const f = fixture(t); review.setup(f.root);
  assert.throws(() => review.begin(f.root, "task", { files: ["../escape"] }), /escapes/);
  assert.throws(() => review.begin(f.root, "task", { files: [".git/config"] }), /Invalid source/);
  const r = review.begin(f.root, "task", { files: ["view.txt"] });
  const link = path.join(r.outputFolder, "linked.png"); fs.symlinkSync(f.image, link);
  assert.throws(() => review.add(f.root, r.run, link), /Symlink/);
  const fake = path.join(f.dir, "not-image.png"); fs.writeFileSync(fake, "state snapshot");
  assert.throws(() => review.add(f.root, r.run, fake), /signature/);
  assert.throws(() => review.finalize(f.root, r.run), /after screenshot/);
});

test("teardown preserves screenshots and user ignore rules and stops automatic cleanup", t => {
  const f = fixture(t); fs.writeFileSync(path.join(f.root, ".gitignore"), "# mine\nnode_modules/\n"); review.setup(f.root, { installHooks: true });
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n"); const r = capture(f);
  review.teardown(f.root); git(f.root, ["add", "view.txt"]); git(f.root, ["commit", "-qm", "keep"]);
  assert.ok(fs.existsSync(r.path)); assert.match(fs.readFileSync(path.join(f.root, ".gitignore"), "utf8"), /^# mine\nnode_modules\//);
  assert.equal(review.doctor(f.root).enabled, false);
});

test("standalone CLI has no toolkit dependency and rejects incomplete arguments", t => {
  const f = fixture(t), output = execFileSync(process.execPath, [helper, "setup", "--root", f.root], { encoding: "utf8" });
  assert.equal(JSON.parse(output).status, "ready");
  const bad = spawnSync(process.execPath, [helper, "add", "--run"], { encoding: "utf8" });
  assert.equal(bad.status, 1); assert.match(bad.stderr, /Missing/);
  const unsafeDryRun = spawnSync(process.execPath, [helper, "teardown", "--root", f.root, "--dry-run"], { encoding: "utf8" });
  assert.equal(unsafeDryRun.status, 1);
  assert.equal(review.doctor(f.root).enabled, true);
});

test("two tasks in one worktree clean only the committed input, including CRLF normalization", t => {
  const f = fixture(t); review.setup(f.root);
  git(f.root, ["config", "core.autocrlf", "true"]);
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\r\n");
  fs.writeFileSync(path.join(f.root, "other.txt"), "not committed\r\n");
  const first = capture(f), second = capture(f, { input: "other.txt", task: "other" });
  git(f.root, ["add", "view.txt"]);
  assert.deepEqual(review.beforeCommit(f.root).runs, [first.run]);
  git(f.root, ["commit", "-qm", "first only"]);
  assert.deepEqual(review.afterCommit(f.root).deleted, [first.run]);
  assert.ok(fs.existsSync(second.path));
});

test("capture-tool output in the run directory is adopted once and cleaned without importing other files", t => {
  const f = fixture(t); review.setup(f.root);
  fs.writeFileSync(path.join(f.root, "view.txt"), "after\n");
  const run = review.begin(f.root, "render", { files: ["view.txt"] });
  const output = path.join(run.outputFolder, "after.png"); fs.writeFileSync(output, png);
  const unregistered = path.join(run.outputFolder, "other.png"); fs.writeFileSync(unregistered, png);
  assert.equal(review.add(f.root, run.run, output).originalPreserved, null);
  assert.throws(() => review.add(f.root, run.run, output), /duplicate/);
  review.finalize(f.root, run.run);
  assert.throws(() => review.add(f.root, run.run, unregistered), /finalized/);
  git(f.root, ["add", "view.txt"]); review.beforeCommit(f.root); git(f.root, ["commit", "-qm", "render"]); review.afterCommit(f.root);
  assert.equal(fs.existsSync(output), false); assert.ok(fs.existsSync(unregistered));
});
