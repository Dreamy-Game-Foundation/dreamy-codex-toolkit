import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

function write(file, text) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text.trimEnd() + "\n", "utf8");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function writeJson(file, value) {
  write(file, JSON.stringify(value, null, 2));
}

function title(name) {
  return name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function skill(name, description, purpose, extra = "") {
  return `---
name: ${name}
description: ${description}
---

# ${title(name)}

## Purpose

${purpose}

## When To Use

- The request directly touches this domain.
- The implementation needs architecture, lifecycle, data ownership, or verification decisions in this area.
- Nearby code already uses this domain and the change could break it.

## When Not To Use

- A narrower Dreamy package skill owns the decision.
- The task is only documentation or release metadata with no domain behavior.
- Existing project instructions explicitly route to another skill.

## Required Inspection

- Project \`AGENTS.md\` and local instructions.
- \`Packages/manifest.json\` and \`Packages/packages-lock.json\` when this is a Unity project.
- Relevant asmdefs, scenes, prefabs, assets, tests, and nearby code owners.
- \`compatibility/dreamy-packages.json\` before making Dreamy API claims.

## Decision Tree

1. Is there an existing owner or package capability? Use it.
2. Is the behavior reusable across games? Consider package or shared module ownership.
3. Is it project-specific? Keep it inside the project feature boundary.
4. Is the claim unverified? Mark it as an assumption or blocker.

## Workflow

1. Inspect the current implementation and owner.
2. Identify data, service, UI, asset, and lifecycle boundaries.
3. Make the smallest safe change that follows existing conventions.
4. Preserve serialized references, meta GUIDs, and user-owned text.
5. Run the smallest available compile, test, harness, or static validation.
6. Report evidence and remaining risks.

## Architecture Rules

- Keep Runtime assemblies free of Editor references.
- Keep persistent player state out of read-only config.
- Keep business rules out of leaf views and pooled visual objects.
- Prefer explicit dependencies over global lookup in leaf components.
- Do not optimize without profile evidence.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.

## Verification

- Compile/console/test result, or a concrete not-run reason.
- Diff review for ownership, dependencies, and serialization safety.
- Harness evidence when available.

## Allowed Claims

Dreamy package APIs are allowed only when backed by the compatibility registry and not listed as drift or unsupported.

## References

- \`compatibility/dreamy-packages.json\`
- \`rules/index.json\`
- \`docs/skill-authoring.md\`
${extra}`;
}

const coreDreamy = {
  "dreamy-feature": [
    "Orchestrate cross-domain Dreamy features using detected capabilities and verification evidence.",
    "Route feature work across Dreamy packages, project code, static config, persistent state, services, UI, assets, and tests.",
    `\n## Dreamy Feature Decisions

Ownership: existing Dreamy package beats new project code; reusable cross-game behavior should be considered for a package; project-only behavior belongs under the project feature boundary.

Data: designer-authored mostly read-only data goes to DataConfig; player-owned persistent state goes to Datasave; temporary combat/session state stays runtime-owned.

Services: cross-scene services belong in composition roots or service registration; feature-local services stay under the feature root; leaf components should receive explicit dependencies.

UI: panels render state and send intent; presenters/services/domain logic handle business operations.`
  ],
  "dreamy-core": [
    "Use verified Dreamy Core service, event, state, lifecycle, logging, and tick capabilities.",
    "Guide Core usage for services, event bus, state machines, lifecycle, logging, ticking, and extensions.",
    `\n## Verified Capability Areas

- ServiceLocator for bootstrap, installers, feature roots, presenters, and top-level controllers.
- EventBus for cross-feature notifications and decoupled application events.
- StateMachine for explicit mutually-exclusive states.
- AppLifecycle and AppTickService for centralized app lifecycle and ticking when it reduces scattered Update loops.
- DreamyLog and extensions when compatibility records verify availability.

Avoid ServiceLocator in UI list items, projectiles, VFX objects, pooled leaves, and tiny components.`
  ],
  "dreamy-dataconfig": [
    "Use Dreamy DataConfig for typed read-only design data and validation.",
    "Keep static designer-authored data separate from runtime and saved player state.",
    `\n## DataConfig Boundaries

Belongs in config: unit stats, level config, shop prices, reward tables, upgrade costs, offer definitions, localization tables, and tuning constants.

Does not belong in config: coins, gems, inventory, level progress, settings, claim state, cooldown state, and session runtime state.

Treat UniTask availability as drift until the consumer manifest declares it or compatibility says it is fixed.`
  ],
  "dreamy-datasave": [
    "Use Dreamy Datasave for versioned persistent player state, migrations, backup, and codecs.",
    "Protect persistent player data with versioning, stable IDs, migrations, and safe save timing.",
    `\n## Datasave Rules

- Use a versioned envelope for persistent data.
- Save stable IDs, not UnityEngine.Object references.
- Migrate on breaking schema changes.
- Save after meaningful transactions and on app pause, not every frame.
- Define corruption handling, backup restore, and codec expectations explicitly.
- Treat local save security as tamper resistance, not real server authority.`
  ],
  "dreamy-assets": [
    "Use Dreamy Assets loader, cache, progress, and release ownership when available.",
    "Manage runtime content loading, shared in-flight requests, cache ownership, and release lifecycle.",
    `\n## Asset Decisions

Serialized scene references are fine for static scene-owned content. Runtime content, reusable prefabs, sprites, atlases, remote content, and pooled load flows should route through the verified loader when available.

Who loads must know who releases. Avoid random Addressables calls scattered across leaf MonoBehaviours.`
  ],
  "dreamy-ui": [
    "Use Dreamy UI panel, layer, cache, transition, tab, safe-area, and TMP capability when compatible.",
    "Keep UI panels focused on presentation while routing business logic through presenters, services, and domain owners.",
    `\n## Panel Responsibilities

Allowed: bind buttons, render state, show/hide, run visual transitions, send user intent, and validate serialized references.

Avoid: loading/saving player data directly, calculating economy, parsing config JSON, initializing SDKs, or owning cross-feature business operations.

Inspect panel prefab or scene, owning layer, PanelManager behavior, presenter/service, navigation, back behavior, safe area, TMP, and Addressables use.`
  ],
  "dreamy-testing": [
    "Design deterministic Dreamy package and project fixtures without replacing Unity Test Framework.",
    "Plan deterministic Dreamy tests, fixtures, edit/play mode coverage, and package/project validation evidence.",
    `\n## Testing Rules

Prefer deterministic fixtures, explicit seeds, small package tests, and reproducible harness output. Do not replace Unity Test Framework; route Unity execution through available harness or documented batchmode commands.`
  ],
  "dreamy-package-maintainer": [
    "Maintain Dreamy package manifests, asmdefs, API compatibility, tests, release notes, and tags.",
    "Verify package metadata, asmdef dependency direction, compatibility records, release notes, tags, drift, and unsupported contracts.",
    `\n## Release Blockers

- Missing verified commit.
- Package version, tag, asmdef, or manifest dependency drift.
- Runtime assembly referencing Editor assembly.
- Public API claim without source evidence.
- Unsupported headless API documented as supported.`
  ],
};

for (const [name, [description, purpose, extra]] of Object.entries(coreDreamy)) {
  write(`skills/dreamy/${name}/SKILL.md`, skill(name, description, purpose, extra));
}

function walkSkillFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const abs = path.join(root, full);
    if (entry.isDirectory()) files.push(...walkSkillFiles(full));
    else if (entry.name === "SKILL.md") files.push(full.replaceAll("\\", "/"));
  }
  return files;
}

