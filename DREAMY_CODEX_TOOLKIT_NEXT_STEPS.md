# Dreamy Codex Toolkit — Next Steps to Production Readiness

> Audit target: `Dreamy-Game-Foundation/dreamy-codex-toolkit` (`main`)
>
> Audit date: 2026-08-15
>
> Current repository version observed: `0.1.0-alpha.2`
>
> Recommended purpose of this document: replace the old implementation-era roadmap as the **active execution plan from alpha.2 toward a trustworthy v0.1.0 release**.

---

## 1. Executive assessment

The repository is no longer an early prompt collection. It already has most of the correct architectural pieces:

- canonical `toolkit.json`;
- modular presets and modules;
- rules and a large skill catalog;
- Codex agent definitions;
- installer / updater / uninstaller / doctor CLI;
- project inspection;
- Unity batchmode harness;
- deterministic eval catalog;
- benchmark runner;
- compatibility registry;
- release gates;
- CI and npm pack smoke testing.

The remaining work is therefore **not primarily “add more skills.”**

The next stage should focus on four things:

1. **Installer trust** — prove that install/update/uninstall never damage user-owned bytes.
2. **Executable Unity evidence** — move from “observed/intended” compatibility to actually tested Unity versions.
3. **Semantic quality evidence** — move from catalog validation and a 3-case pilot benchmark to meaningful release-grade agent evaluation.
4. **Release/platform truthfulness** — every support claim in README must correspond to a real adapter, tested contract, or explicit limitation.

The repository currently has a strong architecture but still has several alpha-grade gaps where the implementation does not yet fully satisfy the contract suggested by the CLI, README, or release gates.

---

# 2. Highest-priority findings

## P0-1 — `AGENTS.md` lifecycle currently treats the whole file as managed state

### Current issue

The installer state records checksums for the entire `AGENTS.md`.

`update` and `uninstall` compare that whole-file checksum before making changes.

This creates the wrong ownership boundary:

```text
AGENTS.md
├── user-owned bytes
├── DREAMY MANAGED BLOCK
└── user-owned bytes
```

Only the Dreamy block should be under toolkit ownership.

If the user edits unrelated text outside the Dreamy managed block after installation, the current checksum strategy can classify the whole file as drifted and reject a safe update/uninstall.

### Required change

Create a dedicated managed-block abstraction.

Suggested API:

```js
findManagedBlock(text)
extractManagedBlock(text)
replaceManagedBlock(text, newBlock)
removeManagedBlock(text)
hashManagedBlock(text)
validateManagedBlock(text)
```

Persist:

```json
{
  "managedBlockHash": "...",
  "managedTemplateVersion": "...",
  "lineEnding": "lf|crlf"
}
```

Do **not** use the entire `AGENTS.md` hash as the ownership check.

### Acceptance tests

- [ ] install into empty `AGENTS.md`;
- [ ] install into non-empty `AGENTS.md`;
- [ ] user prepends text after install → update still succeeds;
- [ ] user appends text after install → update still succeeds;
- [ ] user modifies text outside the managed block → uninstall still succeeds;
- [ ] user modifies the managed block itself → safe refusal unless `--force`;
- [ ] CRLF file remains CRLF;
- [ ] LF file remains LF;
- [ ] malformed duplicate markers are detected;
- [ ] missing begin/end marker is detected;
- [ ] user-owned bytes are byte-for-byte identical after install → update → uninstall.

### Definition of done

A round-trip property test should prove:

```text
original user AGENTS.md
        ↓ install
user bytes + managed bytes
        ↓ update
same user bytes + newer managed bytes
        ↓ uninstall
original user AGENTS.md EXACTLY
```

This should become one of the strongest invariants in the repository.

---

## P0-2 — `update` should actually update the managed template block

### Current issue

The current update path refreshes installed agents/skills and writes state, but the lifecycle should explicitly replace the existing managed block with the current `templates/AGENTS.managed.md`.

A version update that leaves stale managed instructions behind is not a complete update.

### Required change

`update` should:

1. load existing install state;
2. validate the existing managed block;
3. resolve the new preset/module/platform plan;
4. render the new managed block;
5. replace only the managed block;
6. synchronize managed agent files;
7. synchronize managed skill directories;
8. remove obsolete managed files;
9. write new state only after the transaction succeeds.

