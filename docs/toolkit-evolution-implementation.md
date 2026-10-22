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
| P2.1 | Native event decoder, profile policy, version/unknown-trust doctor | Adapter fixtures and read-only native discovery/trust probe; operational is deliberately not established |
| P2.2 | One process/explicit handlers, output/input budgets, no model calls | Native protocol/controls tests, no-op process profiling |
| P2.3 | Session checkpoint replay, failure classes, task-aware observations, interrupt cancellation | Handler tests; no raw prompt/command/transcript persisted |
| P2.4 | Owned matcher-group merge, runtime staging, journal recovery, user-data isolation | Lifecycle, drift, CRLF byte restoration, recovery and uninstall tests |
| P2.5 | Installed fixture smoke and cold-process latency harness | Native lifecycle pending; latency is now captured in the CI matrix |
| P3.1 | Atomic local records, write locks, bounded observation retention, export/forget | Traversal/symlink/retention/isolation tests |
| P3.2 | Candidate -> verified-local only with matching task/command/platform/source/log proof | Stale, wrong-command/platform and tamper tests |
| P3.3 | Lexical top-2 recall, total JSON payload cap, source/version filtering, session dedupe | Positive/near-miss/exclusion fixtures; not a broad semantic score |
| P3.4 | Explicit task-boundary record/verify/recall workflow; hook failures attach to active task | Task-aware failure test; no background observer |
| P4.1 | Fixed verification IDs, change-to-check mapping, source fingerprints, stored logs | Unavailable consumer check is not-run; Unity delegates to existing harness |
| P4.2 | One Stop continuation per task/fingerprint, retained across compaction | Interrupt, active flag, repeat and compact fixtures |
| P4.3 | Narrow strict apply_patch .meta deletion guard, native deny shape | Explicit coverage only; ordinary Unity/diff guards still apply |
| P5.1 | Candidate outside discovery, canonical-name/installed trigger duplicate checks | Candidate/tamper/namespace tests |
| P5.2 | Positive/negative/conflict evidence gate, artifact hashes, <=2 revisions, explicit project promotion | Synthetic gate tests; actual behavioral promotion remains pending |
| P5.3 | CI triage reference attached to existing debugger; compact foundations/testing pilots | Reused existing owners rather than adding overlapping skills |
| P6.1 | Development B0–B4 adapter contract, 12 cases × 3 repetitions, usage provenance | Selftest passes; model/native cohort not-run without configured adapter |
| P6.2 | Opt-in profiles, rollback, user documentation and unreleased changelog | Multi-workspace rollout and release promotion not performed |
| P6.3 | Explicit lesson prune/review, source ledger and context checks for maintenance | Weekly observation is a future operational activity, not a completed test |

## Local checks

The latest full suite contains **61 tests: 60 pass, 1 Windows-only skip on Linux**. Validation covers 83 indexed skills and the registered schemas. Linux Node 20.20.2 and 22.23.3 binaries were downloaded to /tmp from nodejs.org and checked against their release SHA-256 manifests; Node 24.19.0 was already installed. Final matrix and package logs are produced under `/tmp/dreamy-evolution-evidence/`.

Package smoke creates the actual tarball, installs it in an isolated prefix with a space-containing path and invokes the installed CLI. It verifies structural validation, context inventory and installed hook fixture; report generation checks that source did not change during packing. Alpha release checking preserves existing Unity/compatibility/semantic production blockers.

The local no-op cold-process profile (30 Linux/Node 24 trials) observed p50 ~30 ms / p95 ~37 ms, zero visible bytes and zero model calls. `scripts/hook-profile.mjs` reruns the measurement on current source; it is process/adapter latency, not native event-delivery evidence.

`npm run benchmark:selftest` passed 3/3 synthetic plumbing trials. The development evolution cohort reported 180 not-run trials, 0 attempted, because no isolated native/model adapter was configured. It intentionally made no model calls and supplies no quality or token-savings claim. `trial-context.json` tells a configured external adapter which treatment/case/model labels it must implement; runtime/model/native-event receipts are required before counting native trials.

Compact entrypoint byte changes from the baseline commit:

| Skill | Before | After | Reduction |
|---|---:|---:|---:|
| unity-foundations | 4,345 | 2,250 | 48.2% |
| unity-testing | 4,233 | 2,212 | 47.7% |

These percentages measure source bytes. A separate authorized model pilot below measured total input tokens; neither measurement establishes general task-success improvement.

## Observed external checks

The [first pushed GitHub run](https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/actions/runs/39730155583) passed all four jobs at commit `265f4b480424d96c44ac0ec010ad3669754ab7df`: Ubuntu/Windows × Node 20.20.2/22.23.3. Test, installed hook fixture, deterministic eval, compatibility, actual tarball install and alpha release gate all passed. The [retained evidence summary](evidence/toolkit-evolution-ci-20261022.json) records each source/run/tarball hash. That initial run contained 60 tests; the additional runtime/policy trust-revision regression brings the current local suite to 61. Every later source commit must pass its own matrix.

| Runner | Node | Hook process p50 | p95 | Visible bytes / model calls |
|---|---|---:|---:|---|
| Ubuntu | 20 | 29.6 ms | 31.5 ms | 0 / 0 |
| Ubuntu | 22 | 45.3 ms | 47.6 ms | 0 / 0 |
| Windows | 20 | 88.2 ms | 94.2 ms | 0 / 0 |
| Windows | 22 | 89.5 ms | 118.8 ms | 0 / 0 |

Codex app-server 0.163.0 discovered all four minimal-profile definitions in the local consumer fixture and reported `enabled=true`, `trustStatus=untrusted` for each. A separate /tmp project was correctly excluded because its project config layer was untrusted. This establishes native discovery and diagnostics, not event delivery. `hooks probe` can reproduce this check without model calls; `hooks smoke --native` waits for trust review before starting its SessionStart-only smoke.

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

1. **Native trust and delivery:** review the concrete hook definition using Codex `/hooks` in the target runtime. No trust-bypass flag or trusted-hash edit was used. The current workspace `.codex/` directory is read-only; the task did not alter its permissions or install active hooks there. The reviewable local fixture is `.dreamy/native-consumer`; open Codex there, review its four definitions with `/hooks`, then run `hooks probe` and `hooks smoke --native` against that target. Additional tool/compact/interrupt/Stop acceptance remains a real-session task.
2. **Semantic A/B and skill promotion:** configure the isolated adapter, select the intended model/budget and inspect real trial artifacts. No candidate was promoted on synthetic test evidence.
3. **Unity/build/device checks:** no Unity C#/asset changes were made by this initiative. Existing production blockers and tested-matrix gaps remain visible.
4. **Opt-in rollout observation:** one week across real workspaces cannot be replaced by a same-session unit run. Start only after native trust and critical semantic gates pass; retain daily context/latency/failure receipts, review stale lessons and rollback any regression before broadening profiles.

The implementation is reviewable and locally tested; the whole multi-week initiative must not be marked operationally or semantically complete until these gates have real evidence. See [operating guide](toolkit-evolution.md) for commands and rollback.
