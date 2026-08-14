# Agent Authoring

Codex agent templates live in `agents/codex/*.toml`.

Agent = mode of work. Skill = domain knowledge. Rule = invariant. Harness = evidence. Eval = behavior test.

Each agent must include:

- `name` using the native snake_case agent id.
- `description` with a narrow role.
- `developer_instructions` with sandbox behavior, skill expectations, workflow, verification, and output format.
- A unique mission that would still be recognizable if the filename were hidden.
- A stopping condition and output schema.

Agents should stay small. Put domain knowledge in skills and compatibility catalogs, not in agent TOML.

Quality checklist:

- Unique mission.
- Unique workflow.
- Unique stopping condition.
- Explicit output.
- Explicit safety boundary.
- Exact verification.
- Not a copy of another agent with a new title.
