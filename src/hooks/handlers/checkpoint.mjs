import { checkpointPath } from "../../verification-plan.mjs";
import { readJson, atomicJson, sanitize } from "../../lib/local-data.mjs";
export function checkpoint({ root, event }) {
  const file = checkpointPath(root, event.session_id),
    cp = readJson(file);
  if (!cp) return null;
  atomicJson(file, {
    ...cp,
    ...(event.hook_event_name === "Interrupt" ? { status: "cancelled" } : {}),
    lastLifecycleEvent: event.hook_event_name,
    updatedAt: new Date().toISOString(),
    nextAction: sanitize(cp.nextAction, 250),
  });
  return null;
}
