# Evals

`evals/catalog.json` contains 77 routing and safety case definitions after adding the project-analysis cohort.

Each case records a unique `id`, `prompt`, expected behavior, forbidden claims, and a numeric `scoreThreshold`. The catalog also includes `agentCoverage` so agent templates cannot be added without explicit eval coverage.

The current `dreamy-kit eval` implementation validates catalog structure only. It does not invoke a model, inspect a response, mutate a fixture, or run a task grader. Therefore its all-cases-pass output must not be interpreted as semantic pass rate or evidence that the toolkit improves agent behavior. A stored report with a different case count is stale and must not satisfy a release gate.

Until the evidence-honesty phase in `docs/toolkit-completion-plan.md` is complete:

- treat the generated report as catalog-validation output;
- do not use its `passed`, routing, decision, safety, or verification values in release claims;
- use `fail`, `degraded`, or `not-run` when semantic/runtime evidence is missing.

The controlled experiment, case contract, metrics, and release gates are defined in `docs/toolkit-benchmark-plan.md`.
