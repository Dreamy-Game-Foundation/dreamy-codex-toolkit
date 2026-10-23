import fs from "node:fs";
import path from "node:path";
import {
  readJson,
  atomicJson,
  withLock,
  inside,
  dataRoot,
} from "../lib/local-data.mjs";
import { projectIdentity, recordPath } from "./store.mjs";
import { fingerprint, evidenceFor } from "../verification-plan.mjs";
export function eligible(
  root,
  lesson,
  { platform = process.platform, packages, exclude = [] } = {},
) {
  if (
    lesson.schemaVersion !== 1 ||
    !["verified-local", "approved"].includes(lesson.status) ||
    lesson.projectId !== projectIdentity(root) ||
    lesson.scope !== "project" ||
    exclude.includes(lesson.id)
  )
    return false;
  if (
    !Number.isFinite(Date.parse(lesson.reviewAfter)) ||
    Date.parse(lesson.reviewAfter) <= Date.now()
  )
    return false;
  if (
    lesson.applicability?.platforms?.length &&
    !lesson.applicability.platforms.includes(platform)
  )
    return false;
  if (!packages) {
    const lock = readJson(inside(root, "Packages/packages-lock.json"), {
      dependencies: {},
    });
    packages = Object.fromEntries(
      Object.entries(lock.dependencies || {}).map(([id, value]) => [
        id,
        value.version,
      ]),
    );
  }
  for (const [pkg, version] of Object.entries(
    lesson.applicability?.packages || {},
  ))
    if (packages[pkg] !== version) return false;
  if (
    !lesson.verification ||
    fingerprint(root, lesson.verification.files) !==
      lesson.verification.sourceFingerprint
  )
    return false;
  if (
    !lesson.evidenceRefs.every((id) =>
      readJson(recordPath(root, "observations", id)),
    )
  )
    return false;
  return evidenceFor(
    root,
    lesson.verification.taskId,
    lesson.verification.files,
  ).some((r) => r.id === lesson.verification.receiptId);
}
export function verifyLesson(root, id, receiptId) {
  const file = recordPath(root, "lessons", id);
  return withLock(`${file}.lock`, () => {
    const lesson = readJson(file);
    if (
      !lesson ||
      !["candidate", "stale", "verified-local"].includes(lesson.status)
    )
      throw Error("Lesson cannot be verified in current state");
    // Read only receipts produced in the project evidence store, never trust arbitrary supplied pass JSON.
    const dir = inside(dataRoot(root), "evidence");
    const receipts = fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((f) => f.endsWith(".json"))
          .map((f) => readJson(inside(dir, f)))
      : [];
    const r = receipts.find((r) => r?.id === receiptId);
    if (!r || !evidenceFor(root, r.taskId, r.files).some((e) => e.id === r.id))
      throw Error("Fresh successful verification receipt required");
    if (
      !lesson.evidenceRefs
        .map((id) => readJson(recordPath(root, "observations", id)))
        .some(
          (o) =>
            o?.outcome === "fail" &&
            o.taskId === r.taskId &&
            o.operation === r.commandId &&
            o.platform === r.platform,
        )
    )
      throw Error(
        "Failure observation for the same task, command and platform required",
      );
    lesson.verification = {
      taskId: r.taskId,
      files: r.files,
      sourceFingerprint: r.sourceFingerprint,
      receiptId: r.id,
    };
    lesson.status = "verified-local";
    lesson.confidence = "resolved";
    atomicJson(file, lesson);
    return lesson;
  });
}
