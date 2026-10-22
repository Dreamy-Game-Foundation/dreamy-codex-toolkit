# Evolution implementation evidence — 22 October 2026

This tracks implementation of the [ECC / Superpowers / OmO plan](plans/DREAMY_TOOLKIT_ECC_SUPERPOWERS_OMO_EVOLUTION_PLAN.md). The product remains alpha. Source implementation, deterministic verification and external operational/semantic acceptance are separate states.

## Implemented locally

| Plan task | Implementation | Evidence or remaining boundary |
|---|---|---|
| P0.1 | Explicit sorted test files, no shell glob; preserves child exit status | Portable process tests; Linux Node 20/22/24 |
| P0.2 | npm JavaScript entrypoint through current Node; isolated tarball install | Actual pack smoke, including paths with spaces |
| P0.3 | Schema/version/source/run/tarball freshness and packed CLI checks | Stale/modified/missing report tests; alpha release gate |
| P0.4 | Preserve 4-leg matrix, fail-fast off, pack before release, upload evidence | YAML parsed; live GitHub/Windows run remains pending |
| P0.5 | Separate spawn, exit, empty output and JSON diagnostics | EPERM/empty/degraded fixtures |
| P1.1 | Context inventory for selected/managed installation; bytes distinct from tokens | CLI report, tokens=null when unmeasured |
| P1.2 | Compact authoring profile + budget validation; two compact pilots | Entry bytes reduced; semantic retention needs A/B |
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

The latest full suite contains **60 tests: 59 pass, 1 Windows-only skip on Linux**. Validation covers 83 indexed skills and the registered schemas. Linux Node 20.20.2 and 22.23.3 binaries were downloaded to /tmp from nodejs.org and checked against their release SHA-256 manifests; Node 24.19.0 was already installed. Final matrix and package logs are produced under `/tmp/dreamy-evolution-evidence/`.

Package smoke creates the actual tarball, installs it in an isolated prefix with a space-containing path and invokes the installed CLI. It verifies structural validation, context inventory and installed hook fixture; report generation checks that source did not change during packing. Alpha release checking preserves existing Unity/compatibility/semantic production blockers.

The final-source no-op cold-process profile (30 Linux/Node 24 trials) observed p50 ~31 ms / p95 ~37 ms, zero visible bytes and zero model calls. `scripts/hook-profile.mjs` reruns the measurement on current source; it is process/adapter latency, not native event-delivery evidence.

`npm run benchmark:selftest` passed 3/3 synthetic plumbing trials. The development evolution cohort reported 180 not-run trials, 0 attempted, because no isolated native/model adapter was configured. It intentionally made no model calls and supplies no quality or token-savings claim. `trial-context.json` tells a configured external adapter which treatment/case/model labels it must implement; runtime/model/native-event receipts are required before counting native trials.

Compact entrypoint byte changes from the baseline commit:

| Skill | Before | After | Reduction |
|---|---:|---:|---:|
| unity-foundations | 4,345 | 2,250 | 48.2% |
| unity-testing | 4,233 | 2,212 | 47.7% |

These are source byte reductions, not observed token or task-success improvements.

## Deliberate contract choices

- Hook ownership uses its own version-1 sidecar. Existing installer v1/v2 compatibility remains; a v3 installer migration was unnecessary for isolated opt-in hooks.
- Evolution commands target a project. Global policy/trust/skill writes and cross-project knowledge promotion remain disabled.
- No embedding service, resident observer, auto model routing, agent swarm, self-push or self-publish was introduced.
- Candidate promotion copies only reviewed SKILL.md to a new project directory. Toolkit-wide promotion remains a normal source/catalog/module change. Reports validate actual artifact hashes but still need a reviewer to assess behavioral truth.
- Native receipts generated by explicit fixture invocation cannot establish that Codex delivered an event. Doctor therefore does not infer operational=true from such files.
- Presets keep their existing meaning. No lean-selection default was enabled without a measured discovery/task-quality comparison.

## External acceptance still required

1. **Live GitHub/Windows matrix:** source changes have not been committed/pushed by this task. Run the CI workflow at the resulting commit; Linux evidence does not substitute for Windows/PowerShell.
2. **Native trust and delivery:** review the concrete hook definition using Codex `/hooks` in the target runtime. No trust-bypass flag or trusted-hash edit was used. The current workspace `.codex/` directory is read-only; the task did not alter its permissions or install active hooks there. `hooks configure --target ... --dry-run` makes a reviewable proposal for a writable consumer.
3. **Semantic A/B and skill promotion:** configure the isolated adapter, select the intended model/budget and inspect real trial artifacts. No candidate was promoted on synthetic test evidence.
4. **Unity/build/device checks:** no Unity C#/asset changes were made by this initiative. Existing production blockers and tested-matrix gaps remain visible.
5. **Opt-in rollout observation:** one week across real workspaces cannot be replaced by a same-session unit run.

The implementation is reviewable and locally tested; the whole multi-week initiative must not be marked operationally or semantically complete until these gates have real evidence. See [operating guide](toolkit-evolution.md) for commands and rollback.
