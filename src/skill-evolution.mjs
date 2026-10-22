import fs from "node:fs";
import path from "node:path";
import {
  inside,
  dataRoot,
  readJson,
  atomicJson,
  hash,
  withLock,
} from "./lib/local-data.mjs";
import { recordPath } from "./knowledge/store.mjs";
import { eligible } from "./knowledge/eligibility.mjs";
export function proposeSkill(root, id, { name, input } = {}) {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(name || ""))
    throw Error("Skill name must be 3–64 lowercase characters");
  const lesson = readJson(recordPath(root, "lessons", id));
  if (!lesson || !eligible(root, lesson))
    throw Error("Fresh verified project lesson required");
  const canonical = readJson(new URL("../skills/index.json", import.meta.url), {
    skills: [],
  });
  if (canonical.skills.some((s) => s.name === name))
    throw Error(
      "Canonical skill already owns this name; propose a source patch instead",
    );
  const installed = path.join(root, ".agents", "skills");
  if (fs.existsSync(path.join(installed, name)))
    throw Error("Skill already exists: patch its owner instead");
  const text = fs.readFileSync(input, "utf8");
  if (
    Buffer.byteLength(text) > 5000 ||
    !text.startsWith(`---\nname: ${name}\n`) ||
    !/^description: .{40,}$/m.test(text) ||
    !/## Verification/.test(text)
  )
    throw Error(
      "Candidate needs matching name, specific description, Verification and <=5000 bytes",
    );
  const duplicates = fs.existsSync(installed)
    ? fs.readdirSync(installed).filter((n) => {
        const f = inside(installed, `${n}/SKILL.md`);
        return (
          fs.existsSync(f) &&
          fs.readFileSync(f, "utf8").includes(lesson.trigger)
        );
      })
    : [];
  if (duplicates.length)
    throw Error(
      `Existing skill covers this trigger: ${duplicates.join(", ")}; patch its owner first`,
    );
  const dir = inside(dataRoot(root), `knowledge/skill-candidates/${name}`);
  if (fs.existsSync(dir))
    throw Error("Candidate already exists; use a reviewed revision");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(inside(dir, "SKILL.md"), text);
  const manifest = {
    schemaVersion: 1,
    id: name,
    lessonId: id,
    status: "candidate",
    scope: "project",
    contentHash: hash(text),
    createdAt: new Date().toISOString(),
    requiredCases: { positive: 2, negative: 2, conflict: 1 },
    revisions: 0,
  };
  atomicJson(inside(dir, "candidate.json"), manifest);
  return manifest;
}
export function promoteSkill(root, id, { reportFile, dryRun = false } = {}) {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(id)) throw Error("Invalid skill ID");
  const dir = inside(dataRoot(root), `knowledge/skill-candidates/${id}`),
    candidate = readJson(inside(dir, "candidate.json"));
  if (!candidate || candidate.status !== "candidate")
    throw Error("Candidate not found");
  const text = fs.readFileSync(inside(dir, "SKILL.md"), "utf8");
  if (hash(text) !== candidate.contentHash)
    throw Error("Candidate changed; re-evaluate");
  const lesson = readJson(recordPath(root, "lessons", candidate.lessonId));
  if (!lesson || !eligible(root, lesson))
    throw Error("Candidate lesson is no longer eligible");
  const report = readJson(reportFile);
  if (
    !report ||
    report.kind !== "skill-behavior-evaluation" ||
    report.candidateHash !== candidate.contentHash ||
    report.status !== "pass" ||
    report.measurement !== "observed-agent-behavior" ||
    report.criticalFailures !== 0
  )
    throw Error("Observed behavioral report for exact candidate hash required");
  for (const [kind, count] of Object.entries(candidate.requiredCases)) {
    const cases = report.cases?.filter(
      (c) =>
        c.kind === kind &&
        c.status === "pass" &&
        c.artifactHash &&
        /^[0-9a-f]{64}$/.test(c.artifactHash),
    );
    if (!cases || cases.length < count)
      throw Error(`Missing ${kind} behavior cases`);
  }
  const ids = new Set();
  for (const c of report.cases) {
    if (
      typeof c.id !== "string" ||
      ids.has(c.id) ||
      c.status !== "pass" ||
      typeof c.artifactPath !== "string"
    )
      throw Error(
        "Behavior cases need unique IDs, pass outcomes and artifact paths",
      );
    ids.add(c.id);
    const artifact = inside(dataRoot(root), c.artifactPath);
    if (
      !fs.existsSync(artifact) ||
      hash(fs.readFileSync(artifact)) !== c.artifactHash
    )
      throw Error("Behavior artifact missing or hash mismatch");
  }
  // This explicit operation consumes externally reviewed semantic evidence, never invents it from headings/keywords.
  const dest = inside(root, `.agents/skills/${id}`);
  if (fs.existsSync(dest))
    throw Error("Destination skill exists; refusing overwrite");
  if (dryRun)
    return {
      status: "planned",
      destination: dest,
      candidateHash: candidate.contentHash,
    };
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(inside(dest, "SKILL.md"), text);
  atomicJson(inside(dir, "candidate.json"), {
    ...candidate,
    status: "promoted",
    evaluationHash: hash(JSON.stringify(report)),
    promotedAt: new Date().toISOString(),
  });
  return { status: "promoted", destination: dest };
}

export function reviseSkill(root, id, input) {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(id)) throw Error("Invalid skill ID");
  const dir = inside(dataRoot(root), `knowledge/skill-candidates/${id}`),
    file = inside(dir, "candidate.json");
  return withLock(`${file}.lock`, () => {
    const candidate = readJson(file);
    if (
      !candidate ||
      candidate.status !== "candidate" ||
      candidate.revisions >= 2
    )
      throw Error("Candidate revision limit reached or candidate unavailable");
    const text = fs.readFileSync(input, "utf8");
    if (
      Buffer.byteLength(text) > 5000 ||
      !text.startsWith(`---\nname: ${id}\n`) ||
      !/^description: .{40,}$/m.test(text) ||
      !text.includes("## Verification")
    )
      throw Error("Invalid candidate revision");
    const old = fs.readFileSync(inside(dir, "SKILL.md"), "utf8");
    fs.writeFileSync(inside(dir, `revision-${candidate.revisions}.md`), old);
    fs.writeFileSync(inside(dir, "SKILL.md"), text);
    const next = {
      ...candidate,
      revisions: candidate.revisions + 1,
      contentHash: hash(text),
    };
    atomicJson(file, next);
    return next;
  });
}
