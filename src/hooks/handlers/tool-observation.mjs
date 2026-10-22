import { checkpointPath } from "../../verification-plan.mjs";
import { readJson } from "../../lib/local-data.mjs";
import { hash } from "../../lib/local-data.mjs";
import { recordObservation } from "../../knowledge/store.mjs";
export function toolObservation({ root, event }) {
  const response = event.tool_response;
  const status = response?.exit_code ?? response?.exitCode;
  if (!Number.isInteger(status) || status === 0) return null;
  // Only error classes are persisted; command text, prompt and complete output are never captured.
  const text = JSON.stringify(response).slice(0, 8192),
    signature =
      [
        "ENOENT",
        "EPERM",
        "EACCES",
        "ERR_ASSERTION",
        "SyntaxError",
        "timeout",
      ].find((s) => text.includes(s)) || "nonzero-exit";
  const cp = readJson(checkpointPath(root, event.session_id));
  const command = event.tool_input?.command || "";
  const operation = /(?:pack:smoke|scripts[\/]pack-smoke\.mjs)/.test(command)
    ? "pack"
    : /(?:npm (?:run )?(?:test|test:node)|scripts[\/]test-unit\.mjs)/.test(
          command,
        )
      ? "unit"
      : /(?:npm run validate|cli\.js validate)/.test(command)
        ? "validate"
        : /dreamy-harness.*compile/.test(command)
          ? "unity"
          : event.tool_name;
  recordObservation(root, {
    schemaVersion: 1,
    id: hash(event.session_id + ":" + (event.tool_use_id || hash(text))),
    eventId: event.tool_use_id,
    taskId: cp?.status === "active" ? cp.taskId : "unassigned",
    operation,
    outcome: "fail",
    signature,
  });
  return null;
}
