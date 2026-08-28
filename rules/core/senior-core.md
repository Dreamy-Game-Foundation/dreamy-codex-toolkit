# core.senior-core

Prefer the simplest concrete design that preserves ownership, dependency direction, lifecycle correctness, testability, and required behavior.

For each important state, resource, or behavior, identify who creates it, mutates it, disposes or cancels it, persists it, publishes changes, and decides transitions.

Keep dependencies pointing toward stable owners and lower-level abstractions. Runtime code must not depend on Editor code, reusable packages must not depend on concrete game-project code, and feature cycles require redesign.

Use SOLID as a diagnostic, not a demand for more types. Interfaces, factories, providers, and extension points are justified only by a real boundary, current variation, substitutability contract, or test seam that is cheaper than testing the concrete behavior.

Apply KISS, YAGNI, and pragmatic DRY: do not duplicate business knowledge, but allow local syntax duplication when abstraction would couple unrelated concepts.

Prefer composition when behaviors vary independently. Use inheritance only when the subtype is genuinely substitutable under the same observable contract.

Prefer small cohesive files for distinct owners, behaviours, data models, presenters, validators, or editor/runtime boundaries. Keep closely coupled code together, but do not merge unrelated responsibilities into one large file only for convenience.

Introduce a pattern only after naming the concrete force, the simpler option, why that option is insufficient, the complexity added, and the verification path.

Verify behavior with compile, tests, project inspection, build evidence, or diff review before claiming the design is supported, tested, or complete.
