# Dreamy Codex Toolkit

Use this repository to build the Dreamy Codex Toolkit from `docs/plans/DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md`.

Canonical repository state lives in `toolkit.json`.

Rules for contributors:

- Keep observed facts, intended contracts, and unresolved hypotheses in separate fields.
- Do not claim a Dreamy package API is supported unless it is tied to a verified commit.
- Run `npm test` before marking a phase complete.
- Inspect source, project state, ownership, and local instructions before modifying files.
- Follow existing architecture and verified Dreamy package capabilities before introducing new patterns.
- Reusable cross-game code belongs in a package or shared module; game-specific glue belongs in `Assets/_Project`.
- DataConfig owns static designer-authored data; Datasave owns mutable persistent player state; runtime-only session state stays runtime-owned.
- Use ServiceLocator only at composition roots, feature roots, presenters, high-level controllers, or existing Dreamy roots.
- Leaf UI, projectiles, VFX, pooled items, and small behaviours receive explicit dependencies.
- Runtime assemblies must not reference Editor assemblies.
- Preserve Unity `.meta` GUIDs, serialized fields, prefab overrides, and scene references.
- Do not blindly text-edit scene or prefab YAML; prefer Unity/editor-supported mutation.
- Treat Unity MCP/editor operations as stateful: inspect, mutate narrowly, save, refresh, verify.
- After C# edits in Unity projects: refresh/compile, read Console, run relevant tests when available.
- Review git diff and status before claiming success; preserve unrelated user changes.
- Compatibility and API claims require the compatibility registry or current package inspection.
- Never perform broad destructive reimports, migrations, package upgrades, or GUID regeneration by default.
- If verification cannot run, state the exact command and reason.
