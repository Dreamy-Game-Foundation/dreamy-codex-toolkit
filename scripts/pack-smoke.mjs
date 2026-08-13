import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-pack-smoke-"));

function execTool(command, args, options = {}) {
  if (process.platform !== "win32") return execFileSync(command, args, options);
  return execFileSync("cmd.exe", ["/d", "/s", "/c", command, ...args], options);
}

const output = execTool("npm.cmd", ["pack", "--pack-destination", temp, "--cache", path.join(temp, ".npm-cache")], { cwd: root, encoding: "utf8" }).trim();
const tarball = path.join(temp, output.split(/\r?\n/).at(-1));
if (!fs.existsSync(tarball)) throw new Error("npm pack did not create a tarball");

const installRoot = path.join(temp, "install");
fs.mkdirSync(installRoot);
execTool("npm.cmd", ["install", "--prefix", installRoot, tarball, "--cache", path.join(temp, ".npm-cache")], { cwd: root, stdio: "inherit" });
const bin = path.join(installRoot, "node_modules", ".bin", process.platform === "win32" ? "dreamy-kit.cmd" : "dreamy-kit");
const validate = execTool(bin, ["validate"], { cwd: installRoot, encoding: "utf8" });
if (!/validate: OK/.test(validate)) throw new Error("packed CLI validate failed");
const report = {
  status: "ok",
  tarball: path.basename(tarball),
  sha256: crypto.createHash("sha256").update(fs.readFileSync(tarball)).digest("hex")
};
fs.mkdirSync(path.join(root, "release"), { recursive: true });
fs.writeFileSync(path.join(root, "release", "npm-pack-smoke.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report));
