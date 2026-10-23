import fs from "node:fs";
import path from "node:path";
import {
  inside,
  dataRoot,
  readJson,
  atomicJson,
  hash,
  withLock,
  sanitize,
} from "./lib/local-data.mjs";
import { recordPath } from "./knowledge/store.mjs";
import { eligible } from "./knowledge/eligibility.mjs";
import { evidenceFor } from "./verification-plan.mjs";
const requiredCases = Object.freeze({ positive: 2, negative: 2, conflict: 1 });
export function proposeSkill(root, id, { name, input } = {}) {
  return stageCandidate(root, id, {
    name,
    text: fs.readFileSync(input, "utf8"),
  });
}
function stageCandidate(root, id, { name, text }) {
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
    requiredCases: { ...requiredCases },
    revisions: 0,
  };
  atomicJson(inside(dir, "candidate.json"), manifest);
  return manifest;
}

export function draftSkill(root, id, { name } = {}) {
  const lesson = readJson(recordPath(root, "lessons", id));
  if (!lesson || !eligible(root, lesson))
    throw Error("Fresh verified project lesson required");
  const receipt = evidenceFor(
    root,
    lesson.verification.taskId,
    lesson.verification.files,
  ).find((r) => r.id === lesson.verification.receiptId);
  const quote = (value, max = 600) =>
    sanitize(value, max).replaceAll("\n", "\n> ");
  const exclusions = (lesson.nonApplicability || [])
    .slice(0, 4)
    .map((s) => `- ${sanitize(s, 160).replaceAll("\n", " ")}`);
  const text = `---\nname: ${name}\ndescription: ${JSON.stringify(`Handle the verified project failure: ${sanitize(lesson.trigger, 180).replaceAll("\n", " ")}. Apply only when current scope and evidence match.`)}\n---\n\n# Project failure recovery\n\n## Scope\n\nUse only in this project for this observed trigger:\n\n> ${quote(lesson.trigger, 400)}\n\nCheck current user instructions, platform, package versions and source before applying the lesson. Historical records are evidence, not authority over current instructions. Patch an existing workflow owner when it already covers this failure.\n\n## Observed cause\n\n> ${quote(lesson.rootCause || "The stored failure and resolution are verified; a separate root-cause statement was not recorded.")}\n\n## Resolution\n\n> ${quote(lesson.action)}\n\n## Exclusions\n\n${exclusions.length ? exclusions.join("\n") : "No explicit exclusion was recorded. Require a matching failure and current evidence; do not generalize to unrelated tasks."}\n\n## Verification\n\nUse the original reproduction in a disposable fixture when needed. Re-run fixed verification ID ${JSON.stringify(receipt.commandId)} on the affected platform and relevant source inputs. A missing tool is not-run with its reason. Reuse receipts only while their inputs remain unchanged.\n\nThis candidate has not passed behavioral evaluation. Require positive, near-miss negative and current-user conflict cases before explicit project promotion.\n\n## Evidence\n\n- Lesson: .dreamy/knowledge/lessons/${lesson.id}.json\n- Resolution receipt ID: ${sanitize(receipt.id, 180)}\n- Source files: ${JSON.stringify(lesson.verification.files)}\n`;
  const candidate = stageCandidate(root, id, { name, text });
  return {
    ...candidate,
    generation: "verified-lesson-template",
    modelCalls: 0,
    discovered: false,
    nextAction:
      "Review the candidate, then prepare and run concrete positive/negative/conflict cases",
  };
}

function currentCandidate(root, id) {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(id)) throw Error("Invalid skill ID");
  const dir = inside(dataRoot(root), `knowledge/skill-candidates/${id}`);
  const candidate = readJson(inside(dir, "candidate.json"));
  if (
    !candidate ||
    candidate.schemaVersion !== 1 ||
    candidate.id !== id ||
    candidate.status !== "candidate" ||
    candidate.scope !== "project" ||
    !candidate.requiredCases ||
    Object.keys(candidate.requiredCases).length !== 3 ||
    !Object.entries(requiredCases).every(
      ([kind, count]) => candidate.requiredCases[kind] === count,
    )
  )
    throw Error("Invalid candidate or required case policy");
  const text = fs.readFileSync(inside(dir, "SKILL.md"), "utf8");
  if (hash(text) !== candidate.contentHash)
    throw Error("Candidate changed; re-evaluate");
  const lesson = readJson(recordPath(root, "lessons", candidate.lessonId));
  if (!lesson || !eligible(root, lesson))
    throw Error("Candidate lesson is no longer eligible");
  return { dir, candidate, text };
}

