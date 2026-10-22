import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
export function testFiles(directory) {
  const files = fs
    .readdirSync(directory)
    .filter((f) => f.endsWith(".test.mjs"))
    .sort()
    .map((f) => path.resolve(directory, f));
  if (!files.length) throw new Error(`No unit tests found in ${directory}`);
  return files;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const directory = path.resolve(
    fileURLToPath(new URL("../tests/unit/", import.meta.url)),
  );
  const result = spawnSync(
    process.execPath,
    ["--test", ...testFiles(directory)],
    { stdio: "inherit", shell: false },
  );
  if (result.error) console.error(result.error.message);
  process.exitCode = result.error || result.signal ? 1 : (result.status ?? 1);
}
