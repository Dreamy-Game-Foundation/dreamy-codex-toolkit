# Dreamy Codex Toolkit — Agent & Skill Depth Expansion Plan

> Target repository: `Dreamy-Game-Foundation/dreamy-codex-toolkit`
>
> Audit date: 2026-08-15
>
> Scope: deepen existing agents and skills before aggressively increasing catalog breadth.
>
> Companion roadmap: `DREAMY_CODEX_TOOLKIT_NEXT_STEPS.md`

---

# 1. Objective

The current toolkit already has broad coverage:

- specialized Codex agents;
- Unity domain skills;
- Dreamy package skills;
- gameplay/system/platform/production skills;
- compatibility and evidence infrastructure;
- deterministic eval catalog;
- benchmark and Unity harness foundations.

The next content phase should **not** primarily add more agent names or more shallow `SKILL.md` files.

The goal is:

> Make each existing agent behave like a real specialist, and make each skill contain enough domain-specific decision knowledge to materially change implementation quality.

The target evolution is:

```text
Current
role prompt
  + generic workflow
  + broad safety rules
  + short domain notes

        ↓

Target
specialist mental model
  + precise activation boundary
  + diagnostic / implementation playbooks
  + decision tables
  + failure signatures
  + project inspection protocol
  + evidence requirements
  + executable verification
  + domain-specific benchmark cases
```

A deeper toolkit should make this observable:

```text
same user request
      ↓
different selected specialist
      ↓
different evidence inspected
      ↓
different decision model
      ↓
different implementation/review strategy
      ↓
measurably better result
```

---

# 2. Current depth assessment

## 2.1 Agent layer

The current agents generally have strong role separation.

Examples already present:

- project analyst;
- planner;
- architect;
- Unity developer;
- Unity editor;
- debugger;
- tester;
- code reviewer;
- performance engineer;
- build engineer;
- package maintainer;
- release validator;
- docs manager;
- skill author.

Their prompts already contain useful:

- mission boundaries;
- read/write sandbox expectations;
- workflows;
- hard prohibitions;
- output contracts.

That is a good **agent skeleton**.

The main missing depth is:

```text
role
≠
expertise
```

A specialist prompt becomes substantially more useful when it also knows:

- which evidence to inspect first for each failure class;
- how to distinguish similar-looking problems;
- which options are safe in which context;
- which invariants must hold;
- which Unity-specific traps frequently break otherwise valid C#;
- when another specialist should take ownership;
- which tests prove the change;
- what should cause the agent to stop instead of guessing.

## 2.2 Skill layer

The skill schema is already moving in the correct direction.

The skill-author agent expects sections such as:

```text
Purpose
When To Use
When Not To Use
Domain Model
Required Inspection
Decision Tree
Workflow
Architecture Rules
Anti-patterns
Common Failure Modes
Allowed Claims
Verification
References
```

The issue is not the structure.

The issue is **domain information density**.

Several generic Unity skills currently share very similar:

- Required Inspection;
- Workflow;
- Architecture Rules;
- Common Failure Modes;
- Verification;
- Allowed Claims.

This produces consistency, but too much shared boilerplate reduces the value of activating a specific skill.

For example:

```text
unity-async
unity-profiling
unity-navigation
unity-ui
unity-rendering
...
```

should not merely differ in two anti-pattern bullets and one short domain model.

Their inspection protocol, decision tree, failure taxonomy, verification method, and reference material should diverge substantially.

---

# 3. Design principle: Depth, not prompt inflation

Do not equate depth with longer prompts.

The wrong approach is:

```text
add 300 generic lines to every agent
```

The correct approach is:

```text
small agent kernel
+
deep domain skills
+
references/playbooks
+
structured project evidence
+
specialist evals
```

Target information architecture:

```text
Agent
├── identity / responsibility
├── operating protocol
├── routing / handoff
├── evidence discipline
├── completion contract
└── selected skills
      ├── SKILL.md
      ├── references/
      ├── checklists/
      ├── examples/
      └── fixtures/evals
```

The agent should remain relatively compact.

The domain depth should mostly live in skills and references.

---

# 4. Introduce an explicit depth model

Add a machine-readable depth model for every agent and skill.

Recommended levels:

```text
D0 — Stub
D1 — Routing
D2 — Safe Guidance
D3 — Practitioner
D4 — Specialist
D5 — Evidence-Proven Specialist
```

## D0 — Stub

Only name and description.

Not acceptable for production use.

## D1 — Routing

Knows:

- when to activate;
- when not to activate;
- broad owner.

Useful only to route work.

## D2 — Safe Guidance

Adds:

- architecture rules;
- prohibitions;
- broad workflow;
- verification requirement.

Most existing content is around this level.

## D3 — Practitioner

Adds:

- domain model;
- real decision tree;
- common implementation patterns;
- multiple failure modes;
- concrete inspection targets;
- test strategy.

## D4 — Specialist

Adds:

- failure signatures;
- competing-hypothesis discrimination;
- migration/change playbooks;
- performance/platform implications;
- version/API compatibility handling;
- domain-specific references;
- handoff rules;
- examples from real incidents.

## D5 — Evidence-Proven Specialist

Adds:

- executable benchmark coverage;
- fixture projects;
- expected diff/result;
- failure regression cases;
- compatibility evidence;
- measured benchmark improvement.

For v0.1.0, do not require every skill to be D5.

Recommended targets:

```text
P0 Dreamy skills       -> D4+
Critical Unity skills  -> D4+
Other P1 skills        -> D3+
Agents                 -> D4 operating protocol
Release-critical paths -> D5 evidence
```

---

# 5. Add depth metadata

Extend the skill index.

Example:

```json
{
  "name": "unity-async",
  "category": "unity",
  "priority": "P0",
  "depth": "D4",
  "maturity": "specialist",
  "owners": [
    "dreamy_unity_developer",
    "dreamy_debugger",
    "dreamy_code_reviewer"
  ],
  "requiresEvidence": [
    "project-code",
    "manifest"
  ],
  "references": 4,
  "evalCases": [
    "async-owner-destroyed",
    "async-double-submit",
    "async-scene-transition"
  ],
  "file": "skills/unity-async/SKILL.md"
}
```

For agents:

```json
{
  "name": "dreamy_debugger",
  "depth": "D4",
  "primarySkills": [],
  "handoffTo": [],
  "evalGroups": [],
  "writePolicy": "assigned-fix-only"
}
```

---

# 6. Create a quality rubric for skill depth

A skill should be scored on actual usefulness, not line count.

Suggested 100-point rubric:

| Dimension | Points |
|---|---:|
| Activation precision | 10 |
| Domain model | 10 |
| Inspection specificity | 10 |
| Decision depth | 15 |
| Failure modes / diagnosis | 15 |
| Implementation playbooks | 15 |
| Verification strategy | 10 |
| Evidence/source quality | 10 |
| Cross-skill handoff clarity | 5 |