### Stronger implementation

Use a transaction-like staging directory:

```text
.dreamy-codex/
  staging/
  install-state.json
```

Prepare the whole desired install first, validate it, then commit file operations.

If one operation fails, avoid leaving a half-updated installation.

---

## P0-3 — `purge` / uninstall ownership semantics need to be explicit and testable

### Required contract

The toolkit should distinguish:

```text
uninstall
= remove this managed installation while preserving unrelated state

purge
= remove every artifact owned by Dreamy Codex Toolkit, but never user-owned data
```

### Required tests

- [ ] uninstall removes managed block;
- [ ] uninstall removes only files recorded as owned;
- [ ] uninstall removes obsolete owned agent files;
- [ ] uninstall removes owned skill directories;
- [ ] empty toolkit state directory is removed;
- [ ] purge removes toolkit state completely;
- [ ] purge does not delete unrelated `.codex` / `.agents` files;
- [ ] repeat uninstall/purge is safe and idempotent;
- [ ] interrupted install can be diagnosed/recovered.

---

# 3. Make installation truly declarative

## P0-4 — Stop installing every Codex agent unconditionally

The repository already models:

```text
preset → modules → content
```

Skill installation follows selection more closely than agent installation.

Agent selection should become part of the same declarative graph.

### Recommended module schema extension

```json
{
  "id": "production",
  "dependencies": [],
  "skills": [],
  "agents": [
    "build-engineer",
    "release-validator",
    "performance-engineer"
  ]
}
```

Or introduce capabilities:

```json
{
  "capabilities": [
    "unity-development",
    "package-maintenance",
    "release-validation"
  ]
}
```

and map capabilities to platform-specific agents.

### Why this matters

A minimal Unity preset should not necessarily install the same agent surface as a full production preset.

Smaller installation surface means:

- less agent discovery noise;
- more predictable routing;
- fewer irrelevant instructions;
- easier compatibility testing;
- easier future support for Claude / Antigravity.

### Acceptance criteria

- [ ] selected preset deterministically resolves exact agents + skills;
- [ ] `dreamy-kit list --resolved` shows the resolution graph;
- [ ] same manifest produces same ordered install plan;
- [ ] no implicit “all agents” behavior remains unless a preset explicitly asks for it.

---

## P0-5 — Move package → skill routing out of hardcoded CLI code

A package-to-skill map inside the CLI makes the CLI a second source of truth.

Prefer metadata on skills/modules.

Example:

```json
{
  "id": "dreamy-datasave",
  "requires": {
    "packages": ["com.dreamy.datasave"]
  }
}
```

Then the resolver can infer applicable skills from project inspection.

### Goal

Adding a new Dreamy package should require:

1. compatibility record;
2. skill definition;
3. optional module membership;

—not editing hardcoded JavaScript routing tables in multiple places.

---

# 4. Remove history-coupled validation

## P0-6 — Replace hardcoded W0/W10-era assertions

Validation currently contains historical assumptions such as exact package/rule counts and expected known-drift states.

These were useful during bootstrap, but they become technical debt once the toolkit grows.

### Replace

```text
"There must be exactly N records"
```

with invariants such as:

```text
Every indexed entry must exist.
Every relevant filesystem entry must be indexed.
Every schema reference must resolve.
Every package record must validate.
No duplicate IDs.
No duplicate installation basenames.
No dangling module dependencies.
No preset references unknown modules.
```

### Important

Known drift should be data, not JavaScript history.

Instead of validator logic equivalent to:

```text
com.dreamy.dataconfig MUST currently have drift
```

store an explicit compatibility state:

```json
{
  "status": "known-drift",
  "issues": [...]
}
```

and let the release policy decide whether that status blocks release.

---

# 5. Fix known Dreamy ecosystem drift

## P0-7 — Close package compatibility drift before stable release

Current compatibility evidence identifies important ecosystem drift, including direct assembly dependencies that are not consistently represented in package manifests.

### Work items

