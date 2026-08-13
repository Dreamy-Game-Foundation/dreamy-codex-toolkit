# DREAMY CODEX TOOLKIT — GAP ANALYSIS & IMPLEMENTATION BACKLOG

> **Repository:** `Dreamy-Game-Foundation/dreamy-codex-toolkit`  
> **Document type:** Detailed implementation backlog / hardening plan  
> **Primary objective:** Evolve the current toolkit from a strong framework/metadata baseline into a production-grade Codex toolkit for Unity/mobile game development and Dreamy projects.  
> **Target audience:** Toolkit maintainer, Unity engineers, Dreamy package maintainers, AI tooling engineers  
> **Status:** Action plan based on the current repository audit  
> **Recommended use:** Treat this document as the execution backlog after the Master Plan.

---

# 0. EXECUTIVE SUMMARY

The current repository already has a strong foundation:

- Rules
- Skills
- Agents
- Modules
- Presets
- Compatibility registry
- Schemas
- CLI installer
- Install state
- Doctor/validation concept
- Harness entry point
- Eval catalog
- CI
- Source ledger
- Dreamy package capability map

The main problem is **not repository architecture**.

The main problem is the balance between infrastructure and usable execution knowledge.

Current state is approximately:

```text
Toolkit Framework / Metadata
████████████████████  strong

Dreamy Compatibility Intelligence
██████████████████    strong

Generic Unity Knowledge
██████████            partial

Gameplay/System Knowledge
██████                limited

Execution Harness
████                  early

Behavioral Evals
███                   seed

Production Execution Agents
██████                partial
```

The next major milestone should therefore focus on:

```text
DOMAIN KNOWLEDGE
+
EXECUTION LOOP
+
BEHAVIOR VERIFICATION
```

Do **not** spend the next implementation cycle adding more schemas unless an actual missing contract requires one.

Recommended order:

```text
1. Normalize repository state and status metadata.
2. Expand P0 skill depth.
3. Expand Unity/gameplay/system skill coverage.
4. Build real Unity harness execution.
5. Expand execution agents.
6. Expand deterministic evals.
7. Improve preset/module composition.
8. Implement update lifecycle.
9. Add package drift automation.
10. Harden for production release.
```

---

# 1. CURRENT STRENGTHS TO PRESERVE

These areas should be treated as **assets**, not rewritten.

## 1.1 Repository architecture

Keep the current top-level model:

```text
rules/
skills/
agents/
modules/
presets/
compatibility/
schemas/
src/
scripts/
harness/
evals/
docs/
tests/
```

Reason: this gives clear separation between:

```text
Knowledge
Composition
Execution
Distribution
Verification
Compatibility
```

Avoid collapsing these into a single `skills/` repository.

## 1.2 Compatibility registry

Keep and expand:

```text
compatibility/dreamy-packages.json
compatibility/unity.json
compatibility/third-party.json
```

Every Dreamy package capability claim should remain tied to:

```text
package version
verified commit
runtime assemblies
editor assemblies
dependencies
capabilities
known drift
unsupported contracts
test status
```

Do not replace this with README-only knowledge.

## 1.3 Source ledger

Keep:

```text
docs/research/source-ledger.json
```

Continue separating:

```text
observed
intended
hypothesis
unsupported
drift
```

This reduces hallucinated APIs.

## 1.4 Rule metadata catalog

Keep:

```text
rules/index.json
```

Each rule should continue exposing:

```json
{
  "id": "...",
  "category": "...",
  "purpose": "...",
  "scope": "...",
  "priority": "P0",
  "dreamyOverride": true,
  "file": "..."
}
```

Do not convert rules into unindexed Markdown.

## 1.5 Installer safety

Preserve:

```text
managed AGENTS block
managed config block
checksums
install-state
dry-run
global install
project install
safe uninstall
```

These are already strong patterns.

---

# 2. CRITICAL PROBLEM AREAS

## 2.1 Skill coverage is incomplete

Major missing generic Unity domains:

```text
UI
Input System
Physics
Physics2D
Animation
Animator
Camera
Cinemachine
Navigation
AI
Audio
Rendering
URP
Shader
Material
Particles
VFX
ScriptableObject
Profiling
Memory
Build
```

Major missing gameplay domains:

```text
game loop
game state
movement
player controller
combat
health/damage
weapon
projectile
ragdoll
enemy AI
spawning
waves
interaction
progression
level system
inventory
upgrade
skill system
tutorial
```

Major missing mobile systems:

```text
shop
gacha
daily reward
battle pass
settings
analytics
ads
IAP
remote config
notifications
```

## 2.2 Skill quality is inconsistent

Some skills are real workflow guides. Others are only routing statements.

Goal: every P0/P1 skill should contain enough operational information for Codex to:

```text
recognize task
inspect correct state
make decisions
apply correct architecture
avoid common failures
verify result
```

## 2.3 Harness is not yet a real Unity harness

Current harness capability should grow from:

```text
validate
asmdef
```

to:

```text
compile
console
test-editmode
test-playmode
git-diff
git-status
validate-project
validate-package
validate-addressables
build-android
build-ios
```

## 2.4 Eval system is only seed coverage

Target:

```text
v0.2: 20+ deterministic cases
v0.5: 40+ cases
v1.0: 60+ cases
```

## 2.5 Agent set favors toolkit maintenance more than game production

Add daily production agents:

```text
dreamy-debugger
dreamy-code-reviewer
dreamy-tester
dreamy-unity-editor
dreamy-performance-engineer
dreamy-build-engineer
```

## 2.6 Repository state metadata is inconsistent

