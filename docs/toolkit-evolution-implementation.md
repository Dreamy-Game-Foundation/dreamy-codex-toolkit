# Evolution implementation evidence — 22 October 2026

This tracks implementation of the [ECC / Superpowers / OmO plan](plans/DREAMY_TOOLKIT_ECC_SUPERPOWERS_OMO_EVOLUTION_PLAN.md). The product remains alpha. Source implementation, deterministic verification and external operational/semantic acceptance are separate states.

## Implemented locally

| Plan task | Implementation | Evidence or remaining boundary |
|---|---|---|
| P0.1 | Explicit sorted test files, no shell glob; preserves child exit status | Portable process tests; Linux Node 20/22/24 |
| P0.2 | npm JavaScript entrypoint through current Node; isolated tarball install | Actual pack smoke, including paths with spaces |
| P0.3 | Schema/version/source/run/tarball freshness and packed CLI checks | Stale/modified/missing report tests; alpha release gate |
| P0.4 | Preserve 4-leg matrix, fail-fast off, pack before release, upload evidence | Live GitHub 4/4 jobs green on Linux/Windows × Node 20/22; source-bound tarball evidence |
| P0.5 | Separate spawn, exit, empty output and JSON diagnostics | EPERM/empty/degraded fixtures |
| P1.1 | Context inventory for selected/managed installation; bytes distinct from tokens | CLI report, tokens=null when unmeasured |
| P1.2 | Compact authoring profile + budget validation; two compact pilots | Four authorized model batches passed eight probes per variant; broader A/B still pending |
| P1.3 | Bootstrap renders actual installed agent names | Existing lifecycle tests; no default preset migration |
| P2.1 | Native event decoder, profile policy, version/unknown-trust doctor | Adapter fixtures, native trust probe and an observed first-turn SessionStart; full operational status is not established |
| P2.2 | One process/explicit handlers, output/input budgets, no model calls | Native protocol/controls tests, no-op process profiling |
| P2.3 | Session checkpoint replay, failure classes, task-aware observations, interrupt cancellation | Handler tests; no raw prompt/command/transcript persisted |
| P2.4 | Owned matcher-group merge, runtime staging, journal recovery, user-data isolation | Lifecycle, drift, CRLF byte restoration, recovery and uninstall tests |
| P2.5 | Installed fixture smoke and cold-process latency harness | SessionStart observed in the authorized pair; other lifecycle events pending; process latency captured in CI |
| P3.1 | Atomic local records, write locks, bounded observation retention, export/forget | Traversal/symlink/retention/isolation tests |
| P3.2 | Candidate -> verified-local only with matching task/command/platform/source/log proof | Stale, wrong-command/platform and tamper tests |
| P3.3 | Lexical top-2 recall, total JSON payload cap, source/version filtering, session dedupe | Positive/near-miss/exclusion fixtures; not a broad semantic score |
| P3.4 | Explicit task-boundary record/verify/recall workflow; hook failures attach to active task | Task-aware failure test; no background observer |
| P4.1 | Fixed verification IDs, change-to-check mapping, source fingerprints, stored logs | Unavailable consumer check is not-run; Unity delegates to existing harness |
| P4.2 | One Stop continuation per task/fingerprint, retained across compaction | Interrupt, active flag, repeat and compact fixtures |
| P4.3 | Narrow strict apply_patch .meta deletion guard, native deny shape | Explicit coverage only; ordinary Unity/diff guards still apply |
| P5.1 | Zero-model draft from verified lesson, candidate outside discovery, canonical-name/installed trigger duplicate checks | Candidate/tamper/namespace tests |
| P5.2 | Positive/negative/conflict evidence gate, artifact hashes, <=2 revisions, explicit project promotion | Draft-to-plan and retained-report/artifact lifecycle fixtures; actual behavioral promotion remains pending |
| P5.3 | CI triage reference attached to existing debugger; compact foundations/testing pilots | Reused existing owners rather than adding overlapping skills |
| P6.1 | Development B0–B4 adapter contract, 12 cases × 3 repetitions, usage provenance | Built-in decision adapter + schema-validated plan, 1–4-turn/replay cap and actual-event gate; first native pair ran; broader coding cohort remains pending |
| P6.2 | Opt-in profiles, rollback, user documentation and unreleased changelog | Multi-workspace rollout and release promotion not performed |
| P6.3 | Explicit lesson prune/review, daily zero-model rollout snapshots, source ledger and context checks | Weekly observation is a future operational activity, not a completed test |

