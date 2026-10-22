import { performance } from "node:perf_hooks";
import { resolvePolicy, profiles, events } from "./policy.mjs";
import { decodeEvent } from "./codex-adapter.mjs";
import {
  inside,
  dataRoot,
  sessionKey,
  readJson,
  atomicJson,
  withLock,
} from "../lib/local-data.mjs";
import { sessionContext } from "./handlers/session-context.mjs";
import { toolObservation } from "./handlers/tool-observation.mjs";
import { checkpoint } from "./handlers/checkpoint.mjs";
import { verifyStop } from "./handlers/verify-stop.mjs";
import { serializedRisk } from "./handlers/serialized-risk.mjs";
const handlers = {
  "session-context": sessionContext,
  "tool-observation": toolObservation,
  checkpoint,
  "verify-stop": verifyStop,
  "serialized-risk": serializedRisk,
};
export function dispatch(
  input,
  { root, policy: rawPolicy = {}, registry = handlers } = {},
) {
  const start = performance.now(),
    policy = resolvePolicy(rawPolicy),
    event = decodeEvent(input);
  if (!root) throw Error("Resolved workspace root required");
  const selected = events[event.hook_event_name].filter(
    (id) =>
      profiles[policy.profile].includes(id) && !policy.disabled.includes(id),
  );
  if (!selected.length)
    return {
      output: null,
      metrics: {
        durationMs: performance.now() - start,
        contextBytes: 0,
        handlers: 0,
      },
    };
  const file = inside(
    dataRoot(root),
    `hook-state/${sessionKey(event.session_id)}.json`,
  );
  return withLock(`${file}.lock`, () => {
    const state = readJson(file, { seen: {}, contextBytes: 0, epoch: 0 }),
      results = [],
      errors = [];
    if (event.hook_event_name === "PreCompact") {
      state.epoch++;
      state.contextBytes = 0;
      state.seen = Object.fromEntries(
        Object.entries(state.seen).filter(([key]) => key.startsWith("stop:")),
      );
    }
    for (const id of selected) {
      if (performance.now() - start > policy.deadlineMs) {
        errors.push(`${id}: deadline exceeded`);
        break;
      }
      try {
        const r = registry[id]({ root, event, state });
        if (!r?.output) continue;
        if (r.dedupe && state.seen[r.dedupe]) continue;
        const context = r.contextBytes || 0;
        if (context && state.contextBytes + context > policy.taskContextBytes)
          continue;
        if (Buffer.byteLength(JSON.stringify(r.output)) > policy.maxOutputBytes)
          continue;
        results.push(r.output);
        state.contextBytes += context;
        if (r.dedupe) state.seen[r.dedupe] = true;
      } catch (e) {
        errors.push(`${id}: ${e.code || "handler error"}`);
      }
    }
    // Current catalog has at most one visible-output handler per event. Never combine incompatible native outputs.
    const output = results[0] || null;
    if (output || event.hook_event_name === "PreCompact")
      atomicJson(file, state);
    return {
      output,
      metrics: {
        durationMs: performance.now() - start,
        contextBytes: results.length
          ? results[0].hookSpecificOutput?.additionalContext
            ? Buffer.byteLength(results[0].hookSpecificOutput.additionalContext)
            : Buffer.byteLength(results[0].reason || "")
          : 0,
        handlers: selected.length,
        errors,
      },
    };
  });
}
