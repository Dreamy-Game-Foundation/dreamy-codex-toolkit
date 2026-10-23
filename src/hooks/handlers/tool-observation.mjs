import { checkpointPath } from "../../verification-plan.mjs";
import { readJson } from "../../lib/local-data.mjs";
import { hash } from "../../lib/local-data.mjs";
import { recordObservation } from "../../knowledge/store.mjs";
import { codexTranscriptStatus, failureSignature } from "../codex-transcript-status.mjs";
export function toolObservation({ root, event, policy = {} }) {
  const response = event.tool_response;
  let status = response?.exit_code ?? response?.exitCode;
  let evidence = { source: Number.isInteger(status) ? "tool-response" : "unavailable" };
  if (!Number.isInteger(status) && policy.toolStatusSource === "codex-transcript-0.163") {
    evidence = codexTranscriptStatus(root, event);
    status = evidence.exitCode;
  }
  // Codex 0.163.0 sends raw stdout for Bash, without process status.
  // Never parse arbitrary stdout as an exit code: commands can print fake JSON/headers.
  const diagnostic = {
    handler: "tool-observation",
    toolName: ["Bash", "apply_patch"].includes(event.tool_name) ? event.tool_name : "other",
    responseKind: response === null ? "null" : Array.isArray(response) ? "array" : typeof response,
    outcome: !Number.isInteger(status) ? "missing-exit-code" : status === 0 ? "success" : "failure-recorded",
    exitCode: Number.isInteger(status) ? status : null,
    statusSource: evidence.source,
    ...(evidence.reason ? { statusReason: evidence.reason } : {}),
  };
  if (!Number.isInteger(status) || status === 0) return { diagnostic };
  // Only error classes are persisted; command text, prompt and complete output are never captured.
  const text = JSON.stringify(response).slice(0, 8192),
    signature = evidence.signature || failureSignature(text);
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
  return { diagnostic };
}
