import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  hash,
  inside,
  readJson,
  atomicJson,
  atomicText,
  withLock,
} from "../lib/local-data.mjs";
import { resolvePolicy, events, profiles } from "./policy.mjs";
function paths(root) {
  return {
    journal: inside(root, ".dreamy-codex/hooks-transaction.json"),
    backup: inside(root, ".dreamy-codex/hooks-runtime-backup"),
    config: inside(root, ".codex/hooks.json"),
    state: inside(root, ".dreamy-codex/hooks-state.json"),
    runtime: inside(root, ".dreamy-codex/hooks-runtime"),
    policy: inside(root, ".dreamy-codex/hook-policy.json"),
  };
}
const runtimeSources = [
  "hooks",
  "src/hooks",
  "src/knowledge",
  "src/lib",
  "src/verification-plan.mjs",
];
function treeHash(root, sources = [""]) {
  const parts = [];
  function walk(dir) {
    for (const f of fs.readdirSync(dir).sort()) {
      const full = inside(root, path.relative(root, path.join(dir, f)));
      visit(full);
    }
  }
  function visit(full) {
    if (fs.statSync(full).isDirectory()) walk(full);
    else
      parts.push([
        path.relative(root, full).replaceAll("\\", "/"),
        hash(fs.readFileSync(full)),
      ]);
  }
  for (const relative of sources) visit(inside(root, relative));
  parts.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return hash(JSON.stringify(parts));
}
function quotePosix(s) {
  return `'${s.replaceAll("'", "'\\''")}'`;
}
function quoteWindows(s) {
  if (/["%\r\n]/.test(s))
    throw Error("Unsupported character in Windows hook command path");
  return `"${s}"`;
}
function nativeCommand(root, p, revision, policyRevision) {
  const q = process.platform === "win32" ? quoteWindows : quotePosix;
  return [
    process.execPath,
    path.join(p.runtime, "src/hooks/runner.mjs"),
    "--root",
    root,
    "--policy",
    p.policy,
    "--runtime-revision",
    revision,
    "--policy-revision",
    policyRevision,
  ]
    .map(q)
    .join(" ");
}
function subtractOwned(config, state) {
  const result = structuredClone(config);
  result.hooks ??= {};
  for (const [event, group] of Object.entries(state?.entries || {})) {
    const list = result.hooks[event] || [];
    const found = list.findIndex(
      (v) => JSON.stringify(v) === JSON.stringify(group),
    );
    if (found < 0)
      throw Error(
        `Owned hook drift: ${event}; inspect config before removing or updating`,
      );
    list.splice(found, 1);
    if (!list.length) delete result.hooks[event];
  }
  return result;
}
export function configureHooks(
  toolkitRoot,
  root,
  {
    profile = "minimal",
    disabled = [],
    dryRun = false,
    recordReceipts = false,
    ...limits
  } = {},
) {
  root = fs.realpathSync(root);
  const p = paths(root),
    policy = {
      ...resolvePolicy({ ...limits, profile, disabled, recordReceipts }),
      root,
      recordReceipts,
    },
    old = readJson(p.state),
    config = readJson(p.config, { hooks: {} });
  if (old && old.schemaVersion !== 1)
    throw Error("Unsupported hook install state version");
  if (
    config.hooks &&
    Object.values(config.hooks).some((v) => !Array.isArray(v))
  )
    throw Error("Invalid existing native hooks config");
  if (
    old &&
    fs.existsSync(p.runtime) &&
    treeHash(p.runtime) !== old.runtimeHash
  )
    throw Error(
      "Installed hook runtime drift; preserve edits before reconfiguring",
    );
  if (fs.existsSync(p.journal))
    throw Error("Interrupted hook transaction; run hooks recover first");
  const next = subtractOwned(config, old),
    entries = {},
    revision = profile === "off" ? null : treeHash(toolkitRoot, runtimeSources);
  if (profile !== "off")
    for (const [event, ids] of Object.entries(events)) {
      if (
        !ids.some(
          (id) => profiles[profile].includes(id) && !disabled.includes(id),
        )
      )
        continue;
      const group = {
        hooks: [
          {
            type: "command",
            command: nativeCommand(
              root,
              p,
              revision,
              hash(JSON.stringify(policy)),
            ),
            timeout: event === "Interrupt" ? 1 : 5,
            ...(["SessionStart"].includes(event)
              ? { additionalContextLimit: 200 }
              : {}),
          },
        ],
      };
      if (["PostToolUse", "PreToolUse"].includes(event))
        group.matcher =
          event === "PreToolUse" ? "^apply_patch$" : "Bash|apply_patch";
      next.hooks[event] ??= [];
      next.hooks[event].push(group);
      entries[event] = group;
    }
  if (dryRun)
    return {
      status: "planned",
      profile,
      before: config,
      after: next,
      trust: "requires-native-review",
      operational: false,
    };
  return withLock(`${p.state}.lock`, () => {
    // Recheck after acquiring lock rather than overwrite a concurrent configuration change.
    if (
      JSON.stringify(readJson(p.config, { hooks: {} })) !==
      JSON.stringify(config)
    )
      throw Error("Hook config changed concurrently");
    if (fs.existsSync(p.config) && !fs.existsSync(`${p.config}.dreamy-backup`))
      fs.copyFileSync(p.config, `${p.config}.dreamy-backup`);
    const originalText =
      old?.originalText ??
      (fs.existsSync(p.config) ? fs.readFileSync(p.config, "utf8") : null);
    if (profile === "off") {
      if (
        originalText &&
        JSON.stringify(JSON.parse(originalText)) === JSON.stringify(next)
      )
        atomicText(p.config, originalText);
      else atomicJson(p.config, next);
      fs.rmSync(p.runtime, { recursive: true, force: true });
      fs.rmSync(p.state, { force: true });
      fs.rmSync(p.policy, { force: true });
    } else {
      // Stage before switching the native definition; user hooks are untouched.
      const stage = inside(root, `.dreamy-codex/hooks-stage-${process.pid}`);
      fs.rmSync(stage, { recursive: true, force: true });
      for (const relative of runtimeSources) {
        const dest = inside(stage, relative);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.cpSync(path.join(toolkitRoot, relative), dest, { recursive: true });
      }
      if (treeHash(stage) !== revision) {
        fs.rmSync(stage, { recursive: true, force: true });
        throw Error(
          "Hook runtime source changed while staging; retry configuration",
        );
      }
      atomicJson(p.journal, {
        schemaVersion: 1,
        oldConfig: config,
        nextConfig: next,
        oldText: fs.existsSync(p.config)
          ? fs.readFileSync(p.config, "utf8")
          : null,
        oldState: old,
        oldPolicy: readJson(p.policy),
        hadRuntime: fs.existsSync(p.runtime),
      });
      try {
        if (fs.existsSync(p.runtime)) fs.renameSync(p.runtime, p.backup);
        fs.renameSync(stage, p.runtime);
        atomicJson(p.policy, policy);
        atomicJson(p.config, next);
        atomicJson(p.state, {
          schemaVersion: 1,
          entries,
          runtimeHash: treeHash(p.runtime),
          profile,
          configPath: p.config,
          originalText,
        });
        atomicJson(p.journal, { ...readJson(p.journal), committed: true });
        fs.rmSync(p.backup, { recursive: true, force: true });
        fs.rmSync(p.journal, { force: true });
      } catch (error) {
        recoverHooks(root);
        throw error;
      }
    }
    return {
      status: "configured",
      profile,
      trust: "requires-native-review",
      operational: false,
    };
  });
}
export function removeHooks(root) {
  const p = paths(root);
  if (fs.existsSync(p.journal))
    throw Error(
      "Interrupted hook transaction; run hooks recover before uninstall",
    );
  if (!fs.existsSync(p.state)) return;
  configureHooks("", root, { profile: "off" });
}
export function hooksDoctor(root) {
  const p = paths(root),
    state = readJson(p.state);
  const version = spawnSync("codex", ["--version"], {
    encoding: "utf8",
    timeout: 3000,
  });
  const errors = [];
  if (fs.existsSync(p.journal)) errors.push("interrupted-transaction");
  if (state) {
    try {
      subtractOwned(readJson(p.config, { hooks: {} }), state);
      if (
        !fs.existsSync(p.runtime) ||
        treeHash(p.runtime) !== state.runtimeHash
      )
        errors.push("runtime-drift");
    } catch (e) {
      errors.push(e.message);
    }
  }
  return {
    schemaVersion: 1,
    runtime: "codex",
    version: version.status === 0 ? version.stdout.trim() : null,
    surface: "cli",
    configuration: state ? "detected" : "not-installed",
    profile: state?.profile || "off",
    trust: "unknown",
    operational: false,
    events: Object.fromEntries(
      Object.keys(state?.entries || {}).map((e) => [e, "not-probed"]),
    ),
    fallback: "explicit-cli",
    errors,
    reason:
      "Native trust and actual event delivery require runtime review; fixture invocation is not a native smoke result",
  };
}

export function recoverHooks(root) {
  const p = paths(root),
    j = readJson(p.journal);
  if (!j) return { status: "ok", alreadyRecovered: true };
  if (j.committed) {
    fs.rmSync(p.backup, { recursive: true, force: true });
    fs.rmSync(p.journal, { force: true });
    return { status: "recovered-committed" };
  }
  const current = readJson(p.config, { hooks: {} });
  if (
    JSON.stringify(current) !== JSON.stringify(j.oldConfig) &&
    JSON.stringify(current) !== JSON.stringify(j.nextConfig)
  )
    throw Error(
      "Hook config changed after interruption; manual recovery required",
    );
  if (j.hadRuntime && fs.existsSync(p.backup)) {
    fs.rmSync(p.runtime, { recursive: true, force: true });
    fs.renameSync(p.backup, p.runtime);
  } else if (!j.hadRuntime)
    fs.rmSync(p.runtime, { recursive: true, force: true });
  if (j.oldText !== null) atomicText(p.config, j.oldText);
  else fs.rmSync(p.config, { force: true });
  for (const [file, value] of [
    [p.state, j.oldState],
    [p.policy, j.oldPolicy],
  ]) {
    if (value) atomicJson(file, value);
    else fs.rmSync(file, { force: true });
  }
  fs.rmSync(p.journal, { force: true });
  return { status: "recovered" };
}
