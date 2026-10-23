import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

// Use the installed runtime and existing account; never copy auth or rewrite HOME/CODEX_HOME.
export class CodexAppServer {
  constructor({
    executable = process.env.DREAMY_CODEX_EXECUTABLE || "codex",
    args = [],
    cwd,
    timeoutMs = 20000,
  } = {}) {
    this.timeoutMs = timeoutMs;
    this.pending = new Map();
    this.notifications = [];
    this.sequence = 0;
    this.failure = null;
    this.child = spawn(executable, ["app-server", "--stdio", ...args], {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    const fail = (error) => {
      this.failure = error;
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(error);
      }
      this.pending.clear();
    };
    this.child.on("error", fail);
    this.child.on("exit", (code) =>
      fail(
        Error(
          `Codex app-server exited (${code}); check runtime state-directory access`,
        ),
      ),
    );
    this.child.stdin.on("error", fail);
    // Drain diagnostics without persisting account/config data.
    this.child.stderr.resume();
    this.lines = createInterface({ input: this.child.stdout });
    this.lines.on("line", (line) => {
      if (Buffer.byteLength(line) > 4 * 1024 * 1024) {
        fail(Error("Oversized app-server response"));
        this.close();
        return;
      }
      let msg;
      try {
        msg = JSON.parse(line);
      } catch {
        return;
      }
      if (msg.method && msg.id !== undefined) {
        // A diagnostic/benchmark cannot silently authorize tools, permissions or external actions.
        this.child.stdin.write(
          JSON.stringify({
            id: msg.id,
            error: {
              code: -32601,
              message: "Interactive requests are unsupported by this client",
            },
          }) + "\n",
        );
      } else if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, reject, timer } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        clearTimeout(timer);
        if (msg.error) reject(Error(`${msg.error.code}: ${msg.error.message}`));
        else resolve(msg.result);
      } else if (msg.method) {
        this.notifications.push(msg);
        if (this.notifications.length > 1000) this.notifications.shift();
        this.onNotification?.(msg);
      }
    });
  }
  request(method, params = {}) {
    if (this.failure) return Promise.reject(this.failure);
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(Error(`Codex app-server timeout: ${method}`));
      }, this.timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify({ id, method, params }) + "\n");
    });
  }
  async initialize() {
    const result = await this.request("initialize", {
      clientInfo: { name: "dreamy_toolkit", version: "1" },
      capabilities: { experimentalApi: true },
    });
    this.child.stdin.write(
      JSON.stringify({ method: "initialized", params: {} }) + "\n",
    );
    return result;
  }
  close() {
    this.lines.close();
    this.child.stdin.end();
    this.child.kill();
    for (const { reject, timer } of this.pending.values()) {
      clearTimeout(timer);
      reject(Error("App-server client closed"));
    }
    this.pending.clear();
  }
}
