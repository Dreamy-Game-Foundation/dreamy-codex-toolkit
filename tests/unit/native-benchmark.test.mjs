import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { atomicJson, hash, readJson } from "../../src/lib/local-data.mjs";
import {
  authorizeNativeTrial,
  consumeTrialBudget,
  runNativeDecisionTrial,
  snapshotTrialAdditions,
} from "../../src/benchmark-native.mjs";
import { prepareNativeBenchmark } from "../../scripts/prepare-native-benchmark.mjs";

function fixture(t, treatment = "B0") {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), "dreamy native decisions ")),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const prompt =
    "Choose quick/none for a typo-only documentation task. Return JSON mode and decision.";
  const context = {
    schemaVersion: 1,
    treatment,
    caseId: "docs",
    repetition: 1,
    purpose: "development",
    query: prompt,
    manifestHash: hash("manifest"),
  };
  const trial = {
    treatment,
    caseId: "docs",
    repetition: 1,
    manifestHash: context.manifestHash,
    promptHash: hash(prompt),
    contextHash: hash(JSON.stringify(context)),
    additionsHash: hash(
      JSON.stringify(snapshotTrialAdditions(root, context, null)),
    ),
  };
  const plan = {
    schemaVersion: 1,
    kind: "native-benchmark-authorization",
    approved: true,
    projectRoot: root,
    model: "fixture-model",
    reasoning: "low",
    maxModelTurns: 1,
    candidateId: null,
    trials: [trial],
  };
  const planFile = path.join(root, "authorization.json"),
    promptFile = path.join(root, "prompt.md"),
    contextFile = path.join(root, "trial-context.json"),
    outputFile = path.join(root, "output.md");
  atomicJson(planFile, plan);
  atomicJson(contextFile, context);
  fs.writeFileSync(promptFile, prompt);
  return {
    root,
    prompt,
    context,
    plan,
    planFile,
    promptFile,
    contextFile,
    outputFile,
    execute: "1",
  };
}
function runtime(root, { native = false, tool = false, usage = true } = {}) {
  const server = {
    notifications: [],
    methods: [],
    closed: false,
    initialize: async () => ({ userAgent: "unit-fixture-not-native-evidence" }),
    close() {
      this.closed = true;
    },
    async request(method, params) {
      this.methods.push({ method, params });
      if (method === "config/read")
        return { config: { mcp_servers: { unrelated: {} } } };
      if (method === "skills/list")
        return {
          data: [
            { skills: [{ path: path.join(root, "external-skill/SKILL.md") }] },
          ],
        };
      if (method === "thread/start") {
        if (native)
          this.notifications.push({
            method: "hook/completed",
            params: {
              threadId: "thread",
              run: {
                sourcePath: path.join(root, ".codex/hooks.json"),
                eventName: "sessionStart",
                status: "completed",
                durationMs: 1,
              },
            },
          });
        return { model: "fixture-model", thread: { id: "thread" } };
      }
      if (method === "turn/start") {
        queueMicrotask(() => {
          const emit = (event) => {
            this.notifications.push(event);
            this.onNotification?.(event);
          };
          if (tool)
            emit({
              method: "item/started",
              params: {
                threadId: "thread",
                item: { type: "commandExecution" },
              },
            });
          emit({
            method: "item/completed",
            params: {
              threadId: "thread",
              item: {
                type: "agentMessage",
                text: '{"mode":"quick","decision":"none"}',
              },
            },
          });
          if (usage)
            emit({
              method: "thread/tokenUsage/updated",
              params: {
                threadId: "thread",
                tokenUsage: {
                  total: {
                    inputTokens: 100,
                    cachedInputTokens: 0,
                    outputTokens: 10,
                    reasoningOutputTokens: 0,
                    totalTokens: 110,
                  },
                },
              },
            });
          emit({
            method: "turn/completed",
            params: { threadId: "thread", turn: { status: "completed" } },
          });
        });
        return { turn: { id: "turn" } };
      }
      if (method === "turn/interrupt") return {};
      throw Error("Unexpected fixture request " + method);
    },
  };
  return server;
}
const ready = async () => ({
  trust: "trusted",
  errors: [],
  profile: "minimal",
  foreignTrustedHooks: [],
});