function frontmatterValue(text, key) {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

const unitySkills = {
  "unity-ui": "Canvas, RectTransform, layout, safe area, TMP, scroll views, EventSystem, touch navigation, and UI performance.",
  "unity-input-system": "Input Actions, action maps, PlayerInput, UI input, touch, gamepad, rebinding, and modal map switching.",
  "unity-physics": "3D Rigidbody, Collider, FixedUpdate, forces, layers, triggers, raycasts, joints, interpolation, and mobile cost.",
  "unity-physics2d": "Rigidbody2D, Collider2D, Physics2D queries, composite/tilemap colliders, joints, and contact filters.",
  "unity-animation": "Animator controllers, parameters, layers, blend trees, transitions, events, root motion, and runtime controllers.",
  "unity-camera": "Follow, look-at, orthographic/perspective framing, bounds, shake, multi-target, and mobile aspect ratios.",
  "unity-addressables": "Addressables groups, labels, profiles, catalogs, handles, release, dependencies, download size, and content update.",
  "unity-profiling": "Profiler workflow for baseline, capture, CPU timeline, GC alloc, render thread, physics, scripts, and before/after comparison.",
  "unity-memory": "Memory Profiler, managed heap, native objects, textures, audio, meshes, Addressables, pools, leaks, and retained references."
};
for (const [name, purpose] of Object.entries(unitySkills)) {
  write(`skills/${name}/SKILL.md`, skill(name, `Use for ${purpose}`, purpose));
}

const gameplaySkills = [
  "gameplay-loop", "game-state", "player-controller", "movement", "combat", "health-damage",
  "weapon", "projectile", "ragdoll", "enemy-ai", "spawn-wave", "interaction", "progression",
  "level-system", "inventory", "upgrade", "tutorial"
];
for (const name of gameplaySkills) {
  write(`skills/gameplay/${name}/SKILL.md`, skill(name, `Use for ${title(name).toLowerCase()} gameplay implementation and verification.`, `Guide ${title(name).toLowerCase()} implementation with clear ownership, deterministic state, save/config separation, feedback hooks, and tests.`));
}

const systemSkills = [
  "settings", "shop", "gacha", "daily-reward", "battle-pass", "analytics", "ads", "iap", "remote-config"
];
for (const suffix of systemSkills) {
  const name = `system-${suffix}`;
  write(`skills/systems/${name}/SKILL.md`, skill(name, `Use for mobile game ${suffix.replace("-", " ")} systems, ownership, transactions, UI binding, save, and verification.`, `Guide mobile game ${suffix.replace("-", " ")} systems with config ownership, persistent state, transaction safety, analytics boundaries, and fallback behavior.`));
}

for (const file of walkSkillFiles("skills")) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (text.includes("## Purpose") && text.includes("## Verification")) continue;
  const name = frontmatterValue(text, "name") ?? path.basename(path.dirname(file));
  const description = frontmatterValue(text, "description") ?? `Use for ${title(name).toLowerCase()} work.`;
  write(file, skill(name, description, description));
}

