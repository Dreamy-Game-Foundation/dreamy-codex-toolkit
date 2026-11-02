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
import { fingerprint, evidenceFor, explainReceipt } from "../verification-plan.mjs";
export function explainEligibility(
  root,
  lesson,
  { platform = process.platform, packages, exclude = [] } = {},
) {
  const reasons = [];
  if (lesson.schemaVersion !== 1) reasons.push("unsupported-lesson-version");
  if (!["verified-local", "approved"].includes(lesson.status)) reasons.push("not-verified");
  if (lesson.projectId !== projectIdentity(root)) reasons.push("project-mismatch");
  if (lesson.scope !== "project") reasons.push("scope-mismatch");
  if (exclude.includes(lesson.id)) reasons.push("explicitly-excluded");
  if (!Number.isFinite(Date.parse(lesson.reviewAfter)) || Date.parse(lesson.reviewAfter) <= Date.now()) reasons.push("review-expired");
  if (lesson.applicability?.platforms?.length && !lesson.applicability.platforms.includes(platform)) reasons.push("platform-mismatch");
  if (!packages) {
    const lock = readJson(inside(root, "Packages/packages-lock.json"), { dependencies: {} });
    packages = Object.fromEntries(Object.entries(lock.dependencies || {}).map(([id, value]) => [id, value.version]));
  }
  for (const [pkg, version] of Object.entries(lesson.applicability?.packages || {})) {
    if (packages[pkg] !== version) reasons.push("package-version-mismatch");
  }
  if (!lesson.verification) reasons.push("verification-missing");
  else {
    if (fingerprint(root, lesson.verification.files) !== lesson.verification.sourceFingerprint) reasons.push("source-changed");
    reasons.push(...explainReceipt(root, lesson.verification.receiptId, lesson.verification.taskId, lesson.verification.files).reasons);
  }
  if (!lesson.evidenceRefs?.length || !lesson.evidenceRefs.every(id => readJson(recordPath(root, "observations", id)))) reasons.push("observation-missing");
  return { eligible: reasons.length === 0, reasons: [...new Set(reasons)] };
}
export function eligible(root, lesson, context = {}) {
  return explainEligibility(root, lesson, context).eligible;
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
