import test from "node:test";
import assert from "node:assert/strict";
import { findLoadedExternalSkill } from "../../benchmarks/adapters/codex-isolation.mjs";

test("detects an external skill path in a nested Codex JSONL command", () => {
  const eventTrace = String.raw`{"command":"Get-Content C:\\\\Users\\\\trinh\\\\.agents\\\\skills\\\\unity-foundations\\\\SKILL.md"}`;
  const skillDirectory = String.raw`C:\Users\trinh\.agents\skills\unity-foundations`;
  assert.equal(findLoadedExternalSkill(eventTrace, [skillDirectory]), skillDirectory);
});

test("does not flag a trace without installed skill paths", () => {
  assert.equal(findLoadedExternalSkill('{"type":"turn.completed"}', [String.raw`C:\Users\trinh\.agents\skills\unity-foundations`]), null);
});