test("native adapter requires explicit consent and exact prompt/context before any runtime starts", async (t) => {
  const f = fixture(t);
  assert.throws(
    () => authorizeNativeTrial(f.planFile, f.prompt, f.context, "0"),
    /execution is off/,
  );
  assert.throws(
    () =>
      authorizeNativeTrial(f.planFile, f.prompt + "changed", f.context, "1"),
    /differ/,
  );
  let created = false;
  const result = await runNativeDecisionTrial({
    ...f,
    execute: "0",
    clientFactory: () => {
      created = true;
    },
  });
  assert.equal(result.status, "not-run");
  assert.equal(result.modelTurns, 0);
  assert.equal(created, false);
  assert.equal(fs.existsSync(f.outputFile), false);
});
test("model-turn ledger prevents replay across new output attempts", (t) => {
  const f = fixture(t),
    authorization = authorizeNativeTrial(f.planFile, f.prompt, f.context, "1");
  assert.equal(consumeTrialBudget(f.planFile, authorization).consumed, 1);
  assert.throws(
    () => consumeTrialBudget(f.planFile, authorization),
    /exhausted|already/,
  );
  const revoked = fixture(t),
    old = authorizeNativeTrial(
      revoked.planFile,
      revoked.prompt,
      revoked.context,
      "1",
    );
  atomicJson(revoked.planFile, { ...revoked.plan, approved: false });
  assert.throws(() => consumeTrialBudget(revoked.planFile, old), /revoked/);
});
test("B0 executes an ephemeral controlled turn and preserves measured usage", async (t) => {
  const f = fixture(t),
    server = runtime(f.root);
  const result = await runNativeDecisionTrial({
    ...f,
    clientFactory: () => server,
  });
  assert.equal(result.status, "complete");
  assert.equal(result.receipt.trust, "hooks-disabled");
  assert.equal(result.receipt.usage.inputTokens, 100);
  assert.equal(server.closed, true);
  const thread = server.methods.find((v) => v.method === "thread/start").params;
  assert.equal(thread.ephemeral, true);
  assert.equal(thread.approvalPolicy, "never");
  assert.equal(thread.config.project_doc_max_bytes, 0);
  assert.equal(thread.config.mcp_servers.unrelated.enabled, false);
  assert.equal(thread.config.skills.config[0].enabled, false);
  const replay = await runNativeDecisionTrial({
    ...f,
    clientFactory: () => runtime(f.root),
  });
  assert.equal(replay.status, "not-run");
  assert.match(replay.reason, /exhausted|already/);
});
test("B2 requires native delivery and refuses trust or foreign-hook failures before model", async (t) => {
  const f = fixture(t, "B2");
  let created = false;
  const untrusted = await runNativeDecisionTrial({
    ...f,
    probe: async () => ({
      trust: "requires-native-review",
      errors: [],
      profile: "minimal",
    }),
    clientFactory: () => {
      created = true;
    },
  });
  assert.equal(untrusted.status, "not-run");
  assert.equal(created, false);
  const foreign = await runNativeDecisionTrial({
    ...f,
    probe: async () => ({ ...(await ready()), foreignTrustedHooks: [{}] }),
    clientFactory: () => {
      created = true;
    },
  });
  assert.equal(foreign.status, "not-run");
  assert.equal(created, false);
  const server = runtime(f.root);
  const noDelivery = await runNativeDecisionTrial({
    ...f,
    probe: ready,
    clientFactory: () => server,
    hookTimeoutMs: 1,
  });
  assert.equal(noDelivery.status, "not-run");
  assert.equal(
    server.methods.some((v) => v.method === "turn/start"),
    false,
  );
  const delivered = await runNativeDecisionTrial({
    ...f,
    probe: ready,
    clientFactory: () => runtime(f.root, { native: true }),
  });
  assert.equal(delivered.status, "complete");
  assert.equal(delivered.receipt.nativeEvents[0].eventName, "sessionStart");
});
test("a blocked native member prevents wasting a baseline turn in the same plan", async (t) => {
  const f = fixture(t);
  f.plan.maxModelTurns = 2;
  f.plan.trials.push({ ...f.plan.trials[0], treatment: "B2" });
  atomicJson(f.planFile, f.plan);
  let created = false;
  const result = await runNativeDecisionTrial({
    ...f,
    probe: async () => ({
      trust: "requires-native-review",
      errors: [],
      profile: "minimal",
    }),
    clientFactory: () => {
      created = true;
    },
  });
  assert.equal(result.status, "not-run");
  assert.equal(result.modelTurns, 0);
  assert.equal(created, false);
  const changed = fixture(t, "B2");
  atomicJson(path.join(changed.root, ".codex/hooks.json"), { hooks: {} });
  const drift = await runNativeDecisionTrial({
    ...changed,
    probe: ready,
    clientFactory: () => {
      created = true;
    },
  });
  assert.equal(drift.status, "not-run");
  assert.match(drift.reason, /changed/);
  assert.equal(created, false);
});
test("unexpected tool calls fail an attempted decision trial; missing usage stays unavailable", async (t) => {
  const f = fixture(t);
  const result = await runNativeDecisionTrial({
    ...f,
    clientFactory: () => runtime(f.root, { tool: true }),
  });
  assert.equal(result.status, "fail");
  assert.equal(result.modelTurns, 1);
  assert.equal(fs.existsSync(f.outputFile), false);
  const other = fixture(t);
  const unavailable = await runNativeDecisionTrial({
    ...other,
    clientFactory: () => runtime(other.root, { usage: false }),
  });
  assert.equal(unavailable.status, "complete");
  assert.equal(unavailable.receipt.usage, null);
  assert.equal(
    fs.readFileSync(path.join(other.root, "codex-events.jsonl"), "utf8"),
    "",
  );
});
test("native preparation creates reviewable prompts without invoking the configured adapter", (t) => {
  const f = fixture(t);
  const casesFile = path.join(f.root, "cases.json"),
    manifest = path.join(f.root, "manifest.json");
  atomicJson(casesFile, {
    cases: [{ id: "docs", prompt: f.prompt, expected: [] }],
  });
  atomicJson(manifest, {
    purpose: "development",
    repetitions: 1,
    adapter: { executable: "MUST-NOT-EXECUTE" },
    caseFiles: ["cases.json"],
    treatments: [{ id: "B0", sources: [] }],
  });
  const prepared = prepareNativeBenchmark({
    manifest,
    output: path.join(f.root, "prepared"),
    project: f.root,
    model: "fixture-model",
    maxTurns: 1,
  });
  assert.equal(prepared.modelCalls, 0);
  const plan = readJson(prepared.authorizationPlan);
  assert.equal(plan.approved, false);
  assert.equal(plan.trials.length, 1);
  assert.equal(
    plan.trials[0].promptHash,
    hash(
      fs.readFileSync(path.join(f.root, "prepared", plan.trials[0].promptPath)),
    ),
  );
  const source = readJson(manifest);
  source.repetitions = 2;
  atomicJson(manifest, source);
  assert.throws(
    () =>
      prepareNativeBenchmark({
        manifest,
        output: path.join(f.root, "too-many"),
        project: f.root,
        model: "fixture-model",
        maxTurns: 1,
      }),
    /Selected 2 trials/,
  );
  source.repetitions = 1;
  source.treatments[0].sources = [{ root: "repo", paths: ["does-not-exist"] }];
  atomicJson(manifest, source);
  assert.throws(
    () =>
      prepareNativeBenchmark({
        manifest,
        output: path.join(f.root, "missing-source"),
        project: f.root,
        model: "fixture-model",
        maxTurns: 1,
      }),
    /does not exist/,
  );
});
