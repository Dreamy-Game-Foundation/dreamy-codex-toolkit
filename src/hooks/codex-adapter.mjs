import { events } from "./policy.mjs";
export function decodeEvent(input) {
  if (
    !input ||
    typeof input !== "object" ||
    !Object.hasOwn(events, input.hook_event_name) ||
    typeof input.session_id !== "string" ||
    !input.session_id ||
    typeof input.cwd !== "string"
  )
    throw Error("Invalid native hook event");
  if (
    ["PreToolUse", "PostToolUse"].includes(input.hook_event_name) &&
    typeof input.tool_name !== "string"
  )
    throw Error("tool_name required");
  if (
    input.hook_event_name === "Stop" &&
    typeof input.stop_hook_active !== "boolean"
  )
    throw Error("stop_hook_active required");
  return input;
}
export function contextOutput(event, text) {
  return {
    hookSpecificOutput: { hookEventName: event, additionalContext: text },
  };
}
export function deny(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
  };
}
