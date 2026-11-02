import { listRecords, recordPath } from "./store.mjs";
import { explainEligibility } from "./eligibility.mjs";
import {
  inside,
  dataRoot,
  sessionKey,
  hash,
  readJson,
  atomicJson,
  withLock,
} from "../lib/local-data.mjs";
const terms = (s) =>
  new Set(
    String(s)
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}_-]{3,}/gu) || [],
  );
export function recall(
  root,
  query,
  {
    session = "explicit",
    epoch = "initial",
    maxBytes = 1000,
    preview = false,
    ...context
  } = {},
) {
  if (Buffer.byteLength(query) > 4096) throw Error("Query exceeds 4096 bytes");
  if (!context.packages) {
    const lock = readJson(inside(root, "Packages/packages-lock.json"), {
      dependencies: {},
    });
    context.packages = Object.fromEntries(
      Object.entries(lock.dependencies || {}).map(([k, v]) => [k, v.version]),
    );
  }
  const file = inside(
    dataRoot(root),
    `recall/${sessionKey(session + ":" + epoch)}.json`,
  );
  return withLock(`${file}.lock`, () => {
    const ledger = preview ? {} : readJson(file, {});
    const { report } = selectLessons(root, query, ledger, { ...context, maxBytes });
    if (report.items.length && !preview) atomicJson(file, ledger);
    return report;
  });
}

// Selection is shared by recall and the read-only explanation. It mutates only
// the supplied in-memory ledger; callers decide whether anything is persisted.
function selectLessons(root, query, ledger, { maxBytes = 1000, ...context } = {}) {
  if (Buffer.byteLength(query) > 4096) throw Error("Query exceeds 4096 bytes");
  const q = terms(query), decisions = new Map();
  const ranked = listRecords(root, "lessons").map(lesson => {
    const eligibility = explainEligibility(root, lesson, context);
    const score = [...q].filter(t => terms(lesson.trigger + " " + lesson.rootCause).has(t)).length;
    decisions.set(lesson.id, { ...eligibility, selected: false, score, recallReasons: [] });
    return { lesson, score };
  }).sort((a, b) => b.score - a.score || a.lesson.id.localeCompare(b.lesson.id));
  const items = [];
  for (const { lesson: l, score } of ranked) {
    const decision = decisions.get(l.id);
    if (!decision.eligible) { decision.recallReasons.push("ineligible"); continue; }
    if (score < Math.min(2, q.size) || score === 0) { decision.recallReasons.push("query-no-match"); continue; }
    const digest = hash(JSON.stringify(l));
    if (ledger[l.id] === digest) { decision.recallReasons.push("session-deduplicated"); continue; }
    if (items.length === 2) { decision.recallReasons.push("selection-limit"); continue; }
    const item = { id: l.id, trigger: l.trigger, action: l.action, nonApplicability: l.nonApplicability, source: `.dreamy/knowledge/lessons/${l.id}.json`, untrustedData: true };
    const projected = { items: [...items, item], bytes: 1000, tokens: null, measurement: "bytes-only" };
    if (Buffer.byteLength(JSON.stringify(projected)) + 1 > Math.min(maxBytes, 1000)) { decision.recallReasons.push("payload-budget"); continue; }
    items.push(item);
    ledger[l.id] = digest;
    decision.selected = true;
  }
  const report = { items, bytes: 0, tokens: null, measurement: "bytes-only" };
  report.bytes = Buffer.byteLength(JSON.stringify(report)) + 1;
  report.bytes = Buffer.byteLength(JSON.stringify(report)) + 1;
  return { report, decisions };
}

export function explainLesson(root, id, { query, session = "explicit", epoch = "initial", ...context } = {}) {
  const lesson = readJson(recordPath(root, "lessons", id));
  if (!lesson) throw Error("Lesson not found");
  if (query === undefined) return { schemaVersion: 1, id, ...explainEligibility(root, lesson, context), untrustedData: true };
  const file = inside(dataRoot(root), `recall/${sessionKey(session + ":" + epoch)}.json`);
  const { decisions } = selectLessons(root, query, readJson(file, {}), context);
  return { schemaVersion: 1, id, ...decisions.get(id), untrustedData: true };
}