Unify:

```text
README status
AGENTS status
toolkit.json status
CI naming
CHANGELOG
```

There should be one source of truth: `toolkit.json`.

---

# 3. PRIORITY MODEL

```text
P0 = blocks reliable daily use
P1 = significantly expands production usefulness
P2 = hardening / scale / automation
P3 = advanced or specialized domains
```

---

# 4. P0 — REPOSITORY CONSISTENCY CLEANUP

## Task P0.1 — Unify version and maturity state

### Problem

Repository state is currently expressed in several places, which creates drift risk.

### Desired model

`toolkit.json` becomes the only canonical source.

Example:

```json
{
  "version": "0.1.0-alpha.1",
  "status": "alpha",
  "maturity": {
    "foundation": "stable",
    "installer": "alpha",
    "dreamyKnowledge": "alpha",
    "unityKnowledge": "partial",
    "harness": "prototype",
    "evals": "seed"
  }
}
```

### Tasks

- [x] Update toolkit schema.
- [x] Add maturity object.
- [x] Remove duplicated phase claims.
- [x] Make README reference canonical version/status.
- [x] Remove outdated current-wave text from AGENTS.
- [x] Make CHANGELOG reflect actual release.
- [x] Add CI consistency check.

### Acceptance Criteria

- `toolkit.json` is canonical.
- No status conflict exists in repo.
- CI catches duplicated or mismatched release metadata.

## Task P0.2 — Rename wave-specific tests

Rename history-oriented tests:

```text
w0-validation
w2-unity-safety
w4-installer-lifecycle
w5-harness
```

into capability-oriented tests:

```text
validation
unity-safety
installer-lifecycle
harness-contract
```

Why: after a few months, `w4` becomes archaeology.

## Task P0.3 — Clean root documentation

Recommended root:

```text
README.md
AGENTS.md
CHANGELOG.md
LICENSE
toolkit.json
```

Move historical prompt to:

```text
docs/history/master-plan-prompt.md
```

Move master plan to:

```text
docs/plans/DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md
```

---

# 5. P0 — STANDARDIZE SKILL FORMAT

Create:

```text
docs/skill-authoring.md
templates/skill/
```

Required P0/P1 skill format:

```markdown
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
```

## 5.1 Purpose

One concise domain statement.

## 5.2 When To Use

Explicit triggers.

## 5.3 When Not To Use

Prevent overlap and routing confusion.

## 5.4 Required Inspection

Define exactly what Codex must inspect before action.

## 5.5 Decision Tree

Use for ambiguous architecture decisions.

## 5.6 Workflow

Operational steps, not generic advice.

## 5.7 Architecture Rules

Generic industry rules plus Dreamy overrides where applicable.

## 5.8 Common Failure Modes

Real mistakes the skill must guard against.

## 5.9 Verification

Required evidence before completion claim.

## 5.10 Allowed Claims

For Dreamy packages, current API claims must be verified by compatibility registry.

---

# 6. P0 — EXPAND EXISTING DREAMY SKILLS

Priority order:

```text
dreamy-feature
dreamy-core
dreamy-dataconfig
dreamy-datasave
dreamy-assets
dreamy-ui
dreamy-testing
dreamy-package-maintainer
```

---

# 7. P0 — DREAMY-FEATURE EXPANSION

File:

```text
skills/dreamy/dreamy-feature/SKILL.md
```

## 7.1 Ownership Decision

```text
New functionality
    ↓
Already supported by existing Dreamy package?
    ├─ yes → use package
    └─ no
        ↓
Reusable across games?
        ├─ yes → consider package
        └─ no → Assets/_Project
```

## 7.2 Data Decision

```text
Designer-authored mostly read-only?
→ DataConfig

Persistent player-owned?
→ Datasave

Temporary current-session state?
→ runtime feature state
```

## 7.3 Service Decision

```text
Cross-scene application service?
→ composition root + service registry

Feature-local service?
→ feature root ownership

Leaf component dependency?
→ pass explicitly
```

## 7.4 UI Decision

```text
Presentation only?
→ UIPanel/view

Business operation?
→ presenter/service/domain
```

## 7.5 Required Workflow

```text
1. Inspect project AGENTS.
2. Inspect manifest/lock.
3. Inspect relevant asmdefs.
4. Inspect existing feature.
5. Inspect compatibility records.
6. Identify ownership.
7. Identify static config.
8. Identify persistent state.
9. Identify service boundary.
10. Identify presentation.
11. Implement minimum change.
12. Compile.
13. Read Console.
14. Run relevant tests.
15. Review diff.
16. Report evidence.
```

---

# 8. P0 — DREAMY-CORE SKILL

Must document verified capabilities:

```text
ServiceLocator
MyEventBus<T>
StateMachine
Singleton variants
AppLifecycle
AppTickService
DreamyLog
extensions
```

## ServiceLocator Guidance

Allowed:

```text
GameInstaller
bootstrap
feature root
presenter
top-level controller
```

Avoid:

```text
UI list item
projectile
VFX object
pooled leaf
tiny component
```

## EventBus Guidance

Use for:

```text
cross-feature notification
decoupled application events
```

Avoid for:

```text
simple parent-child communication
one direct dependency
```

## StateMachine Guidance

Use for explicit mutually-exclusive state, not trivial binary flags.

## AppTickService Guidance

Use when centralized ticking meaningfully replaces many independent Update loops.

---

# 9. P0 — DREAMY-DATACONFIG SKILL

Must include:

```text
what belongs in config
what does not
loading
validation
local source
remote source
composite source
fallback
schema evolution
designer workflow
```

