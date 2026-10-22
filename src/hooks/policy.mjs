import fs from "node:fs";
export const profiles = JSON.parse(
  fs.readFileSync(
    new URL("../../hooks/profiles.json", import.meta.url),
    "utf8",
  ),
).profiles;
export const events = {
  SessionStart: ["session-context"],
  PostToolUse: ["tool-observation"],
  PreCompact: ["checkpoint"],
  Interrupt: ["checkpoint"],
  Stop: ["verify-stop"],
  PreToolUse: ["serialized-risk"],
};
export function resolvePolicy(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("Hook policy must be an object");
  const limits = {
    maxInputBytes: [65536, 1024],
    maxOutputBytes: [1000, 64],
    deadlineMs: [250, 1],
    taskContextBytes: [2000, 0],
  };
  const allowed = new Set([
    "schemaVersion",
    "profile",
    "disabled",
    "root",
    "recordReceipts",
    ...Object.keys(limits),
  ]);
  for (const key of Object.keys(input))
    if (!allowed.has(key)) throw Error(`Unknown hook policy field: ${key}`);
  for (const [key, [ceiling, floor]] of Object.entries(limits))
    if (
      input[key] !== undefined &&
      (!Number.isSafeInteger(input[key]) ||
        input[key] < floor ||
        input[key] > ceiling)
    )
      throw Error(`Invalid ${key}: expected integer ${floor}..${ceiling}`);
  if (input.root !== undefined && typeof input.root !== "string")
    throw Error("Invalid hook root");
  if (
    input.recordReceipts !== undefined &&
    typeof input.recordReceipts !== "boolean"
  )
    throw Error("Invalid recordReceipts");
  const profile = input.profile || "off";
  if (!Object.hasOwn(profiles, profile)) throw Error("Unknown hook profile");
  if (input.schemaVersion !== undefined && input.schemaVersion !== 1)
    throw Error("Unsupported hook policy version");
  if (
    input.disabled !== undefined &&
    (!Array.isArray(input.disabled) ||
      input.disabled.some((s) => !Object.values(profiles).flat().includes(s)))
  )
    throw Error("Invalid disabled hook ID");
  return {
    schemaVersion: 1,
    profile,
    disabled: input.disabled || [],
    ...Object.fromEntries(
      Object.entries(limits).map(([key, [ceiling]]) => [
        key,
        input[key] ?? ceiling,
      ]),
    ),
  };
}