## Local checks

The latest full suite contains **73 tests: 72 pass, 1 Windows-only skip on Linux**. Validation covers 83 indexed skills and the registered schemas. Linux Node 20.20.2 and 22.23.3 binaries were downloaded to /tmp from nodejs.org and checked against their release SHA-256 manifests; Node 24.19.0 was already installed. Final matrix and package logs are produced under `/tmp/dreamy-evolution-evidence/`.

Package smoke creates the actual tarball, installs it in an isolated prefix with a space-containing path and invokes the installed CLI. It verifies structural validation, context inventory and installed hook fixture; report generation checks that source did not change during packing. Alpha release checking preserves existing Unity/compatibility/semantic production blockers.

The local no-op cold-process profile (30 Linux/Node 24 trials) observed p50 ~30 ms / p95 ~37 ms, zero visible bytes and zero model calls. `scripts/hook-profile.mjs` reruns the measurement on current source; it is process/adapter latency, not native event-delivery evidence.

`npm run benchmark:selftest` passed 3/3 synthetic plumbing trials. The development evolution cohort reported 180 not-run trials, 0 attempted, because no isolated native/model adapter was configured at that time. It intentionally made no model calls and supplies no quality or token-savings claim. `trial-context.json` tells a configured external adapter which treatment/case/model labels it must implement; runtime/model/native-event receipts are required before counting native trials. A built-in development decision adapter is now implemented and fixture-tested; `prepare-native-benchmark.mjs` produces a reviewed payload plan and the new native-smoke manifest narrows the first feasibility batch to two turns. That adapter implementation did not itself authorize a model turn; a later explicitly authorized two-turn native pair is documented below.

Compact entrypoint byte changes from the baseline commit:

| Skill | Before | After | Reduction |
|---|---:|---:|---:|
| unity-foundations | 4,345 | 2,250 | 48.2% |
| unity-testing | 4,233 | 2,212 | 47.7% |

These percentages measure source bytes. A separate authorized model pilot below measured total input tokens; neither measurement establishes general task-success improvement.

## Observed external checks

The [first pushed GitHub run](https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/actions/runs/39730155583) passed all four jobs at commit `265f4b480424d96c44ac0ec010ad3669754ab7df`: Ubuntu/Windows × Node 20.20.2/22.23.3. Test, installed hook fixture, deterministic eval, compatibility, actual tarball install and alpha release gate all passed. The [retained evidence summary](evidence/toolkit-evolution-ci-20261022.json) records each source/run/tarball hash. That initial run contained 60 tests; the later runtime/policy trust-revision regression brought that suite to 61; the follow-up adapter, draft and rollout changes brought the suite to 72; the deferred-lifecycle regression now brings it to 73. Every later source commit must pass its own matrix.

| Runner | Node | Hook process p50 | p95 | Visible bytes / model calls |
|---|---|---:|---:|---|
| Ubuntu | 20 | 29.6 ms | 31.5 ms | 0 / 0 |
| Ubuntu | 22 | 45.3 ms | 47.6 ms | 0 / 0 |
| Windows | 20 | 88.2 ms | 94.2 ms | 0 / 0 |
| Windows | 22 | 89.5 ms | 118.8 ms | 0 / 0 |

Before user review, Codex app-server 0.163.0 discovered all four minimal-profile definitions in the local consumer fixture and reported `enabled=true`, `trustStatus=untrusted` for each. A separate /tmp project was correctly excluded because its project config layer was untrusted. This establishes native discovery and diagnostics, not event delivery. `hooks probe` can reproduce this check without model calls; `hooks smoke --native` waits for trust review before starting its SessionStart-only smoke.

The user explicitly authorized the four-call source-entry retention pilot after the initial automatic approval rejection. It ran through Codex 0.163.0 with model `gpt-6.1-sol`, reasoning `low`, using the pinned baseline and current compact entries. All four batches passed: each variant answered the same eight unique decision probes correctly (16 observed answers total), with zero tool calls. The [retained measured report](evidence/skill-retention-pilot-20261022.json) contains actual decisions, source hashes, runtime token counters and raw-artifact hashes; raw runtime traces remain local.