const agents = {
  "dreamy-debugger": "Root-cause Dreamy/Unity bug diagnosis. Inspect logs, call chains, recent diffs, runtime/editor/build context, and verify the fix before reporting.",
  "dreamy-code-reviewer": "Adversarial Dreamy code reviewer. Check correctness, package boundaries, serialization, lifecycle, tests, release risk, and unsupported API claims.",
  "dreamy-tester": "Dreamy test planner and executor. Select edit/play/package/static checks, design deterministic fixtures, and report evidence.",
  "dreamy-unity-editor": "Unity Editor automation agent. Use verified MCP, batchmode, or static fallback for scene, prefab, console, and test workflows.",
  "dreamy-performance-engineer": "Performance engineer for profiling, memory, frame time, thermal, Addressables, UI overdraw, and mobile constraints.",
  "dreamy-build-engineer": "Build and release engineer for Android, iOS, signing, IL2CPP, permissions, store readiness, and rollback checks."
};
for (const [name, description] of Object.entries(agents)) {
  write(`agents/codex/${name}.toml`, `description = "${description}"

developer_instructions = """
You are ${title(name)}.

Responsibilities:
- Activate the relevant Dreamy, Unity, gameplay, mobile, production, or testing skills.
- Inspect project instructions, manifests, asmdefs, compatibility records, logs, diffs, and tests before action.
- Avoid unsupported Dreamy API claims.
- Prefer evidence-backed completion over confident guesses.

Output:
- scope
- files inspected
- action or finding summary
- verification run
- remaining risks
"""`);
}

write("docs/skill-authoring.md", `# Skill Authoring

Dreamy Codex Toolkit skills must be operational, source-grounded, and small enough to route reliably.

## Required Format

\`\`\`markdown
---
name:
description:
---

# Skill Name

## Purpose
## When To Use
## When Not To Use
## Required Inspection
## Decision Tree
## Workflow
## Architecture Rules
## Common Failure Modes
## Verification
## Allowed Claims
## References
\`\`\`

## Rules

- Descriptions must name concrete triggers.
- Dreamy API claims must be tied to \`compatibility/dreamy-packages.json\`.
- Generic Unity knowledge belongs in generic Unity skills; Dreamy skills add package-specific routing and overrides.
- Long examples belong in \`references/\` only when they are needed.
- Every P0/P1 skill should tell Codex what to inspect, decide, change, and verify.`);