- [ ] `com.dreamy.ui`: reconcile the TextMeshPro assembly dependency with package manifest declarations;
- [ ] `com.dreamy.dataconfig`: reconcile the UniTask assembly dependency with package manifest declarations;
- [ ] `com.dreamy.editor-tools`: define and verify a stable headless contract if the toolkit intends to automate it;
- [ ] unify the canonical `com.dreamy.core` version across package dependencies, template project, docs, tags, and compatibility records;
- [ ] define whether incompatible/unsupported package contracts are warnings or release blockers.

### Desired state

For every supported package:

```json
{
  "observedVersion": "...",
  "verifiedCommit": "...",
  "unityRange": "...",
  "dependencies": {},
  "evidence": [],
  "status": "tested"
}
```

A package should not be called “supported” solely because its repository was inspected.

---

# 6. Fix the compatibility pipeline semantics

## P0-8 — `compatibility:refresh` should really refresh evidence

The current script named `refresh-compatibility` primarily reads already-committed compatibility JSON and renders a drift report.

That is closer to:

```text
compatibility:report
```

than a real refresh.

### Recommended split

```json
{
  "compatibility:fetch": "fetch/re-observe upstream evidence",
  "compatibility:validate": "validate registry integrity",
  "compatibility:report": "render JSON + Markdown drift report",
  "compatibility:refresh": "fetch + validate + report"
}
```

### Evidence refresh should capture

- upstream repository;
- resolved commit;
- package version;
- manifest dependencies;
- asmdef references;
- observed Unity metadata;
- timestamp;
- fetch method;
- source hash.

### Important design rule

A generated report must never silently make old evidence look fresh merely because `generatedAt` is new.

Track separately:

```json
{
  "evidenceRetrievedAt": "...",
  "reportGeneratedAt": "..."
}
```

---

# 7. Build real Unity compatibility evidence

## P0-9 — Populate a tested Unity matrix

The current Unity compatibility model correctly distinguishes intended/observed/tested, but the tested matrix is empty.

This is one of the clearest blockers between alpha and a trustworthy release.

### Add executable fixture projects

Suggested structure:

```text
fixtures/
  unity/
    minimal/
    urp/
    dreamy-core/
    dreamy-ui/
    dreamy-datasave/
    runtime-editor-boundary/
```

Keep fixtures intentionally small.

Each fixture should have:

- pinned Unity editor version;
- pinned `Packages/manifest.json`;
- pinned `packages-lock.json`;
- deterministic test scene/assets;
- EditMode tests;
- PlayMode tests only where needed;
- known expected warnings/errors.

### Minimum evidence pipeline

```text
fixture
  ↓
project-inspect
  ↓
compile
  ↓
asmdef validation
  ↓
EditMode tests
  ↓
optional PlayMode tests
  ↓
evidence artifact
  ↓
compatibility/unity.json tested entry
```

### Rule

`compatibility/unity.json -> tested[]` should be generated or updated **only from successful harness evidence**, not manually claimed.

---

# 8. Harden the Unity harness

## P0-10 — Make evidence machine-grade, not log-grade

The harness already has the correct idea: run Unity batchmode and record evidence.

Now tighten it.

### Required evidence fields

```json
{
  "schemaVersion": 1,
  "operation": "compile",
  "status": "pass|fail|degraded",
  "unityVersion": "...",
  "unityExecutable": "...",
  "platform": "...",
  "projectPath": "...",
  "projectRevision": "...",
  "manifestHash": "...",
  "packagesLockHash": "...",
  "command": [],
  "exitCode": 0,
  "startedAt": "...",
  "completedAt": "...",
  "durationMs": 0,
  "artifacts": [],
  "errors": [],
  "warnings": []
}
```

### Improve result parsing

Do not base release decisions on broad substring matching such as arbitrary appearances of `"error"`.

Prefer:

- Unity exit code;
- structured NUnit XML parsing;
- known Unity compiler-error patterns;
- explicit sentinel output from a toolkit Editor method;
- separately classified warnings/exceptions.

### Add process robustness

- [ ] operation timeout;
- [ ] kill child process tree;
- [ ] preserve log on timeout;
- [ ] classify license/editor-startup failures separately;
- [ ] unique artifact directory per invocation;
- [ ] deterministic result JSON even when Unity crashes;
- [ ] redact local secrets/tokens from stored command/environment.

---

# 9. Turn `doctor` into a real operational diagnostic

## P1-1 — Expand `doctor`

