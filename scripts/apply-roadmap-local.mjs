import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function write(relativePath, text) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
  fs.writeFileSync(path.join(root, relativePath), text);
}

const dependencies = {
  foundation: [],
  "unity-core": ["foundation"],
  "unity-gameplay": ["foundation", "unity-core"],
  "unity-rendering": ["foundation", "unity-core"],
  "game-systems": ["foundation"],
  mobile: ["foundation", "unity-core"],
  production: ["foundation"],
  "dreamy-foundation": ["foundation"],
  "dreamy-packages": ["dreamy-foundation"],
  dreamy: ["foundation"]
};

for (const [id, deps] of Object.entries(dependencies)) {
  const file = `modules/${id}/module.json`;
  if (!fs.existsSync(path.join(root, file))) continue;
  const json = readJson(file);
  json.dependencies = deps;
  writeJson(file, json);
}

const renderingSkills = {
  "unity-rendering": "frame rendering ownership, render pipeline choice, batching, overdraw, lighting, and platform budget",
  "unity-urp": "URP renderer assets, quality levels, renderer features, post-processing, camera stacking, and mobile tradeoffs",
  "unity-shader": "Shader Graph, HLSL, variants, keywords, precision, transparency, batching, and build size",
  "unity-material": "materials, shared material mutation safety, instancing, property blocks, atlases, and runtime tinting",
  "unity-vfx": "VFX ownership, spawn lifetime, pooling, GPU cost, feedback events, and platform fallback",
  "unity-particles": "ParticleSystem modules, pooling, overdraw, collision cost, sub emitters, and mobile budgets",
  "unity-navigation": "NavMesh, agents, obstacles, links, runtime baking boundaries, and AI path cost",
  "unity-cinemachine": "Cinemachine cameras, virtual camera priority, blends, confiners, shake, and aspect handling"
};

for (const [name, topic] of Object.entries(renderingSkills)) {
  write(`skills/${name}/SKILL.md`, `---
name: ${name}
description: Use for Unity ${topic}.
---

# ${name.replace(/^unity-/, "Unity ")}

## Purpose

Guide ${topic} with explicit ownership, measurable performance, mobile constraints, and safe Unity asset handling.

## When To Use

- The task changes rendering, visuals, navigation presentation, camera composition, or graphics performance.
- The implementation needs a Unity-specific tradeoff between quality, memory, build size, and frame time.
- A mobile build or production preset needs graphics behavior verified.

## When Not To Use

- The task is purely gameplay state with no visual/runtime rendering impact.
- A narrower Dreamy package skill owns the behavior.
- The request only edits docs or release metadata.

## Required Inspection

- Project AGENTS.md, render pipeline assets, quality settings, scenes, prefabs, materials, shaders, and relevant asmdefs.
- Packages/manifest.json and Packages/packages-lock.json for render pipeline, Cinemachine, or navigation packages.
- Existing profiling evidence before claiming an optimization.

## Decision Tree

1. Is there an existing project rendering convention? Follow it.
2. Is the issue quality, CPU, GPU, memory, build size, or workflow? Optimize the right budget.
3. Can the change be verified statically? Use static validation; otherwise require Unity harness evidence.
4. Is the claim unverified on device? Mark it as a risk.

## Workflow

1. Inspect assets and owners before editing serialized data.
2. Identify the runtime owner, authoring asset, and platform budget.
3. Make the smallest change that preserves references and existing quality tiers.
4. Avoid hidden global material, shader keyword, or camera priority side effects.
5. Run validation, harness, or document the missing Unity gate.

## Architecture Rules

- Do not mutate shared materials at runtime unless that is the intended global effect.
- Keep visual feedback from owning gameplay state.
- Prefer measured profiling evidence over guessed optimization.
- Keep mobile memory, overdraw, and shader variant cost visible.

## Common Failure Modes

- Broken serialized references or missing render pipeline assets.
- Runtime changes to shared assets that leak across instances.
- Unbounded VFX/particle spawn cost.
- Camera or navigation ownership hidden in leaf gameplay objects.

## Verification

- Static diff review plus compile/console/profile/harness evidence when available.
- For mobile-sensitive changes, record before/after budget or explicit not-run reason.

## Allowed Claims

Only claim package support when present in Packages/manifest.json or verified compatibility metadata.

## References

- rules/unity
- docs/harness.md
- compatibility/third-party.json
`);
}

const renderingModule = readJson("modules/unity-rendering/module.json");
renderingModule.content = Object.keys(renderingSkills).map((name) => `skills/${name}`);
writeJson("modules/unity-rendering/module.json", renderingModule);

for (const file of fs.readdirSync(path.join(root, "agents", "codex")).filter((name) => name.endsWith(".toml"))) {
  const full = path.join(root, "agents", "codex", file);
  let text = fs.readFileSync(full, "utf8");
  if (!/^name\s*=/m.test(text)) {
    const name = file.replace(/\.toml$/, "").replaceAll("-", "_");
    text = `name = "${name}"\n${text}`;
    fs.writeFileSync(full, text);
  }
}

const toolkit = readJson("toolkit.json");
toolkit.version = "0.1.0-alpha.2";
toolkit.maturity = {
  ...toolkit.maturity,
  installer: "alpha.2-native-paths",
  agents: "alpha.2-native-schema",
  doctor: "alpha.2-diagnostics",
  evals: "alpha.2-static-runner",
  compatibility: "alpha.2-drift-report"
};
writeJson("toolkit.json", toolkit);