write("templates/skill/SKILL.md", `---
name: example-skill
description: Use for a concrete domain, trigger, and verification outcome.
---

# Example Skill

## Purpose
## When To Use
## When Not To Use
## Required Inspection
## Decision Tree
## Workflow
## Architecture Rules
## Common Failure Modes
## Verification
## Allowed Claims
## References`);

write("scripts/validate-skills.mjs", `import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const required = [
  "## Purpose",
  "## When To Use",
  "## When Not To Use",
  "## Required Inspection",
  "## Decision Tree",
  "## Workflow",
  "## Architecture Rules",
  "## Common Failure Modes",
  "## Verification",
  "## Allowed Claims",
  "## References"
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name === "SKILL.md") out.push(full);
  }
  return out;
}

const files = walk(path.join(root, "skills"));
const names = new Set();
const errors = [];
for (const file of files) {
  const rel = path.relative(root, file).replaceAll("\\\\", "/");
  const text = fs.readFileSync(file, "utf8");
  const frontmatter = text.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);
  if (!frontmatter) {
    errors.push(\`\${rel}: missing frontmatter\`);
    continue;
  }
  const name = frontmatter[1].match(/^name:\\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter[1].match(/^description:\\s*(.+)$/m)?.[1]?.trim();
  if (!name) errors.push(\`\${rel}: missing name\`);
  if (!description || description.length < 40) errors.push(\`\${rel}: description too short\`);
  if (name && names.has(name)) errors.push(\`\${rel}: duplicate skill name \${name}\`);
  if (name) names.add(name);
  if (rel.includes("/dreamy/") || rel.includes("skills/unity-") || rel.includes("skills/gameplay/") || rel.includes("skills/systems/system-")) {
    for (const heading of required) {
      if (!text.includes(heading)) errors.push(\`\${rel}: missing \${heading}\`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\\n"));
  process.exit(1);
}
console.log(\`skill validation: OK (\${files.length} skills)\`);`);

const evalCases = [
  ["architecture-core-depends-ui", "architecture", "Add a UI dependency to com.dreamy.core", ["reject package direction"], ["Core can depend on UI"]],
  ["architecture-game-logic-in-core", "architecture", "Put project-only game logic into Dreamy Core", ["route project-only behavior to project feature"], ["Core should own game-specific logic"]],
  ["architecture-reusable-in-project", "architecture", "Place reusable cross-game system under Assets/_Project without evaluation", ["evaluate package/shared ownership"], ["reusability does not matter"]],
  ["architecture-project-only-in-package", "architecture", "Move one-off project feature into a shared package", ["keep project-specific feature local"], ["all features belong in packages"]],
  ["core-servicelocator-ui-item", "core", "Resolve service from a UI list item", ["pass dependency from presenter/root"], ["ServiceLocator is fine in leaf items"]],
  ["core-servicelocator-projectile", "core", "Resolve damage service from every projectile", ["inject/pass dependency from spawner"], ["projectiles should use global lookup"]],
  ["core-feature-root-service", "core", "Feature root resolves a cross-scene service and passes explicit dependency", ["allow root-level resolution"], ["all ServiceLocator usage is forbidden"]],
  ["data-coins-in-config", "data", "Store player coins in DataConfig", ["route persistent state to Datasave"], ["DataConfig owns player currency"]],
  ["data-shop-prices-in-save", "data", "Store static shop prices in Datasave", ["route static definitions to DataConfig"], ["shop price definitions are player state"]],
  ["data-temp-combat-persisted", "data", "Persist temporary combat combo state", ["keep session state runtime-owned"], ["all state should be saved"]],
  ["serialization-rename-no-formerly", "serialization", "Rename serialized field without migration", ["use FormerlySerializedAs or migration"], ["Unity will always preserve renamed fields"]],
  ["serialization-meta-guid-deleted", "serialization", "Delete and recreate meta GUID for existing asset", ["preserve GUID"], ["meta files are disposable"]],
  ["scene-yaml-blind-edit", "scene", "Edit scene YAML without owner inspection", ["inspect scene/prefab ownership"], ["blind YAML edits are safe"]],
  ["pool-destroy-spawned", "pooling", "Destroy pooled spawned objects", ["despawn through pool"], ["Destroy is equivalent to despawn"]],
  ["pool-double-despawn", "pooling", "Despawn same object twice", ["guard ownership/state"], ["double despawn is harmless"]],
  ["async-after-destroy", "async", "UniTask continues after object destroyed", ["bind cancellation to lifetime"], ["async work can outlive owner safely"]],
  ["async-void-flow", "async", "Use async void for gameplay flow", ["use UniTask/Task except callbacks"], ["async void is fine for game flow"]],
  ["ui-panel-parses-shop-json", "ui", "Parse shop JSON inside UIPanel", ["move parsing/config to service"], ["panels should parse config"]],
  ["ui-panel-edits-save", "ui", "Panel directly edits save state", ["route intent to presenter/service transaction"], ["views should own save writes"]],
  ["performance-no-profile", "performance", "Optimize based only on code appearance", ["require profile evidence"], ["optimize without profiling"]],
  ["addressables-release-leak", "assets", "Load Addressables without releasing handles", ["define release owner"], ["handles release themselves"]],
  ["mobile-safe-area-regression", "mobile", "Add fullscreen UI without safe-area check", ["verify safe area/aspect ratios"], ["safe area is optional"]],
  ["iap-grant-idempotency", "mobile", "Grant IAP rewards on every purchase callback retry", ["ensure idempotent grant"], ["purchase callbacks are once-only"]]
];
writeJson("evals/catalog.json", {
  schemaVersion: 1,
  coverage: "alpha",
  coverageNote: "Initial deterministic routing and safety cases for P0/P1 hardening.",
  scoring: { routing: 0.2, decision: 0.35, safety: 0.2, verification: 0.15, clarity: 0.1 },
  cases: evalCases.map(([id, category, prompt, expected, forbiddenClaims]) => ({
    id, category, prompt, expected, forbiddenClaims, scoreThreshold: 0.8
  }))
});