Examples:

Config:

```text
unit stats
level config
shop prices
reward tables
upgrade cost
offer definitions
```

Not config:

```text
coins
gems
inventory
level progress
settings
claim state
```

Verification:

```text
config parse
type validation
missing key
fallback behavior
```

---

# 10. P0 — DREAMY-DATASAVE SKILL

Cover:

```text
versioned envelope
atomic write
backup restore
migration
codecs
corruption handling
save timing
app pause
transactions
security limitations
```

Rules:

- Do not save UnityEngine.Object references.
- Save stable IDs.
- Migration required for breaking data schema.
- Save after meaningful state transaction.
- Avoid save spam every frame.

---

# 11. P0 — DREAMY-ASSETS SKILL

Cover:

```text
AssetLoader
Addressables
Resources fallback
typed cache
shared in-flight request
release ownership
prefab load
sprite load
atlas access
```

Decision:

```text
Static scene reference?
→ serialized ref may be fine

Runtime content / reusable loaded content?
→ AssetLoader
```

Ownership rule:

```text
who loads
must know who releases
```

Red flags:

```text
random Addressables calls across MonoBehaviours
never releasing handles
string addresses duplicated everywhere
```

---

# 12. P0 — DREAMY-UI SKILL

Needs major expansion.

Include:

```text
UIPanel
PanelManager
UILayerRoot
Screen
Popup
Overlay
panel cache
transitions
tabs
safe area
TMP
Addressables
panel lifecycle
navigation
```

## Panel Responsibilities

Allowed:

```text
bind buttons
render state
show/hide
visual transition
send user intent
```

Avoid:

```text
load/save player data directly
calculate economy
parse config JSON
initialize analytics SDK
```

## Workflow

```text
1. Inspect panel prefab/scene.
2. Inspect owner layer.
3. Inspect current PanelManager behavior.
4. Inspect presenter/service.
5. Add bindings.
6. Keep persistent logic outside panel.
7. Validate serialized refs.
8. Compile.
9. Test navigation and back behavior.
```

---

# 13. P0 — UNITY GENERIC SKILLS TO ADD

Create:

```text
skills/unity-ui/
skills/unity-input-system/
skills/unity-physics/
skills/unity-physics2d/
skills/unity-animation/
skills/unity-camera/
skills/unity-addressables/
skills/unity-profiling/
skills/unity-memory/
```

These are the highest-value generic Unity additions.

---

# 14. UNITY-UI SKILL

Cover:

```text
Canvas
Screen Space Overlay
Screen Space Camera
World Space
RectTransform
anchors
pivot
layout groups
ContentSizeFitter
CanvasScaler
GraphicRaycaster
EventSystem
TMP
scroll views
buttons
safe area
overdraw
dynamic lists
pooling
```

Common failures:

```text
layout rebuild storms
nested ContentSizeFitters
transparent fullscreen UI
multiple canvases without reason
raycast targets on decorative graphics
safe-area regressions
```

Verification:

```text
multiple aspect ratios
safe area
navigation
serialized refs
touch
```

---

# 15. UNITY-INPUT-SYSTEM SKILL

Cover:

```text
Input Actions
Action Maps
PlayerInput
touch
pointer
keyboard/gamepad
mobile gestures
rebinding
UI Input Module
```

Rules:

```text
avoid mixing old/new input accidentally
separate gameplay/UI maps where useful
disable inappropriate gameplay maps during modal UI
```

---

# 16. UNITY-PHYSICS SKILL

Cover:

```text
Rigidbody
Collider
FixedUpdate
forces
velocity
collision layers
triggers
continuous collision
raycasts
NonAlloc queries
joints
interpolation
```

Mobile concerns:

```text
excessive dynamic rigidbodies
mesh collider cost
solver cost
per-frame query spam
```

---

# 17. UNITY-PHYSICS2D SKILL

Cover:

```text
Rigidbody2D
Collider2D
Physics2D queries
CompositeCollider2D
TilemapCollider2D
joints
contact filters
```

Keep separate from 3D physics because APIs, collision tuning, and common mobile game patterns differ.

---

# 18. UNITY-ANIMATION SKILL

Cover:

```text
Animator
Animator Controller
parameters
layers
blend trees
transitions
Animation Events
root motion
StateMachineBehaviour
runtime animator controller
```

Avoid:

```text
string parameter calls everywhere
transition spaghetti
animation owning game authority
```

---

# 19. UNITY-CAMERA SKILL

Cover:

```text
follow
look-at
orthographic
perspective
camera bounds
camera shake
target framing
multi-target
mobile aspect ratio
```

Cinemachine should be a separate P1 skill if commonly used.

---

# 20. UNITY-ADDRESSABLES SKILL

Generic Addressables knowledge independent of Dreamy loader.

Cover:

```text
groups
labels
profiles
catalog
local/remote
LoadAssetAsync
InstantiateAsync
handles
release
dependencies
download size
content update
```

Dreamy Assets skill then explains preferred integration.

---

# 21. UNITY-PROFILING SKILL

Required workflow:

```text
baseline
capture
identify frame
CPU Timeline
GC Alloc
render thread
physics
scripts
compare after change
```

Never optimize purely because code "looks slow".

---

# 22. UNITY-MEMORY SKILL

Cover:

```text
Memory Profiler
managed heap
native objects
textures
audio
meshes
Addressables
pools
leaks
retained references
```

---

# 23. P1 — UNITY SKILLS

After P0:

