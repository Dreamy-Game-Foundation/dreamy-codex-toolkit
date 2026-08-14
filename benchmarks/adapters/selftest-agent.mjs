import fs from "node:fs";

const prompt = fs.readFileSync(process.argv[2], "utf8");
let output;
if (prompt.includes("Runtime asmdef")) {
  output = "Reject the Runtime to Editor dependency and remove the Editor assembly reference.";
} else if (prompt.includes("packages-lock.json")) {
  output = "The profile is incomplete because packages-lock.json is missing.";
} else {
  output = "Status is degraded because the Unity executable is not configured.";
}
fs.writeFileSync(process.argv[3], output, "utf8");
