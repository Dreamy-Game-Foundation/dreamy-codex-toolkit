import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const python = ["python3", "python"].find((command) => {
  const result = spawnSync(command, ["-c", "import sys; sys.exit(sys.version_info < (3, 10))"], { encoding: "utf8", timeout: 10000 });
  return result.status === 0;
});

test("asset helpers preserve source, bound extraction, reject corrupt receipts and retain real empty-source semantics", {
  skip: python ? false : "Optional Python 3.10+ unavailable; extraction fixture checks not run",
}, () => {
  const fixture = fileURLToPath(new URL("../python/asset_extraction_test.py", import.meta.url));
  const result = spawnSync(python, ["-B", fixture], { encoding: "utf8", timeout: 60000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