```text
unity-scriptableobject
unity-audio
unity-cinemachine
unity-navigation
unity-ai
unity-particles
unity-vfx
unity-rendering
unity-urp
unity-shader
unity-material
unity-build
```

---

# 24. P0/P1 — GAMEPLAY SKILL EXPANSION

Recommended catalog:

```text
gameplay-loop
game-state
player-controller
movement
combat
health-damage
weapon
projectile
ragdoll
enemy-ai
spawn-wave
interaction
progression
level-system
inventory
upgrade
tutorial
```

## gameplay-loop

Cover:

```text
session start
match start
active play
pause
result
restart
return home
```

## game-state

Use explicit state machine when boolean combinations become invalid or difficult to reason about.

## player-controller

Separate:

```text
input
movement
ability
animation
camera hooks
state
```

Avoid one controller owning every game system.

## combat

Cover:

```text
damage request
damage calculation
health owner
death
hit feedback
invulnerability
damage types
```

## projectile

Cover:

```text
spawn
trajectory
collision
hit
lifetime
pooling
VFX
damage
```

## ragdoll

Cover:

```text
bone mapping
colliders
rigidbodies
joint configuration
animation → ragdoll
ragdoll → recover
pool reset
```

## enemy-ai

Cover:

```text
state machine
sensing
targeting
movement
attack
cooldowns
navigation
performance
```

## spawn-wave

Cover:

```text
spawn ownership
spawn points
wave config
pooling
difficulty
lifetime
cleanup
```

## progression

Cover:

```text
level progression
unlock
XP
upgrade
reward
save ownership
config ownership
```

## upgrade

Generic rule:

```text
upgrade definition → static config
player upgrade level → persistent state
transaction → service/domain
visuals → UI/feedback
```

---

# 25. P1 — MOBILE GAME SYSTEM SKILLS

Create generic skills:

```text
system-settings
system-shop
system-gacha
system-daily-reward
system-battle-pass
system-tutorial
system-analytics
system-ads
system-iap
system-remote-config
```

## system-shop

Cover:

```text
catalog
currency prices
IAP prices
availability
purchase transaction
reward granting
UI binding
save
analytics
```

## system-gacha

Cover:

```text
loot table
rarity
guarantee/pity
random source
grant transaction
duplicate handling
history
UI reveal
```

## system-daily-reward

Cover:

```text
calendar/time source
claim state
streak
reset policy
offline time
server-time caveat
```

## system-battle-pass

Cover:

```text
season
XP
tiers
free/premium track
claim
expiration
migration
```

## system-analytics

Cover:

```text
event naming
event schema
funnel
economy
session
progression
ad
IAP
error
```

Vendor APIs should not be scattered through gameplay.

## system-ads

Cover:

```text
rewarded
interstitial
banner
MREC
frequency
cooldown
placement
lifecycle
consent
mediation
```

## system-iap

Cover:

```text
product IDs
purchase flow
pending
failure
restore
receipt
grant idempotency
```

## system-remote-config

Cover:

```text
safe default
cache
fetch
activation
version
fallback
rollout
```

---

# 26. P0 — EXECUTION AGENTS

Create:

```text
agents/codex/dreamy-debugger.toml
agents/codex/dreamy-code-reviewer.toml
agents/codex/dreamy-tester.toml
```

## dreamy-debugger

Purpose:

```text
root-cause bug diagnosis
```

Must:

```text
inspect logs
inspect call chain
inspect recent diff
classify runtime/editor/build
avoid speculative fixes
verify corrected behavior
```

Output:

```text
Root Cause
Evidence
Fix
Verification
Remaining Risk
```

## dreamy-code-reviewer

Focus:

```text
bugs
serialization
lifecycle
architecture
Dreamy boundary
performance
mobile
test coverage
```

Severity:

```text
P0 blocker
P1 bug
P2 risk
P3 maintainability
```

## dreamy-tester

Responsibilities:

```text
choose test scope
compile
console
EditMode
PlayMode
build smoke test
report evidence
```

---

# 27. P1 AGENTS

Add:

```text
dreamy-unity-editor
dreamy-performance-engineer
dreamy-build-engineer
```

## dreamy-unity-editor

Use for:

```text
scene
prefab
component
serialized references
asset setup
```

Prefer Editor/MCP state inspection over blind YAML edits.

## dreamy-performance-engineer

Classify:

```text
CPU
GPU
GC
memory
IO
loading
thermal
```

Use profiler evidence.

## dreamy-build-engineer

Cover:

```text
Android
iOS
Gradle
AGP
JDK
R8
IL2CPP
signing
manifest
store packaging
```

---

# 28. P0 — UNITY HARNESS ARCHITECTURE

Recommended:

```text
harness/
├── dreamy-harness
├── adapters/
│   ├── unity-cli
│   ├── unity-mcp
│   ├── git
│   └── local
└── schemas/
```

P0 operations:

```text
validate
asmdef
git-status
git-diff
compile
console
test-editmode
test-playmode
```

P1 operations:

```text
validate-project
validate-package
validate-addressables
build-android
build-ios
```

---

# 29. HARNESS EVIDENCE CONTRACT

All operations should return the same basic contract:

```json
{
  "schemaVersion": 1,
  "adapter": "unity-cli",
  "operation": "compile",
  "status": "pass",
  "observedAt": "...",
  "exitCode": 0,
  "artifacts": [],
  "diagnostics": [],
  "git": {
    "available": true,
    "dirtyPaths": []
  },
  "degradedReason": null
}
```

Never claim compile success if no actual compile occurred.

---

# 30. COMPILE HARNESS

Possible Unity CLI flow:

