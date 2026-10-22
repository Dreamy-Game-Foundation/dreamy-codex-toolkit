import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packReportErrors } from "../../src/release-evidence.js";
import {
  sourceFingerprint,
  hash,
} from "../../scripts/lib/source-fingerprint.mjs";
test("pack gate rejects old version, different source/run and missing or modified tarballs", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy evidence "));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = fileURLToPath(new URL("../../", import.meta.url));
  fs.cpSync(path.join(source, "schemas"), path.join(dir, "schemas"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ files: ["source.txt"] }),
  );
  fs.writeFileSync(path.join(dir, "source.txt"), "source");
  fs.writeFileSync(
    path.join(dir, "toolkit.json"),
    '{"version":"0.1.0-alpha.3"}',
  );
  fs.writeFileSync(path.join(dir, "test.tgz"), "tarball");
  const r = {
    schemaVersion: 1,
    status: "ok",
    toolkitVersion: "0.1.0-alpha.3",
    packageVersion: "0.1.0-alpha.3",
    sourceCommit: null,
    sourceFingerprint: sourceFingerprint(dir),
    runId: "run",
    platform: process.platform,
    nodeVersion: process.version,
    tarball: "test.tgz",
    tarballSha256: hash("tarball"),
    packedCliChecks: { validate: "pass", context: "pass", hookFixture: "pass" },
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  assert.deepEqual(packReportErrors(r, dir, dir, "run"), []);
  assert.match(
    packReportErrors(
      { ...r, packageVersion: "alpha.2" },
      dir,
      dir,
      "run",
    ).join(),
    /version/,
  );
  assert.match(packReportErrors(r, dir, dir, "another").join(), /another run/);
  fs.writeFileSync(path.join(dir, "source.txt"), "modified");
  assert.match(packReportErrors(r, dir, dir, "run").join(), /source/);
  fs.unlinkSync(path.join(dir, "test.tgz"));
  assert.match(packReportErrors(r, dir, dir, "run").join(), /tarball/);
  assert.ok(
    packReportErrors({ status: "ok", tarball: "old.tgz" }, dir, dir).length,
  );
});