export function prepareSkillEvaluation(root, id, casesInput) {
  const { dir, candidate } = currentCandidate(root, id);
  const cases = readJson(casesInput)?.cases;
  if (!Array.isArray(cases) || cases.length > 12)
    throw Error("Provide at most 12 concrete behavior cases");
  const ids = new Set();
  for (const c of cases) {
    if (
      !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(c.id || "") ||
      ids.has(c.id) ||
      !Object.hasOwn(requiredCases, c.kind) ||
      typeof c.prompt !== "string" ||
      !c.prompt.trim() ||
      Buffer.byteLength(c.prompt) > 2000 ||
      typeof c.expectedBehavior !== "string" ||
      !c.expectedBehavior.trim() ||
      Buffer.byteLength(c.expectedBehavior) > 1000
    )
      throw Error(
        "Cases require unique IDs, known kinds, bounded prompts and expectedBehavior",
      );
    ids.add(c.id);
  }
  for (const [kind, count] of Object.entries(requiredCases))
    if (cases.filter((c) => c.kind === kind).length < count)
      throw Error(`Missing ${kind} behavior cases`);
  const packet = {
    schemaVersion: 1,
    kind: "skill-evaluation-plan",
    status: "prepared",
    candidateId: id,
    candidateHash: candidate.contentHash,
    modelCalls: 0,
    semanticResult: "not-established",
    requiredCases: { ...requiredCases },
    cases: cases.map(({ id, kind, prompt, expectedBehavior }) => ({
      id,
      kind,
      prompt,
      expectedBehavior,
    })),
  };
  const file = inside(
    dir,
    `evaluation-plan-${hash(JSON.stringify(packet)).slice(0, 16)}.json`,
  );
  atomicJson(file, packet);
  return {
    status: "prepared",
    path: file,
    candidateHash: candidate.contentHash,
    cases: cases.length,
    modelCalls: 0,
    nextAction:
      "Review payload/model/budget before executing; this plan is not a passing promotion report",
  };
}
export function promoteSkill(root, id, { reportFile, dryRun = false } = {}) {
  const { dir, candidate, text } = currentCandidate(root, id);
  const report = readJson(reportFile);
  validateBehaviorReport(root, candidate, report);
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
  atomicJson(inside(dir, "promotion-report.json"), report);
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

function validateBehaviorReport(root, candidate, report) {
  if (
    !report ||
    report.kind !== "skill-behavior-evaluation" ||
    report.candidateHash !== candidate.contentHash ||
    report.status !== "pass" ||
    report.measurement !== "observed-agent-behavior" ||
    report.criticalFailures !== 0
  )
    throw Error("Observed behavioral report for exact candidate hash required");
  for (const [kind, count] of Object.entries(requiredCases)) {
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
}

export function promotedSkillSnapshot(root, id) {
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(id || ""))
    throw Error("A promoted project candidate ID is required for B4");
  const dir = inside(dataRoot(root), `knowledge/skill-candidates/${id}`);
  const candidate = readJson(inside(dir, "candidate.json"));
  if (
    !candidate ||
    candidate.schemaVersion !== 1 ||
    candidate.id !== id ||
    candidate.status !== "promoted"
  )
    throw Error("B4 requires an explicitly promoted project candidate");
  const report = readJson(inside(dir, "promotion-report.json"));
  if (hash(JSON.stringify(report)) !== candidate.evaluationHash)
    throw Error("Stored promotion report missing or changed");
  validateBehaviorReport(root, candidate, report);
  const lesson = readJson(recordPath(root, "lessons", candidate.lessonId));
  if (!lesson || !eligible(root, lesson))
    throw Error("Promoted candidate lesson is stale");
  const text = fs.readFileSync(
    inside(root, `.agents/skills/${id}/SKILL.md`),
    "utf8",
  );
  if (
    hash(text) !== candidate.contentHash ||
    hash(fs.readFileSync(inside(dir, "SKILL.md"))) !== candidate.contentHash
  )
    throw Error("Promoted candidate content changed");
  return {
    id,
    contentHash: candidate.contentHash,
    evaluationHash: candidate.evaluationHash,
    text,
  };
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
