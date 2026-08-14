import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSchemaValidator, validateWithSchema } from "../src/schema-validation.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const result = { manifest: "benchmarks/manifests/pilot.json", command: null, output: null, treatment: null, publishRelease: false };
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (["--manifest", "--command", "--output", "--treatment"].includes(name)) result[name.slice(2)] = argv[++index];
    else if (name === "--publish-release") result.publishRelease = true;
    else throw new Error(`Unknown argument: ${name}`);
  }
  return result;
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function collectSourceFiles(directory, files) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, item.name);
    if (item.isDirectory()) collectSourceFiles(candidate, files);
    else if (item.isFile() && /\.(md|json|toml)$/i.test(candidate)) files.push(candidate);
  }
}

function expandFiles(base, entries) {
  const files = [];
  for (const entry of entries) {
    const full = path.resolve(base, entry);
    if (!full.startsWith(path.resolve(base) + path.sep) && full !== path.resolve(base)) throw new Error(`Source escapes configured root: ${entry}`);
    if (!fs.existsSync(full)) throw new Error(`Treatment source does not exist: ${full}`);
    if (fs.statSync(full).isFile()) files.push(full);
    else collectSourceFiles(full, files);
  }
  return [...new Set(files)].sort();
}

function treatmentSources(treatment, maxBytes) {
  let used = 0;
  const sections = [];
  const provenance = [];
  for (const source of treatment.sources ?? []) {
    const base = source.root === "repo" ? root : process.env[source.root];
    if (!base) return { status: "not-run", reason: `Environment variable ${source.root} is not set`, sections: [], provenance: [] };
    for (const file of expandFiles(base, source.paths ?? [])) {
      const content = fs.readFileSync(file, "utf8");
      if (used + Buffer.byteLength(content) > maxBytes) return { status: "not-run", reason: `Treatment sources exceed maxSourceBytes (${maxBytes})`, sections: [], provenance: [] };
      used += Buffer.byteLength(content);
      const label = `${source.root}:${path.relative(base, file).replaceAll("\\", "/")}`;
      sections.push(`--- ${label}\n${content}`);
      provenance.push({ path: label, sha256: hash(content) });
    }
  }
  return { status: "ready", sections, provenance };
}