`doctor` should answer:

> “Can this machine/project safely use the selected toolkit features right now?”

### Checks

- Node version;
- toolkit/package version agreement;
- install-state schema;
- managed-block integrity;
- stale managed files;
- selected preset/module closure;
- duplicate skill destination names;
- project manifest/lock presence;
- Unity executable configured;
- detected Unity version;
- requested Unity compatibility status;
- package drift;
- Runtime → Editor asmdef violations;
- benchmark/harness prerequisites;
- target platform prerequisites;
- degraded-mode reasons.

### Useful output modes

```bash
dreamy-kit doctor
dreamy-kit doctor --json
dreamy-kit doctor --fix
```

`--fix` should only perform safe deterministic fixes.

---

# 10. Upgrade evaluation from structural to semantic

## P1-2 — Keep deterministic evals, but stop treating them as quality evidence

The existing deterministic eval catalog is useful as:

- catalog/schema validation;
- routing/safety expectation inventory;
- regression fixture metadata.

It correctly does not claim semantic execution.

Keep that honesty.

### Separate three layers

```text
Layer 1 — Static validation
schemas, indexes, manifests

Layer 2 — Deterministic routing/eval catalog
case validity, expected routing metadata

Layer 3 — Executed benchmark
real agent invocation + grading + evidence
```

Never merge these into one ambiguous “eval score.”

---

# 11. Expand the benchmark from pilot to release-grade

## P1-3 — Increase benchmark breadth

The current pilot benchmark is useful for plumbing but too small to establish release quality.

Build a benchmark suite around actual failure modes.

### Suggested benchmark groups

#### Architecture

- wrong Runtime/Editor dependency;
- incorrect service boundary;
- premature abstraction;
- package-vs-project placement.

#### Unity correctness

- serialization;
- domain reload;
- async lifetime;
- Addressables;
- NavMesh;
- physics;
- UI;
- URP/rendering;
- scene/prefab workflows.

#### Dreamy ecosystem

- DataSave usage;
- DataConfig usage;
- Core architecture;
- UI;
- Audio;
- Localization;
- Assets;
- package manifest/asmdef fixes.

#### Production

- Android build issue;
- iOS build issue;
- performance regression;
- memory allocation;
- release validation.

#### Evidence honesty

- missing Unity executable;
- untested Unity version;
- missing package lock;
- unsupported API claim;
- stale compatibility evidence.

### Target shape

Do not optimize for a magic case count.

Optimize for coverage of distinct risk classes.

A reasonable release suite should contain **dozens of executed cases**, not only a few prompt-level checks.

---

# 12. Improve benchmark graders

## P1-4 — Reduce substring-based grading

Substring graders are fine for pilot smoke tests but fragile for real quality gates.

Prefer, in order:

1. executable tests;
2. JSON Schema validation;
3. AST/static analysis;
4. exact structured field assertions;
5. diff-based assertions;
6. carefully constrained semantic judge;
7. substring matching only for simple smoke tests.

### For code-edit benchmarks

The ideal loop is:

```text
prepare fixture repo
  ↓
agent edits fixture
  ↓
git diff captured
  ↓
project validator
  ↓
Unity compile/tests
  ↓
grader reads evidence
  ↓
benchmark result
```

That measures whether the toolkit produces working changes, not whether it says the right words.

---

# 13. Add release benchmark policy

## P1-5 — Define quality thresholds in data

A benchmark report should become release-eligible only when it meets declared policy.

Example policy:

```json
{
  "minimumPassRate": 0.95,
  "criticalSafetyFailuresAllowed": 0,
  "requiredGroups": [
    "architecture",
    "unity",
    "dreamy",
    "production",
    "evidence-honesty"
  ],
  "requireCleanGit": true,
  "requireRepetitions": 3
}
```

Also track:

- model;
- model settings;
- toolkit revision;
- treatment;
- input/token cost;
- latency;
- variance across repetitions.

Do not silently compare benchmark reports produced with materially different model configurations.

---

# 14. Add benchmark scenarios that modify repositories

## P1-6 — Repository-edit benchmarks

Prompt-only JSON cases cannot validate the core promise of a coding toolkit.

Add cases where the agent must:

