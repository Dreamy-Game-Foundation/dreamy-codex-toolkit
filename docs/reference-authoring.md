# Reference Authoring

References are deep, on-demand material for a skill. They are not a place to dump generic tutorials.

Use a skill-local `references/` file when:

- The topic has repeated gotchas that would bloat `SKILL.md`.
- A model needs a deeper decision model, fixture expectation, or platform nuance.
- The skill can say exactly when to read the reference.

Do not add a reference when:

- The content repeats the rule invariant.
- The same advice applies to every skill.
- The skill never points to it from `## References`.

Every reference link in a skill must use `references/<file>.md` and must exist beside that skill.

Good reference prompts:

- Read `references/idempotency.md` when purchase callbacks, retries, restore, or duplicate grants are involved.
- Read `references/panel-lifecycle.md` when a panel can be reopened, hidden during async work, or cached.
- Read `references/load-ownership.md` when a loaded asset or handle outlives the immediate method call.