Suggested maturity:

```text
< 40  = D1
40-54 = D2
55-69 = D3
70-84 = D4
85+   = D5 candidate
```

D5 additionally requires executed eval evidence.

---

# 7. Agent architecture v2

Every agent should have the same small outer contract, but a different expert core.

Recommended agent structure:

```text
name = "..."

description = "..."

developer_instructions =
ROLE

MISSION

OWNERSHIP BOUNDARY

ACTIVATION CONDITIONS

MANDATORY PREFLIGHT

DOMAIN REASONING MODEL

OPERATING MODES

SPECIALIST PLAYBOOKS

SKILL ACTIVATION RULES

HANDOFF RULES

STOP CONDITIONS

WRITE / MUTATION POLICY

VERIFICATION CONTRACT

OUTPUT CONTRACT
```

Do not make every section huge.

The key new sections are:

```text
DOMAIN REASONING MODEL
OPERATING MODES
SPECIALIST PLAYBOOKS
HANDOFF RULES
STOP CONDITIONS
```

---

# 8. Shared agent kernel

Extract rules duplicated across all agents into a shared conceptual kernel.

Examples:

```text
respect AGENTS.md
inspect before claiming
prefer repository truth
do not invent Dreamy APIs
preserve user-owned files
record degraded verification
avoid unrelated changes
```

Platform rendering can inject this kernel.

Then agent prompts can spend tokens on specialist differences.

Conceptually:

```text
agent prompt =
shared safety kernel
+ role protocol
+ activated skill knowledge
+ project profile
```

This avoids fourteen prompts repeating the same generic safety prose.

---

# 9. Deepen `dreamy_project_analyst`

## Current strength

Already correctly separates:

```text
declared
resolved
observed
supported
unknown
drift
```

This is excellent foundation.

## Target depth

Turn it into the toolkit's **evidence router**.

Add a capability evidence graph:

```text
signal
  ↓
evidence
  ↓
confidence
  ↓
capability
  ↓
skill/agent routing
  ↓
required verification
```

Add confidence levels:

```text
confirmed
strongly-inferred
weakly-inferred
unknown
contradicted
```

Add detection rules:

```text
URP package installed
≠ active URP pipeline

Addressables package installed
≠ Addressables used by feature

UniTask installed
≠ async ownership is UniTask-based

Dreamy package manifest entry
≠ public API verified
```

Add project-change awareness:

- clean/dirty git;
- changed packages;
- changed asmdefs;
- changed ProjectSettings;
- changed scenes/prefabs;
- recent migration evidence.

Add routing matrix:

```text
manifest/asmdef drift
    -> package maintainer

runtime exception
    -> debugger

scene/prefab mutation
    -> unity editor

multi-owner design
    -> architect

measured frame regression
    -> performance engineer
```

Depth evals:

- false URP inference;
- package present but unused;
- manifest vs lock mismatch;
- Runtime assembly importing Editor;
- Dreamy package with known drift;
- unsupported Unity version;
- project with conflicting signals.

---

# 10. Deepen `dreamy_plan`

Target role:

> Not a prettier TODO-list generator. It should be a **change impact planner**.

Add a planning risk model for each proposed change:

```text
behavior risk
serialization risk
persistence/migration risk
scene/prefab risk
package/API risk
async/lifecycle risk
performance risk
platform/build risk
release risk
```

Use qualitative levels:

```text
none
low
medium
high
unknown
```

Do not invent numerical probabilities.

Each implementation step should contain:

```text
owner
precondition
files/assets
operation
expected invariant
verification
rollback/recovery
```

Add migration planning patterns:

- save-schema migration;
- serialized field rename;
- prefab component replacement;
- package version migration;
- Addressables key migration;
- service ownership migration;
- scene split/merge;
- API deprecation migration.

Stopping rule:

If a plan depends on an unverified API contract, do not continue decomposition as if it were fact. Insert an evidence-resolution step.

---

# 11. Deepen `dreamy_architect`

This should become one of the deepest agents.

Add architecture decision domains.

## Ownership

```text
static config
persistent state
runtime state
business logic
presentation state
scene ownership
asset ownership
platform integration
lifecycle ownership
```

## Dependency direction

```text
foundation
  ↑
domain
  ↑
feature
  ↑
presentation/composition
```

No package should reach upward into a specific project.

## Service resolution

Create decision guidance for:

```text
Service Locator
explicit constructor/method dependency
serialized MonoBehaviour dependency
ScriptableObject reference
event/message
direct feature reference
```

Do not universally promote one mechanism.

## Events

Decision criteria:

```text
direct call
event
command
query
state observation
```

## State machines

Distinguish:

- state as behavior;
- state as enum;
- workflow state;
- animation state;
- persistent progression state.

## Data

Explicit comparison:

```text
DataConfig
DataSave
runtime model
ScriptableObject authoring
scene serialized state
PlayerPrefs
remote config
```

## Package boundary

Include:

- when logic belongs in package;
- when it must remain project-local;
- API surface minimization;
- extension seams;
- runtime/editor split.

Add an ADR mini-format:

```text
Context
Decision
Owner
Dependency direction
Alternatives
Why rejected
Migration impact
Verification
```

Architecture evals should intentionally contain attractive but wrong abstractions.

---

# 12. Deepen `dreamy_unity_developer`

This agent should become the main implementation orchestrator.

Add operating modes:

```text
feature implementation
bug fix
refactor
integration
migration
small UI wiring
runtime system work
```

Different mode → different preflight.

Add Unity implementation invariants.

## MonoBehaviour

- initialization order;
- Awake/OnEnable/Start boundaries;
- disabled object behavior;
- destroy path;
- scene unload;
- domain reload implications.

## Serialization

- serialized field compatibility;
- field rename migration;
- polymorphism restrictions;
- references and GUIDs;
- prefab overrides;
- runtime-created state vs serialized authoring state.

## Events

- subscribe owner;
- unsubscribe owner;
- duplicate subscription;
- pooled object re-enable;
- scene reload.

## Async

- operation owner;
- cancellation owner;
- exception observation;
- scene/panel destruction;
- duplicate request.

## Pooling

- spawn reset;
- despawn cleanup;
- retained events;
- retained cancellation;
- particles/tweens;
- mutable runtime state.

## UI

- presenter/model boundary;
- button duplicate listeners;
- panel lifecycle;
- safe area;
- layout rebuild;
- navigation/input ownership.

Add implementation strategy.

Before code:

```text
find existing owner
find nearest established pattern
choose least-invasive extension point
predict serialized/runtime impact
```

After code:

```text
compile
targeted behavior test
lifecycle test
diff
asset/serialization check
```

Add handoff rules:

