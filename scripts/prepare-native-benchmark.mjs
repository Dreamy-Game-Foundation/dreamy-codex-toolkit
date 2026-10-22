import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBenchmark } from "./benchmark.mjs";
import { atomicJson, hash, readJson } from "../src/lib/local-data.mjs";
import {
  snapshotTrialAdditions,
  validateNativePlan,
} from "../src/benchmark-native.mjs";

export function prepareNativeBenchmark({
  manifest,
  output,
  project,
  model,
  treatment,
  caseId,
  maxTurns = 4,
  candidateId = null,
}) {
  if (!model || !/^[a-zA-Z0-9_.-]+$/.test(model))
    throw Error("An explicit --model is required");
  if (!Number.isSafeInteger(maxTurns) || maxTurns < 1 || maxTurns > 4)
    throw Error("Pilot max-turns must be 1..4");
  const projectRoot = fs.realpathSync(project);
  const { report, runDir } = runBenchmark({
    manifest,
    output,
    treatment,
    case: caseId,
    prepare: true,
  });
  const trials = [];
  for (const result of report.treatments) {
    const dir = path.join(
      runDir,
      result.treatment,
      result.caseId,
      String(result.repetition),
    );
    const context = readJson(path.join(dir, "trial-context.json"));
    const additions = snapshotTrialAdditions(projectRoot, context, candidateId);
    atomicJson(path.join(dir, "reviewed-additions.json"), additions);
    trials.push({
      treatment: result.treatment,
      caseId: result.caseId,
      repetition: result.repetition,
      manifestHash: context.manifestHash,
      promptHash: hash(fs.readFileSync(path.join(dir, "prompt.md"))),
      contextHash: hash(JSON.stringify(context)),
      additionsHash: hash(JSON.stringify(additions)),
      additionsPath: path
        .relative(runDir, path.join(dir, "reviewed-additions.json"))
        .replaceAll("\\", "/"),
      promptPath: path
        .relative(runDir, path.join(dir, "prompt.md"))
        .replaceAll("\\", "/"),
    });
  }
  if (!trials.length || trials.length > maxTurns)
    throw Error(
      `Selected ${trials.length} trials; choose a smaller manifest/case/treatment within max-turns=${maxTurns}`,
    );
  if (
    report.treatments.some(
      (t) => t.reason !== "Preparation only; no adapter executed",
    )
  )
    throw Error("Treatment preparation failed");
  const plan = {
    schemaVersion: 1,
    kind: "native-benchmark-authorization",
    approved: false,
    projectRoot,
    model,
    reasoning: "low",
    maxModelTurns: maxTurns,
    candidateId,
    trials,
    modelCalls: 0,
    review:
      "Review prompt files, eligible project lessons and any promoted candidate before setting approved=true. This file does not itself establish user permission.",
  };
  const file = path.join(runDir, "authorization-plan.json");
  validateNativePlan(plan);
  atomicJson(file, plan);
  return {
    status: "prepared",
    modelCalls: 0,
    plannedTurns: trials.length,
    authorizationPlan: file,
    projectRoot,
    nextAction:
      "Review exact payload/model and authorize this new run; no model turn has started",
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const options = {};
    for (let i = 2; i < process.argv.length; i += 2) {
      const key = process.argv[i];
      if (
        ![
          "--manifest",
          "--output",
          "--project",
          "--model",
          "--treatment",
          "--case",
          "--max-turns",
          "--candidate",
        ].includes(key) ||
        !process.argv[i + 1]
      )
        throw Error(`Invalid option ${key}`);
      options[key.slice(2)] = process.argv[i + 1];
    }
    for (const key of ["manifest", "output", "project", "model"])
      if (!options[key]) throw Error(`--${key} required`);
    console.log(
      JSON.stringify(
        prepareNativeBenchmark({
          ...options,
          caseId: options.case,
          maxTurns: Number(options["max-turns"] || 4),
          candidateId: options.candidate || null,
        }),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
