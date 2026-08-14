# Architecture

Dreamy Codex Toolkit is organized around machine-readable truth first:

- `toolkit.json` lists current modules, presets, schemas, rules, skills, evals, and harness.
- `compatibility/` gates Dreamy package API claims by verified commits.
- `rules/` and `skills/` provide concise Codex routing material.
- `agents/codex/` stores optional Codex agent templates.
- `src/cli` installs and removes the managed AGENTS block, Dreamy agent files, and Codex agent config without touching user text.
- `harness/dreamy-harness` emits schema-shaped evidence for validation operations.

## Agent And Skill Shape

This repo follows the useful parts of `tranvietanh0/oh-my-game-kit`:

- compact root manifest
- module and preset catalogs
- install state with managed blocks
- `AGENTS.md` sentinels that preserve user text
- project-local Codex agents in `.codex/agents`
- skills with short trigger frontmatter plus task-specific workflow sections

Dreamy-specific agents:

- `dreamy_project_analyst`: read-only project capability profile and routing preflight.
- `dreamy_plan`: repository-aware work planning.
- `dreamy_architect`: ownership and dependency decisions.
- `dreamy_unity_developer`: Unity feature implementation.
- `dreamy_unity_editor`: safe Editor, scene and prefab mutation.
- `dreamy_debugger`: evidence-driven root-cause work.
- `dreamy_tester`: test strategy and execution.
- `dreamy_code_reviewer`: correctness and release-risk review.
- `dreamy_performance_engineer`: measured performance work.
- `dreamy_build_engineer`: Unity/mobile build and CI work.
- `dreamy_package_maintainer`: package manifest, asmdef, compatibility, and release upkeep.
- `dreamy_release_validator`: release gate checks.
- `dreamy_docs_manager`: README and docs maintenance.
- `dreamy_skill_author`: detailed skill creation and expansion.

Dreamy-specific skills should be detailed only when the guidance is source-grounded. Verified package claims live in `compatibility/dreamy-packages.json`; unresolved behavior stays in drift or unsupported contract fields.