```text
requires scene/prefab mutation
-> unity editor

uncertain owner
-> architect

root cause unclear
-> debugger

performance justification
-> performance engineer

package API/asmdef change
-> package maintainer
```

---

# 13. Deepen `dreamy_unity_editor`

This agent should specialize in Unity state mutation, not generic file editing.

Add Unity Editor object model:

```text
scene instance
prefab asset
prefab instance
nested prefab
prefab variant
Prefab Stage
ScriptableObject asset
imported asset
sub-asset
ProjectSettings
```

Add safe mutation playbooks.

## Scene

- load target scene explicitly;
- check dirty state;
- mutate exact objects;
- save exact scene;
- reopen/read result.

## Prefab

- identify asset vs instance;
- understand variant ownership;
- avoid accidental override flattening;
- save only intended owner.

## SerializedObject

Prefer supported serialized APIs for editor automation where required.

## Undo

Interactive/editor tooling should preserve Undo where appropriate.

## AssetDatabase

Define safe use of:

- refresh;
- import;
- create;
- move;
- delete;
- GUID preservation.

## Importer mutation

Capture old settings and validate reimport scope.

Add forbidden-actions depth.

Do not only say “don't edit YAML blindly.” Explain that YAML inspection may be useful for read-only investigation/diff review, while mutation should prefer Unity-supported editor APIs.

Evals:

- nested prefab;
- variant override;
- missing serialized reference;
- component replacement;
- GUID preservation;
- targeted asset reimport.

---

# 14. Deepen `dreamy_debugger`

This can become the strongest differentiated agent.

Current phased method is already good.

Now add a **failure knowledge system**.

Symptom taxonomy:

```text
compile
domain reload
editor exception
runtime exception
wrong state
intermittent state
scene transition
serialization
save corruption
async race
event duplication
pool stale state
Addressables lifetime
NavMesh
physics
UI
rendering
performance
Android
iOS
CI-only
package drift
```

Failure-signature record example:

```yaml
id: pooled-event-duplicate
symptoms:
  - callback count grows after respawn
likely_causes:
  - duplicate subscription
  - missing unsubscribe
  - pool reset omission
inspect:
  - OnEnable
  - OnDisable
  - spawn/despawn
  - event owner
discriminators:
  - fresh instantiate does not reproduce
verification:
  - spawn/despawn N times
  - assert one callback
```

Use a hypothesis table during nontrivial debugging:

| Hypothesis | Evidence for | Evidence against | Cheapest test |
|---|---|---|---|

Root-cause invariant:

```text
what first became incorrect?
who owned that state?
what path allowed it?
why did protection/tests miss it?
```

Add regression rule:

```text
original reproduction
+
regression protection when economical
```

---

# 15. Deepen `dreamy_tester`

The current test ladder is a strong base.

Expand into a **proof-selection agent**.

Test selection matrix:

| Risk | Cheapest valid proof |
|---|---|
| pure calculation | unit |
| ScriptableObject serialization | EditMode |
| MonoBehaviour lifecycle | PlayMode |
| prefab wiring | EditMode / Editor |
| async scene flow | PlayMode |
| importer | Editor integration |
| Gradle dependency | Android build |
| device permission | device |
| thermal/perf | device profiling |

Add fixture patterns:

- temporary assets;
- prefab fixture;
- scene fixture;
- package fixture;
- save migration fixture;
- fake clock;
- deterministic random seed;
- test service doubles;
- Addressables test group.

Add negative testing:

```text
duplicate
re-entry
cancel
destroy
disable
scene unload
invalid data
missing reference
old save
partial migration
unsupported platform
```

Add flaky-test policy:

Before weakening a flaky test:

```text
identify nondeterministic owner
remove timing assumptions
replace arbitrary delays
capture lifecycle state
```

Add test-smell catalog:

- testing implementation details;
- huge scene integration for pure function;
- arbitrary WaitForSeconds;
- shared mutable fixture;
- relying on test order;
- asserting logs instead of state;
- ignoring teardown.

---

# 16. Deepen `dreamy_code_reviewer`

Current severity model is useful.

Expand review into domain passes:

```text
1. behavioral correctness
2. ownership/state
3. lifecycle/async
4. serialization/assets
5. package/asmdef
6. test quality
7. performance
8. platform/release
9. diff hygiene
```

Only run relevant passes.

Add confidence:

```text
severity
confidence
evidence
reproduction/proof
```

Avoid high-severity claims based purely on style preference.

Add review anti-patterns:

- speculative bug without code path;
- architecture preference presented as correctness;
- duplicated findings;
- demanding unrelated refactor;
- missing user-visible impact;
- ignoring existing project convention.

Add “review the test” rule:

```text
does the test prove the desired behavior,
or merely mirror the implementation?
```

---

# 17. Deepen `dreamy_performance_engineer`

Current “measure before optimize” rule is correct.

Now add specialist measurement protocols.

Performance domains:

## CPU

- main thread;
- scripts;
- physics;
- animation;
- UI;
- job scheduling;
- render submission.

## GPU

- fill rate;
- overdraw;
- shader complexity;
- draw calls;
- render targets;
- post-processing;
- resolution.

## GC / managed memory

- alloc/frame;
- temporary collections;
- boxing;
- closures;
- strings;
- async allocations;
- LINQ only when actually measured.

## Native / asset memory

- textures;
- meshes;
- audio;
- bundles;
- duplicated assets;
- Addressables residency.

## Loading

- sync IO;
- AssetBundle;
- scene activation;
- shader warmup;
- initialization burst.

## Mobile

- thermal throttling;
- battery;
- sustained performance;
- device class;
- memory kill risk.

Baseline protocol:

```text
scenario
device/build
quality settings
duration
metric
baseline
change
after
variance
```

No hardcoded universal budget unless the project declares one.

---

# 18. Deepen `dreamy_build_engineer`

Turn current triage list into a build pipeline model.

```text
C# compile
  ↓
Unity asset/build preprocessing
  ↓
player generation
  ↓
IL2CPP
  ↓
native compile/link
  ↓
platform dependency resolution
  ↓
sign/package
  ↓
store validation
  ↓
install/runtime
```

Every failure should first be assigned to one stage.

Android knowledge packs:

```text
gradle-dependency-resolution.md
android-manifest-merge.md
r8-proguard.md
target-sdk.md
signing.md
edm4u.md
google-services.md
```

iOS knowledge packs:

```text
xcode-project.md
pods-spm.md
signing-capabilities.md
privacy-manifest.md
framework-linking.md
minimum-ios.md
archive-export.md
```

CI knowledge packs:

```text
unity-license.md
cache.md
case-sensitivity.md
secrets.md
headless-build.md
artifact-validation.md
```

Important rule:

Never solve build failures with:

```text
upgrade everything
delete all caches
regenerate whole project
```

until evidence says that scope is necessary.

---

