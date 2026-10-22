import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
export const hash = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");
export function sourceFingerprint(root) {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const files = new Set(["package.json", "package-lock.json", ...pkg.files]);
  const digest = crypto.createHash("sha256");
  function visit(relative) {
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) return;
    const stat = fs.lstatSync(full);
    if (stat.isSymbolicLink())
      throw new Error(`Source symlink is not supported: ${relative}`);
    if (stat.isDirectory())
      for (const f of fs.readdirSync(full).sort())
        visit(`${relative.replace(/\/$/, "")}/${f}`);
    else if (stat.isFile())
      digest
        .update(relative.replaceAll("\\", "/") + "\0")
        .update(fs.readFileSync(full))
        .update("\0");
  }
  [...files].sort().forEach(visit);
  return digest.digest("hex");
}
export function sourceCommit(root) {
  const r = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], {
    encoding: "utf8",
  });
  return r.status === 0 ? r.stdout.trim() : null;
}
export function artifactDirectory(root) {
  return path.resolve(
    process.env.DREAMY_ARTIFACTS_DIR || path.join(root, "release"),
  );
}
