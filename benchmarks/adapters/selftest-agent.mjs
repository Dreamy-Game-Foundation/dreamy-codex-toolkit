import fs from "node:fs";

const prompt = fs.readFileSync(process.argv[2], "utf8");
let output;
if (prompt.includes("Runtime asmdef")) {
  output = JSON.stringify({ status: "fail", decision: "reject", reason: "Remove the Runtime to Editor assembly reference." });
} else if (prompt.includes("packages-lock.json")) {
  output = JSON.stringify({ status: "incomplete", decision: "partial", reason: "packages-lock.json is missing." });
} else {
  output = JSON.stringify({ status: "degraded", decision: "not-run", reason: "The Unity executable is not configured." });
}
fs.writeFileSync(process.argv[3], output, "utf8");
