import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  artifactDirectory,
  hash,
  sourceCommit,
  sourceFingerprint,
} from "./lib/source-fingerprint.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
const startedAt = new Date().toISOString();
const beforeFingerprint = sourceFingerprint(root);
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy pack smoke "));
const artifacts = artifactDirectory(root);
fs.mkdirSync(artifacts, { recursive: true });
// npm provides its JS entrypoint on every supported OS. Execute it with Node, no shell quoting.
const npmCli = process.env.npm_execpath;
if (!npmCli || !fs.existsSync(npmCli))
  throw new Error(
    "Run via npm run pack:smoke so npm_execpath resolves the npm CLI",
  );
const npmCache = process.env.DREAMY_NPM_CACHE || process.env.npm_config_cache || path.join(temp, ".npm-cache");
const npm = (args) =>
  execFileSync(
    process.execPath,
    [npmCli, ...args, "--cache", npmCache, "--prefer-offline"],
    { cwd: temp, encoding: "utf8", timeout: 180000 },
  );
try {
  const packed = JSON.parse(
    npm([
      "pack",
      root,
      "--json",
      "--pack-destination",
      temp,
      "--ignore-scripts",
    ]),
  );
  const name = path.basename(packed[0].filename);
  const tarball = path.join(temp, name);
  const installRoot = path.join(temp, "isolated install");
  npm([
    "install",
    "--prefix",
    installRoot,
    tarball,
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
  ]);
  const installed = path.join(
    installRoot,
    "node_modules",
    "dreamy-codex-toolkit",
  );
  const cli = path.join(installed, "src", "cli.js");
  const validate = execFileSync(process.execPath, [cli, "validate"], {
    cwd: installRoot,
    encoding: "utf8",
    timeout: 60000,
  });
  if (!/validate: OK/.test(validate))
    throw new Error("Packed CLI validation did not pass");
  const context = JSON.parse(
    execFileSync(
      process.execPath,
      [cli, "context", "report", "--preset", "core", "--json"],
      { cwd: installRoot, encoding: "utf8" },
    ),
  );
  if (!context.skills.length || context.tokens !== null)
    throw new Error("Packed context report failed");
  const hook = JSON.parse(
    execFileSync(process.execPath, [cli, "hooks", "smoke"], {
      cwd: installRoot,
      encoding: "utf8",
      timeout: 10000,
    }),
  );
  if (hook.status !== "pass" || hook.nativeLifecycle.status !== "not-run")
    throw new Error("Packed hook fixture failed");
  if (beforeFingerprint !== sourceFingerprint(root))
    throw new Error("Source changed during packaging; rerun");
  const report = {
    schemaVersion: 1,
    status: "ok",
    toolkitVersion: JSON.parse(fs.readFileSync(path.join(root, "toolkit.json")))
      .version,
    packageVersion: JSON.parse(
      fs.readFileSync(path.join(installed, "package.json")),
    ).version,
    sourceCommit: sourceCommit(root),
    sourceFingerprint: beforeFingerprint,
    runId: process.env.DREAMY_RUN_ID || null,
    platform: process.platform,
    nodeVersion: process.version,
    tarball: name,
    tarballSha256: hash(fs.readFileSync(tarball)),
    packedCliChecks: { validate: "pass", context: "pass", hookFixture: "pass" },
    startedAt,
    completedAt: new Date().toISOString(),
  };
  fs.copyFileSync(tarball, path.join(artifacts, name));
  fs.writeFileSync(
    path.join(artifacts, "npm-pack-smoke.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report));
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
