import fs from "node:fs";
import path from "node:path";
import { hash, inside } from "./local-data.mjs";

const checkerFiles = [
  "harness/dreamy-harness", "src/project-profile.js", "src/verification-plan.mjs",
  "src/lib/local-data.mjs", "src/lib/verification-context.mjs", "src/schema-validation.js",
  "src/lib/unity-test-results.mjs",
  "schemas/evidence.schema.json", "schemas/project-profile.schema.json",
  "schemas/verification-receipt.schema.json", "compatibility/dreamy-packages.json",
  "package.json",
];
export function checkerFingerprint(toolkitRoot) {
  return hash(JSON.stringify(checkerFiles.map(name => {
    const file = inside(toolkitRoot, name);
    return [name, fs.existsSync(file) ? hash(fs.readFileSync(file)) : null];
  })));
}
export function unityEnvironment() {
  const executable = process.env.DREAMY_UNITY_PATH || process.env.UNITY_PATH || null;
  let identity = null;
  if (executable) {
    try {
      const stat = fs.statSync(executable);
      identity = { path: fs.realpathSync(executable), size: stat.size, mtimeMs: stat.mtimeMs };
    } catch { identity = { path: path.resolve(executable), missing: true }; }
  }
  // Only settings used by the fixed compile/test adapter. No credentials or
  // arbitrary environment variables are captured; only the final digest persists.
  return { executable: identity, timeoutMs: process.env.DREAMY_UNITY_TIMEOUT_MS || "300000" };
}
