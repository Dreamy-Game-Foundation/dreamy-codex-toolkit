import {
  checkpointPath,
  evidenceFor,
  fingerprint,
} from "../../verification-plan.mjs";
import { readJson, bounded } from "../../lib/local-data.mjs";
export function verifyStop({ root, event, state }) {
  if (event.stop_hook_active) return null;
  const cp = readJson(checkpointPath(root, event.session_id));
  if (!cp || cp.status !== "active") return null;
  const current = fingerprint(root, cp.files),
    key = `stop:${cp.taskId}:${current}`;
  if (state.seen[key]) return null;
  const receipts = evidenceFor(root, cp.taskId, cp.files),
    missing = cp.requiredCommands.filter(
      (id) => !receipts.some((r) => r.commandId === id),
    );
  if (!missing.length) return null;
  // Missing infrastructure is an explicit degraded outcome, not an instruction to loop.
  const reason = bounded(
    `Task ${cp.taskId} lacks fresh verification: ${missing.join(", ")}. Run relevant checks once, or report the exact unavailable command and reason. Respect interruption and scope.`,
    480,
  );
  return {
    output: { decision: "block", reason },
    contextBytes: Buffer.byteLength(reason),
    dedupe: key,
  };
}