```text
Unity
-batchmode
-quit
-projectPath <path>
-executeMethod Dreamy.Codex.Editor.HarnessEntry.Compile
```

Alternative when Unity MCP is connected:

```text
MCP refresh/compile
```

Adapter chooses available capability.

---

# 31. CONSOLE HARNESS

Return structured evidence:

```json
{
  "errors": [],
  "warnings": [],
  "exceptions": []
}
```

Support:

```text
since last compile
full session
filter by type
```

---

# 32. TEST HARNESS

Operations:

```text
test-editmode
test-playmode
```

Return:

```text
passed
failed
skipped
duration
failed test details
```

---

# 33. GIT HARNESS

`git-status`:

```text
dirty files
untracked
staged
```

`git-diff`:

```text
changed paths
scoped summary
```

This is important for final verification and unrelated-change protection.

---

# 34. UNITY EDITOR BRIDGE

Consider adding an editor bridge:

```csharp
public static class HarnessEntry
{
    public static void Compile();
    public static void RunEditModeTests();
    public static void RunPlayModeTests();
    public static void ValidateProject();
}
```

Output JSON to a known path.

Fallback priority:

```text
Unity MCP
↓
Unity CLI
↓
static validation
↓
degraded evidence
```

---

# 35. P0 — EVAL EXPANSION

Create at least 20 cases immediately.

Categories:

```text
architecture
data
service
unity
serialization
pooling
async
UI
assets
performance
build
```

Initial cases:

1. Core depends on UI.
2. Game-specific logic added to Core.
3. Reusable feature placed in `_Project` without evaluation.
4. Project-only feature prematurely moved to package.
5. ServiceLocator used in UI item.
6. ServiceLocator used in projectile.
7. Feature root resolves service and passes dependency correctly.
8. Coins stored in DataConfig.
9. Shop prices stored in Datasave.
10. Temporary combat state persisted unnecessarily.
11. Serialized field rename without `FormerlySerializedAs`.
12. Meta GUID deleted/recreated.
13. Scene YAML edited blindly.
14. Pool spawn then `Destroy`.
15. Double despawn.
16. UniTask continues after destroyed object.
17. `async void` used for non-callback flow.
18. Shop JSON parsed inside UIPanel.
19. Panel directly edits save state.
20. Optimization suggested without profile evidence.

P1 cases:

```text
Addressables release leak
safe area regression
physics Update misuse
R8 build issue
Android permission change
IAP grant idempotency
gacha persistence
analytics vendor coupling
```

---

# 36. EVAL RUNNER DESIGN

Recommended structure:

```text
evals/
├── catalog.json
├── cases/
├── rubrics/
├── fixtures/
└── runner/
```

Case schema example:

```json
{
  "id": "...",
  "prompt": "...",
  "requiredConcepts": [],
  "forbiddenClaims": [],
  "requiredTools": [],
  "scoreThreshold": 0.8
}
```

Score dimensions:

```text
routing             20%
decision            35%
safety              20%
verification        15%
clarity             10%
```

---

# 37. P1 — MODULE REFACTOR

Future module model:

```text
foundation
unity-core
unity-gameplay
unity-rendering
unity-production
mobile
game-systems
dreamy-foundation
dreamy-packages
production
```

## foundation

```text
core rules
C# rules
basic Unity safety
planning/debug/review/test workflow
```

## unity-core

```text
foundations
serialization
scene-prefab
async
editor
testing
UI
input
physics
animation
camera
```

## unity-gameplay

Gameplay skills.

## unity-rendering

```text
URP
shader
material
VFX
particles
GPU profiling
```

## mobile

```text
mobile-production
Android
iOS
safe-area
thermal
memory
build size
```

## game-systems

```text
economy
shop
reward
gacha
settings
tutorial
analytics
ads
IAP
remote config
```

## dreamy-foundation

```text
dreamy-base
dreamy-architecture
dreamy-feature
dreamy-core
dreamy-testing
Dreamy core rules
```

## dreamy-packages

Package-detected skills only.

---

# 38. P1 — PRESET EXPANSION

Recommended:

```text
core
unity-minimal
unity-production
unity-full
dreamy-project
dreamy-production
dreamy-package
dreamy-template
dreamy-full
```

## unity-production

```text
foundation
unity-core
mobile
production
```

No Dreamy-specific rules.

## dreamy-project

```text
foundation
unity-core
mobile
dreamy-foundation
detected Dreamy package skills
```

## dreamy-production

Adds:

```text
production
game-systems
build/release
profiling
```

## dreamy-full

Everything except explicitly experimental modules.

---

# 39. AUTO-DETECTED PACKAGE SKILLS

Installer reads manifest.

Examples:

```text
com.dreamy.ui
→ dreamy-ui

com.dreamy.audio
→ dreamy-audio

com.dreamy.feedback
→ dreamy-feedback

com.dreamy.localization
→ dreamy-localization
```

Do not load absent package skills.

---

# 40. P1 — PROJECT PROFILE EXPANSION

Recommended:

```json
{
  "engine": "unity",
  "unityVersion": "6000.x",
  "projectType": "dreamy-game",
  "preset": "dreamy-project",
  "packages": [],
  "dreamyPackages": [],
  "thirdParty": [],
  "capabilities": {
    "unityMcp": false,
    "batchmode": true
  }
}
```

---

# 41. P1 — DOCTOR EXPANSION

Doctor should inspect:

```text
Unity version
manifest validity
package lock
Dreamy version mismatch
known drift
duplicate AGENTS block
missing skill files
invalid skill frontmatter
agent config
Codex config
MCP availability
Unity executable
Node version
git
runtime dependencies
```

