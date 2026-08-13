# Evals

`evals/catalog.json` contains 60 deterministic routing and safety cases for package direction, data ownership, Unity safety, gameplay, mobile systems, assets, and performance.

Each case records a unique `id`, `prompt`, expected behavior, forbidden claims, and a numeric `scoreThreshold`. The catalog also includes `agentCoverage` so agent templates cannot be added without explicit eval coverage.

`dreamy-kit eval` validates the deterministic structure and reports catalog coverage. Future semantic runners may add model scoring, but missing runtime evidence must remain fail/degraded rather than pass.
