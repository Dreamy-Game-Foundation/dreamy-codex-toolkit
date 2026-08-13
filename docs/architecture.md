# Architecture

Dreamy Codex Toolkit is organized around machine-readable truth first:

- `toolkit.json` lists current modules, presets, schemas, rules, skills, evals, and harness.
- `compatibility/` gates Dreamy package API claims by verified commits.
- `rules/` and `skills/` provide concise Codex routing material.
- `src/cli` installs and removes the managed AGENTS block without touching user text.
- `harness/dreamy-harness` emits schema-shaped evidence for validation operations.
