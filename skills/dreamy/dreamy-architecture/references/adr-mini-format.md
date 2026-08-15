# ADR Mini Format

Use this when a change has nontrivial ownership or dependency consequences.

## Fields

- Context: existing owners, packages, assemblies, scenes, data sources, and constraints.
- Decision: one concrete direction, not a list of preferences.
- Owner: package, project feature, scene, service, presenter, runtime model, or asset owner.
- Dependency direction: which layer may reference which layer.
- Alternatives: credible options considered.
- Why rejected: evidence-based reason for each rejected option.
- Migration impact: save data, serialized fields, prefabs, Addressables keys, public API, tests.
- Verification: compile/test/static evidence and any degraded reason.

## Quick Checks

- Does the decision keep package code independent from project code?
- Does static config stay out of mutable save state?
- Does UI send intent instead of owning business transactions?
- Is service lookup limited to a composition/high-level owner?
- Does the migration preserve serialized references and old saves?