function renderArgs(args, values) {
  return args.map((arg) => arg.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`));
}

function grade(output, benchmarkCase) {
  const normalized = output.toLocaleLowerCase("en-US");
  const missingExpected = (benchmarkCase.expected ?? []).filter((item) => !normalized.includes(item.toLocaleLowerCase("en-US")));
  const observedForbidden = (benchmarkCase.forbidden ?? []).filter((item) => normalized.includes(item.toLocaleLowerCase("en-US")));
  return { pass: missingExpected.length === 0 && observedForbidden.length === 0, missingExpected, observedForbidden };
}

function gitProvenance() {
  const commit = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8", windowsHide: true });
  const status = spawnSync("git", ["-C", root, "status", "--porcelain"], { encoding: "utf8", windowsHide: true });
  return {
    toolkitCommit: commit.status === 0 ? commit.stdout.trim() : null,
    toolkitDirty: status.status !== 0 || status.stdout.trim().length > 0
  };
}

export function runBenchmark(options) {
  const manifestPath = path.resolve(options.manifest);
  const manifestText = fs.readFileSync(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  const startedAt = new Date().toISOString();
  const runId = `${startedAt.replace(/[:.]/g, "-")}-${hash(manifestText).slice(0, 8)}`;
  const runDir = path.resolve(options.output ?? path.join(root, "benchmarks", "runs", runId));
  fs.mkdirSync(runDir, { recursive: true });
  const caseFiles = manifest.caseFiles ?? [];
  const cases = caseFiles.flatMap((file) => readJson(path.resolve(path.dirname(manifestPath), file)).cases ?? []);
  const command = options.command ?? manifest.adapter?.executable ?? null;
  const commandArgs = manifest.adapter?.args ?? ["{promptFile}", "{outputFile}"];
  const results = [];

  for (const treatment of manifest.treatments.filter((item) => !options.treatment || item.id === options.treatment)) {
    const source = treatmentSources(treatment, manifest.maxSourceBytes ?? 1_000_000);
    for (const benchmarkCase of cases) {
      const repetitions = benchmarkCase.repetitions ?? manifest.repetitions ?? 1;
      for (let repetition = 1; repetition <= repetitions; repetition += 1) {
        const attemptDir = path.join(runDir, treatment.id, benchmarkCase.id, String(repetition));
        fs.mkdirSync(attemptDir, { recursive: true });
        const promptFile = path.join(attemptDir, "prompt.md");
        const outputFile = path.join(attemptDir, "output.md");
        const prompt = [benchmarkCase.prompt, source.sections.length ? `Treatment sources:\n${source.sections.join("\n\n")}` : ""].filter(Boolean).join("\n\n");
        fs.writeFileSync(promptFile, prompt, "utf8");
        if (!command || source.status !== "ready") {
          results.push({ treatment: treatment.id, caseId: benchmarkCase.id, repetition, status: "not-run", reason: !command ? "No benchmark command configured" : source.reason, sourceProvenance: source.provenance });
          continue;
        }
        const args = renderArgs(commandArgs, { repoRoot: root, promptFile, outputFile, attemptDir, treatment: treatment.id, caseId: benchmarkCase.id });
        const execution = spawnSync(command, args, { cwd: attemptDir, encoding: "utf8", windowsHide: true, timeout: manifest.timeoutMs ?? 300_000 });
        if (!fs.existsSync(outputFile) && execution.stdout) fs.writeFileSync(outputFile, execution.stdout, "utf8");
        const output = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, "utf8") : "";
        const grading = grade(output, benchmarkCase);
        const executionOk = execution.status === 0 && !execution.error;
        results.push({
          treatment: treatment.id,
          caseId: benchmarkCase.id,
          repetition,
          status: executionOk && grading.pass ? "pass" : "fail",
          command: [command, ...args],
          exitCode: execution.status,
          executionError: execution.error?.message ?? null,
          outputPath: path.relative(runDir, outputFile).replaceAll("\\", "/"),
          outputHash: output ? hash(output) : null,
          grading,
          sourceProvenance: source.provenance
        });
      }
    }
  }

  const attempted = results.filter((item) => item.status !== "not-run").length;
  const passed = results.filter((item) => item.status === "pass").length;
  const failed = results.filter((item) => item.status === "fail").length;
  const notRun = results.filter((item) => item.status === "not-run").length;
  const report = {
    schemaVersion: 1,
    kind: "semantic-benchmark",
    purpose: manifest.purpose ?? "development",
    releaseEligible: Boolean(manifest.releaseEligible),
    runId,
    status: failed ? "failed" : notRun ? "degraded" : "complete",
    startedAt,
    finishedAt: new Date().toISOString(),
    manifest: path.relative(root, manifestPath).replaceAll("\\", "/"),
    manifestHash: hash(manifestText),
    adapter: command ? { executable: command, args: commandArgs } : null,
    provenance: {
      ...gitProvenance(),
      model: manifest.model ?? "unspecified",
      reasoning: manifest.reasoning ?? "unspecified",
      node: process.version,
      platform: `${os.platform()} ${os.release()}`,
      arch: os.arch()
    },
    treatments: results,
    summary: { attempted, passed, failed, notRun }
  };
  const schemas = createSchemaValidator(path.join(root, "schemas"));
  validateWithSchema(schemas, "https://dreamy.tools/codex/schemas/benchmark-run.schema.json", report, "benchmark report");
  fs.writeFileSync(path.join(runDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  if (options.publishRelease) {
    if (report.status !== "complete" || report.purpose !== "quality" || !report.releaseEligible || report.provenance.toolkitDirty) {
      throw new Error("Refusing to publish benchmark: require a complete, quality, release-eligible run from a clean toolkit commit");
    }
    fs.mkdirSync(path.join(root, "release"), { recursive: true });
    fs.copyFileSync(path.join(runDir, "report.json"), path.join(root, "release", "benchmark-report.json"));
  }
  return { report, runDir };
}

if (path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  try {
    const result = runBenchmark(parseArgs(process.argv.slice(2)));
    console.log(JSON.stringify({
      schemaVersion: result.report.schemaVersion,
      kind: result.report.kind,
      purpose: result.report.purpose,
      releaseEligible: result.report.releaseEligible,
      runId: result.report.runId,
      status: result.report.status,
      manifestHash: result.report.manifestHash,
      summary: result.report.summary,
      runDir: result.runDir,
      reportPath: path.join(result.runDir, "report.json")
    }, null, 2));
    process.exitCode = result.report.status === "complete" ? 0 : result.report.status === "degraded" ? 2 : 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
