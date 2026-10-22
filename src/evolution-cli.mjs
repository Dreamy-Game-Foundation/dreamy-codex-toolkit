import fs from "node:fs";
import path from "node:path";
import { contextInventory } from "./context-budget.mjs";
import { configureHooks, hooksDoctor, recoverHooks } from "./hooks/install.mjs";
import {
  listRecords,
  recordObservation,
  saveLesson,
  forgetLesson,
  pruneObservations,
  recordPath,
} from "./knowledge/store.mjs";
import { verifyLesson } from "./knowledge/eligibility.mjs";
import { recall } from "./knowledge/recall.mjs";
import { writeCheckpoint, runVerification } from "./verification-plan.mjs";
import {
  proposeSkill,
  promoteSkill,
  reviseSkill,
  draftSkill,
  prepareSkillEvaluation,
} from "./skill-evolution.mjs";
import {
  createSchemaValidator,
  validateWithSchema,
} from "./schema-validation.js";
import { readJson } from "./lib/local-data.mjs";
import { rolloutSnapshot } from "./rollout-snapshot.mjs";
export async function evolutionCommand(toolkitRoot, argv) {
  const [group, action, ...rest] = argv,
    options = {},
    pos = [];
  const allowed = new Set([
    "target",
    "preset",
    "profile",
    "disabled",
    "input",
    "session",
    "query",
    "receipt",
    "name",
    "report",
    "command",
  ]);
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (["--json", "--dry-run", "--record-receipts", "--native"].includes(a))
      options[a.slice(2)] = true;
    else if (a.startsWith("--")) {
      if (
        !allowed.has(a.slice(2)) ||
        !rest[i + 1] ||
        rest[i + 1].startsWith("--")
      )
        throw Error(`Invalid option ${a}`);
      options[a.slice(2)] = rest[++i];
    } else pos.push(a);
  }
  if (
    options["dry-run"] &&
    !(
      (group === "hooks" && action === "configure") ||
      (group === "skills" && action === "promote")
    )
  )
    throw Error(
      "--dry-run is supported only for hooks configure and skills promote",
    );
  const root = path.resolve(options.target || ".");
  if (options.target === "global")
    throw Error(
      "Evolution commands use a project --target; global configuration is not changed",
    );
  const input = () => {
    if (!options.input) throw Error("--input file required");
    const value = readJson(path.resolve(options.input));
    const schema =
      group === "hooks" && action === "configure"
        ? "hook-policy"
        : group === "task" && action === "checkpoint"
          ? "task-checkpoint"
          : group === "lessons" && action === "record"
            ? value.operation
              ? "hook-observation"
              : "lesson"
            : null;
    if (schema)
      validateWithSchema(
        createSchemaValidator(path.join(toolkitRoot, "schemas")),
        `https://dreamy.tools/codex/schemas/${schema}.schema.json`,
        value,
        "input",
      );
    return value;
  };
  let result;
  if (group === "rollout" && action === "snapshot") {
    result = await rolloutSnapshot(root);
  } else if (group === "context" && action === "report") {
    const state = readJson(path.join(root, ".dreamy-codex/install-state.json"));
    result = contextInventory(toolkitRoot, {
      preset: options.preset || state?.preset || "dreamy-project",
      installedRoot: state ? path.join(root, ".agents/skills") : null,
    });
  } else if (group === "hooks" && action === "configure") {
    const policy = options.input ? input() : {};
    result = configureHooks(toolkitRoot, root, {
      ...policy,
      profile: options.profile || policy.profile || "minimal",
      disabled: options.disabled?.split(",") || policy.disabled || [],
      dryRun: !!options["dry-run"],
      recordReceipts:
        options["record-receipts"] || policy.recordReceipts || false,
    });
  } else if (group === "hooks" && action === "probe") {
    const { probeNativeHooks } = await import("./hooks/native-probe.mjs");
    result = await probeNativeHooks(root);
    if (result.probeStatus !== "observed") process.exitCode = 2;
  } else if (group === "hooks" && action === "recover")
    result = recoverHooks(root);
  else if (group === "hooks" && action === "doctor") result = hooksDoctor(root);
  else if (group === "hooks" && action === "smoke") {
    if (options.native) {
      const { smokeNativeHooks } = await import("./hooks/native-probe.mjs");
      result = await smokeNativeHooks(root);
      if (result.status !== "pass") process.exitCode = 2;
    } else {
      const { fixtureSmoke } = await import("../scripts/hook-smoke.mjs");
      result = fixtureSmoke();
    }
  } else if (group === "lessons" && action === "list")
    result = { lessons: listRecords(root, "lessons") };
  else if (group === "lessons" && action === "record") {
    const value = input();
    result = value.operation
      ? recordObservation(root, value)
      : saveLesson(root, value);
  } else if (group === "lessons" && action === "verify")
    result = verifyLesson(root, pos[0], options.receipt);
  else if (group === "lessons" && action === "show")
    result = readJson(recordPath(root, "lessons", pos[0]));
  else if (group === "lessons" && action === "forget")
    result = forgetLesson(root, pos[0]);
  else if (group === "lessons" && action === "prune")
    result = pruneObservations(root);
  else if (group === "lessons" && action === "recall") {
    if (!options.query) throw Error("--query required");
    result = recall(root, options.query, {
      session: options.session || "explicit",
    });
  } else if (group === "lessons" && action === "export")
    result = { schemaVersion: 1, lessons: listRecords(root, "lessons") };
  else if (group === "task" && action === "checkpoint") {
    if (!options.session) throw Error("--session required");
    result = writeCheckpoint(root, options.session, input());
  } else if (group === "task" && action === "verify") {
    const value = input();
    result = runVerification(toolkitRoot, root, {
      ...value,
      id: options.command,
    });
    if (result.status !== "pass")
      process.exitCode = result.status === "fail" ? 1 : 2;
  } else if (group === "skills" && action === "draft")
    result = draftSkill(root, pos[0], { name: options.name });
  else if (group === "skills" && action === "prepare-evaluation")
    result = prepareSkillEvaluation(root, pos[0], options.input);
  else if (group === "skills" && action === "propose")
    result = proposeSkill(root, pos[0], {
      name: options.name,
      input: options.input,
    });
  else if (group === "skills" && action === "revise")
    result = reviseSkill(root, pos[0], options.input);
  else if (group === "skills" && action === "promote")
    result = promoteSkill(root, pos[0], {
      reportFile: options.report,
      dryRun: !!options["dry-run"],
    });
  else
    throw Error(
      "Unknown evolution command. See docs/toolkit-evolution.md for supported commands.",
    );
  console.log(
    JSON.stringify(
      result,
      null,
      options.json || (group === "lessons" && action === "recall") ? 0 : 2,
    ),
  );
  return result;
}