- inspect a fixture;
- make a code/config change;
- run/interpret validation;
- stop on unsupported evidence;
- leave a reviewable diff.

Examples:

```text
Fix a Runtime asmdef referencing UnityEditor.
Fix an undeclared package dependency.
Implement a small Dreamy DataSave feature.
Diagnose a broken Unity package lock.
Add a safe Editor-only tool.
Fix a test without weakening the test.
```

Success should be determined by the fixture, not prose style.

---

# 15. Make platform support architecture explicit

## P1-7 — Decide what “Codex / Claude / Antigravity support” means

The repository currently has strong Codex-specific implementation.

If the README names additional platforms, choose one of two policies.

### Option A — Codex-first truthful scope

For v0.1.0:

```text
Supported: Codex
Experimental/reference: Claude, Antigravity
```

This is the lower-risk release path.

### Option B — Real multi-platform toolkit

Introduce a platform-neutral logical model:

```text
agents/specs/
  unity-developer.json
  debugger.json
  tester.json

platforms/
  codex/
    renderer.js
    installer.js
    paths.js
  claude/
    renderer.js
    installer.js
    paths.js
  antigravity/
    renderer.js
    installer.js
    paths.js
```

CLI:

```bash
dreamy-kit install --platform codex
dreamy-kit install --platform claude
dreamy-kit install --platform antigravity
dreamy-kit detect --platform auto
```

### Important

Do not invent target-platform file formats.

Each adapter must be based on verified current platform contracts and have its own fixture tests.

---

# 16. Strengthen catalog integrity

## P1-8 — Bidirectional index validation

For every registry/index:

```text
index → filesystem
filesystem → index
```

Both directions must hold.

### Validate

- [ ] every indexed skill exists;
- [ ] every publishable `SKILL.md` is indexed;
- [ ] every indexed rule exists;
- [ ] every module content path exists;
- [ ] every preset module exists;
- [ ] no circular module dependencies;
- [ ] no duplicate IDs;
- [ ] no duplicate destination basenames;
- [ ] all schema refs resolve;
- [ ] all compatibility package IDs are canonical.

### Especially important

If the installer copies skills by directory basename, two different source paths with the same basename can collide.

Add an explicit collision check even if the current catalog has no collision.

---

# 17. Improve project inspection into a capability graph

## P1-9 — Project profile v2

The current project inspector is a good base.

Evolve it from “detected fields” into the input for routing.

Example:

```json
{
  "unity": {
    "version": "6000.x",
    "renderPipeline": "urp"
  },
  "packages": {},
  "assemblies": {
    "runtime": [],
    "editor": [],
    "tests": []
  },
  "capabilities": [
    "addressables",
    "unitask",
    "dreamy-datasave",
    "mobile-android"
  ],
  "violations": [],
  "confidence": {}
}
```

### Improvements

- prune generated/irrelevant directories aggressively;
- preserve reasons for every inferred capability;
- distinguish `detected`, `inferred`, `unknown`;
- hash project inputs used for detection;
- make output stable/sorted for deterministic diffs.

Then preset/skill routing can use the project profile rather than duplicated package checks.

---

# 18. Refactor CLI after correctness is locked

## P1-10 — Split the monolithic CLI

Do this **after installer semantics are fixed and covered by tests**.

Suggested layout:

```text
src/
  cli.js
  commands/
    install.js
    update.js
    uninstall.js
    purge.js
    doctor.js
    detect.js
    validate.js
    eval.js
  install/
    managed-block.js
    resolver.js
    state.js
    transaction.js
    ownership.js
  project/
    inspect.js
  catalog/
    load.js
    validate.js
  output/
    json.js
    terminal.js
```

Keep business logic independent from argument parsing so it is easy to unit test.

---

# 19. CI should reflect cost and evidence level

## P1-11 — Split workflows by purpose

The current cross-platform Node CI is a solid base, but all validation should not live in one conceptual bucket.

Recommended workflows:

```text
ci-fast.yml
  schema/catalog validation
  Node tests
  installer property tests
  npm pack smoke

compatibility.yml
  scheduled/manual upstream evidence refresh
  drift report

benchmark.yml
  manual/nightly
  real agent benchmark
  publish benchmark artifact

unity-evidence.yml
  dedicated Unity runners
  compile/EditMode/PlayMode fixture matrix

release.yml
  tag/release gate
  artifact generation
  package smoke install
  checksums/provenance
```