# 19. Deepen `dreamy_package_maintainer`

This agent should know package engineering at specialist depth.

Package anatomy:

```text
package.json
Runtime/
Editor/
Tests/
Samples~
Documentation~
CHANGELOG.md
README.md
LICENSE
asmdefs
.meta
```

depending on package type.

Dependency model:

```text
manifest dependency
asmdef reference
optional integration
editor-only dependency
test-only dependency
transitive assumption
```

API compatibility playbooks:

- public type rename;
- method signature change;
- serialized type move;
- namespace change;
- assembly rename;
- package ID change;
- dependency range/version change.

Add a SemVer decision table according to the toolkit's declared package policy.

Package release evidence:

```text
resolved commit
package version
manifest graph
asmdef graph
Unity test matrix
API diff
changelog
tag
```

---

# 20. Deepen `dreamy_release_validator`

Make this the final evidence graph validator.

Release graph:

```text
release commit
├── validation report
├── installer lifecycle evidence
├── compatibility evidence
├── Unity evidence
├── benchmark report
├── package artifact
└── docs/version/changelog
```

Every artifact must point back to the same release revision.

Gate classes:

```text
structural
behavioral
compatibility
platform
quality
provenance
documentation
```

Staleness rules matter.

Examples:

```text
benchmark from previous commit
Unity result before package manifest change
compatibility observation before upstream package update
```

Treat staleness explicitly.

Recommended output:

```yaml
status: pass|fail|blocked
releaseRevision:
blockingGates:
staleEvidence:
warnings:
residualRisk:
```

---

# 21. Deepen `dreamy_docs_manager`

This agent should become a documentation truth validator.

Information classes:

```text
contract
observed behavior
tested behavior
example
recommendation
experimental
unsupported
```

For command snippets:

```text
does command exist?
does option exist?
does path exist?
does output claim match current behavior?
```

For API docs:

```text
is API verified?
for which package version/commit?
is it public?
is it stable?
```

Add drift detection:

```text
README claims
vs
toolkit.json
vs
CLI commands
vs
compatibility records
```

---

# 22. Deepen `dreamy_skill_author`

This agent becomes the guardian of knowledge quality.

Add authoring process:

```text
1. identify a repeated task/failure
2. identify owner and activation boundary
3. gather primary evidence
4. build domain model
5. enumerate decisions
6. add failure signatures
7. add verification
8. split references
9. create eval cases
10. score with depth rubric
```

Reject skill creation when:

- the topic is a one-off fact;
- a narrower existing skill can absorb it;
- content would just repeat global rules;
- no distinct decision model exists;
- activation description cannot be made precise.

New D3+ skill requirements:

```text
at least one meaningful decision tree
at least three domain-specific failure modes
domain-specific inspection targets
domain-specific verification
at least one eval case
```

D4 should additionally include:

```text
failure signatures
deep references
handoff rules
version/compatibility behavior where relevant
```

---

# 23. Create a Skill Knowledge Pack convention

A skill should not be forced into one giant Markdown file.

Recommended structure:

```text
skills/unity-async/
├── SKILL.md
├── references/
│   ├── ownership.md
│   ├── cancellation.md
│   ├── unitask.md
│   ├── coroutine.md
│   └── failure-signatures.md
├── checklists/
│   ├── implementation.md
│   └── review.md
└── examples/
    ├── owner-destroyed.md
    └── duplicate-submit.md
```

Not every skill needs every directory.

Create them only when they add durable value.

---

# 24. Rewrite generic Unity skills around domain-specific questions

Every Unity skill should answer:

```text
What objects exist in this domain?
Who owns them?
What lifecycle do they have?
What state is serialized?
What is runtime-only?
What are the main competing implementation choices?
How do I choose among them?
What breaks most often?
What evidence distinguishes those failures?
What is the cheapest valid verification?
What changes across Unity/package versions?
```

If a skill cannot answer these, it is still too shallow.

---

# 25. Priority depth pass — Unity skills

## Tier U0 — deepen first

These affect a huge percentage of Unity bugs:

```text
unity-foundations
unity-serialization
unity-async
unity-scene-prefab
unity-editor-tooling
unity-testing
unity-project-analysis
unity-memory
unity-profiling
```

Target: D4.

## Tier U1 — gameplay infrastructure

```text
unity-addressables
unity-input-system
unity-navigation
unity-physics
unity-physics2d
unity-ui
unity-animation
unity-camera
unity-cinemachine
```

Target: D3/D4.

## Tier U2 — rendering/VFX specialization

```text
unity-rendering
unity-urp
unity-material
unity-shader
unity-particles
unity-vfx
```

Target: D3 initially; D4 where production need is proven.

---

# 26. `unity-serialization` depth blueprint

This should be a foundational skill.

Add references for:

```text
field serialization rules
SerializeReference
ScriptableObject ownership
MonoBehaviour references
prefab overrides
GUID/fileID
FormerlySerializedAs
type/namespace/assembly moves
domain reload
serialization callbacks
managed runtime state
```

Failure signatures:

- field reset after domain reload;
- missing reference after prefab change;
- data duplicated unintentionally;
- old save/scene cannot deserialize;
- variant override silently replaced.

Verification:

- reopen asset;
- domain reload;
- prefab reopen;
- EditMode serialization fixture;
- migration test.

---

# 27. `unity-async` depth blueprint

Current skill has correct ownership emphasis.

Deepen with a choice matrix:

```text
Coroutine
Task
UniTask
callback/event
Unity AsyncOperation
```

Questions:

```text
Does operation require a result?
Who cancels it?
Does it cross scene lifetime?
Does it touch Unity API after await?
Does it run per-frame?
How are exceptions observed?
Can it be called twice?
```

Failure signatures:

- MissingReferenceException after await;
- duplicate reward after double click;
- operation continues after panel close;
- cancellation treated as error;
- unobserved exception;
- pooled owner reuses old token;
- scene unload leaves callback.

---

# 28. `unity-addressables` depth blueprint

Add:

```text
key/reference ownership
AssetReference
handle ownership
InstantiateAsync vs LoadAssetAsync
Release vs ReleaseInstance
dependency bundles
scene loading
catalog update
remote content
memory residency
failure/retry
```

Failure signatures:

- asset black/missing only in build;
- invalid key;
- bundle never released;
- release too early;
- duplicated load;
- scene handle leak;
- remote catalog mismatch.

Verification:

- player build;
- content catalog;
- memory before/after;
- repeated load/unload;
- offline/failure branch.

---

# 29. `unity-navigation` depth blueprint

Model:

```text
NavMesh data
agent
destination
path
off-mesh link
obstacle
carving
moving target
sampling
stopping
```

Failure signatures:

- `SetDestination` false;
- agent not on NavMesh;
- remainingDistance invalid;
- oscillation near target;
- baked gap blocked;
- stale path;
- moving between floors.