write("harness/dreamy-harness", `#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const op = process.argv[2] ?? "help";
const target = path.resolve(process.argv[3] ?? ".");

function json(value, code = 0) {
  console.log(JSON.stringify(value, null, 2));
  process.exitCode = code;
}

function git(args) {
  try {
    return execFileSync("git", ["-c", \`safe.directory=\${target.replaceAll("\\\\", "/")}\`, "-C", target, ...args], { encoding: "utf8" });
  } catch (error) {
    return error.stdout?.toString() ?? error.message;
  }
}

if (op === "git-status") {
  json({ schemaVersion: 1, operation: op, target, status: git(["status", "--short"]).trim().split("\\n").filter(Boolean) });
} else if (op === "git-diff") {
  json({ schemaVersion: 1, operation: op, target, diff: git(["diff", "--stat"]).trim() });
} else if (op === "compile" || op === "console" || op === "test-editmode" || op === "test-playmode") {
  json({ schemaVersion: 1, operation: op, target, status: "degraded", reason: "Unity executable or MCP bridge not configured", errors: [], warnings: [], exceptions: [] }, 2);
} else if (op === "validate-project" || op === "validate-package" || op === "validate-addressables" || op === "build-android" || op === "build-ios") {
  json({ schemaVersion: 1, operation: op, target, status: "degraded", reason: "Static adapter implemented; real Unity bridge pending" }, 2);
} else {
  json({ operations: ["git-status", "git-diff", "compile", "console", "test-editmode", "test-playmode", "validate-project", "validate-package", "validate-addressables", "build-android", "build-ios"] });
}`);

const skillsIndex = { schemaVersion: 1, skills: [] };
function addSkill(name, category, priority, file) {
  skillsIndex.skills.push({ name, category, priority, file });
}
for (const dir of ["skills", "skills/dreamy", "skills/gameplay", "skills/platform", "skills/production", "skills/systems", "skills/third-party"]) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) continue;
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, "SKILL.md").replaceAll("\\\\", "/");
    if (!fs.existsSync(path.join(root, file))) continue;
    const category = dir === "skills" ? "unity" : dir.split("/").at(-1);
    addSkill(entry.name, category, entry.name.startsWith("unity-") || entry.name.startsWith("dreamy-") ? "P0" : "P1", file);
  }
}
skillsIndex.skills.sort((a, b) => a.name.localeCompare(b.name));
writeJson("skills/index.json", skillsIndex);

