import { listRecords } from "./store.mjs";
import { eligible } from "./eligibility.mjs";
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
    const ledger = preview ? {} : readJson(file, {}),
      q = terms(query);
    const ranked = listRecords(root, "lessons")
      .filter((l) => eligible(root, l, context))
      .map((l) => ({
        lesson: l,
        score: [...q].filter((t) => terms(l.trigger + " " + l.rootCause).has(t))
          .length,
      }))
      .filter((v) => v.score >= Math.min(2, q.size) && v.score > 0)
      .sort(
        (a, b) => b.score - a.score || a.lesson.id.localeCompare(b.lesson.id),
      );
    const items = [];

    for (const { lesson: l } of ranked) {
      const digest = hash(JSON.stringify(l));
      if (ledger[l.id] === digest) continue;
      const item = {
        id: l.id,
        trigger: l.trigger,
        action: l.action,
        nonApplicability: l.nonApplicability,
        source: `.dreamy/knowledge/lessons/${l.id}.json`,
        untrustedData: true,
      };
      const projected = {
        items: [...items, item],
        bytes: 1000,
        tokens: null,
        measurement: "bytes-only",
      };
      if (
        Buffer.byteLength(JSON.stringify(projected)) + 1 >
        Math.min(maxBytes, 1000)
      )
        continue;
      items.push(item);
      ledger[l.id] = digest;
      if (items.length === 2) break;
    }
    if (items.length && !preview) atomicJson(file, ledger);
    const report = { items, bytes: 0, tokens: null, measurement: "bytes-only" };
    report.bytes = Buffer.byteLength(JSON.stringify(report)) + 1;
    report.bytes = Buffer.byteLength(JSON.stringify(report)) + 1;
    return report;
  });
}