| Skill | Baseline input tokens | Compact input tokens | Difference |
|---|---:|---:|---:|
| unity-foundations | 11,374 | 10,858 | 516 |
| unity-testing | 11,365 | 10,859 | 506 |
| Combined | 22,739 | 21,717 | 1,022 (4.49%) |

The four batches consumed 44,456 input and 242 output tokens (44,698 total); cache/reasoning-output counters were zero. These runtime input totals include inherited context, so the ~48% entry-byte reduction corresponds to ~4.5% measured input reduction in this small pilot. Fixed-choice probes, one batch per variant and no no-skill control cannot establish causal skill value, general coding quality or native-hook gains. No extra model trials or skill promotions were performed.

## Deliberate contract choices

- Hook ownership uses its own version-1 sidecar. Existing installer v1/v2 compatibility remains; a v3 installer migration was unnecessary for isolated opt-in hooks.
- Evolution commands target a project. Global policy/trust/skill writes and cross-project knowledge promotion remain disabled.
- No embedding service, resident observer, auto model routing, agent swarm, self-push or self-publish was introduced.
- Candidate promotion copies only reviewed SKILL.md to a new project directory. Toolkit-wide promotion remains a normal source/catalog/module change. Reports validate actual artifact hashes but still need a reviewer to assess behavioral truth.
- Native receipts generated by explicit fixture invocation cannot establish that Codex delivered an event. Doctor therefore does not infer operational=true from such files. Runtime and policy revision hashes are included in native command definitions, so managed updates require exact-definition review again. They are review markers, not a claim that mutable local scripts are cryptographically attested by Codex.
- Presets keep their existing meaning. No lean-selection default was enabled without a measured discovery/task-quality comparison.

## External acceptance still required

1. **Native trust and delivery:** the local consumer fixture now has all four definitions trusted with no foreign trusted hooks or errors. For other installations, review the concrete hook definition using Codex `/hooks` in the target runtime. No trust-bypass flag or trusted-hash edit was used. The current workspace `.codex/` directory is read-only; the task did not alter its permissions or install active hooks there. The reviewable local fixture is `.dreamy/native-consumer`; run `hooks probe` and `hooks smoke --native` against that target. Codex 0.163.0 defers SessionStart until the first user turn, so a zero-model thread-only smoke cannot prove delivery. The later authorized pair now proves SessionStart delivery on this fixture; remaining lifecycle events still need separate evidence. Do not repeat trust review on unchanged definitions. Additional tool/compact/interrupt/Stop acceptance remains a real-session task.
2. **Semantic A/B and skill promotion:** the four retention calls and the separately authorized two-turn native pair are consumed. Any further run requires its own reviewed plan/model/budget. The first native pair completed runtime execution but retained failed exact-field grades; see the diagnosis below. The broader B0–B4/coding/routing cohort and actual candidate behavioral promotion remain pending; no candidate was promoted on synthetic test evidence.
3. **Unity/build/device checks:** no Unity C#/asset changes were made by this initiative. Existing production blockers and tested-matrix gaps remain visible.
4. **Opt-in rollout observation:** one week across real workspaces cannot be replaced by a same-session unit run. Start only after native trust and critical semantic gates pass; retain daily context/latency/failure receipts, review stale lessons and rollback any regression before broadening profiles.

The implementation is reviewable and locally tested; the whole multi-week initiative must not be marked operationally or semantically complete until these gates have real evidence. See [operating guide](toolkit-evolution.md) for commands and rollback.

## Owner handoff and follow-up implementation

See [the Vietnamese handoff](toolkit-evolution-handoff.vi.md) for native /hooks review, expected probe/smoke outputs, a prepared two-turn decision batch, Editor readiness, candidate evaluation and daily observations. The new adapter is context-filtered and decision-only: B4 supplies reviewed text and does not prove automatic skill discovery/routing. Candidate drafts and evaluation preparation make zero model calls. Promotion retains the report and revalidates its artifacts on B4 reuse. Preview recall does not consume session dedupe, and package-bound eligibility now reads the inspected lock when no explicit package context was supplied.

