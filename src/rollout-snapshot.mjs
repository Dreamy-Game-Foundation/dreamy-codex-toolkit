import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  atomicJson,
  dataRoot,
  hash,
  inside,
  readJson,
} from "./lib/local-data.mjs";
import { listRecords } from "./knowledge/store.mjs";
import { eligible } from "./knowledge/eligibility.mjs";
import { probeNativeHooks } from "./hooks/native-probe.mjs";

export async function rolloutSnapshot(
  root,
  { now = Date.now(), probe = probeNativeHooks } = {},
) {
  root = fs.realpathSync(root);
  const directory = inside(dataRoot(root), "rollout");
  const state = readJson(inside(root, ".dreamy-codex/hooks-state.json"));
  const policy = readJson(inside(root, ".dreamy-codex/hook-policy.json"));
  const cohortHash = hash(
    JSON.stringify({ runtimeHash: state?.runtimeHash || null, policy }),
  );
  const lessons = listRecords(root, "lessons");
  const native = await probe(root);
  const dayUtc = new Date(now).toISOString().slice(0, 10);
  const prior = fs.existsSync(directory)
    ? fs
        .readdirSync(directory)
        .filter((name) => name.endsWith(".json"))
        .map((name) => readJson(inside(directory, name)))
        .filter(
          (record) =>
            record?.kind === "rollout-observation" &&
            record.cohortHash === cohortHash,
        )
    : [];
  const days = [...new Set([...prior.map((r) => r.dayUtc), dayUtc])].sort();
  const report = {
    schemaVersion: 1,
    kind: "rollout-observation",
    observedAt: new Date(now).toISOString(),
    dayUtc,
    cohortHash,
    modelCalls: 0,
    profile: state?.profile || "off",
    nativeTrust: native.trust,
    nativeProbe: native.probeStatus,
    errors: native.errors || [],
    reason: native.reason,
    lessonCounts: {
      total: lessons.length,
      candidate: lessons.filter((l) => l.status === "candidate").length,
      eligible: lessons.filter((l) => eligible(root, l)).length,
    },
    observedUtcDays: days.length,
    firstObservationDayUtc: days[0],
    operationalAcceptance: "not-established",
    limitation:
      "Daily configuration/data observations do not prove actual task success, native lifecycle coverage or a completed week of real usage",
  };
  const file = inside(
    directory,
    `${new Date(now).toISOString().replaceAll(":", "-")}-${crypto.randomUUID().slice(0, 8)}.json`,
  );
  atomicJson(file, report);
  return { ...report, artifact: file };
}
