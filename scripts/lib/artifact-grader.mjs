import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const hash = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

function inventory(root) {
  if (!fs.existsSync(root) || fs.lstatSync(root).isSymbolicLink() || !fs.statSync(root).isDirectory()) throw Error("Artifact workspace/fixture must be a regular directory");
  const files = [];
  function walk(dir) {
    for (const name of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, name);
      const stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) throw Error("Artifact trees cannot contain symlinks");
      if (stat.isDirectory()) walk(file);
      else if (stat.isFile()) files.push({ path: path.relative(root, file).replaceAll("\\", "/"), sha256: hash(fs.readFileSync(file)) });
      else throw Error("Artifact trees must contain regular files only");
    }
  }
  walk(root);
  return files;
}

// Only manifest-owned fixture/verifier paths are executable. Adapter output is
// never interpreted as a command or accepted as a verification receipt.
export function prepareArtifactTask(grader, manifestDir, attemptDir) {
  if (grader?.type !== "artifact-task") return null;
  if (typeof grader.fixture !== "string" || !grader.fixture || typeof grader.verifier !== "string" || !grader.verifier) throw Error("artifact-task requires fixture and verifier paths");
  const fixture = path.resolve(manifestDir, grader.fixture);
  const verifier = path.resolve(manifestDir, grader.verifier);
  if (fs.lstatSync(verifier).isSymbolicLink() || !fs.statSync(verifier).isFile() || path.extname(verifier) !== ".mjs") throw Error("Artifact verifier must be a regular .mjs file");
  const workspace = path.join(attemptDir, "workspace");
  // Reject overlap rather than recursively copying a fixture into itself.
  const contains = (parent, child) => child === parent || child.startsWith(parent + path.sep);
  if (contains(fixture, attemptDir) || contains(attemptDir, fixture) || contains(attemptDir, verifier)) throw Error("Artifact inputs must be outside the attempt directory");
  const baseline = inventory(fixture);
  fs.cpSync(fixture, workspace, { recursive: true, errorOnExist: true, force: false });
  return { fixture, verifier, workspace, baseline, verifierHash: hash(fs.readFileSync(verifier)), timeoutMs: Math.min(60000, Math.max(1, grader.timeoutMs ?? 10000)) };
}

export function gradeArtifactTask(task, attemptDir) {
  const fail = reason => ({ pass: false, type: "artifact-task", reason });
  try {
    const after = inventory(task.workspace);
    const baseline = new Map(task.baseline.map(f => [f.path, f.sha256]));
    const current = new Map(after.map(f => [f.path, f.sha256]));
    const changed = [...new Set([...baseline.keys(), ...current.keys()])].sort()
      .filter(name => baseline.get(name) !== current.get(name));
    if (hash(fs.readFileSync(task.verifier)) !== task.verifierHash || JSON.stringify(inventory(task.fixture)) !== JSON.stringify(task.baseline)) return fail("Trusted artifact inputs changed during adapter execution");
    const result = spawnSync(process.execPath, [task.verifier, task.workspace], { cwd: attemptDir, encoding: "utf8", windowsHide: true, timeout: task.timeoutMs, maxBuffer: 1024 * 1024 });
    const log = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    fs.writeFileSync(path.join(attemptDir, "verification.log"), log);
    // A verifier must not quietly repair what it is supposed to evaluate.
    const unchanged = JSON.stringify(inventory(task.workspace)) === JSON.stringify(after) &&
      hash(fs.readFileSync(task.verifier)) === task.verifierHash && JSON.stringify(inventory(task.fixture)) === JSON.stringify(task.baseline);
    return {
      type: "artifact-task", pass: !result.error && result.status === 0 && unchanged,
      reason: !unchanged ? "Artifact inputs changed during verification" : result.error?.message ?? (result.status === 0 ? null : "Artifact verifier failed"),
      verifierHash: task.verifierHash, fixtureFiles: task.baseline, artifactFiles: after,
      changedPaths: changed, exitCode: result.status, signal: result.signal,
      logPath: "verification.log", logHash: hash(log),
    };
  } catch (error) { return fail(error.message); }
}
