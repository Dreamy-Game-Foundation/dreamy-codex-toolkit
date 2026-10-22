import fs from "node:fs";
import path from "node:path";
import { CodexAppServer } from "../lib/codex-app-server.mjs";
import { waitForHook } from "../lib/native-events.mjs";
import { hooksDoctor } from "./install.mjs";
import { readJson, inside } from "../lib/local-data.mjs";

// Discovery is read-only and makes zero model requests. Trust is reported by Codex, never inferred from local receipts.
export async function probeNativeHooks(root, { client } = {}) {
  root = fs.realpathSync(root);
  const doctor = hooksDoctor(root);
  const configPath = inside(root, ".codex/hooks.json");
  const state = readJson(inside(root, ".dreamy-codex/hooks-state.json"));
  const expected = Object.keys(state?.entries || {});
  const server = client || new CodexAppServer({ cwd: root });
  try {
    const runtime = await server.initialize();
    const result = await server.request("hooks/list", { cwds: [root] });
    const effective = await server.request("config/read", {
      cwd: root,
      includeLayers: true,
    });
    const projectLayers = (effective.layers || []).filter(
      (v) => v.name?.type === "project" || v.source?.type === "project",
    );
    const entry = result.data?.find((v) => path.resolve(v.cwd) === root);
    if (!entry || !Array.isArray(entry.hooks))
      throw Error("Malformed hooks/list response");
    const owned = entry.hooks.filter(
      (h) =>
        path.resolve(h.sourcePath) === configPath &&
        Object.values(state?.entries || {}).some((g) =>
          g.hooks.some((v) => v.command === h.command),
        ),
    );
    const foundEvents = new Set(owned.map((h) => h.eventName.toLowerCase()));
    const allFound =
      expected.length > 0 &&
      expected.every((e) => foundEvents.has(e.toLowerCase()));
    const trusted =
      allFound &&
      owned.every(
        (h) => h.enabled && ["trusted", "managed"].includes(h.trustStatus),
      );
    return {
      ...doctor,
      surface: "app-server",
      probeStatus: "observed",
      runtimeUserAgent: runtime.userAgent,
      trust: !owned.length
        ? "not-discovered"
        : trusted
          ? "trusted"
          : "requires-native-review",
      discovery: allFound ? "complete" : "incomplete",
      hooks: owned.map(({ eventName, enabled, trustStatus, currentHash }) => ({
        eventName,
        enabled,
        trustStatus,
        currentHash,
      })),
      foreignTrustedHooks: entry.hooks
        .filter(
          (h) =>
            !owned.includes(h) &&
            h.enabled &&
            ["trusted", "managed"].includes(h.trustStatus),
        )
        .map(({ eventName, source, sourcePath }) => ({
          eventName,
          source,
          sourcePath,
        })),
      errors: [...doctor.errors, ...(entry.errors || []).map((e) => e.message)],
      warnings: entry.warnings || [],
      projectLayerWarnings: projectLayers
        .map((v) => v.disabledReason)
        .filter(Boolean),
      hooksFeature: effective.config?.features?.hooks ?? "runtime-default",
      modelCalls: 0,
      operational: false,
      reason: trusted
        ? "Definitions are trusted; actual lifecycle delivery still requires a native session smoke"
        : "Review the installed project and exact definitions in Codex /hooks, then rerun this probe",
    };
  } catch (error) {
    return {
      ...doctor,
      surface: "app-server",
      probeStatus: "unavailable",
      modelCalls: 0,
      reason: error.message,
    };
  } finally {
    server.close();
  }
}

// SessionStart is the only lifecycle this smoke can exercise without a model turn.
export async function smokeNativeHooks(root) {
  const discovery = await probeNativeHooks(root);
  if (
    discovery.trust !== "trusted" ||
    discovery.errors.length ||
    discovery.foreignTrustedHooks?.length
  )
    return {
      schemaVersion: 1,
      kind: "native-hook-smoke",
      status: "not-run",
      discovery,
      modelCalls: 0,
      reason: discovery.foreignTrustedHooks?.length
        ? "Other enabled trusted hooks could affect this smoke; review the foreignTrustedHooks list before testing in an isolated consumer"
        : discovery.reason,
    };
  const server = new CodexAppServer({ cwd: root });
  try {
    await server.initialize();
    const started = await server.request("thread/start", {
      cwd: fs.realpathSync(root),
      ephemeral: true,
      sandbox: "read-only",
      approvalPolicy: "never",
    });
    const runs = await waitForHook(
      server,
      started.thread.id,
      path.join(fs.realpathSync(root), ".codex/hooks.json"),
    );
    const session = runs.find((v) => v.eventName === "sessionStart");
    return {
      schemaVersion: 1,
      kind: "native-hook-smoke",
      status: session?.status === "completed" ? "pass" : "not-run",
      runtime: discovery.runtimeUserAgent,
      threadId: started.thread.id,
      modelCalls: 0,
      operational: false,
      events: { SessionStart: session?.status || "not-observed" },
      runs,
      reason:
        "This smoke proves only observed SessionStart delivery; tool/compact/interrupt/Stop require separate real lifecycle trials",
    };
  } catch (error) {
    return {
      schemaVersion: 1,
      kind: "native-hook-smoke",
      status: "not-run",
      modelCalls: 0,
      reason: error.message,
    };
  } finally {
    server.close();
  }
}
