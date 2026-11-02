// Synthetic process adapter only: this is never real Unity acceptance evidence.
import fs from "node:fs";
const args = process.argv.slice(2);
if (process.env.FAKE_UNITY_DELAY) await new Promise(resolve => setTimeout(resolve, Number(process.env.FAKE_UNITY_DELAY)));
const log = args[args.indexOf("-logFile") + 1];
fs.writeFileSync(log, process.env.FAKE_UNITY_LOG || "Synthetic Editor completed\n");
if (process.env.FAKE_UNITY_XML) fs.copyFileSync(process.env.FAKE_UNITY_XML, args[args.indexOf("-testResults") + 1]);
process.exitCode = Number(process.env.FAKE_UNITY_EXIT || 0);
