# Agent Authoring

Codex agent templates live in `agents/codex/*.toml`.

Each agent must include:

- `name` using the native snake_case agent id.
- `description` with a narrow role.
- `developer_instructions` with sandbox behavior, skill expectations, workflow, verification, and output format.

Agents should stay small. Put domain knowledge in skills and compatibility catalogs, not in agent TOML.