### Also add

- macOS Node path/lifecycle coverage;
- dependency update automation;
- security scanning appropriate for the repository;
- test coverage reporting;
- branch protection requiring the fast deterministic gates.

### Small cleanup

Avoid running the same validation twice if `npm test` already invokes `npm run validate`.

Either:

```text
npm test = pure tests
```

or let CI call only the composite command once.

---

# 20. Establish a real release artifact chain

## P1-12 — Reproducible release evidence

A release should be traceable:

```text
git tag
  ↓
toolkit.json version
  ↓
package.json version
  ↓
npm tarball
  ↓
tarball SHA-256
  ↓
validation report
  ↓
compatibility evidence
  ↓
Unity evidence
  ↓
benchmark report
```

Each release report should include the git commit and hashes of its dependent artifacts.

### Release must fail when

- working tree is dirty;
- version mismatch exists;
- tested Unity matrix is empty;
- required compatibility evidence is stale;
- critical drift is unresolved;
- benchmark is not `releaseEligible`;
- benchmark was generated for another commit;
- npm tarball smoke install fails;
- installer round-trip property tests fail.

---

# 21. Reduce roadmap/document sprawl

## P2-1 — Archive bootstrap-era plans

The repository already contains large implementation roadmaps/backlogs written for earlier alpha phases.

Once this new plan is adopted:

```text
docs/history/
  DREAMY_CODEX_TOOLKIT_COMPLETION_ROADMAP.md
  DREAMY_CODEX_TOOLKIT_DETAILED_GAP_IMPLEMENTATION_SPEC.md
  DREAMY_CODEX_TOOLKIT_IMPLEMENTATION_BACKLOG.md
```

Keep one active root-level roadmap:

```text
ROADMAP.md
```

or:

```text
docs/ROADMAP.md
```

### Rule

The active roadmap should describe **current unresolved work only**.

Git history already preserves old plans; the main tree should not make a new contributor reverse-engineer which roadmap is authoritative.

---

# 22. Documentation required before v0.1.0

## P2-2 — Add/finish maintainer docs

Recommended canonical docs:

```text
docs/
  architecture.md
  installer-lifecycle.md
  project-profile.md
  compatibility-policy.md
  harness.md
  benchmark-methodology.md
  release-playbook.md
  platform-support.md
  troubleshooting.md

CONTRIBUTING.md
SECURITY.md
SUPPORT.md
```

### `architecture.md`

Must explain:

```text
toolkit.json
  ↓
presets
  ↓
modules
  ↓
rules / skills / agent capabilities
  ↓
platform renderer
  ↓
installer
  ↓
project profile + harness evidence
```

### `compatibility-policy.md`

Define the vocabulary precisely:

- intended;
- observed;
- tested;
- degraded;
- unsupported;
- known drift.

This vocabulary is one of the strongest ideas in the repository; make it a public contract.

---

# 23. Recommended milestone order

## Milestone A — Installer Trust

Goal: an installation is safe enough that users can trust update/uninstall.

- [ ] managed-block ownership abstraction;
- [ ] update replaces managed block;
- [ ] user bytes preserved exactly;
- [ ] uninstall/purge semantics fixed;
- [ ] transaction/staging behavior;
- [ ] lifecycle property tests;
- [ ] module-driven agent selection;
- [ ] package-to-skill routing moved to metadata;
- [ ] hardcoded historical validator assumptions removed.

### Exit condition

No known scenario where normal user edits outside toolkit-owned regions block or corrupt lifecycle operations.

Recommended next prerelease after completion:

```text
0.1.0-alpha.3
```

---

## Milestone B — Evidence Loop

Goal: “supported” means executable evidence exists.

- [ ] Unity fixture projects;
- [ ] harness evidence schema hardened;
- [ ] structured XML/compiler result parsing;
- [ ] tested Unity matrix populated;
- [ ] compatibility fetch/validate/report split;
- [ ] known Dreamy package drift resolved;
- [ ] `doctor` validates real runtime prerequisites.

### Exit condition

At least one declared Unity target has repeatable successful compile/test evidence tied to a concrete toolkit commit.

Recommended next prerelease:

