# Evals

`evals/catalog.json` contains 77 routing and safety case definitions after adding the project-analysis cohort.

Each case records a unique `id`, `prompt`, expected behavior, forbidden claims, and a numeric `scoreThreshold`. The catalog also includes `agentCoverage` so agent templates cannot be added without explicit eval coverage.

`dreamy-kit eval` validates every case with JSON Schema and writes a hash-bound `catalog-validation` report. It deliberately contains no `passed`, pass-rate, or semantic score field because it does not invoke a model. A report with a different catalog hash or case count fails the release freshness check.

Semantic execution is separate:

- `npm run eval:deterministic` validates catalog structure only;
- `npm run benchmark -- --manifest benchmarks/manifests/pilot.json --command <adapter>` invokes an external agent adapter and grades observed output;
- omitting `--command` produces a `degraded` benchmark with `not-run` trials rather than fake passes.
- production release only consumes a separately published `release/benchmark-report.json` that is quality-purpose, release-eligible, complete, and bound to a clean toolkit commit.
- release benchmark thresholds live in `benchmarks/release-policy.json` and are evaluated by `npm run release:check`.

The controlled experiment, case contract, metrics, and release gates are defined in `docs/toolkit-benchmark-plan.md`.
