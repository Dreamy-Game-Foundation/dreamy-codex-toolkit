import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function requireText(text, pattern, label) {
  if (!pattern.test(text)) errors.push(label);
}

function validateAgents() {
  const dir = path.join(root, "agents", "codex");
  const evals = readJson("evals/catalog.json");
  const covered = new Set(evals.agentCoverage ?? []);
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith(".toml"))) {
    const id = file.replace(/\.toml$/, "");
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    requireText(text, new RegExp(`^name\\s*=\\s*"${id.replaceAll("-", "_")}"`, "m"), `${file}: missing native name`);
    requireText(text, /^description\s*=\s*".{40,}"/m, `${file}: role/description is missing or vague`);
    requireText(text, /Responsibilities:|Rules:|Core rules:|Check in order:/, `${file}: tools/capabilities or safety rules not explicit`);
    requireText(text, /skills|Activate|Skill structure|validation path/i, `${file}: skills used are not explicit`);
    requireText(text, /sandbox/i, `${file}: sandbox strategy is not explicit`);
    requireText(text, /Output:|Completion:|Completion gates:/, `${file}: output format is not defined`);
    requireText(text, /verify|verification|validation|Run|evidence/i, `${file}: verification behavior is not defined`);
    if (!covered.has(id)) errors.push(`${file}: missing eval agentCoverage entry`);
  }
}

function validateEvals() {
  const evals = readJson("evals/catalog.json");
  for (const testCase of evals.cases ?? []) {
    if (!testCase.id || !testCase.category) errors.push("eval case missing unique id/category");
    if (!testCase.prompt) errors.push(`${testCase.id}: missing architecture decision prompt`);
    if (!Array.isArray(testCase.expected) || testCase.expected.length === 0) errors.push(`${testCase.id}: missing required behavior`);
    if (!Array.isArray(testCase.forbiddenClaims)) errors.push(`${testCase.id}: missing forbidden claims`);
    if (typeof testCase.scoreThreshold !== "number") errors.push(`${testCase.id}: missing deterministic rubric threshold`);
  }
}

function runHarness(args, expectedCode) {
  try {
    const output = execFileSync(process.execPath, [path.join(root, "harness", "dreamy-harness"), ...args], { encoding: "utf8" });
    if (expectedCode !== 0) errors.push(`harness ${args[0]} unexpectedly exited 0`);
    return JSON.parse(output);
  } catch (error) {
    const output = error.stdout?.toString() ?? "{}";
    if (error.status !== expectedCode) errors.push(`harness ${args[0]} exit ${error.status}, expected ${expectedCode}`);
    return JSON.parse(output);
  }
}

function validateHarness() {
  const gitStatus = runHarness(["git-status", root], 0);
  if (gitStatus.status !== "pass" || !Array.isArray(gitStatus.diagnostics) || gitStatus.exitCode !== 0) {
    errors.push("harness git-status must emit pass JSON diagnostics and exit 0");
  }
  if (!gitStatus.timestamp || !gitStatus.adapter) errors.push("harness git-status missing timestamp or adapter");

  const compile = runHarness(["compile", root], 2);
  if (compile.status !== "degraded" || !compile.degradedReason || compile.exitCode === 0) {
    errors.push("harness compile must emit degraded JSON and non-zero exit");
  }
}

function validatePresets() {
  const moduleDir = path.join(root, "modules");
  const modules = new Map();
  for (const moduleFile of fs.readdirSync(moduleDir)) {
    const file = path.join(moduleDir, moduleFile, "module.json");
    if (fs.existsSync(file)) modules.set(moduleFile, JSON.parse(fs.readFileSync(file, "utf8")));
  }
  function visit(id, stack = []) {
    const module = modules.get(id);
    if (!module) errors.push(`missing module ${id}`);
    if (stack.includes(id)) errors.push(`module cycle ${[...stack, id].join(" -> ")}`);
    for (const dep of module?.dependencies ?? []) visit(dep, [...stack, id]);
  }
  for (const id of modules.keys()) visit(id);
  for (const file of fs.readdirSync(path.join(root, "presets")).filter((name) => name.endsWith(".json"))) {
    const preset = readJson(`presets/${file}`);
    const seen = new Set();
    for (const id of preset.modules ?? []) {
      if (seen.has(id)) errors.push(`${file}: duplicate module ${id}`);
      seen.add(id);
      if (!modules.has(id)) errors.push(`${file}: missing module ${id}`);
    }
  }
}

validateAgents();
validateEvals();
validateHarness();
validatePresets();

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("acceptance validation: OK");