```text
0.1.0-alpha.4
```

---

## Milestone C — Quality Gate

Goal: prove the toolkit improves agent behavior without hiding regressions.

- [ ] executed benchmark suite expanded;
- [ ] repository-edit benchmark fixtures;
- [ ] strong graders;
- [ ] multiple risk groups;
- [ ] benchmark policy in data;
- [ ] repetition/variance tracking;
- [ ] benchmark report linked to commit;
- [ ] release gate consumes benchmark policy.

### Exit condition

A clean commit produces a complete, release-eligible quality report and passes the Unity evidence gate.

Recommended stage:

```text
0.1.0-rc.1
```

---

## Milestone D — Release & Platform Contract

Goal: package exactly what the project can defend as supported.

- [ ] decide Codex-only vs multi-platform v0.1.0;
- [ ] if multi-platform, implement verified adapters and tests;
- [ ] split CI workflows;
- [ ] add release workflow/provenance;
- [ ] finish maintainer docs;
- [ ] archive obsolete roadmaps;
- [ ] clean README claims and support matrix.

### Exit condition

Every feature/platform called “supported” has:

```text
implementation
+ validation
+ evidence
+ documentation
+ release gate
```

Then cut:

```text
v0.1.0
```

---

# 24. Suggested issue/PR sequence

This is the order I would actually execute.

## PR 1 — Managed block ownership

- implement block parser;
- managed-block-only hash;
- byte-preservation tests;
- CRLF/LF tests.

## PR 2 — Correct update/uninstall/purge

- update template replacement;
- owned-file reconciliation;
- cleanup state;
- idempotency;
- failure recovery tests.

## PR 3 — Declarative install resolution

- module/preset agent selection;
- skill requirements metadata;
- remove hardcoded packageSkillMap;
- add resolved-plan CLI output.

## PR 4 — Generic validators

- remove historical exact-count assertions;
- bidirectional index validation;
- collision detection;
- graph validation.

## PR 5 — Compatibility pipeline

- rename/split refresh/report;
- evidence timestamp vs report timestamp;
- source hash;
- drift severity policy.

## PR 6 — Dreamy dependency cleanup

- UI/TMP;
- DataConfig/UniTask;
- Editor Tools headless contract decision;
- canonical package version alignment.

## PR 7 — Unity fixtures + harness evidence v2

- minimal fixture;
- runtime/editor violation fixture;
- structured NUnit XML parser;
- process timeout/error classes.

## PR 8 — Unity evidence CI

- dedicated runner workflow;
- tested matrix artifact;
- release-check integration.

## PR 9 — Benchmark v2

- benchmark case schema upgrades;
- strong graders;
- repository-edit fixture runner;
- risk-group policy.

## PR 10 — Release benchmark suite

- expand executed cases;
- generate real release report;
- threshold/regression gates.

## PR 11 — Platform contract

- choose Codex-only scope or platform abstraction;
- make README match reality;
- implement adapters only from verified contracts.

## PR 12 — Release engineering + docs

- split workflows;
- release pipeline;
- maintainer docs;
- archive old roadmap files;
- prepare `0.1.0-rc.1`.

---

# 25. Definition of Done for v0.1.0

Do not call the repository “finished” until all statements below are true.

## Installer

- [ ] install is deterministic;
- [ ] install/update/uninstall are safe with arbitrary user content around the managed block;
- [ ] update really updates every owned artifact;
- [ ] uninstall/purge remove only owned artifacts;
- [ ] lifecycle is idempotent;
- [ ] interrupted operations are diagnosable.

## Catalog

- [ ] one canonical source for version/status;
- [ ] no hardcoded bootstrap-era counts;
- [ ] every index is bidirectionally validated;
- [ ] no skill destination collisions;
- [ ] presets/modules resolve deterministically.

## Dreamy compatibility

- [ ] supported packages have pinned evidence;
- [ ] critical manifest/asmdef drift is zero;
- [ ] unsupported contracts are explicit;
- [ ] evidence freshness is distinguishable from report generation time.

## Unity

- [ ] tested Unity matrix is non-empty;
- [ ] tested claims are produced from harness evidence;
- [ ] compile result is structured;
- [ ] EditMode test result is structured;
- [ ] Runtime/Editor boundary is verified;
- [ ] degraded mode cannot accidentally look like success.