const pkg = readJson("package.json");
pkg.version = "0.1.0-alpha.2";
pkg.scripts["pack:smoke"] = "node scripts/pack-smoke.mjs";
writeJson("package.json", pkg);

const evals = readJson("evals/catalog.json");
const extraCases = [
  ["system-iap-pending-retry", "systems", "IAP pending transaction receives duplicate callback", ["deduplicate by transaction id"], ["grant reward twice"]],
  ["system-ads-reward-callback", "systems", "Rewarded ad callback fires after scene changed", ["route reward through idempotent service"], ["grant from ad button directly"]],
  ["system-remote-config-fallback", "systems", "Remote config fetch fails on cold start", ["use local defaults and safe parsing"], ["block the game without fallback"]],
  ["system-settings-runtime-apply", "systems", "Graphics setting saved but not applied until restart", ["separate persisted preference and runtime apply"], ["save alone changes runtime"]],
  ["system-shop-catalog-availability", "systems", "Shop offer hidden in UI but still purchasable", ["validate availability in transaction service"], ["UI visibility is enough"]],
  ["system-analytics-pii", "systems", "Analytics event includes raw user email", ["remove PII and use taxonomy"], ["send raw email to analytics"]],
  ["system-gacha-pity", "systems", "Gacha pity counter resets before grant commit", ["commit grant and pity transaction atomically"], ["UI reveal owns pity"]],
  ["system-battle-pass-migration", "systems", "Battle pass season changes with unclaimed rewards", ["define migration/expiry claim behavior"], ["ignore old season claims"]],
  ["system-daily-reward-timezone", "systems", "Daily reward streak changes when timezone changes", ["define time source and timezone policy"], ["device timezone is authoritative"]],
  ["rendering-shared-material", "rendering", "Runtime tint changes shared material on all enemies", ["use material property block or instance intentionally"], ["shared material mutation is local"]],
  ["rendering-shader-variants", "rendering", "New shader keywords explode mobile build variants", ["track keywords and strip policy"], ["shader variants do not affect build"]],
  ["rendering-vfx-pool", "rendering", "Hit VFX instantiates every frame on mobile", ["pool and cap VFX spawn"], ["instantiate is always fine"]],
  ["rendering-camera-priority", "rendering", "Two virtual cameras fight for the same priority", ["define camera owner and priority/blend"], ["priority conflicts do not matter"]],
  ["rendering-navmesh-runtime", "rendering", "Enemy recalculates expensive paths every Update", ["budget navigation tick and cache target"], ["pathfinding every frame is free"]]
];
const byId = new Set((evals.cases ?? []).map((entry) => entry.id));
for (const [id, category, prompt, expected, forbiddenClaims] of extraCases) {
  if (!byId.has(id)) evals.cases.push({ id, category, prompt, expected, forbiddenClaims, scoreThreshold: 0.8 });
}
writeJson("evals/catalog.json", evals);

const index = [];
function walkSkills(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    const skill = path.join(full, "SKILL.md");
    if (fs.existsSync(skill)) {
      const rel = path.relative(root, skill).replaceAll("\\", "/");
      const text = fs.readFileSync(skill, "utf8");
      const name = text.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? entry.name;
      const parts = rel.split("/");
      const category = parts[1] === "platform" || parts[1] === "production" || parts[1] === "systems" || parts[1] === "gameplay" || parts[1] === "dreamy" || parts[1] === "third-party"
        ? parts[1].replace("third-party", "thirdparty")
        : name.startsWith("unity-") ? "unity" : "general";
      index.push({ name, category, priority: name.startsWith("dreamy-") ? "P0" : "P1", file: rel });
    } else {
      walkSkills(full);
    }
  }
}
walkSkills(path.join(root, "skills"));
writeJson("skills/index.json", { schemaVersion: 1, skills: index.sort((a, b) => a.name.localeCompare(b.name)) });

write("docs/agent-orchestration.md", `# Agent Orchestration

Use the smallest role set that can verify the task.

## Flows

- Feature: dreamy_unity_developer -> dreamy_tester.
- Bug: dreamy_debugger -> dreamy_unity_developer -> dreamy_tester.
- Review: dreamy_code_reviewer; add dreamy_tester only when validation is needed.
- Performance: dreamy_performance_engineer -> dreamy_unity_developer -> dreamy_tester.
- Android/iOS build: dreamy_build_engineer; add dreamy_debugger only for failures.

## Sandbox

- Reviewer: read-only.
- Debugger: read-first, write only when assigned a fix.
- Developer/tester/build/editor: workspace-write for assigned repo work.
- Docs manager: docs-focused writes.
- Performance: measure first, then change only with evidence.

Avoid multi-agent work for tiny local edits such as renames, formatting, or single-file docs.
`);

let changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");
if (!changelog.includes("## 0.1.0-alpha.2")) {
  changelog = changelog.replace("# Changelog\n", `# Changelog\n\n## 0.1.0-alpha.2\n\n- Repaired native Codex skill paths for project and user installs.\n- Added native agent names, sandbox guidance, orchestration docs, and agent coverage validation.\n- Added install-state v2, preset module dependency resolution, delta update, and richer doctor diagnostics.\n- Added rendering skills, more system/rendering evals, pack smoke, and release/eval artifacts.\n\n`);
  fs.writeFileSync(path.join(root, "CHANGELOG.md"), changelog);
}
