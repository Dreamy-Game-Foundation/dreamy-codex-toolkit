import { fileURLToPath } from "node:url";
import { contextIssues } from "../src/context-budget.mjs";
const result = contextIssues(fileURLToPath(new URL("../", import.meta.url)));
for (const message of result.errors) console.error(message);
console.log(
  `context validation: ${result.errors.length ? "FAIL" : "OK"} (${result.warnings.length} size advisories)`,
);
process.exitCode = result.errors.length ? 1 : 0;
