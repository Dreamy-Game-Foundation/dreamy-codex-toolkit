import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { findLoadedExternalSkill } from "./codex-isolation.mjs";

const [promptFile, outputFile, model = "gpt-5.6-sol", reasoning = "medium"] = process.argv.slice(2);
if (!promptFile || !outputFile) {
  console.error("Usage: codex-exec.mjs <prompt-file> <output-file> [model] [reasoning]");
  process.exit(2);
}

const executable = process.env.DREAMY_CODEX_EXECUTABLE ?? "codex";
const prompt = fs.readFileSync(promptFile, "utf8");
const eventsFile = path.join(path.dirname(outputFile), "codex-events.jsonl");
const adapterStatusFile = path.join(path.dirname(outputFile), "adapter-status.json");
const isolationBase = path.resolve(process.env.DREAMY_BENCH_TEMP_ROOT ?? os.tmpdir());
fs.mkdirSync(isolationBase, { recursive: true });
const isolationRoot = fs.mkdtempSync(path.join(isolationBase, "dreamy-codex-benchmark-"));
const isolatedHome = path.join(isolationRoot, "codex-home");
const isolatedWorkspace = path.join(isolationRoot, "workspace");
fs.mkdirSync(isolatedHome, { recursive: true });
fs.mkdirSync(isolatedWorkspace, { recursive: true });
const sourceHome = process.env.CODEX_HOME ? path.resolve(process.env.CODEX_HOME) : path.join(os.homedir(), ".codex");
const authFile = path.join(sourceHome, "auth.json");
if (!fs.existsSync(authFile)) {
  console.error(`Codex authentication file is missing: ${authFile}`);
  fs.rmSync(isolationRoot, { recursive: true, force: true });
  process.exit(2);
}
fs.copyFileSync(authFile, path.join(isolatedHome, "auth.json"));

function findSkillDirectories(root) {
  if (!fs.existsSync(root)) return [];
  const directories = [];
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    if (fs.existsSync(path.join(current, "SKILL.md"))) directories.push(current);
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) pending.push(path.join(current, entry.name));
    }
  }
  return directories;
}

const userHome = path.dirname(sourceHome);
const installedSkillDirectories = [
  ...findSkillDirectories(path.join(sourceHome, "skills")),
  ...findSkillDirectories(path.join(userHome, ".agents", "skills"))
];
const skillConfig = installedSkillDirectories
  .map((skillDirectory) => `[[skills.config]]\npath = '${skillDirectory.replaceAll("'", "''")}'\nenabled = false\n`)
  .join("\n");
fs.writeFileSync(path.join(isolatedHome, "config.toml"), skillConfig, "utf8");
const args = [
  "exec",
  "--ephemeral",
  "--ignore-rules",
  "--disable",
  "skill_search",
  "--disable",
  "plugins",
  "--disable",
  "hooks",
  "--disable",
  "apps",
  "--disable",
  "multi_agent",
  "--skip-git-repo-check",
  "--sandbox",
  "read-only",
  "--model",
  model,
  "--config",
  `model_reasoning_effort=${JSON.stringify(reasoning)}`,
  "--color",
  "never",
  "--json",
  "--output-last-message",
  outputFile,
  "-"
];
let exitCode = 1;
try {
  const execution = spawnSync(executable, args, {
    cwd: isolatedWorkspace,
    env: {
      ...process.env,
      CODEX_HOME: isolatedHome,
      HOME: isolationRoot,
      USERPROFILE: isolationRoot,
      HOMEDRIVE: path.parse(isolationRoot).root.replace(/[\\/]$/, ""),
      HOMEPATH: isolationRoot.slice(path.parse(isolationRoot).root.length - 1)
    },
    input: prompt,
    encoding: "utf8",
    windowsHide: true,
    timeout: Number(process.env.DREAMY_CODEX_TIMEOUT_MS ?? 300_000)
  });
  const eventTrace = `${execution.stdout ?? ""}${execution.stderr ?? ""}`;
  fs.writeFileSync(eventsFile, eventTrace, "utf8");
  const loadedExternalSkill = findLoadedExternalSkill(eventTrace, installedSkillDirectories);
  if (loadedExternalSkill) {
    fs.writeFileSync(adapterStatusFile, `${JSON.stringify({
      status: "not-run",
      reason: `Codex loaded a disabled external skill: ${loadedExternalSkill}`
    }, null, 2)}\n`, "utf8");
  }
  if (execution.error) console.error(execution.error.message);
  exitCode = execution.status ?? 1;
} finally {
  fs.rmSync(isolationRoot, { recursive: true, force: true });
}
process.exit(exitCode);
