import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { performance } from "node:perf_hooks";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  artifactDirectory,
  sourceFingerprint,
} from "./lib/source-fingerprint.mjs";
const root = fileURLToPath(new URL("../", import.meta.url)),
  workspace = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy hook profile ")),
  samples = [];
try {
  const policy = path.join(workspace, "policy.json");
  fs.writeFileSync(
    policy,
    JSON.stringify({ schemaVersion: 1, profile: "minimal" }),
  );
  for (let i = 0; i < 30; i++) {
    const start = performance.now(),
      r = spawnSync(
        process.execPath,
        [
          path.join(root, "src/hooks/runner.mjs"),
          "--root",
          workspace,
          "--policy",
          policy,
        ],
        {
          input: JSON.stringify({
            hook_event_name: "SessionStart",
            session_id: "profile",
            cwd: workspace,
          }),
          encoding: "utf8",
          timeout: 5000,
        },
      );
    if (r.error || r.status !== 0 || r.stdout || r.stderr)
      throw Error("No-op profile failed");
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  const report = {
    schemaVersion: 1,
    kind: "hook-process-latency",
    nativeLifecycle: "not-run",
    platform: process.platform,
    node: process.version,
    samples: samples.length,
    p50Ms: samples[14],
    p95Ms: samples[28],
    visibleBytes: 0,
    modelCalls: 0,
    sourceFingerprint: sourceFingerprint(root),
    runId: process.env.DREAMY_RUN_ID || null,
  };
  if (process.env.DREAMY_ARTIFACTS_DIR) {
    const directory = artifactDirectory(root);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(
      path.join(directory, "hook-profile.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
  }
  console.log(JSON.stringify(report, null, 2));
} finally {
  fs.rmSync(workspace, { recursive: true, force: true });
}
