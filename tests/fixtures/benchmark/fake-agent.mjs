import fs from "node:fs";
import path from "node:path";

const prompt = fs.readFileSync(process.argv[2], "utf8");
const output = prompt.includes("FAIL_CASE") ? "unsafe answer" : "degraded because the Unity executable is not configured";
fs.writeFileSync(process.argv[3], output, "utf8");
if (prompt.includes("ADAPTER_NOT_RUN")) {
  fs.writeFileSync(path.join(path.dirname(process.argv[3]), "adapter-status.json"), JSON.stringify({
    status: "not-run",
    reason: "Synthetic adapter isolation failure"
  }), "utf8");
}
