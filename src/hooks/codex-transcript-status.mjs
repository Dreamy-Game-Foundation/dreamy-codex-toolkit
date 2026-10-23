import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inside } from "../lib/local-data.mjs";

export function failureSignature(text) {
  return ["ENOENT", "EPERM", "EACCES", "ERR_ASSERTION", "SyntaxError", "timeout"]
    .find(signature => text.includes(signature)) || "nonzero-exit";
}

// Opt-in compatibility adapter. The transcript is not a stable public interface.
// Read only bounded head/tail windows; never return or persist transcript text.
export function codexTranscriptStatus(root, event, {
  codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex"),
  now = Date.now(),
} = {}) {
  const skipped = reason => ({ source: "unavailable", reason });
  if (event.tool_name !== "Bash" || event.subagent || event.agent_id ||
      typeof event.session_id !== "string" || !/^[0-9a-f-]{36}$/.test(event.session_id) ||
      typeof event.turn_id !== "string" || !event.turn_id ||
      typeof event.tool_use_id !== "string" || !event.tool_use_id ||
      typeof event.transcript_path !== "string" || !path.isAbsolute(event.transcript_path))
    return skipped("missing-correlation");
  let fd;
  try {
    const sessions = path.resolve(codexHome, "sessions");
    const relative = path.relative(sessions, event.transcript_path);
    if (!relative || !path.basename(relative).endsWith(`-${event.session_id}.jsonl`))
      return skipped("invalid-transcript-path");
    const file = inside(sessions, relative); // Reject escapes and symlink ancestors.
    fd = fs.openSync(file, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
    const stat = fs.fstatSync(fd);
    if (!stat.isFile()) return skipped("invalid-transcript-path");
    const head = Buffer.alloc(Math.min(stat.size, 65536));
    const headBytes = fs.readSync(fd, head, 0, head.length, 0);
    const firstLine = head.subarray(0, headBytes).toString("utf8").split("\n")[0];
    const meta = JSON.parse(firstLine);
    const sameRoot = value => {
      if (typeof value !== "string") return false;
      const decoded = value.startsWith("file:") ? fileURLToPath(value) : value;
      return path.isAbsolute(decoded) && fs.realpathSync(decoded) === fs.realpathSync(root);
    };
    if (meta.type !== "session_meta" || meta.payload?.id !== event.session_id ||
        meta.payload?.cli_version !== "0.163.0" ||
        !sameRoot(meta.payload?.cwd) || !sameRoot(event.cwd))
      return skipped("session-or-version-mismatch");
    const start = Math.max(0, stat.size - 131072);
    const tail = Buffer.alloc(stat.size - start);
    const bytes = fs.readSync(fd, tail, 0, tail.length, start);
    const lines = tail.subarray(0, bytes).toString("utf8").split("\n");
    if (start) lines.shift(); // Never parse a partially read record.
    const matches = [];
    for (const line of lines) {
      if (!line) continue;
      let record;
      try { record = JSON.parse(line); } catch { continue; }
      const payload = record.payload, item = payload?.item;
      if (record.type !== "event_msg" || payload?.type !== "item_completed" ||
          payload.thread_id !== event.session_id || payload.turn_id !== event.turn_id ||
          item?.type !== "CommandExecution" || item.id !== event.tool_use_id) continue;
      const age = now - Date.parse(record.timestamp);
      if (!Number.isFinite(age) || age < -1000 || age > 300000 ||
          !["completed", "failed"].includes(item.status) ||
          !Number.isInteger(item.exit_code) || !sameRoot(item.cwd))
        return skipped("invalid-or-stale-command");
      matches.push({ source: "codex-transcript-0.163", exitCode: item.exit_code,
        signature: failureSignature(typeof item.aggregated_output === "string"
          ? item.aggregated_output.slice(0, 8192) : ""), bytesRead: headBytes + bytes });
    }
    return matches.length === 1 ? matches[0] : skipped(matches.length ? "ambiguous-command" : "command-not-found");
  } catch {
    return skipped("transcript-unavailable");
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}
