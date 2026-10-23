import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { CodexAppServer } from "../src/lib/codex-app-server.mjs";
import { hash, atomicJson } from "../src/lib/local-data.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const option = (key, fallback) =>
  args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const output = path.resolve(
  option("--output", path.join(root, ".dreamy/evaluations/skill-retention")),
);
const baseline = option(
  "--baseline",
  "21d4af56e5a757b2700d46909d279b07d9db099d",
);
if (!/^[a-f0-9]{40}$/.test(baseline))
  throw Error("--baseline requires a pinned full commit SHA");
const probes = {
  "unity-foundations": [
    {
      id: "assembly",
      prompt:
        "A Runtime asmdef depends on an Editor assembly to share a helper. Choose move-boundary or accept-runtime-editor.",
      expected: "move-boundary",
    },
    {
      id: "leaf",
      prompt:
        "A pooled projectile needs a service. Choose inject-explicitly or resolve-global-in-leaf.",
      expected: "inject-explicitly",
    },
    {
      id: "unknown-api",
      prompt:
        "Dreamy API support is unknown and package versions have not been inspected. Choose inspect-first or invent-api.",
      expected: "inspect-first",
    },
    {
      id: "negative-docs",
      prompt:
        "Only correct a README typo; no Unity/API claims change. Choose prose-only or require-unity-workflow.",
      expected: "prose-only",
    },
  ],
  "unity-testing": [
    {
      id: "logic",
      prompt:
        "Change a deterministic arithmetic helper with no Unity lifecycle. Choose pure-csharp or broad-playmode.",
      expected: "pure-csharp",
    },
    {
      id: "lifecycle",
      prompt:
        "A MonoBehaviour async callback duplicates events after pooled reuse. Choose playmode-cleanup or lint-only.",
      expected: "playmode-cleanup",
    },
    {
      id: "missing-unity",
      prompt:
        "C# changed; static checks pass, but Unity and its license are unavailable. Choose report-not-run-gap or claim-runtime-pass.",
      expected: "report-not-run-gap",
    },
    {
      id: "serialized",
      prompt:
        "A prefab serialized reference changes. Choose editmode-representative-assets or pure-math-only.",
      expected: "editmode-representative-assets",
    },
  ],
};
const specification = Object.entries(probes).flatMap(([skill, cases]) =>
  ["baseline", "compact"].map((variant) => {
    const relative = `skills/${skill}/SKILL.md`;
    let source;
    if (variant === "baseline") {
      const result = spawnSync("git", ["show", `${baseline}:${relative}`], {
        cwd: root,
        encoding: "utf8",
      });
      if (result.error || result.status !== 0)
        throw Error("Cannot read pinned baseline skill");
      source = result.stdout;
    } else source = fs.readFileSync(path.join(root, relative), "utf8");
    return {
      skill,
      variant,
      source,
      sourceHash: hash(source),
      sourceBytes: Buffer.byteLength(source),
      cases,
    };
  }),
);
if (!args.includes("--execute")) {
  console.log(
    JSON.stringify(
      {
        status: "not-run",
        modelCalls: 0,
        plannedModelCalls: specification.length,
        kind: "source-entry-retention-pilot",
        reason:
          "Pass --execute to run four bounded decision batches using the configured Codex model; this is not native-hook or release-quality evidence",
      },
      null,
      2,
    ),
  );
} else {
  if (fs.existsSync(output) && fs.readdirSync(output).length)
    throw Error("Output must be empty to avoid stale trial artifacts");
  fs.mkdirSync(output, { recursive: true });
  const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "dreamy retention "));
  const server = new CodexAppServer({
    cwd: workspace,
    args: [
      "--disable",
      "hooks",
      "--disable",
      "plugins",
      "--disable",
      "apps",
      "--disable",
      "multi_agent",
    ],
  });
  const report = {
    schemaVersion: 1,
    kind: "source-entry-retention-pilot",
    releaseEligible: false,
    baselineCommit: baseline,
    observedAt: new Date().toISOString(),
    trials: [],
    modelCalls: 0,
    limitations: [
      "One batch per skill/variant; decision probes do not establish coding success",
      "Entrypoint text only; no reference loading or native hook treatment",
      "Configured account/runtime are inherited; this is not the fully isolated B0-B4 cohort",
    ],
  };
  let activeTurnTimer;
  try {
    const runtime = await server.initialize();
    report.runtime = runtime.userAgent;
    const config = await server.request("config/read", {
      cwd: workspace,
      includeLayers: false,
    });
    report.model = option("--model", config.config.model);
    report.reasoning = config.config.model_reasoning_effort;
    const skills = await server.request("skills/list", {
      cwds: [workspace],
      forceReload: false,
    });
    const disabledSkills = (skills.data || [])
      .flatMap((v) => v.skills || [])
      .map((v) => ({ path: v.path, enabled: false }));
    const disabledMcp = Object.fromEntries(
      Object.keys(config.config.mcp_servers || {}).map((key) => [
        key,
        { enabled: false },
      ]),
    );
    for (const trial of specification) {
      const thread = await server.request("thread/start", {
        cwd: workspace,
        model: report.model,
        ephemeral: true,
        sandbox: "read-only",
        approvalPolicy: "never",
        baseInstructions:
          "Answer a bounded decision evaluation. Use only supplied skill text. Do not use tools, delegate, browse, or access files. Return the requested JSON only.",
        config: {
          project_doc_max_bytes: 0,
          mcp_servers: disabledMcp,
          skills: { config: disabledSkills },
        },
      });
      const threadId = thread.thread.id;
      const before = server.notifications.length;
      const completed = new Promise((resolve, reject) => {
        const timer = (activeTurnTimer = setTimeout(() => {
          server.onNotification = null;
          reject(Error("Bounded model turn exceeded 120 seconds"));
        }, 120000));
        server.onNotification = (msg) => {
          if (
            msg.method === "turn/completed" &&
            msg.params.threadId === threadId
          ) {
            clearTimeout(timer);
            server.onNotification = null;
            resolve(msg.params);
          }
        };
      });
      // Observe rejection immediately, including if turn/start itself fails.
      completed.catch(() => {});
      const prompt = JSON.stringify({
        skill: trial.source,
        cases: trial.cases.map(({ id, prompt }) => ({ id, prompt })),
      });
      report.modelCalls++;
      await server.request("turn/start", {
        threadId,
        input: [{ type: "text", text: prompt, text_elements: [] }],
        outputSchema: {
          type: "object",
          properties: {
            answers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  decision: { type: "string" },
                },
                required: ["id", "decision"],
                additionalProperties: false,
              },
            },
          },
          required: ["answers"],
          additionalProperties: false,
        },
      });
      const finish = await completed;
      const events = server.notifications
        .slice(before)
        .filter((v) => v.params?.threadId === threadId);
      const messages = events.filter(
        (v) =>
          v.method === "item/completed" &&
          v.params.item?.type === "agentMessage",
      );
      const text = messages.at(-1)?.params.item.text || "";
      let answer = null;
      try {
        answer = JSON.parse(text);
      } catch {}
      const checks = trial.cases.map((c) => ({
        id: c.id,
        expected: c.expected,
        actual: answer?.answers?.find((a) => a.id === c.id)?.decision || null,
      }));
      const unexpectedTools = events.filter(
        (v) =>
          v.method === "item/started" &&
          !["userMessage", "agentMessage", "reasoning", "plan"].includes(
            v.params.item?.type,
          ),
      );
      const usage =
        events.findLast((v) => v.method === "thread/tokenUsage/updated")?.params
          .tokenUsage?.total || null;
      const result = {
        skill: trial.skill,
        variant: trial.variant,
        sourceHash: trial.sourceHash,
        sourceBytes: trial.sourceBytes,
        promptBytes: Buffer.byteLength(prompt),
        model: thread.model,
        threadId,
        status:
          finish.turn.status === "completed" &&
          !unexpectedTools.length &&
          checks.every((c) => c.actual === c.expected)
            ? "pass"
            : "fail",
        checks,
        usage,
        usageMeasurement: usage ? "measured-runtime" : "unavailable",
        unexpectedTools: unexpectedTools.length,
      };
      atomicJson(path.join(output, `${trial.skill}-${trial.variant}.json`), {
        ...result,
        events,
      });
      report.trials.push(result);
      atomicJson(path.join(output, "report.json"), report);
      console.log(`${trial.skill}/${trial.variant}: ${result.status}`);
    }
    report.status = report.trials.every((v) => v.status === "pass")
      ? "pass"
      : "fail";
    if (report.status !== "pass") process.exitCode = 1;
  } catch (error) {
    report.status = "incomplete";
    report.reason = error.message;
    process.exitCode = 2;
  } finally {
    clearTimeout(activeTurnTimer);
    server.close();
    fs.rmSync(workspace, { recursive: true, force: true });
    atomicJson(path.join(output, "report.json"), report);
    console.log(
      JSON.stringify({
        status: report.status,
        modelCalls: report.modelCalls,
        report: path.join(output, "report.json"),
      }),
    );
  }
}