Severity:

```text
ERROR
WARN
INFO
```

Example:

```text
ERROR: runtime asmdef references missing package dependency
WARN: Unity MCP unavailable; harness will use batchmode
INFO: com.dreamy.audio detected
```

---

# 42. P1 — UPDATE LIFECYCLE

Implement:

```text
dreamy-kit update
```

Requirements:

```text
read install state
compare toolkit version
detect user-modified managed files
dry-run
backup state
apply managed changes
preserve user text
update skills
update agents
update profile
```

Default conflict behavior:

```text
refuse with diagnostics
```

Optional:

```text
--force
--backup
```

---

# 43. P1 — COMPATIBILITY DRIFT AUTOMATION

Add:

```text
scripts/refresh-compatibility
```

Responsibilities:

```text
inspect Dreamy repos
read package.json
read asmdef
read git tag
compare manifest
update observed metadata
produce drift report
```

Do not auto-publish unreviewed API claims.

---

# 44. PACKAGE QUALITY GATE

For every Dreamy package validate:

```text
package.json
README
CHANGELOG
Runtime asmdef
Editor asmdef
Tests
manifest dependencies
version/tag
```

---

# 45. P1 — CI REFACTOR

Recommended commands:

```text
npm ci
npm test
npm run validate
npm run eval:deterministic
```

Jobs:

```text
validate
test
eval
release-check
```

Remove wave-oriented job names.

---

# 46. RELEASE CHECK

Before tag:

```text
clean CI
toolkit version
CHANGELOG
compatibility state
known drift
eval threshold
installer tests
release artifact
```

---

# 47. VERSIONING

Recommended progression:

```text
0.1.0-alpha.1
0.1.0-alpha.2
0.1.0-beta.1
0.1.0
```

Do not keep `0.0.0` after external/internal install starts.

Maturity gates:

## Alpha

```text
installer works
foundation skills
Dreamy basics
partial harness
seed evals
```

## Beta

```text
core Unity coverage
real compile/test harness
20+ evals
update works
```

## 1.0

```text
production presets
stable install/update/uninstall
full P0/P1 skill set
reliable Unity verification
60+ evals
release CI
```

---

# 48. P2 — GENERATE DREAMY API REFERENCES

Future script:

```text
scripts/generate-package-reference
```

Input:

```text
Dreamy package source
```

Output draft:

```text
skills/dreamy/<package>/references/api.md
```

Manual review required.

---

# 49. P2 — SKILL ROUTING BENCHMARK

Create around 100 routing prompts.

Measure whether correct skills are selected.

Categories:

```text
Unity
Dreamy
gameplay
mobile
production
```

---

# 50. P2 — CONTEXT BUDGET TEST

Measure installed skill metadata size.

Targets:

```text
core global → small
dreamy-project → bounded
dreamy-full → explicit opt-in
```

Warn when skill descriptions or selected skill counts exceed thresholds.

---

# 51. P2 — KNOWLEDGE DUPLICATION CHECK

Generic knowledge belongs generic skill.

Dreamy skill should reference or override, not copy everything.

Example:

```text
unity-addressables
→ generic API/lifetime

dreamy-assets
→ Dreamy AssetLoader integration
```

---

# 52. P2 — DOC GENERATION

Generate from indexes:

```text
skill catalog
rule catalog
preset matrix
agent matrix
compatibility summary
```

Avoid maintaining duplicate tables manually.

---

# 53. P2 — RELEASE ARTIFACTS

Publish:

```text
npm package
GitHub release archive
checksum
release notes
```

---

# 54. P3 — ADVANCED UNITY DOMAINS

Only after real demand:

```text
DOTS/ECS
multiplayer
Netcode
advanced shaders
custom SRP
advanced animation rigging
procedural generation
advanced AI
```

---

# 55. DETAILED IMPLEMENTATION WAVES

## WAVE A — CONSISTENCY & SKILL STANDARDIZATION

### Objective

Stabilize repository truth and authoring conventions.

### Tasks

- [x] Canonical toolkit status.
- [x] Move historical prompt.
- [x] Rename wave tests.
- [x] Standard skill template.
- [x] Add authoring validator.
- [x] Expand top Dreamy P0 skills.

### Deliverables

```text
docs/skill-authoring.md
templates/skill/
updated toolkit.json
updated README
updated AGENTS
expanded Dreamy skills
```

### Definition of Done

- No status contradiction.
- P0 skills follow standard format.
- Validator rejects malformed P0 skills.

---

## WAVE B — UNITY DAILY DEVELOPMENT CORE

### Objective

Cover most daily Unity tasks.

### Add Skills

```text
unity-ui
unity-input-system
unity-physics
unity-physics2d
unity-animation
unity-camera
unity-addressables
unity-profiling
unity-memory
```

### Add Evals

At least 8 Unity cases.

### Definition of Done

Codex can handle:

```text
UI changes
physics bugs
input integration
animation wiring
camera behavior
asset lifetime
basic profiling
memory diagnosis
```

---

## WAVE C — GAMEPLAY CORE

### Objective

Make toolkit useful for actual feature implementation.

### Add

```text
gameplay-loop
game-state
player-controller
movement
combat
projectile
ragdoll
enemy-ai
spawn-wave
interaction
progression
upgrade
inventory
tutorial
```

### Definition of Done

Common gameplay implementation no longer depends only on generic Unity knowledge.

---

## WAVE D — DREAMY PRODUCTION KNOWLEDGE

### Objective

Deepen Dreamy package usage.

