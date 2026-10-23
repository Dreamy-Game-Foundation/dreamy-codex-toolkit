import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { atomicJson, hash, readJson, sessionKey } from "../src/lib/local-data.mjs";
import { writeCheckpoint, checkpointPath, runVerification } from "../src/verification-plan.mjs";
import { listRecords, recordObservation, saveLesson } from "../src/knowledge/store.mjs";
import { verifyLesson, eligible } from "../src/knowledge/eligibility.mjs";
import { recall } from "../src/knowledge/recall.mjs";
import { draftSkill, prepareSkillEvaluation, promoteSkill } from "../src/skill-evolution.mjs";
import { probeNativeHooks } from "../src/hooks/native-probe.mjs";
import { rolloutSnapshot } from "../src/rollout-snapshot.mjs";

const toolkit = fileURLToPath(new URL("../", import.meta.url));

// This is an operator-run integration fixture, not evidence that an IDE delivered events.
export async function runAcceptanceLab({ output, nativeProbe = false, onProgress = message => process.stdout.write(message + "\n") } = {}) {
  const runRoot = path.resolve(output || path.join(toolkit, ".dreamy/acceptance-labs",
    `${new Date().toISOString().replaceAll(":", "-")}-${crypto.randomUUID().slice(0, 6)}`));
  if (fs.existsSync(runRoot)) throw Error("Output exists; retain evidence and choose a new lab directory");
  fs.mkdirSync(runRoot, { recursive: true });
  const project = path.join(runRoot, "project"), artifacts = path.join(runRoot, "artifacts");
  fs.mkdirSync(project); fs.mkdirSync(artifacts);
  const results = [];
  const startedAt = new Date().toISOString();
  const save = (relative, text) => {
    const file = path.join(project, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  };
  const json = (relative, value) => atomicJson(path.join(project, relative), value);
  function processRun(id, executable, args, { input, cwd = project } = {}) {
    const result = spawnSync(executable, args, {
      cwd, input, encoding: "utf8", timeout: 60000, maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
    });
    fs.writeFileSync(path.join(artifacts, `${id}.log`), (result.stdout || "") + (result.stderr || ""));
    atomicJson(path.join(artifacts, `${id}.command.json`), {
      executable, args, cwd, exitCode: result.status, error: result.error?.message || null,
      inputSource: input ? "explicit-fixture-event" : null,
    });
    if (result.error) throw result.error;
    return result;
  }
  function cli(id, args, expectedExit = 0) {
    const result = processRun(id, process.execPath, [path.join(toolkit, "src/cli.js"), ...args, "--target", project, "--json"]);
    assert.equal(result.status, expectedExit, result.stderr || result.stdout);
    return JSON.parse(result.stdout);
  }
  async function check(id, category, expected, fn) {
    const start = Date.now();
    try {
      const observed = await fn();
      results.push({ id, category, status: "pass", expected, observed, durationMs: Date.now() - start });
    } catch (error) {
      results.push({ id, category, status: "fail", expected, reason: error.message, durationMs: Date.now() - start });
    }
    onProgress(`${id}: ${results.at(-1).status}`);
  }
  const session = "explicit-fixture-session";
  const checkpoint = (id = session, taskId = "lab-hook-task") => writeCheckpoint(project, id, {
    schemaVersion: 1, taskId, status: "active", files: ["AGENTS.md"],
    objective: "Isolated toolkit fixture", nextAction: "Inspect fixture documentation",
  });
  function runner(id, event) {
    const response = processRun(id, process.execPath, [
      path.join(project, ".dreamy-codex/hooks-runtime/src/hooks/runner.mjs"),
      "--root", project, "--policy", path.join(project, ".dreamy-codex/hook-policy.json"),
    ], { input: JSON.stringify({ session_id: session, cwd: project, ...event }) });
    assert.equal(response.status, 0, response.stderr);
    const receipt = readJson(path.join(project, `.dreamy/hook-receipts/${hash((event.session_id || session) + ":" + event.hook_event_name)}.json`));
    assert.ok(receipt, "Installed runner did not write its fixture receipt");
    assert.deepEqual(receipt.metrics.errors || [], [], "Handler degraded despite a zero wrapper exit");
    return response.stdout.trim() ? JSON.parse(response.stdout) : null;
  }
  function configure(id, profile) {
    return cli(id, ["hooks", "configure", "--profile", profile, "--record-receipts"]);
  }
  function verify(id, commandId, files, taskId) {
    const receipt = runVerification(toolkit, project, { id: commandId, files, taskId });
    atomicJson(path.join(artifacts, `${id}.receipt.json`), receipt);
    return receipt;
  }

  save("Assets/README.txt", "Static Unity fixture. No game source or assets were copied.\n");
  save("ProjectSettings/ProjectVersion.txt", "m_EditorVersion: 6000.4.12f1\n");
  json("Packages/manifest.json", { dependencies: {} });
  json("Packages/packages-lock.json", { dependencies: {} });
  save(".gitignore", "Library/\nTemp/\nLogs/\n.dreamy/\n.dreamy-codex/\n");
  const oldAgents = "Fixture user prefix\r\n<!-- DREAMY-CODEX:START schema=1 -->\r\nLegacy fixture block\r\n<!-- DREAMY-CODEX:END -->\r\nFixture user suffix\r\n";
  save("AGENTS.md", oldAgents);
  const userConfig = 'model_reasoning_effort = "low"\n# fixture user setting\n';
  save(".codex/config.toml", userConfig);
  const userSkill = "---\nname: lab-user-skill\ndescription: User-owned fixture skill preserved through the toolkit lifecycle.\n---\nFixture user content.\n";
  save(".agents/skills/lab-user-skill/SKILL.md", userSkill);
  const sentinel = { matcher: "^lab-never-trigger$", hooks: [{ type: "command", command: "echo lab-user-hook-sentinel" }] };
  const originalHooks = { description: "Owned by the lab, emulating a user hook", hooks: { SessionStart: [sentinel] } };
  json(".codex/hooks.json", originalHooks);
  json(".dreamy-codex/install-state.json", {
    schemaVersion: 1, toolkitVersion: "0.0.0", target: "D:\\Lab\\Legacy Toolkit Fixture",
    preset: "unity-minimal", agentFiles: [], skillDirs: [], checksums: { before: "", after: hash(oldAgents) },
  });
  const init = processRun("git-init", "git", ["init", "-q"]);
  assert.equal(init.status, 0, init.stderr);
  const initialSourceHash = hash(fs.readFileSync(path.join(project, "Assets/README.txt")));

  fs.writeFileSync(path.join(runRoot, "PLAN.md"), [
    "# Isolated toolkit acceptance plan", "",
    "Scope: static Unity-shaped fixture, project-only toolkit install, zero auxiliary model turns.",
    "1. Migrate synthetic v1/Windows metadata; preserve user configuration and skill.",
    "2. Inspect managed context; install minimal hooks and invoke the installed runner explicitly.",
    "3. Check session/dedupe/source isolation, real shell failure capture, Interrupt and PreCompact handlers.",
    "4. Check standard Stop bounds and strict deny output shape through explicit fixture events.",
    "5. Reproduce a missing lock, run actual fixed verification before/after, verify a local fixture lesson.",
    "6. Check recall, draft/evaluation preparation, rejection of an unevaluated promotion, source/log freshness.",
    "7. Uninstall while preserving user files/knowledge; reinstall minimal for later manual native testing.",
    "8. Optionally probe native discovery without turn/start; retain separate not-run native/Editor/semantic gates.",
    "", "No live game project, global configuration, account auth, model budget or native trust is modified.",
    "Fixture event passes do not prove Extension/CLI native delivery. Static verification does not prove Editor compilation.", "",
  ].join("\n"));

  await check("L01-legacy-update", "installer-cli", "v1 metadata migrates without force or user-content loss", () => {
    const dry = cli("update-dry", ["update", "--dry-run"]);
    assert.equal(dry.fromVersion, "0.0.0");
    assert.equal(fs.readFileSync(path.join(project, "AGENTS.md"), "utf8"), oldAgents);
    cli("update", ["update", "--backup"]);
    const state = readJson(path.join(project, ".dreamy-codex/install-state.json"));
    assert.equal(state.schemaVersion, 2); assert.equal(state.target, project);
    const agents = fs.readFileSync(path.join(project, "AGENTS.md"), "utf8");
    assert.ok(agents.includes("Fixture user prefix") && agents.includes("Fixture user suffix"));
    assert.equal(fs.readFileSync(path.join(project, ".agents/skills/lab-user-skill/SKILL.md"), "utf8"), userSkill);
    return { from: dry.fromVersion, to: state.toolkitVersion, schema: state.schemaVersion, preset: dry.preset, skills: dry.skills, agents: dry.agents };
  });
  await check("L02-context", "context-inventory", "actual managed inventory reports bytes, not fabricated tokens", () => {
    const report = cli("context", ["context", "report"]);
    atomicJson(path.join(artifacts, "context.json"), report);
    assert.equal(report.selection, "installed"); assert.equal(report.tokens, null);
    assert.ok(report.skills.length > 0 && report.metadataBytes > 0 && report.bodyBytes > 0);
    return { artifact: "artifacts/context.json", skills: report.skills.length, metadataBytes: report.metadataBytes, bodyBytes: report.bodyBytes, tokens: report.tokens, measurement: report.measurement };
  });
  await check("L03-minimal-install", "installer-cli", "minimal hooks merge without replacing the sentinel", () => {
    configure("minimal", "minimal");
    const config = readJson(path.join(project, ".codex/hooks.json"));
    assert.deepEqual(config.hooks.SessionStart[0], sentinel);
    const doctor = cli("hooks-doctor", ["hooks", "doctor"]);
    assert.deepEqual(doctor.errors, []);
    return { profile: doctor.profile, userHookPreserved: true, nativeTrust: "not-granted" };
  });
  await check("L04-session-replay", "installed-runner-explicit-event", "same-session checkpoint injects once; another session does not", () => {
    checkpoint();
    const event = { hook_event_name: "SessionStart", source: "resume" };
    const first = runner("session-first", event);
    assert.match(first.hookSpecificOutput.additionalContext, /Inspect fixture documentation/);
    assert.equal(runner("session-repeat", event), null);
    assert.equal(runner("session-other", { ...event, session_id: "explicit-other-session" }), null);
    return { firstContextBytes: Buffer.byteLength(first.hookSpecificOutput.additionalContext), repeatedOutput: null, otherSessionOutput: null, nativeDelivery: false };
  });
  await check("L05-failure-observation", "real-shell-plus-explicit-event", "real exit 7 yields a bounded observation; a success does not", () => {
    const shell = processRun("shell-real-failure", process.execPath, ["-e", "console.error('ERR_ASSERTION TOOLKIT_FAKE_SECRET_123');process.exit(7)"]);
    assert.equal(shell.status, 7);
    const before = listRecords(project, "observations").length;
    runner("failed-tool", { hook_event_name: "PostToolUse", tool_name: "Bash", tool_use_id: "lab-real-shell-failure", tool_input: { command: "node fixture-failure" }, tool_response: { exit_code: shell.status, stderr: shell.stderr } });
    const records = listRecords(project, "observations");
    assert.equal(records.length, before + 1);
    const observation = records.find(r => r.taskId === "lab-hook-task");
    assert.equal(observation.signature, "ERR_ASSERTION");
    assert.ok(!JSON.stringify(observation).includes("TOOLKIT_FAKE_SECRET_123"));
    runner("successful-tool", { hook_event_name: "PostToolUse", tool_name: "Bash", tool_use_id: "lab-shell-success", tool_response: { exit_code: 0 } });
    assert.equal(listRecords(project, "observations").length, records.length);
    runner("statusless-native-shape", { hook_event_name: "PostToolUse", tool_name: "Bash", tool_use_id: "lab-statusless-output", tool_response: shell.stderr });
    const statusless = readJson(path.join(project, `.dreamy/hook-receipts/${hash(session + ":PostToolUse")}.json`));
    assert.equal(statusless.metrics.diagnostics[0].outcome, "missing-exit-code");
    assert.equal(statusless.metrics.diagnostics[0].toolName, "Bash");
    assert.equal(JSON.stringify(statusless).includes("TOOLKIT_FAKE_SECRET_123"), false);
    assert.equal(listRecords(project, "observations").length, records.length);
    return { observedShellExit: shell.status, signature: observation.signature, taskId: observation.taskId, nativePostToolUse: false,
      statuslessNativeShape: "missing-exit-code; no fabricated observation" };
  });
  await check("L06-stale-checkpoint", "installed-runner-explicit-event", "changed source does not replay", () => {
    checkpoint("explicit-stale-session");
    const file = path.join(project, "AGENTS.md"), original = fs.readFileSync(file);
    try {
      fs.appendFileSync(file, "\nTemporary fixture source drift\n");
      assert.equal(runner("session-stale", { hook_event_name: "SessionStart", source: "resume", session_id: "explicit-stale-session" }), null);
    } finally { fs.writeFileSync(file, original); }
    return { staleReplay: false };
  });
  await check("L07-interrupt", "installed-runner-explicit-event", "Interrupt cancels and prevents replay", () => {
    runner("interrupt", { hook_event_name: "Interrupt" });
    const cp = readJson(checkpointPath(project, session));
    assert.equal(cp.status, "cancelled"); assert.equal(cp.lastLifecycleEvent, "Interrupt");
    assert.equal(runner("cancelled-replay", { hook_event_name: "SessionStart", source: "resume" }), null);
    return { status: cp.status, lastLifecycleEvent: cp.lastLifecycleEvent, nativeUserStop: false };
  });
  await check("L08-precompact", "installed-runner-explicit-event", "checkpoint persists and epoch increments", () => {
    checkpoint("explicit-compact-session");
    runner("precompact", { hook_event_name: "PreCompact", session_id: "explicit-compact-session" });
    const cp = readJson(checkpointPath(project, "explicit-compact-session"));
    assert.equal(cp.lastLifecycleEvent, "PreCompact"); assert.equal(cp.nextAction, "Inspect fixture documentation");
    const state = readJson(path.join(project, `.dreamy/hook-state/${sessionKey("explicit-compact-session")}.json`));
    assert.equal(state.epoch, 1);
    return { lastLifecycleEvent: cp.lastLifecycleEvent, epoch: state.epoch, nativeCompaction: false };
  });
  await check("L09-stop-bound", "installed-runner-explicit-event", "one continuation per task/source; compaction does not reset it", () => {
    configure("standard", "standard"); checkpoint("explicit-stop-session", "lab-stop-task");
    const event = { hook_event_name: "Stop", session_id: "explicit-stop-session", stop_hook_active: false };
    assert.equal(runner("stop-first", event).decision, "block");
    assert.equal(runner("stop-repeat", event), null);
    runner("stop-compact", { hook_event_name: "PreCompact", session_id: "explicit-stop-session" });
    assert.equal(runner("stop-after-compact", event), null);
    assert.equal(runner("stop-already-active", { ...event, stop_hook_active: true }), null);
    assert.equal(runner("stop-cancelled", { hook_event_name: "Stop", stop_hook_active: false }), null);
    return { continuationOutputs: 1, resetByCompaction: false, nativeModelContinuation: false };
  });
  await check("L10-strict-deny-shape", "installed-runner-explicit-event", "direct .meta Delete File produces deny output", () => {
    configure("strict", "strict");
    const response = runner("strict-deny", { hook_event_name: "PreToolUse", tool_name: "apply_patch", tool_input: { command: "*** Begin Patch\n*** Delete File: .dreamy/lab/fake.asset.meta\n*** End Patch" } });
    assert.equal(response.hookSpecificOutput.permissionDecision, "deny");
    return { permissionDecision: "deny", actualPatchAttempted: false, nativeEnforcement: false };
  });

  const files = ["Packages/manifest.json", "Packages/packages-lock.json", "ProjectSettings/ProjectVersion.txt"];
  let green, lesson;
  await check("L11-real-red-green", "fixed-harness-verification", "missing lock fails inspection; restored lock produces a fresh successful receipt", () => {
    fs.rmSync(path.join(project, "Packages/packages-lock.json"));
    const red = verify("red-inspection", "validate", files, "lab-lock-task");
    assert.notEqual(red.status, "pass"); assert.notEqual(red.exitCode, 0);
    recordObservation(project, { schemaVersion: 1, id: "lab-missing-lock", taskId: "lab-lock-task", operation: "validate", outcome: "fail", signature: "Missing packages lock fixture inspection" });
    json("Packages/packages-lock.json", { dependencies: {} });
    green = verify("green-inspection", "validate", files, "lab-lock-task");
    assert.equal(green.status, "pass"); assert.equal(green.inputsUnchanged, true);
    return { redStatus: red.status, redExit: red.exitCode, greenStatus: green.status, greenExit: green.exitCode, verification: "static project-inspect, not Unity Editor" };
  });
  await check("L12-lesson-recall", "knowledge-workflow", "fresh verified lesson recalls once, unrelated query stays silent", () => {
    assert.ok(green?.status === "pass", "Missing successful prerequisite receipt");
    saveLesson(project, { schemaVersion: 1, id: "lab-lock-recovery", scope: "project", status: "candidate", trigger: "missing packages lock fixture inspection", rootCause: "The isolated fixture omitted its package lock file.", action: "Restore the fixture lock JSON and rerun static inspection; do not claim Editor compile success.", evidenceRefs: ["lab-missing-lock"], nonApplicability: ["Editor compile, build and device failures"], applicability: { platforms: [process.platform], packages: {} } });
    lesson = verifyLesson(project, "lab-lock-recovery", green.id);
    assert.equal(lesson.status, "verified-local");
    const positive = recall(project, "missing packages lock", { session: "lab-recall" });
    assert.equal(positive.items.length, 1); assert.ok(positive.bytes <= 1000);
    assert.equal(recall(project, "missing packages lock", { session: "lab-recall" }).items.length, 0);
    assert.equal(recall(project, "texture asteroid audio", { session: "lab-unrelated" }).items.length, 0);
    return { lessonStatus: lesson.status, recalledItems: 1, bytes: positive.bytes, tokens: positive.tokens, repeatedItems: 0, unrelatedItems: 0, semanticGeneralization: "not-tested" };
  });
  await check("L13-skill-draft-gate", "skill-workflow", "draft stays outside discovery and a prepared plan cannot promote it", () => {
    const candidate = draftSkill(project, "lab-lock-recovery", { name: "lab-lock-recovery-skill" });
    const cases = [
      ["missing-lock", "positive", "Fixture inspection fails because packages-lock.json is absent.", "Restore the lock and rerun the matching inspection."],
      ["restored-lock", "positive", "Lock was restored; what verifies this fixture fix?", "Use a fresh successful static inspection receipt, without claiming Editor compile."],
      ["shader-error", "negative", "Editor reports a shader compile error with a valid lock.", "Do not apply this missing-lock lesson."],
      ["unrelated-audio", "negative", "Audio is too loud; inspect volume ownership.", "Do not change package lock because of this lesson."],
      ["read-only", "conflict", "The user permits read-only inspection; the lock is missing.", "Report findings without writing a lock; current scope takes precedence."],
    ].map(([id, kind, prompt, expectedBehavior]) => ({ id, kind, prompt, expectedBehavior }));
    atomicJson(path.join(artifacts, "skill-cases.json"), { cases });
    const plan = prepareSkillEvaluation(project, candidate.id, path.join(artifacts, "skill-cases.json"));
    assert.equal(plan.cases, 5);
    assert.throws(() => promoteSkill(project, candidate.id, { reportFile: plan.path }), /behavioral report/i);
    assert.equal(fs.existsSync(path.join(project, ".agents/skills", candidate.id)), false);
    return { candidateId: candidate.id, modelCalls: candidate.modelCalls, cases: plan.cases, promoted: false, semanticEvaluation: "not-run" };
  });
  await check("L14-source-and-log-freshness", "knowledge-workflow", "source or stored-log changes invalidate the lesson", () => {
    assert.ok(lesson && green, "Missing verified lesson prerequisite");
    const lockFile = path.join(project, "Packages/packages-lock.json"), original = fs.readFileSync(lockFile);
    try { json("Packages/packages-lock.json", { dependencies: {}, labMutation: true }); assert.equal(eligible(project, lesson), false); }
    finally { fs.writeFileSync(lockFile, original); }
    assert.equal(eligible(project, lesson), true);
    const logFile = path.join(project, `.dreamy/evidence/${hash(green.id)}.log`), log = fs.readFileSync(logFile);
    try { fs.appendFileSync(logFile, "\nfixture tamper\n"); assert.equal(eligible(project, lesson), false); }
    finally { fs.writeFileSync(logFile, log); }
    assert.equal(eligible(project, lesson), true);
    return { sourceMutationRejected: true, logMutationRejected: true, restoredEvidenceEligible: true };
  });
  await check("L15-uninstall-preservation", "installer-cli", "managed runtime is removed; user files and lesson/candidate survive", () => {
    cli("uninstall", ["uninstall"]);
    assert.equal(fs.existsSync(path.join(project, ".dreamy-codex/hooks-runtime")), false);
    assert.deepEqual(readJson(path.join(project, ".codex/hooks.json")), originalHooks);
    assert.equal(fs.readFileSync(path.join(project, ".agents/skills/lab-user-skill/SKILL.md"), "utf8"), userSkill);
    assert.ok(fs.readFileSync(path.join(project, ".codex/config.toml"), "utf8").includes("# fixture user setting"));
    const agents = fs.readFileSync(path.join(project, "AGENTS.md"), "utf8");
    assert.ok(agents.includes("Fixture user prefix") && agents.includes("Fixture user suffix"));
    assert.ok(readJson(path.join(project, ".dreamy/knowledge/lessons/lab-lock-recovery.json")));
    assert.ok(readJson(path.join(project, ".dreamy/knowledge/skill-candidates/lab-lock-recovery-skill/candidate.json")));
    assert.equal(hash(fs.readFileSync(path.join(project, "Assets/README.txt"))), initialSourceHash);
    return { userSkillPreserved: true, userHookPreserved: true, knowledgePreserved: true, fixtureAssetUnchanged: true };
  });
  await check("L16-restore-minimal", "installer-cli", "leave an installed minimal project ready for manual client testing", () => {
    cli("reinstall", ["install", "--preset", "unity-minimal"]);
    // Remove only our synthetic sentinel from this lab's original hook config before preparing native review.
    json(".codex/hooks.json", { description: "Isolated toolkit acceptance lab", hooks: {} });
    configure("final-minimal", "minimal");
    const doctor = cli("final-doctor", ["doctor"]);
    assert.ok(!doctor.checks.some(c => c.severity === "ERROR"));
    return { profile: "minimal", recordReceipts: true, doctorStatus: doctor.status, nativeTrust: "requires-native-review" };
  });

  let native = { trust: "not-probed", probeStatus: "not-run", errors: [], reason: "Native probe not requested" };
  if (nativeProbe) {
    native = await probeNativeHooks(project);
    atomicJson(path.join(artifacts, "native-probe.json"), native);
    results.push({ id: "L17-native-discovery", category: "native-control-plane", status: native.probeStatus === "observed" ? "pass" : "not-run", expected: "report runtime discovery and trust without a model turn", observed: { probeStatus: native.probeStatus, trust: native.trust, discovery: native.discovery, errors: native.errors, modelCalls: native.modelCalls }, reason: native.reason });
  }
  await check("L18-rollout-observation", "rollout-workflow", "same-day snapshots count one day and do not declare acceptance", async () => {
    const options = { probe: async () => native }; // Cached actual probe, or explicitly not-probed; no synthetic trusted result.
    const first = await rolloutSnapshot(project, options), second = await rolloutSnapshot(project, options);
    assert.equal(first.observedUtcDays, 1); assert.equal(second.observedUtcDays, 1);
    assert.equal(second.operationalAcceptance, "not-established");
    return { observedUtcDays: second.observedUtcDays, operationalAcceptance: second.operationalAcceptance, nativeProbe: second.nativeProbe };
  });
  for (const [id, reason] of [
    ["N01-extension-lifecycle", "No Extension session was driven. All runner events above were explicit fixtures; native trust was not granted."],
    ["N02-live-stop-and-guard", "No real client Stop/compact/apply_patch lifecycle was executed."],
    ["N03-model-quality", "No auxiliary model turn is authorized for this lab. Routing and behavioral skill quality were not evaluated."],
    ["N04-unity-editor", `No Editor was started. This project contains a static fixture, not an Editor-tested game. Future command: node harness/dreamy-harness compile ${project}`],
    ["N05-week-rollout", "Same-session snapshots do not replace real multi-day task observation."],
  ]) results.push({ id, category: "external-acceptance", status: "not-run", reason });

  const sourceCommit = spawnSync("git", ["-C", toolkit, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout?.trim() || null;
  const sourceStatus = spawnSync("git", ["-C", toolkit, "status", "--porcelain"], { encoding: "utf8" });
  const artifactHashes = {};
  for (const name of fs.readdirSync(artifacts).sort()) artifactHashes[`artifacts/${name}`] = hash(fs.readFileSync(path.join(artifacts, name)));
  const report = {
    schemaVersion: 1, kind: "isolated-toolkit-acceptance-lab", startedAt, finishedAt: new Date().toISOString(),
    sourceCommit, sourceDirty: sourceStatus.status !== 0 || Boolean(sourceStatus.stdout.trim()),
    harnessHash: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
    sourceHashes: Object.fromEntries([
      "src/cli.js", "src/evolution-cli.mjs", "src/hooks/install.mjs", "src/hooks/runner.mjs",
      "src/hooks/dispatcher.mjs", "src/verification-plan.mjs", "src/knowledge/store.mjs",
      "src/hooks/codex-transcript-status.mjs", "src/hooks/policy.mjs",
      "src/knowledge/eligibility.mjs", "src/knowledge/recall.mjs", "src/skill-evolution.mjs",
    ].map(relative => [relative, hash(fs.readFileSync(path.join(toolkit, relative)))])),
    projectRoot: project, platform: process.platform, node: process.version, modelCalls: 0,
    scope: "static Unity fixture + CLI + explicitly invoked installed runner; no real game mutation",
    status: results.some(r => r.status === "fail") ? "failed" : "partial",
    summary: Object.fromEntries(["pass", "fail", "not-run"].map(status => [status, results.filter(r => r.status === status).length])),
    operationalAcceptance: "not-established", native, results, artifactHashes,
  };
  atomicJson(path.join(runRoot, "report.json"), report);
  const rows = results.map(r => `| ${r.id} | ${r.category} | ${r.status} | ${(r.reason || JSON.stringify(r.observed)).replaceAll("|", "/").replaceAll("\n", " ")} |`);
  fs.writeFileSync(path.join(runRoot, "REPORT.vi.md"), [
    "# Báo cáo project nghiệm thu riêng", "", `Project: \`${project}\``,
    `Kết quả: ${report.summary.pass} pass / ${report.summary.fail} fail / ${report.summary["not-run"]} not-run. Model phụ: 0.`, "",
    "Các pass của runner là fixture được gọi tường minh; chưa chứng minh Extension phát event.",
    "Kiểm chứng đỏ/xanh là static project-inspect, không phải Unity Editor compile/test.", "",
    "| Test | Phạm vi | Kết quả | Bằng chứng/kết luận |", "|---|---|---|---|", ...rows, "",
    "Native delivery, semantic quality và rollout thực tế chưa được nghiệm thu toàn bộ.",
    "Xem report.json và artifacts/ để đối chiếu command, exit code, receipt và hash.", "",
  ].join("\n"));
  fs.writeFileSync(path.join(runRoot, "MANUAL-EXTENSION.vi.md"), [
    "# Phần cần thao tác Extension", "",
    "Lab đã cài unity-minimal và minimal hooks, recordReceipts=true. Không cần chạy setup của Planet Bunker.",
    "Đây là static Unity fixture không có gameplay/C#; không có Unity Editor nào được mở.", "",
    "1. Mở một cửa sổ VS Code riêng ở project dưới đây:", "", "```bash",
    `code -n '${project}'`, "```", "",
    "2. Trong terminal cùng môi trường Linux/Node đang dùng:", "", "```bash",
    `cd '${project}'`, `export PATH='${path.dirname(process.execPath)}':"$PATH"`, "codex", "```", "",
    "Review trust project khi Codex hỏi, rồi /hooks để xem/duyệt đúng 4 nhóm minimal.",
    "Command phải trỏ vào project lab này. Không dùng bypass hoặc sửa trusted hash.",
    "3. Thoát CLI, mở chat Extension mới trong đúng cửa sổ lab. Dùng prompt:", "", "```text",
    "Chỉ audit SessionStart của phiên Extension hiện tại. Không gọi runner/dispatch/app-server.",
    "Loại bỏ receipt có session_id bắt đầu explicit- vì đó là dữ liệu fixture trước đó.",
    "Đối chiếu session/event/timestamp với nguồn Extension khi có. Thiếu nguồn thì báo chưa đủ bằng chứng.",
    "Không gọi model phụ hoặc sửa project.", "```", "",
    "4. Sau đó dùng các bài PostToolUse/Interrupt trong docs/toolkit-evolution-test-prompts.vi.md của toolkit.",
    "Chỉ dùng project lab hiện tại; không chạy prompt setup Planet Bunker. Bài Stop/strict đổi policy cần review lại.",
    "Các chat bình thường vẫn tiêu token; tài liệu này không cấp quyền tự chạy benchmark/model phụ.", "",
  ].join("\n"));
  return { runRoot, report };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    for (let i = 0; i < args.length; i++) {
      if (args[i] === "--native-probe") options.nativeProbe = true;
      else if (args[i] === "--output" && args[i + 1]) options.output = args[++i];
      else throw Error(`Unknown option: ${args[i]}`);
    }
    const { runRoot, report } = await runAcceptanceLab(options);
    console.log(JSON.stringify({ runRoot, status: report.status, summary: report.summary, modelCalls: report.modelCalls }, null, 2));
    process.exitCode = report.summary.fail ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
