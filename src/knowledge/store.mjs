import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  hash,
  inside,
  dataRoot,
  readJson,
  atomicJson,
  withLock,
  sanitize,
} from "../lib/local-data.mjs";
export function projectIdentity(root) {
  const canonical = fs.realpathSync(root);
  const remote = spawnSync(
    "git",
    ["-C", canonical, "remote", "get-url", "origin"],
    { encoding: "utf8", timeout: 1000 },
  );
  const url =
    remote.status === 0
      ? remote.stdout.trim().replace(/\/\/[^/@]+@/, "//")
      : canonical;
  return hash(url);
}
export const recordPath = (root, kind, id) => {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,95}$/.test(id))
    throw Error("Invalid record ID");
  return inside(dataRoot(root), `knowledge/${kind}/${id}.json`);
};
export function listRecords(root, kind) {
  const dir = inside(dataRoot(root), `knowledge/${kind}`);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson(inside(dir, f)))
    .filter(Boolean);
}
export function recordObservation(root, input) {
  if (
    input.schemaVersion !== 1 ||
    !["fail", "pass", "degraded"].includes(input.outcome) ||
    typeof input.operation !== "string"
  )
    throw Error("Invalid observation");
  const record = {
    schemaVersion: 1,
    id: input.id || hash(JSON.stringify(input)).slice(0, 32),
    projectId: projectIdentity(root),
    taskId: sanitize(input.taskId || "unassigned", 96),
    eventId: sanitize(input.eventId || input.id || "explicit", 96),
    observedAt: new Date().toISOString(),
    platform: sanitize(input.platform || process.platform, 32),
    operation: sanitize(input.operation, 80),
    outcome: input.outcome,
    signature: sanitize(input.signature || "", 400),
    rawPromptCaptured: false,
    rawToolInputCaptured: false,
  };
  const file = recordPath(root, "observations", record.id);
  return withLock(inside(dataRoot(root), "knowledge/write.lock"), () => {
    const old = readJson(file);
    if (old) return old;
    const size = Buffer.byteLength(JSON.stringify(record, null, 2)) + 1;
    const retained = pruneObservations(root, {
      maxBytes: 10 * 1024 * 1024 - size,
    });
    if (retained.remainingBytes + size > 10 * 1024 * 1024)
      throw Error(
        "Observation capacity held by retained evidence; review lessons before capturing more",
      );
    atomicJson(file, record);
    return record;
  });
}
export function saveLesson(root, input) {
  if (
    input.schemaVersion !== 1 ||
    input.scope !== "project" ||
    input.status !== "candidate" ||
    !input.trigger ||
    !input.action ||
    !Array.isArray(input.evidenceRefs) ||
    !input.evidenceRefs.length
  )
    throw Error("New lesson must be an evidence-backed project candidate");
  const lessons = listRecords(root, "lessons");
  const duplicate = lessons.find(
    (l) =>
      l.trigger === input.trigger &&
      l.action === input.action &&
      l.status !== "rejected",
  );
  if (duplicate) return duplicate;
  const record = {
    schemaVersion: 1,
    id: input.id,
    projectId: projectIdentity(root),
    scope: "project",
    status: "candidate",
    trigger: sanitize(input.trigger, 400),
    action: sanitize(input.action, 600),
    rootCause: sanitize(input.rootCause || "", 600),
    nonApplicability: (input.nonApplicability || []).map((s) =>
      sanitize(s, 200),
    ),
    evidenceRefs: input.evidenceRefs,
    applicability: input.applicability || {},
    confidence: "unverified",
    createdAt: new Date().toISOString(),
    reviewAfter: new Date(Date.now() + 90 * 86400000).toISOString(),
    sourceHashes: input.sourceHashes || [],
  };
  for (const id of record.evidenceRefs)
    if (!readJson(recordPath(root, "observations", id)))
      throw Error(`Observation missing: ${id}`);
  const file = recordPath(root, "lessons", record.id);
  return withLock(`${file}.lock`, () => {
    if (fs.existsSync(file)) throw Error("Lesson ID already exists");
    atomicJson(file, record);
    return record;
  });
}
export function forgetLesson(root, id) {
  const file = recordPath(root, "lessons", id);
  return withLock(`${file}.lock`, () => {
    const lesson = readJson(file);
    if (!lesson) throw Error("Lesson not found");
    lesson.status = "rejected";
    lesson.reason = "Forgotten by explicit operation";
    atomicJson(file, lesson);
    return lesson;
  });
}
export function pruneObservations(
  root,
  { now = Date.now(), maxBytes = 10 * 1024 * 1024, days = 14 } = {},
) {
  const retained = new Set(
    listRecords(root, "lessons")
      .filter((l) => !["rejected", "superseded"].includes(l.status))
      .flatMap((l) => l.evidenceRefs),
  );
  const records = listRecords(root, "observations").sort((a, b) =>
    a.observedAt.localeCompare(b.observedAt),
  );
  let total = records.reduce(
      (n, r) => n + fs.statSync(recordPath(root, "observations", r.id)).size,
      0,
    ),
    removed = 0;
  for (const r of records) {
    if (retained.has(r.id)) continue;
    const file = recordPath(root, "observations", r.id);
    if (Date.parse(r.observedAt) < now - days * 86400000 || total > maxBytes) {
      total -= fs.statSync(file).size;
      fs.unlinkSync(file);
      removed++;
    }
  }
  return { removed, remainingBytes: total };
}