Add decision guidance for:

```text
SamplePosition radius
warp
stopping distance
pathPending
path status
repath cadence
agent enable/disable
```

---

# 30. `unity-ui` depth blueprint

Add subdomains:

```text
Canvas
RectTransform
layout
event system
input
safe area
world-space UI
sorting
masking
TMP
panel lifecycle
navigation
animation
```

Failure signatures:

- LayoutGroup does not expand;
- button blocked by overlay;
- world-space joystick captures raycast;
- Canvas invisible in Game view;
- safe-area incorrect after rotation;
- pooled panel duplicates listeners;
- rebuild spikes.

Verification should include:

- multiple aspect ratios;
- safe areas;
- touch input;
- navigation;
- open/close repetition;
- target device where relevant.

---

# 31. Priority depth pass — Dreamy skills

Dreamy skills are the toolkit's unique moat.

They should be deeper than generic Unity skills.

Target all P0 Dreamy package skills at D4.

---

# 32. Dreamy skill standard

Every Dreamy package skill should contain:

```text
Verified package identity
Supported/observed version
Verified commit/source evidence
Public API surface
Architecture role
Primary types/concepts
Initialization/lifecycle
Dependency contract
Typical usage flows
Known integration constraints
Failure signatures
Migration/version concerns
Verification path
Unsupported/unverified areas
```

Do not copy package source wholesale.

Describe stable contracts and evidence.

---

# 33. `dreamy-core` deepening

The existing references for:

- service locator;
- event bus;
- state machine;
- tick service;
- app lifecycle;

are exactly the right direction.

Deepen each into:

```text
concept
owner
lifecycle
correct use cases
wrong use cases
dependency direction
failure signatures
test strategy
integration example
```

Add a cross-reference map:

```text
Architecture
├── Services
├── Events
├── State
├── Lifecycle
└── Tick/update
```

The agent should know when **not** to use each.

---

# 34. `dreamy-dataconfig` deepening

Core questions:

```text
What is authoring/static configuration?
What owns schema?
What owns IDs/keys?
How is data loaded?
How is validation performed?
What can change remotely?
What cannot be player state?
```

References:

```text
schema.md
key-stability.md
validation.md
migration.md
remote-source.md
failure-signatures.md
```

Important discriminator:

```text
DataConfig
≠ runtime mutable state
≠ save data
```

---

# 35. `dreamy-datasave` deepening

Add:

```text
save root ownership
key strategy
versioning
migration
atomicity
default creation
reset
partial corruption
branch/profile separation
cloud/local boundary if supported
```

Failure signatures:

- save key collision;
- project branch overwrites another branch;
- field added but migration missing;
- save object mutated unexpectedly;
- reset clears wrong scope.

Evals should test data preservation, not merely API syntax.

---

# 36. `dreamy-ui` deepening

Existing presenter/panel references are a good start.

Add:

```text
panel ownership
presenter boundary
view state
navigation
open/close
subscriptions
animation lifetime
resource loading
safe-area/mobile
pooling if applicable
```

Create explicit “business logic does not live here” examples.

---

# 37. `dreamy-assets` deepening

Model asset pipeline:

```text
identifier
source
load
handle
owner
lifetime
release
fallback
```

Cover:

- direct refs;
- Addressables if integrated;
- asset registry;
- runtime ownership;
- memory;
- invalid/missing asset behavior.

---

# 38. `dreamy-audio` deepening

Model:

```text
audio data
channel/category
source
play request
lifetime
pool
volume/mute
scene transition
```

Failure signatures:

- source leak;
- duplicate music;
- volume not persisted;
- pooled audio source stale;
- clip unloaded too early.

---

# 39. `dreamy-localization` deepening

Cover:

```text
stable key ownership
fallback
format arguments
pluralization if supported
font/TMP
dynamic content
language switching
asset localization
CSV/import pipeline if supported
```

Failure signatures:

- missing key;
- stale key after rename;
- layout overflow;
- font missing glyph;
- incorrect runtime refresh.

---

# 40. `dreamy-mobile` deepening

Make this a cross-domain mobile policy skill.

Cover:

```text
performance
safe area
touch
orientation
pause/resume
low memory
permissions
network state
battery/thermal
Android back
iOS lifecycle
```

It should activate alongside narrower skills, not replace them.

---

# 41. `dreamy-package-maintainer` skill deepening

Separate:

```text
package architecture
manifest
asmdef
public API
tests
release
compatibility ledger
```

This skill should back the package-maintainer agent with actual detailed decisions rather than duplicating the role prompt.

---

# 42. Gameplay skill depth strategy

Gameplay skills should avoid turning into design-pattern encyclopedias.

They should be built around runtime invariants.

Example `combat`:

```text
combatant
target
attack request
validation
damage calculation
application
feedback
death
cleanup
```

Questions:

```text
Who is authoritative?
Can damage be applied twice?
Can target disappear?
What is pooled?
What is persisted?
What fires events?
How is animation synchronized?
```

---

# 43. `enemy-ai` deepening

Cover:

```text
sensing
target selection
pathing
state
action
cooldown
animation
damage
recovery
```

Failure signatures:

- multiple enemies choose invalid target;
- oscillation near target;
- state changes while animation locked;
- NavMesh lost;
- dead target retained;
- pooled AI retains state.

---

# 44. `game-state` deepening

Disambiguate:

```text
application state
game mode
match state
player progression
feature state
UI state
FSM state
```

One of the largest sources of bad architecture is calling every enum “game state.”

Skill should force ownership clarification.

---

# 45. `gameplay-pooling` deepening

This deserves D4 because pooling creates many Unity lifecycle bugs.

Checklist on spawn:

```text
transform
active state
health
events
async
tweens
particles
timers
AI state
NavMesh
UI
target
references
```

Checklist on despawn:

```text
unsubscribe
cancel
stop
clear owner
release handles
remove registry entries
```

---

# 46. Third-party skill strategy

Do not create third-party skills from memory.

Each should identify:

```text
package ID
observed version
source
activation signal
verified APIs
unsupported APIs
Unity compatibility
platform caveats
```

If version cannot be verified:

```text
routing/safety skill
not API reference skill
```

---

# 47. Build a failure-signature library

Create reusable schema under a shared knowledge area or skill-local files.

Example:

```yaml
id: unity-navmesh-agent-off-mesh
domain: unity-navigation
symptoms:
  - SetDestination returns false
  - agent.isOnNavMesh false
inspect:
  - enabled
  - activeInHierarchy
  - baked surface
  - agent position
  - SamplePosition
likelyCauses:
  - spawn outside baked mesh
  - surface not loaded
  - agent disabled
verification:
  - assert isOnNavMesh before SetDestination
```

Benefits:

- debugger uses it;
- developer uses it;
- reviewer uses it;
- tester derives regression;
- evals derive cases from it.