## Evaluation

- [ ] static validation remains separate from semantic benchmarking;
- [ ] benchmark contains meaningful executed coverage;
- [ ] code-edit scenarios are verified with executable evidence;
- [ ] critical safety regression threshold is zero;
- [ ] release benchmark is bound to the release commit.

## CI / release

- [ ] deterministic PR CI;
- [ ] Unity evidence workflow;
- [ ] benchmark workflow;
- [ ] compatibility workflow;
- [ ] reproducible release artifacts;
- [ ] npm tarball smoke install;
- [ ] version/changelog/tag agreement;
- [ ] release gate blocks stale or mismatched evidence.

## Platform claims

- [ ] README support matrix matches actual implementation;
- [ ] experimental platforms are labeled experimental;
- [ ] supported platform adapters have tests;
- [ ] no target-specific format is assumed without verified contract evidence.

## Documentation

- [ ] one active roadmap;
- [ ] architecture documented;
- [ ] installer ownership contract documented;
- [ ] compatibility vocabulary documented;
- [ ] benchmark methodology documented;
- [ ] release playbook documented.

---

# 26. What NOT to prioritize next

Unless a concrete user failure proves otherwise, do **not** spend the next cycle mainly on:

- adding dozens more Unity skills;
- expanding prose-only agent instructions;
- creating more presets with tiny variations;
- adding more roadmap documents;
- claiming more AI platforms;
- increasing eval case count without actually executing them.

The repository already has breadth.

Its bottleneck is now **proof, lifecycle correctness, and operational trust**.

A toolkit for coding agents wins when the invariant is:

> It changes only what it owns, knows what it does not know, tests what it claims, and leaves evidence behind.

---

# 27. Compact priority board

| Priority | Workstream | Release impact |
|---|---|---|
| P0 | Managed `AGENTS.md` ownership | Critical |
| P0 | Update/uninstall/purge correctness | Critical |
| P0 | Declarative agent/skill resolution | High |
| P0 | Remove history-coupled validation | High |
| P0 | Resolve Dreamy dependency drift | Critical |
| P0 | Real compatibility refresh semantics | High |
| P0 | Tested Unity matrix | Critical |
| P0 | Harness evidence hardening | Critical |
| P1 | Doctor v2 | High |
| P1 | Benchmark expansion | Critical |
| P1 | Strong graders / repo-edit cases | Critical |
| P1 | Platform support contract | High |
| P1 | CI/release workflow split | High |
| P1 | Project capability graph | Medium |
| P1 | CLI modularization | Medium |
| P2 | Documentation consolidation | Medium |
| P2 | Repository metadata/polish | Low |

---

# 28. Audit basis

The recommendations above were produced from a static audit of the current public `main` branch, with particular attention to:

```text
README.md
toolkit.json
package.json
.github/workflows/ci.yml

src/cli.js
src/project-profile.js
src/eval-catalog.js

scripts/validate.mjs
scripts/refresh-compatibility.mjs
scripts/release-check.mjs

templates/AGENTS.managed.md

modules/*
presets/*
skills/index.json
agents/codex/*

compatibility/unity.json
compatibility/dreamy-packages.json
compatibility/third-party.json

docs/research/source-ledger.json

evals/catalog.json

benchmarks/manifest/*
benchmarks/cases/*
benchmarks/adapters/*

harness/*

tests/*
release/*
```

The audit is intentionally evidence-conscious:

- it does not treat an inspected package as tested;
- it does not treat deterministic eval catalog validation as semantic quality;
- it does not treat a regenerated drift report as refreshed upstream evidence;
- it does not claim a Unity matrix has passed until executable Unity evidence exists.

---

# 29. Final recommendation

The most important architectural decision for the next iteration is simple:

```text
STOP optimizing breadth.
START optimizing trust.
```

The repository already knows a lot.

Now make every important claim answerable by one of these:

```text
Where is the owner boundary?
Where is the schema?
Where is the executable test?
Where is the evidence artifact?
Which release gate consumes that evidence?
```

Once those questions have clean answers, the project stops feeling like a sophisticated alpha toolkit and starts behaving like infrastructure a Unity studio can safely standardize around.
