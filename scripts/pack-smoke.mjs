import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy-pack-smoke-"));
const output = execFileSync("npm", ["pack", "--pack-destination", temp, "--cache", path.join(temp, ".npm-cache")], { cwd: root, encoding: "utf8" }).trim();
const tarball = path.join(temp, output.split(/\r?\n/).at(-1));
if (!fs.existsSync(tarball)) throw new Error("npm pack did not create a tarball");

const installRoot = path.join(temp, "install");
fs.mkdirSync(installRoot);
execFileSync("npm", ["install", tarball, "--cache", path.join(temp, ".npm-cache")], { cwd: installRoot, stdio: "ignore" });
const bin = path.join(installRoot, "node_modules", ".bin", process.platform === "win32" ? "dreamy-kit.cmd" : "dreamy-kit");
const validate = execFileSync(bin, ["validate"], { cwd: installRoot, encoding: "utf8" });
if (!/validate: OK/.test(validate)) throw new Error("packed CLI validate failed");
console.log(JSON.stringify({ status: "ok", tarball: path.basename(tarball) }));