A read-only consumer project inspection was also performed through the existing harness; its static profile passed and the private artifact is under `.dreamy/consumer-readiness/`. The observed Editor status was stale and indicated Play Mode/transition. No refresh, compile, tests, build or project mutation was performed; this is not a Unity tested-matrix entry.

The new native adapter session setup was exercised with Codex 0.163.0 using initialize/config/read/skills/list/thread/start and hooks disabled. The configured model matched `gpt-6.1-sol`; no turn/start request was sent (zero model turns). This is control-plane evidence only. A concrete two-turn B1/B2 plan was initially prepared locally under `.dreamy/benchmarks/native-smoke-review/` with approved=false. It was subsequently authorized and consumed by the native pair below; the consumer hook definitions are trusted. On Codex 0.163.0, their SessionStart is deferred until the first user turn; the thread-only zero-model smoke therefore remains not-run without indicating a trust failure.

The CI failure reproduction was rerun against the original source, followed by passing current validate/unit/pack receipts. The resulting verified-local lesson was recalled within its payload budget and used to draft `project-ci-recovery` outside discovery. The skill-authoring structural validator passed; two positive, two negative and one current-user conflict cases were prepared locally. This exercises the real failure-to-draft workflow with zero model calls. It does not establish behavioral skill quality or authorize promotion; a reusable CI workflow should continue to patch the existing debugger owner.

## Deferred SessionStart correction

The trusted native smoke exposed an incorrect pre-turn assumption in the toolkit: no SessionStart notification arrived after thread/start, including an explicit startup source and a non-ephemeral thread. Codex 0.163.0 source at commit `83086188ae0614bd882818ff1aa23f3194962012` calls pending SessionStart hooks inside the first regular turn. The [retained diagnosis](evidence/native-sessionstart-lifecycle-20261022.json) separates these observations from the source-derived explanation.

Zero-model smoke now explains the deferred result without requesting a turn or another trust review. The decision adapter checks trust/config before execution, consumes the explicit budget before turn/start, and requires completed native SessionStart before accepting the result. A missing/failed event rejects the trial, retains measured usage when present and leaves the attempted turn consumed. Regression fixtures cover first-turn and early delivery, missing/failed delivery, replay rejection and zero-model smoke. At the correction commit no new model call had been made; the later explicitly authorized pair below now supplies first-turn delivery evidence. The installed fixture runtime/definitions were left unchanged to preserve the trust already reviewed by the user.

## Authorized native pair — observed result

The user explicitly authorized the prepared two-turn plan. It ran on source commit `165a0bfcf8ee1ae049fcb0e92fc1636a97e0d834`, Codex 0.163.0, model `gpt-6.1-sol`, reasoning `low`. The ledger contains exactly B1/quick-docs/1 and B2/quick-docs/1, consuming 2/2 turns. Both runtime turns completed with zero unexpected tools; B1 disabled hooks and B2 observed native SessionStart completed in **37 ms**. The installed hook definitions were unchanged.

| Treatment | Input tokens | Output tokens | Native SessionStart | Original exact-field grade |
|---|---:|---:|---|---|
| B1 | 6,918 | 39 | Hooks disabled | Fail |
| B2 | 6,918 | 40 | Completed, 37 ms | Fail |

Total: **13,836 input + 79 output = 13,915 tokens**, no cached input or reasoning-output tokens. Input counts were equal for this quiet minimal fixture. One sequential pair cannot establish latency effects, general token savings or coding quality. Source was reported dirty because the pre-existing untracked `.research/` directory was preserved; this is development evidence, not a clean release cohort.

Both answers selected `quick` and explicitly declined a background observer. The grader required the exact literal `decision: none`, which the reviewed prompt had not specified; the models returned explanatory decision strings. The [retained report](evidence/native-smoke-pair-20261022.json) preserves both original failures, actual answers, usage, native event, approval/ledger binding, source hashes and raw-artifact hashes. No scores were relaxed or rewritten. The quick-docs prompt now declares both observer decision labels for future batches; changed prompts need new authorization and were not executed. Other native lifecycle events, behavioral skill promotion, full coding/routing evaluation, Unity acceptance and real rollout observation remain pending.

A project-local observation and lesson `benchmark-output-label-contract` were recorded from this real grading failure. The lesson remains candidate: the revised prompt has not been model-evaluated, so this batch does not justify verified status or skill promotion.
