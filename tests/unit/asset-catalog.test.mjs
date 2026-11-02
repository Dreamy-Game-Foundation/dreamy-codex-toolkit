import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const python = ["python3", "python"].find(command => spawnSync(command,
  ["-c", "import sys; sys.exit(sys.version_info < (3, 10))"], { encoding: "utf8", timeout: 10000 }).status === 0);

test("asset catalogs link every file, preserve source status, avoid body reads and reject broken inventories", {
  skip: python ? false : "Optional Python3.10+ unavailable; catalog checks not run",
}, () => {
  const fixture = fileURLToPath(new URL("../python/asset_catalog_test.py", import.meta.url));
  const result = spawnSync(python, ["-B", fixture], { encoding: "utf8", timeout: 30000 });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});
