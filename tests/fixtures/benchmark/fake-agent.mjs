import fs from "node:fs";

const prompt = fs.readFileSync(process.argv[2], "utf8");
const output = prompt.includes("FAIL_CASE") ? "unsafe answer" : "degraded because the Unity executable is not configured";
fs.writeFileSync(process.argv[3], output, "utf8");
