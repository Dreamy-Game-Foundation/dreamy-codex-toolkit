import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
export const hash = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
export function inside(root, relative) {
  const base = path.resolve(root),
    target = path.resolve(base, relative),
    rel = path.relative(base, target);
  if (rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel))
    throw Error("Path escapes data root");
  let current = base;
  // Check existing ancestors too: a symlink above the requested root is not safe ownership.
  const anchor = path.parse(target).root;
  const parts = target.slice(anchor.length).split(path.sep);
  current = anchor;
  for (const part of parts) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink())
      throw Error("Symlink data paths are not supported");
  }
  return target;
}
export function readJson(file, fallback = null, maxBytes = 262144) {
  try {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || !stat.isFile() || stat.size > maxBytes)
      throw Error("Invalid or oversized data file");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return fallback;
    throw e;
  }
}
export function atomicJson(file, value) {
  inside(path.dirname(file), path.basename(file));
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + "\n", {
      flag: "wx",
      mode: 0o600,
    });
    fs.renameSync(temp, file);
  } finally {
    fs.rmSync(temp, { force: true });
  }
}
export function withLock(file, fn) {
  inside(path.dirname(file), path.basename(file));
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  let fd;
  try {
    fd = fs.openSync(file, "wx", 0o600);
  } catch (e) {
    if (e.code === "EEXIST") throw Error("Data is busy; retry this operation");
    throw e;
  }
  try {
    return fn();
  } finally {
    fs.closeSync(fd);
    fs.rmSync(file, { force: true });
  }
}
export function bounded(text, maxBytes) {
  let out = "";
  for (const c of String(text)) {
    if (Buffer.byteLength(out + c) > maxBytes) break;
    out += c;
  }
  return out;
}
export function sanitize(text, maxBytes = 400) {
  return bounded(
    String(text)
      .replace(/\x1b\[[0-9;]*m/g, "")
      .replace(/(?:https?:\/\/)?[^\s/@:]+:[^\s/@]+@/g, "[redacted]@")
      .replace(
        /\b(?:Bearer\s+\S+|(?:sk-|ghp_|github_pat_)[\w-]+)/gi,
        "[redacted]",
      )
      .replace(
        /((?:api[_-]?key|token|secret|password|authorization)\s*[=:]\s*)["']?[^\s,"'}]+/gi,
        "$1[redacted]",
      )
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ""),
    maxBytes,
  );
}
export function dataRoot(root) {
  return inside(path.resolve(root), ".dreamy");
}
export function sessionKey(session) {
  if (typeof session !== "string" || !session)
    throw Error("Session ID required");
  return hash(session).slice(0, 32);
}
export function atomicText(file, text) {
  inside(path.dirname(file), path.basename(file));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, text, { flag: "wx", mode: 0o600 });
    fs.renameSync(temp, file);
  } finally {
    fs.rmSync(temp, { force: true });
  }
}
