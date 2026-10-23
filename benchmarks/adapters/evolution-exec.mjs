import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
// The built-in decision adapter is off unless an exact reviewed authorization plan enables it.
const [promptFile, outputFile] = process.argv.slice(2);
const executable = process.env.DREAMY_EVOLUTION_EXECUTABLE;
if (!promptFile || !outputFile) throw Error("prompt/output paths required");
const statusFile = path.join(path.dirname(outputFile), "adapter-status.json");
if (!executable) {
  const { runNativeDecisionTrial } = await import(
    "../../src/benchmark-native.mjs"
  );
  const result = await runNativeDecisionTrial({
    promptFile,
    outputFile,
    contextFile: path.join(path.dirname(outputFile), "trial-context.json"),
  });
  process.exitCode =
    result.status === "complete" ? 0 : result.status === "not-run" ? 2 : 1;
} else {
  const contextFile = path.join(path.dirname(outputFile), "trial-context.json");
  const result = spawnSync(executable, [promptFile, outputFile, contextFile], {
    encoding: "utf8",
    timeout: 180000,
    shell: false,
  });
  fs.writeFileSync(
    path.join(path.dirname(outputFile), "adapter.log"),
    (result.stdout || "") + (result.stderr || ""),
  );
  if (result.error) {
    fs.writeFileSync(
      statusFile,
      JSON.stringify({ status: "not-run", reason: result.error.message }),
    );
    process.exitCode = 2;
  } else if (result.status === 0) {
    const receiptFile = path.join(
      path.dirname(outputFile),
      "runtime-receipt.json",
    );
    let receipt = null;
    try {
      receipt = JSON.parse(fs.readFileSync(receiptFile, "utf8"));
    } catch {}
    const context = JSON.parse(fs.readFileSync(contextFile, "utf8"));
    const hooksRequired = ["B2", "B3", "B4"].includes(context.treatment);
    if (
      !receipt?.runtime ||
      !receipt?.model ||
      receipt.treatment !== context.treatment ||
      (hooksRequired &&
        (!receipt.nativeEvents?.length || receipt.trust !== "reviewed"))
    ) {
      fs.writeFileSync(
        statusFile,
        JSON.stringify({
          status: "not-run",
          reason:
            "External adapter did not provide matching runtime/model/native-hook receipt",
        }),
      );
      process.exitCode = 2;
    } else process.exitCode = 0;
  } else process.exitCode = result.status ?? 1;
}
