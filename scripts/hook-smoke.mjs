import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { configureHooks } from "../src/hooks/install.mjs";
import { writeCheckpoint } from "../src/verification-plan.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
export function fixtureSmoke() {
  const workspace = fs.mkdtempSync(
    path.join(os.tmpdir(), "dreamy hook smoke "),
  );
  try {
    fs.writeFileSync(path.join(workspace, "source.txt"), "fixture");
    writeCheckpoint(workspace, "smoke", {
      schemaVersion: 1,
      taskId: "smoke",
      status: "active",
      files: ["source.txt"],
      objective: "fixture",
      nextAction: "Inspect source.txt",
    });
    configureHooks(root, workspace, {
      profile: "minimal",
      recordReceipts: true,
    });
    const r = spawnSync(
      process.execPath,
      [
        path.join(
          workspace,
          ".dreamy-codex/hooks-runtime/src/hooks/runner.mjs",
        ),
        "--root",
        workspace,
        "--policy",
        path.join(workspace, ".dreamy-codex/hook-policy.json"),
      ],
      {
        input: JSON.stringify({
          hook_event_name: "SessionStart",
          session_id: "smoke",
          cwd: workspace,
          source: "resume",
        }),
        encoding: "utf8",
        timeout: 5000,
      },
    );
    if (r.error || r.status !== 0 || !r.stdout.includes("Inspect source.txt"))
      throw Error(`Fixture smoke failed: ${r.error?.message || r.stderr}`);
    return {
      schemaVersion: 1,
      status: "pass",
      kind: "hook-adapter-fixture",
      nativeLifecycle: {
        status: "not-run",
        reason:
          "Use a trusted native Codex session to observe delivery; no trust bypass or model request is performed",
      },
      platform: process.platform,
    };
  } finally {
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  console.log(JSON.stringify(fixtureSmoke(), null, 2));
}