This is much higher leverage than adding duplicate prose to five agents.

---

# 48. Build a decision-record library

Create decision references:

```text
decisions/
  async-mechanism.md
  data-owner.md
  dependency-injection.md
  event-vs-direct-call.md
  pooling-vs-instantiation.md
  project-vs-package.md
  editmode-vs-playmode-test.md
```

Each decision record:

```text
Context
Options
Signals
Trade-offs
Choose A when
Choose B when
Avoid when
Verification
```

Agents consume these through skills.

---

# 49. Add specialist handoff contracts

Agents currently have roles, but routing should be more explicit.

Define:

```text
primary owner
consulted specialist
handoff trigger
returned evidence
```

Example:

```text
dreamy_unity_developer
    ↓ uncertain root cause
dreamy_debugger
    ↓ root cause + evidence
dreamy_unity_developer
    ↓ implementation
dreamy_tester
    ↓ verification
dreamy_code_reviewer
```

Do not force this whole chain for trivial work.

Use it based on risk.

---

# 50. Add a task risk classifier

Before specialist routing, classify task:

```text
R0 — trivial/local
R1 — contained
R2 — cross-owner
R3 — serialization/data/package/platform risk
R4 — release-critical/destructive
```

Example:

```text
rename local variable -> R0

small isolated MonoBehaviour logic -> R1

feature touching UI + save + service -> R2

save migration / package asmdef -> R3

store release/signing/destructive migration -> R4
```

Risk controls:

```text
R0 -> one agent, minimal validation
R1 -> one agent + targeted skill/test
R2 -> analyst/plan or architecture if needed
R3 -> specialist + explicit evidence
R4 -> release validator + full evidence chain
```

---

# 51. Add skill composition rules

A weakness of large skill catalogs is skill pile-up.

Define:

```text
primary skill
supporting skills
policy skills
```

Example:

```text
Task:
fix pooled enemy async attack leak

Primary:
gameplay-pooling

Supporting:
unity-async
enemy-ai

Policy:
dreamy-architecture
```

Only the primary skill should dominate reasoning.

Supporting skills add constraints.

---

# 52. Add negative activation examples

Descriptions should contain enough distinction to avoid over-triggering.

For each skill maintain tests:

```text
should activate
should maybe activate
should not activate
```

Example `unity-profiling`.

Should activate:

```text
game drops from 60 to 35 FPS after 5 minutes
```

Should not activate:

```text
replace this LINQ query because I prefer loops
```

unless there is measured performance context.

---

# 53. Add skill activation evals

Create routing eval dataset:

```json
{
  "prompt": "...",
  "expectedPrimarySkill": "...",
  "expectedSupportingSkills": [],
  "forbiddenSkills": []
}
```

Metrics:

```text
primary precision
primary recall
unnecessary skill activation
missing safety skill
```

This proves the catalog is usable instead of merely large.

---

# 54. Add reasoning-behavior evals

Do not test hidden chain-of-thought.

Test observable decisions.

Example async eval:

Prompt contains:

```text
async operation updates panel after delay
panel can close before completion
```

Expected observable behavior:

```text
identifies panel/operation ownership
asks/inspects cancellation path
does not suggest fire-and-forget async void
proposes destruction/close regression
```

---

# 55. Add mutation evals per high-value skill

Every D4 skill should eventually have at least one repository-edit fixture.

Examples:

```text
unity-serialization
  field rename preserving old data

unity-async
  cancel operation on owner close

gameplay-pooling
  remove stale event subscription

dreamy-datasave
  migrate save version safely

dreamy-package-maintainer
  fix manifest/asmdef dependency drift
```

---

# 56. Add adversarial evals

Test specialist restraint.

Cases:

```text
user suggests wrong root cause
user asks to mass-upgrade packages
user requests deleting .meta
user asks to put runtime code in Editor assembly
user calls observed support "tested"
user asks to optimize without profile evidence
```

Correct behavior is often to reject the proposed mechanism while still solving the actual goal.

---

# 57. Introduce knowledge provenance

Every nontrivial package/API claim should be traceable.

Reference header example:

```yaml
sourceType: official-doc|source-repo|project-observation|incident
package: com.dreamy.core
version: ...
commit: ...
observedAt: ...
confidence: verified
```

Not every general Unity principle requires metadata.

Use provenance for version-sensitive details.

---

# 58. Create incident-derived knowledge

The highest-value depth comes from real bugs.

Add a lightweight incident format:

```text
docs/incidents/
```

Example:

```yaml
id:
date:
domain:
symptom:
rootCause:
falseLeads:
fix:
verification:
generalizableLesson:
skills:
```

Then periodically promote recurring lessons into skill references.

The pipeline becomes:

```text
real bug
  ↓
incident
  ↓
failure signature
  ↓
skill update
  ↓
eval case
```

That gives the toolkit memory without stuffing project-specific anecdotes into prompts.

---

# 59. Depth linting

Add a validator that catches fake depth.

For D3+ skills, check presence of:

```text
Domain Model
Decision Tree
Common Failure Modes
Verification
```

For D4:

```text
references/
multiple domain-specific failure modes
handoff guidance
specific inspection targets
```

Do **not** judge quality only from presence.

Combine structural lint with review/eval policy.

---

# 60. Detect boilerplate duplication

Add a similarity report across `SKILL.md`.

Goal:

Find sections copied across most skills.

Classify shared content as:

```text
global rule -> move to rules/kernel
category rule -> category reference
domain rule -> keep in skill
```

If the same paragraph appears in 20 skills, it probably belongs elsewhere.

This reduces token waste and increases domain signal.

---

# 61. Suggested skill file budget

Do not enforce exact line counts.

Use rough guidance:

```text
SKILL.md
  80–180 focused lines

references/
  unlimited as justified

agent prompt
  compact operating contract
```

A skill should become longer only when the added content creates:

- a new decision;
- a new failure discriminator;
- a new verified workflow;
- a new constraint;
- a useful example.

---

# 62. Agent-specific benchmark groups

Create:

```text
benchmarks/agents/
  project-analyst/
  plan/
  architect/
  unity-developer/
  unity-editor/
  debugger/
  tester/
  reviewer/
  performance/
  build/
  package/
  release/
  docs/
  skill-author/
```

Each agent should be tested for:

```text
routing
specialist decision
restraint
evidence usage
handoff
completion output
```

---

# 63. Cross-agent workflow benchmarks

Test actual collaboration.

Scenario:

```text
bug:
save resets after package migration
```

Expected workflow:

```text
analyst
 -> identifies package/data drift

debugger
 -> finds schema/key root cause

architect
 -> decides migration owner if needed

developer/package-maintainer
 -> implements

tester
 -> validates old/new save

reviewer
 -> checks migration/data loss risk

release-validator
 -> verifies evidence
```

