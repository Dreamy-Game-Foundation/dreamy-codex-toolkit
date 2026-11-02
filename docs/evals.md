# Evals

<!-- DREAMY-CATALOG:START -->
`evals/catalog.json` contains **103** routing and safety case definitions. These are catalog definitions, not 103 observed model passes.
<!-- DREAMY-CATALOG:END -->

Each case records a unique `id`, `prompt`, expected behavior, forbidden claims, and a numeric `scoreThreshold`. The catalog also includes `agentCoverage` so agent templates cannot be added without explicit eval coverage.

`dreamy-kit eval` validates every case with JSON Schema and writes a hash-bound `catalog-validation` report. It deliberately contains no `passed`, pass-rate, or semantic score field because it does not invoke a model. A report with a different catalog hash or case count fails the release freshness check.

Semantic execution is separate:

- `npm run eval:deterministic` validates catalog structure only;
- `npm run benchmark -- --manifest benchmarks/manifests/pilot.json --command <adapter>` invokes an external agent adapter and grades observed output;
- omitting `--command` produces a `degraded` benchmark with `not-run` trials rather than fake passes.
- production release only consumes a separately published `release/benchmark-report.json` that is quality-purpose, release-eligible, complete, and bound to a clean toolkit commit.
- release benchmark thresholds live in `benchmarks/release-policy.json` and are evaluated by `npm run release:check`.

Artifact tasks use `grader.type: "artifact-task"` with `fixture` and `verifier`
paths resolved relative to the **manifest directory**. Each attempt receives a
fresh copied `workspace`; adapters get its path through `{workspace}` and the
prompt. After the adapter exits, the runner executes the manifest-owned `.mjs`
verifier using Node with the workspace path as its only argument. Exit zero is
required, independently of the adapter's answer. Reports retain fixture and
artifact hashes, changed paths, verifier hash and `verification.log` with its
hash. Changes to trusted fixture/verifier inputs or verifier-side artifact
repairs fail. The grader is a verification mechanism, not a security sandbox;
run only reviewed adapters/verifiers with the task's ordinary permissions.

`benchmarks/manifests/artifact-pilot.json` defines a pure JavaScript subscription
lifecycle task with three repetitions, development purpose and no release
eligibility. Prepare it without model execution:

```bash
node scripts/benchmark.mjs --manifest benchmarks/manifests/artifact-pilot.json --prepare
```

No configured adapter means not-run, not a model quality score. Deterministic
fake-adapter tests verify grader mechanics only. Real coding comparisons still
require an authorized runtime/model/budget and retained observed artifacts.

For the compact-skill draft comparison, prepare only the development split:

```bash
node scripts/validate-compact-pilot.mjs
node scripts/benchmark.mjs --manifest benchmarks/manifests/compact-skill-pilot.json --split development --prepare
```

This creates 60 not-run trial slots (10 cases × 2 treatments × 3 repetitions),
without invoking a model. Keep `--split holdout` for the reserved cohort. These
are forced-load decision probes, distinct from the artifact lifecycle pilot,
automatic skill discovery and production quality evidence.

The controlled experiment, case contract, metrics, and release gates are defined in `docs/toolkit-benchmark-plan.md`.

Catalog counts in this guide and README are generated from toolkit.json and its catalogs. Run `node scripts/catalog-summary.mjs --write` after catalog changes; `npm run validate` checks for drift. This check does not invoke a model.