### Expand

```text
dreamy-core
dreamy-dataconfig
dreamy-datasave
dreamy-assets
dreamy-ui
dreamy-audio
dreamy-feedback
dreamy-localization
dreamy-editor-tools
dreamy-package-maintainer
```

Add references where useful:

```text
references/capabilities.md
references/workflows.md
references/common-errors.md
```

---

## WAVE E — REAL HARNESS

### Objective

Create real edit→verify loop.

### Add

```text
compile
console
test-editmode
test-playmode
git-status
git-diff
```

### Definition of Done

A code mutation can produce executable evidence.

---

## WAVE F — EXECUTION AGENTS

Add:

```text
dreamy-debugger
dreamy-code-reviewer
dreamy-tester
dreamy-unity-editor
```

Then:

```text
dreamy-performance-engineer
dreamy-build-engineer
```

---

## WAVE G — MOBILE SYSTEMS

Add:

```text
shop
gacha
daily reward
battle pass
settings
analytics
ads
IAP
remote config
```

---

## WAVE H — EVAL SCALE-UP

Target:

```text
40 cases
```

Add automated runner.

---

## WAVE I — PRESET/MODULE HARDENING

Implement granular modules and dynamic Dreamy package selection.

---

## WAVE J — UPDATE & DRIFT

Implement:

```text
dreamy-kit update
compatibility refresh
drift report
```

---

## WAVE K — BETA HARDENING

Focus:

```text
routing
context
release
documentation
installer lifecycle
Windows support
```

---

## WAVE L — V1.0

Release gate:

```text
stable install
stable update
stable uninstall
60+ evals
real Unity harness
P0/P1 skill coverage
production CI
```

---

# 56. RECOMMENDED FIRST 30 IMPLEMENTATION ISSUES

1. Normalize toolkit version/status.
2. Move historical prompt docs.
3. Rename wave-specific tests.
4. Add standard skill template.
5. Add skill structure validator.
6. Expand dreamy-ui.
7. Expand dreamy-core.
8. Expand dreamy-dataconfig.
9. Expand dreamy-datasave.
10. Expand dreamy-assets.
11. Add unity-ui.
12. Add unity-input-system.
13. Add unity-physics.
14. Add unity-physics2d.
15. Add unity-animation.
16. Add unity-camera.
17. Add unity-addressables.
18. Add unity-profiling.
19. Add unity-memory.
20. Add dreamy-debugger agent.
21. Add dreamy-code-reviewer agent.
22. Add dreamy-tester agent.
23. Add harness git-status.
24. Add harness git-diff.
25. Add harness compile adapter.
26. Add harness console adapter.
27. Add harness EditMode tests.
28. Add harness PlayMode tests.
29. Expand eval catalog to 20.
30. Add `unity-production` preset.

---

# 57. RECOMMENDED NEXT 30 ISSUES

31. Add gameplay-loop.
32. Add game-state.
33. Add player-controller.
34. Add movement.
35. Add combat.
36. Add health-damage.
37. Add projectile.
38. Add ragdoll.
39. Add enemy-ai.
40. Add spawn-wave.
41. Add interaction.
42. Add progression.
43. Add inventory.
44. Add upgrade.
45. Add tutorial.
46. Add system-settings.
47. Add system-shop.
48. Add system-gacha.
49. Add system-daily-reward.
50. Add system-battle-pass.
51. Add system-analytics.
52. Add system-ads.
53. Add system-iap.
54. Add system-remote-config.
55. Add dreamy-unity-editor agent.
56. Add dreamy-performance-engineer agent.
57. Add dreamy-build-engineer agent.
58. Add dreamy-production preset.
59. Add dreamy-full preset.
60. Implement project capability detection.

---

# 58. ACCEPTANCE STANDARD FOR NEW SKILLS

Every P0/P1 skill must pass:

```text
[ ] Valid frontmatter
[ ] Clear trigger
[ ] Clear non-trigger
[ ] Inspection checklist
[ ] Decision guidance
[ ] Action workflow
[ ] Common failures
[ ] Verification steps
[ ] No unsupported Dreamy API claims
[ ] References valid
[ ] Catalog entry exists
[ ] Preset/module ownership defined
[ ] At least one eval when architecture-critical
```

---

# 59. ACCEPTANCE STANDARD FOR AGENTS

```text
[ ] Role is not redundant
[ ] Tools/capabilities are explicit
[ ] Skills used are explicit
[ ] Safety rules referenced
[ ] Output format defined
[ ] Verification behavior defined
[ ] Agent has eval coverage
```

---

# 60. ACCEPTANCE STANDARD FOR HARNESS OPERATIONS

```text
[ ] Non-destructive default
[ ] Machine-readable JSON
[ ] Meaningful exit code
[ ] Diagnostics preserved
[ ] Degraded state explicit
[ ] Does not fake success
[ ] Cross-platform behavior documented
[ ] Test fixture exists
```

---

# 61. ACCEPTANCE STANDARD FOR EVALS

```text
[ ] Unique architecture decision
[ ] Required behavior
[ ] Forbidden claims
[ ] Expected routing
[ ] Deterministic rubric where possible
[ ] Failure output readable
```

---

# 62. RECOMMENDED METRICS

Track:

```text
skill routing accuracy
eval pass %
compile success after AI edits
architecture violation count
unsupported API claim count
harness execution success
context metadata size
installer/update failure rate
```

Targets:

Alpha:

```text
critical eval pass >= 85%
```

Beta:

```text
critical eval pass >= 95%
routing accuracy >= 90%
```

