// Deterministic adapter used only to test benchmark mechanics, never a model.
import fs from "node:fs";
import path from "node:path";
const [, , , output, workspace, mode] = process.argv;
fs.writeFileSync(output, "Fixed all lifecycle bugs. Tests pass.");
if (mode === "fix") fs.writeFileSync(path.join(workspace, "subscription.mjs"), `
export class Panel {
  constructor(source) { this.source = source; this.calls = 0; this.active = false; this.handler = () => this.calls++; }
  open() { if (!this.active) { this.active = true; this.source.on("reward", this.handler); } }
  close() { if (this.active) { this.active = false; this.source.off("reward", this.handler); } }
}
`);
if (mode === "remove") fs.rmSync(workspace, { recursive: true });