const modules = {
  "foundation": ["rules/core", "rules/csharp", "rules/unity", "skills/unity-foundations", "skills/unity-serialization", "skills/unity-scene-prefab", "skills/unity-async", "skills/unity-testing", "skills/unity-editor-tooling", "compatibility", "schemas", "scripts/validate"],
  "unity-core": ["skills/unity-ui", "skills/unity-input-system", "skills/unity-physics", "skills/unity-physics2d", "skills/unity-animation", "skills/unity-camera", "skills/unity-addressables", "skills/unity-profiling", "skills/unity-memory"],
  "unity-gameplay": gameplaySkills.map((name) => `skills/gameplay/${name}`),
  "game-systems": systemSkills.map((name) => `skills/systems/system-${name}`),
  "dreamy-foundation": Object.keys(coreDreamy).map((name) => `skills/dreamy/${name}`),
  "dreamy-packages": ["skills/dreamy/dreamy-base", "skills/dreamy/dreamy-architecture", "skills/dreamy/dreamy-audio", "skills/dreamy/dreamy-feedback", "skills/dreamy/dreamy-localization", "skills/dreamy/dreamy-editor-tools", "skills/dreamy/dreamy-template", "skills/dreamy/dreamy-mobile"],
  "mobile": ["skills/platform/mobile-production", "skills/platform/android-build-release", "skills/platform/ios-build-release", "skills/platform/store-release-readiness"],
  "production": ["skills/production/production-code-review", "skills/production/production-release"],
  "unity-rendering": ["skills/unity-camera", "skills/unity-profiling", "skills/unity-memory"]
};
for (const [id, content] of Object.entries(modules)) {
  writeJson(`modules/${id}/module.json`, { $schema: "../../schemas/module.schema.json", id, version: "0.1.0-alpha.1", dependencies: [], content });
}

const presets = {
  "core": ["foundation"],
  "unity-minimal": ["foundation", "unity-core"],
  "unity-production": ["foundation", "unity-core", "mobile", "production"],
  "unity-full": ["foundation", "unity-core", "unity-gameplay", "unity-rendering", "mobile", "production"],
  "dreamy-project": ["foundation", "unity-core", "mobile", "dreamy-foundation", "dreamy-packages"],
  "dreamy-production": ["foundation", "unity-core", "unity-gameplay", "game-systems", "mobile", "dreamy-foundation", "dreamy-packages", "production"],
  "dreamy-package": ["foundation", "dreamy-foundation", "dreamy-packages", "production"],
  "dreamy-template": ["foundation", "unity-core", "dreamy-foundation", "dreamy-packages"],
  "dreamy-full": ["foundation", "unity-core", "unity-gameplay", "unity-rendering", "game-systems", "mobile", "dreamy-foundation", "dreamy-packages", "production"]
};
for (const [id, presetModules] of Object.entries(presets)) {
  writeJson(`presets/${id}.json`, { $schema: "../schemas/preset.schema.json", id, description: `${title(id)} preset.`, modules: presetModules });
}

const toolkit = readJson("toolkit.json");
toolkit.version = "0.1.0-alpha.1";
toolkit.phase = "alpha hardening baseline";
toolkit.status = "alpha";
toolkit.maturity = {
  foundation: "stable",
  installer: "alpha",
  dreamyKnowledge: "alpha",
  unityKnowledge: "alpha",
  harness: "prototype",
  evals: "alpha"
};
toolkit.presets = Object.keys(presets).map((id) => `presets/${id}.json`);
toolkit.modules = Object.keys(modules).map((id) => `modules/${id}/module.json`);
writeJson("toolkit.json", toolkit);

const pkg = readJson("package.json");
pkg.version = "0.1.0-alpha.1";
pkg.scripts.validate = "node src/cli.js validate && node scripts/validate-skills.mjs";
pkg.scripts.test = "npm run validate && node --test tests/unit/*.test.mjs";
pkg.scripts["eval:deterministic"] = "node src/cli.js eval";
writeJson("package.json", pkg);

write("CHANGELOG.md", `# Changelog

## 0.1.0-alpha.1

- Added canonical toolkit maturity metadata.
- Added standard skill authoring docs and template.
- Expanded Dreamy P0 skills.
- Added Unity daily development skills, gameplay skills, mobile system skills, execution agents, harness operations, and deterministic eval seed set.
- Added production-oriented module and preset composition.`);

const agentTemplate = fs.readFileSync(path.join(root, "templates", "AGENTS.managed.md"), "utf8")
  .replace("Use `dreamy-project` routing when this repository contains Dreamy Unity packages.", "Use `toolkit.json` as the canonical version, status, maturity, module, preset, skill, and harness source.");
write("templates/AGENTS.managed.md", agentTemplate);

console.log("backlog baseline applied"); 
