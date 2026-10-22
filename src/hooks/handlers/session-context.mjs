import { checkpointPath, fingerprint } from "../../verification-plan.mjs";
import { readJson, bounded, sanitize } from "../../lib/local-data.mjs";
import { contextOutput } from "../codex-adapter.mjs";
export function sessionContext({ root, event }) {
  const cp = readJson(checkpointPath(root, event.session_id));
  if (!cp || cp.status !== "active") return null;
  if (cp.sourceFingerprint !== fingerprint(root, cp.files)) return null;
  const text = bounded(
    `Task ${sanitize(cp.taskId, 80)}: ${sanitize(cp.nextAction, 250)}. Checkpoint: .dreamy/checkpoints/. Verify inputs before resuming.`,
    600,
  );
  return {
    output: contextOutput("SessionStart", text),
    contextBytes: Buffer.byteLength(text),
    dedupe: `context:${cp.sourceFingerprint}`,
  };
}