1.0:

```text
critical eval pass >= 98%
no known P0 installer corruption
no unsupported Dreamy API claims in release catalog
```

---

# 63. WHAT NOT TO DO NEXT

Do not prioritize:

```text
more schemas
more decorative docs
more agent names
more empty skill stubs
more presets that compose the same modules
```

before existing skills become useful.

Avoid using:

```text
"we have 80 skills"
```

as a success metric.

Success is:

```text
Codex solves actual Dreamy Unity tasks correctly and proves it.
```

---

# 64. IDEAL END STATE

```text
User Request
    ↓
AGENTS invariants
    ↓
Skill routing
    ↓
Generic Unity/game system knowledge
    ↓
Dreamy override
    ↓
Compatibility verification
    ↓
Agent execution
    ↓
Unity harness
    ↓
Compile / Console / Tests / Diff
    ↓
Evidence-backed completion
```

---

# 65. FINAL TOP PRIORITIES

If only ten things are implemented next:

```text
1. Normalize repo version/status.
2. Standardize P0 skill structure.
3. Deepen dreamy-ui/core/data/assets skills.
4. Add unity-ui.
5. Add unity-physics/input/animation/camera.
6. Add profiling/memory/addressables skills.
7. Add debugger/reviewer/tester agents.
8. Implement compile/console/test harness.
9. Expand evals from seed to 20+.
10. Add unity-production + dreamy-production composition.
```

---

# 66. IMPLEMENTATION CHECKLIST

## Repository consistency

- [x] Canonical version/status in toolkit.json.
- [x] README references canonical state.
- [x] AGENTS no stale wave text.
- [x] CI naming updated.
- [x] Historical prompt moved.
- [x] Master plan location normalized.

## Skill authoring

- [x] Standard template.
- [x] Skill validator.
- [x] Description validator.
- [x] Broken reference detection.
- [x] Duplicate skill detection.

## Dreamy P0 skills

- [x] dreamy-feature.
- [x] dreamy-core.
- [x] dreamy-dataconfig.
- [x] dreamy-datasave.
- [x] dreamy-assets.
- [x] dreamy-ui.
- [x] dreamy-testing.
- [x] dreamy-package-maintainer.

## Unity P0 skills

- [x] unity-ui.
- [x] unity-input-system.
- [x] unity-physics.
- [x] unity-physics2d.
- [x] unity-animation.
- [x] unity-camera.
- [x] unity-addressables.
- [x] unity-profiling.
- [x] unity-memory.

## Gameplay

- [x] gameplay-loop.
- [x] game-state.
- [x] player-controller.
- [x] movement.
- [x] combat.
- [x] health-damage.
- [x] projectile.
- [x] ragdoll.
- [x] enemy-ai.
- [x] spawn-wave.
- [x] interaction.
- [x] progression.
- [x] inventory.
- [x] upgrade.
- [x] tutorial.

## Mobile systems

- [x] settings.
- [x] shop.
- [x] gacha.
- [x] daily reward.
- [x] battle pass.
- [x] analytics.
- [x] ads.
- [x] IAP.
- [x] remote config.

## Agents

- [x] dreamy-debugger.
- [x] dreamy-code-reviewer.
- [x] dreamy-tester.
- [x] dreamy-unity-editor.
- [x] dreamy-performance-engineer.
- [x] dreamy-build-engineer.

## Harness

- [x] git-status.
- [x] git-diff.
- [x] compile.
- [x] console.
- [x] EditMode.
- [x] PlayMode.
- [x] project validation.
- [x] package validation.
- [x] Addressables validation.
- [x] Android build.
- [x] iOS build.

## Evals

- [x] 20 initial cases.
- [x] 40 beta cases.
- [x] 60 v1 cases.
- [x] automated runner.
- [x] score report.
- [x] CI gate.

## Modules

- [x] foundation.
- [x] unity-core.
- [x] unity-gameplay.
- [x] unity-rendering.
- [x] mobile.
- [x] game-systems.
- [x] dreamy-foundation.
- [x] dreamy-packages.
- [x] production.

## Presets

- [x] core.
- [x] unity-minimal.
- [x] unity-production.
- [x] unity-full.
- [x] dreamy-project.
- [x] dreamy-production.
- [x] dreamy-package.
- [x] dreamy-template.
- [x] dreamy-full.

## Installer

- [x] install.
- [x] detect.
- [x] doctor.
- [x] update.
- [x] uninstall.
- [x] dry-run.
- [x] managed block preservation.
- [x] compatibility-aware skill installation.

## Compatibility

- [x] package refresh script.
- [x] drift report.
- [x] package/tag/version checks.
- [x] asmdef dependency checks.
- [x] third-party drift checks.

## CI

- [x] npm ci.
- [x] npm test.
- [x] validate.
- [x] deterministic eval.
- [x] release gate.
- [x] compatibility gate.

## Release

- [x] alpha version.
- [ ] beta version.
- [x] changelog automation.
- [x] npm artifact.
- [ ] GitHub release.
- [x] checksum.
- [ ] v1.0 internal production release.

---

# 67. FINAL PRINCIPLE

Preserve the current repository architecture.

The next development cycle should focus on turning the toolkit from a well-designed framework into a deeply useful Unity production system by expanding:

```text
SKILL DEPTH
+
DOMAIN COVERAGE
+
EXECUTION AGENTS
+
REAL UNITY HARNESS
+
BEHAVIOR EVALS
```

The toolkit should ultimately behave like a Dreamy-aware Unity engineer, not a directory full of Markdown that has achieved consciousness through naming conventions.

