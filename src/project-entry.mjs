// Invoked by the portable installed wrappers; no machine-specific source path.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const runtime = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = path.resolve(runtime, "../..");
const state = JSON.parse(fs.readFileSync(path.join(base, ".dreamy-codex/workflow-state.json"), "utf8"));
const args = process.argv.slice(2);
if (!args.length) args.push("help");
// Global wrappers run against cwd. Global lifecycle changes must be explicit.
// Project wrappers always target their own project, even from another cwd.
if (state.targetKind === "project") {
  if (args.some(a => a === "--target" || a.startsWith("--target="))) {
    console.error("Project entrypoint targets its own project; omit --target. Use the source/global CLI for other targets.");
    process.exit(2);
  }
  process.chdir(base);
  args.push("--target", base);
}
const result = spawnSync(process.execPath, [path.join(runtime, "src/cli.js"), ...args], { stdio: "inherit" });
if (result.error) console.error(result.error.message);
process.exitCode = result.error ? 2 : result.status ?? 2;
