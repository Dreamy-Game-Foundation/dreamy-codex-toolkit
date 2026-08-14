# Rules

Rules are mandatory behavior contracts cataloged in `rules/index.json`.

Use rules for invariant safety:

- inspect before modify
- preserve serialized Unity data
- keep Runtime assemblies free of Editor references
- verify before completion
- avoid unsupported Dreamy package API claims

Use skills for workflow guidance and agents for role selection.

## Rule Quality

Rules should be atomic, testable, short enough to remember, and complete enough to prevent guessing. A production-grade rule should include at least:

- Invariant.
- Required behavior.
- Forbidden behavior.
- Decision tree or exceptions when the rule has branches.
- Verification.

Avoid one-sentence slogans. Avoid turning a rule into a 300-line tutorial; move operational depth into skills or references.