Again: do not invoke all agents for every task.

The benchmark verifies high-risk orchestration.

---

# 64. Skill maturity dashboard

Generate a report:

| Skill | Priority | Depth | References | Routing eval | Behavior eval | Mutation eval | Status |
|---|---:|---:|---:|---|---|---|---|

This immediately exposes:

```text
many files
≠
deep toolkit
```

Target visible progress by depth coverage.

---

# 65. Recommended depth KPIs

Track:

```text
% P0 skills at D4+
% P1 skills at D3+
% agents with specialist eval group
% D4 skills with failure signatures
% D4 skills with executable mutation eval
routing primary-skill accuracy
benchmark pass rate
critical safety failure count
```

Do not track:

```text
total prompt lines
total Markdown files
total agent count
```

as quality metrics.

---

# 66. Milestone S1 — Remove generic duplication

Goal:

Make existing skill activation meaningfully change context.

Work:

- [ ] run similarity audit;
- [ ] identify generic shared sections;
- [ ] move truly global rules to shared rules/kernel;
- [ ] define depth rubric;
- [ ] add depth metadata;
- [ ] select U0 + Dreamy P0 depth targets;
- [ ] add validator for maturity metadata.

Exit:

```text
Every selected D3/D4 skill has clearly unique decision knowledge.
```

---

# 67. Milestone S2 — Foundational Unity deepening

Deepen first:

- [ ] unity-foundations;
- [ ] unity-serialization;
- [ ] unity-async;
- [ ] unity-scene-prefab;
- [ ] unity-editor-tooling;
- [ ] unity-testing;
- [ ] unity-project-analysis;
- [ ] unity-memory;
- [ ] unity-profiling.

For each:

- [ ] richer domain model;
- [ ] decision table;
- [ ] failure signatures;
- [ ] inspection protocol;
- [ ] verification matrix;
- [ ] references;
- [ ] routing evals;
- [ ] behavior evals.

---

# 68. Milestone S3 — Dreamy package expert layer

Deepen:

- [ ] dreamy-core;
- [ ] dreamy-architecture;
- [ ] dreamy-dataconfig;
- [ ] dreamy-datasave;
- [ ] dreamy-assets;
- [ ] dreamy-ui;
- [ ] dreamy-audio;
- [ ] dreamy-localization;
- [ ] dreamy-editor-tools;
- [ ] dreamy-mobile;
- [ ] dreamy-testing;
- [ ] dreamy-package-maintainer.

Target:

```text
package skill = verified integration guide,
not generic architecture prose.
```

Add package-specific source provenance.

---

# 69. Milestone A1 — Agent Brain v2

Refactor all agents to shared structure.

- [ ] shared kernel;
- [ ] operating modes;
- [ ] specialist reasoning model;
- [ ] handoff rules;
- [ ] stop conditions;
- [ ] risk-aware behavior;
- [ ] skill composition rules;
- [ ] structured output contracts.

Keep prompts lean.

---

# 70. Milestone A2 — Specialist playbooks

Implement agent-specific playbooks.

Priority:

1. debugger;
2. Unity developer;
3. architect;
4. tester;
5. Unity editor;
6. package maintainer;
7. build engineer;
8. performance engineer;
9. reviewer;
10. project analyst;
11. release validator;
12. planner;
13. skill author;
14. docs manager.

This priority reflects direct impact on code correctness and production risk.

---

# 71. Milestone E1 — Failure library + incidents

- [ ] create failure signature schema;
- [ ] collect first 25 real failure signatures;
- [ ] link signatures to skills;
- [ ] create incident template;
- [ ] promote recurring bugs into reusable knowledge;
- [ ] add eval mapping.

Focus on failures already common in Dreamy Unity projects.

---

# 72. Milestone E2 — Routing quality

- [ ] primary/supporting skill model;
- [ ] positive activation cases;
- [ ] negative activation cases;
- [ ] agent routing cases;
- [ ] risk classification cases;
- [ ] measure unnecessary activation.

Goal:

The system should use **fewer, better-targeted skills**, not activate everything.

---

# 73. Milestone E3 — Evidence-proven depth

For every critical domain:

- [ ] one reasoning/decision benchmark;
- [ ] one adversarial benchmark;
- [ ] one repository mutation benchmark;
- [ ] executable verification where possible.

Target initial D5 domains:

```text
unity-serialization
unity-async
unity-testing
dreamy-core
dreamy-datasave
dreamy-package-maintainer
Android/iOS build path
release validation
```

---

# 74. Recommended implementation PR sequence

## PR 1 — Depth model

Add:

```text
depth levels
quality rubric
skill metadata
agent metadata
validation
dashboard generator
```

## PR 2 — Shared content extraction

Move repeated safety/architecture boilerplate out of individual skills.

Add duplication report.

Do not change behavior intentionally.

## PR 3 — Skill template v2

Update `dreamy_skill_author`.

Create canonical authoring guide.

Require D3/D4 completion rules.

## PR 4 — Unity serialization D4

Use this as the reference-quality skill.

Build:

```text
SKILL.md
references/
failure signatures
routing evals
behavior evals
mutation fixture
```

Other skills should imitate its **quality model**, not copy its prose.

## PR 5 — Unity async D4

Add:

- async mechanism matrix;
- ownership/cancellation;
- failure signatures;
- pooled/UI/scene cases;
- executable regressions.

## PR 6 — Unity scene/prefab/editor D4

Deepen:

```text
unity-scene-prefab
unity-editor-tooling
dreamy_unity_editor
```

Treat these as one vertical slice.

## PR 7 — Tester + testing D4

Deepen:

```text
dreamy_tester
unity-testing
dreamy-testing
```

Add test-selection and fixture library.

## PR 8 — Debugger D4

Build failure taxonomy and hypothesis protocol.

Connect failure library.

## PR 9 — Dreamy Core vertical slice

Deepen:

```text
dreamy-core
dreamy-architecture
dreamy_architect
dreamy_unity_developer
```

Add service/event/state/lifecycle decision references.

## PR 10 — Dreamy data vertical slice

Deepen:

```text
dreamy-dataconfig
dreamy-datasave
```

Add save/config ownership and migration evals.

## PR 11 — Reviewer vertical slice

Make reviewer consume:

- failure signatures;
- ownership invariants;
- testing rules;
- severity confidence.

## PR 12 — Build/mobile vertical slice

Deepen:

```text
android-build-release
ios-build-release
dreamy-mobile
dreamy_build_engineer
```

Add stage-based diagnostics.

## PR 13 — Performance vertical slice

Deepen:

```text
unity-memory
unity-profiling
dreamy_performance_engineer
```

Add baseline/after evidence protocol.

## PR 14 — Package/release vertical slice

Deepen:

```text
dreamy-package-maintainer
dreamy_package_maintainer
dreamy_release_validator
```

