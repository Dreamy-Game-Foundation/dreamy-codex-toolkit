import { deny } from "../codex-adapter.mjs";
export function serializedRisk({ event }) {
  if (!["apply_patch", "Edit", "Write"].includes(event.tool_name)) return null;
  const command = event.tool_input?.command;
  if (typeof command !== "string") return null;
  // Narrow guard: direct patch deletion of GUID files. Other edits remain subject to post-diff verification.
  if (/^\*\*\* Delete File: .*\.meta\s*$/m.test(command))
    return {
      output: deny(
        "Direct .meta deletion requires a Unity-supported asset operation to preserve serialized references.",
      ),
      contextBytes: 0,
    };
  return null;
}