Tie decisions to compatibility/release evidence.

## PR 15 — Routing benchmark

Evaluate:

```text
agent selection
primary skill selection
supporting skill selection
over-activation
handoff
```

---

# 75. Suggested first failure-signature backlog

Start from recurring real Unity production problems.

1. Runtime asmdef references Editor.
2. Serialized reference lost after field/type move.
3. Prefab override accidentally applied to wrong owner.
4. Duplicate event subscription after enable/disable.
5. Pooled object retains stale event callback.
6. Async continuation touches destroyed object.
7. Duplicate UI click starts two async operations.
8. UniTask cancellation token owner outlives object.
9. Addressables handle leak.
10. Addressables object released too early.
11. Invalid Addressables key in build.
12. NavMesh agent spawned outside mesh.
13. `SetDestination` failure.
14. NavMesh oscillation near target.
15. UI raycast overlay blocks button.
16. LayoutGroup/ContentSizeFitter conflict.
17. SafeArea stale after orientation change.
18. Canvas/render camera mismatch.
19. Save key collision between branches/profiles.
20. Missing save migration.
21. DataConfig used as runtime mutable state.
22. Gradle duplicate dependency.
23. R8 strips required SDK class.
24. iOS signing/capability mismatch.
25. CI case-sensitive path failure.

Then grow from actual incidents, not imagination.

---

# 76. Suggested first decision-record backlog

1. Config vs save vs runtime state.
2. Direct reference vs service resolution.
3. Direct call vs event.
4. Coroutine vs UniTask vs Task.
5. Instantiate vs pool.
6. Scene object vs prefab asset ownership.
7. Project-local vs package feature.
8. Runtime assembly vs Editor assembly.
9. Pure C# vs EditMode vs PlayMode test.
10. AssetReference vs direct serialized reference.
11. Synchronous vs async load.
12. Cache vs recompute.
13. ScriptableObject data vs runtime instance.
14. Component state vs external state machine.
15. Package API extension vs wrapper.

---

# 77. What a D4 skill should feel like

After activating a D4 skill, an agent should be able to say:

```text
I see three plausible implementation paths.

Path A fits because X owns lifecycle.
Path B would break serialized ownership.
Path C requires an API not verified in this package version.

The failure symptom most strongly matches Y because Z.

I need to inspect these exact files/assets before changing code.

After the change, these two checks prove the relevant invariant.
```

If activation merely causes:

```text
follow SOLID
avoid leaks
test your code
```

the skill is not deep enough.

---

# 78. What a D4 agent should feel like

The difference between agents should be obvious.

For one broken UI async flow:

### Analyst asks

```text
Which packages, UI system, async mechanism, and project conventions are actually present?
```

### Architect asks

```text
Who owns the operation and panel lifetime?
```

### Debugger asks

```text
What first invalid state appears, and under which timing path?
```

### Developer asks

```text
What is the smallest architecture-consistent fix?
```

### Tester asks

```text
What cheapest deterministic test proves close-before-completion?
```

### Reviewer asks

```text
Can the fix still duplicate, leak, or mutate a destroyed owner?
```

Same issue, different mental model.

That is the desired depth.

---

# 79. Definition of Done — Agent Depth

An agent is D4-ready when:

- [ ] responsibility is distinct;
- [ ] operating modes are defined;
- [ ] specialist reasoning model is defined;
- [ ] preflight evidence is role-specific;
- [ ] skill selection rules exist;
- [ ] handoff triggers exist;
- [ ] stop/unknown rules exist;
- [ ] output contract matches role;
- [ ] at least 5 specialist eval cases exist;
- [ ] at least 2 adversarial cases exist;
- [ ] behavior is observably different from neighboring agents.

---

# 80. Definition of Done — Skill Depth

A skill is D4-ready when:

- [ ] activation description is precise;
- [ ] negative activation guidance exists;
- [ ] domain model represents actual domain objects/ownership;
- [ ] inspection targets are domain-specific;
- [ ] decision tree has real alternatives;
- [ ] architecture rules are not merely global boilerplate;
- [ ] at least 5 useful failure modes exist;
- [ ] failure discriminators exist for major failures;
- [ ] verification is specific;
- [ ] references contain durable expert knowledge;
- [ ] package/version-sensitive claims have provenance;
- [ ] handoff relationships are defined;
- [ ] routing eval exists;
- [ ] behavior eval exists.

D5 additionally requires executable evidence.

---

# 81. Definition of Done — Toolkit Depth Phase

This expansion phase is successful when:

```text
catalog breadth stays roughly stable
while
specialist benchmark quality rises materially
```

Required:

- [ ] all P0 Dreamy skills D4;
- [ ] all Tier U0 Unity skills D4;
- [ ] remaining P1 skills at least D3;
- [ ] all 14 agents have Agent Brain v2;
- [ ] first 25+ failure signatures exist;
- [ ] first 15+ decision records exist;
- [ ] routing benchmark exists;
- [ ] skill over-activation is measured;
- [ ] every critical agent has adversarial cases;
- [ ] at least 8 critical skills have mutation benchmarks;
- [ ] knowledge provenance exists for Dreamy/version-sensitive API claims;
- [ ] duplicate boilerplate is significantly reduced.

---

# 82. Recommended order alongside the repository completion roadmap

Do not run content depth work completely independently from infrastructure work.

Recommended interleave:

```text
Installer Trust
    ↓
Depth metadata + shared kernel
    ↓
Unity foundational skills D4
    ↓
Unity executable evidence
    ↓
Dreamy P0 skills D4
    ↓
Agent Brain v2
    ↓
Routing / specialist benchmarks
    ↓
Mutation benchmarks
    ↓
Release quality gate
```

This prevents writing very deep instructions for workflows the toolkit still cannot verify.

---

# 83. Final direction

The toolkit should evolve away from:

```text
large library of prompts
```

toward:

```text
operational knowledge system for Unity engineering
```

The durable architecture should be:

```text
PROJECT EVIDENCE
      ↓
PROJECT PROFILE
      ↓
RISK CLASS
      ↓
SPECIALIST AGENT
      ↓
PRIMARY SKILL
  + SUPPORTING SKILLS
      ↓
DECISION RECORDS
  + FAILURE SIGNATURES
  + VERIFIED PACKAGE KNOWLEDGE
      ↓
CHANGE / DIAGNOSIS / REVIEW
      ↓
EXECUTABLE VERIFICATION
      ↓
EVIDENCE
      ↓
BENCHMARK / RELEASE GATE
```

The strongest competitive advantage of Dreamy Codex Toolkit will not be:

```text
"We have more Unity skills."
```

It will be:

> "Our agents know which Unity failure they are looking at, why one solution is safer than another in this repository, which package contract is actually verified, and what evidence proves the result."

That is real depth.
