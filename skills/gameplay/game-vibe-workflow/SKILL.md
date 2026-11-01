---
name: game-vibe-workflow
description: Build or resume a game from a detailed brief, including whole-game exact clones, original ideas and requested slices, with asset integration, screenshot comparison and optional REA investigation.
---

# Game Vibe Workflow

## Scope

Use for starting or resuming a game across briefing, assets, integration and delivery. Preserve existing work and choices. For clones use `game-clone`. Route isolated bugs, single-asset requests or architecture-only reviews to narrower skills.

## Decisions

1. Inspect the real project; in Unity read manifest/lock before package claims. For a new game, clone or materially underspecified resume, read `references/input-pack.md` and expand the input before feature implementation. For "complete/identical/exact clone", "clone hoàn thiện/y hệt" or equivalent intent, also read `references/exact-clone.md`: prepare the whole-game brief and research/capture/asset coverage first. Do not silently replace that request with an offline core loop, a handful of levels or redesigned menus. Reuse existing work; an integration pilot is a checkpoint within the full scope.
2. In Dreamy consumers, apply `references/dreamy-reuse.md` before custom infrastructure/UI: inspect README/source and `_Feature`, reuse installers/prefabs/assets/panels/tween components, and record a capability gap before self-writing. Separate game intent (clone/original/hybrid) from asset sourcing (AI/existing/procedural/hybrid). Use `references/workflow.md` for milestones and `references/asset-routing.md` for assets. Requested package/build extraction routes to `game-asset-extraction`; a clone brief alone does not request extraction.
3. Select investigation mode: `off`, `auto` or `required`. Default `auto` means use ordinary source/visual observation unless a specific unresolved claim needs a supplied shipped artifact or requested runtime evidence. Explicit `off` skips REA discovery, setup and commands. With a complete source repo, inspect it normally. For a relevant REA task read `references/rea.md`; REA is an optional analyst, never a game dependency. If `required` cannot run, preserve useful independent work and report the investigation as blocked/unverified; do not silently substitute a standalone result.
4. After intake, prove one representative integration from asset through gameplay, then complete the required screen/function graph. For an exact clone, prefer suitable extracted assets and finish the complete entry/action/effect/exit/error flow; placeholders or imported files alone are not completion. Use an early build when permitted; no-build means Editor checks and a deferred player gate. If actual Unity/MCP/Game View is needed, notify the user of the reason, project/scene and required Editor/bridge state before switching from batch. Do not claim an offscreen batch preview is the same verification.
5. Persist next action, revision, running job/process IDs and evidence. Resume a paid job after timeouts; do not regenerate to repair a download. Bound retries, blocker time and spending; do not let repeated tool/build debugging displace gameplay/fidelity work. Use one editor writer and isolated work areas if delegation is already authorized; otherwise work sequentially.
6. Freeze features at the agreed boundary. Verify the final artifact from normal launch when player delivery is in scope and permitted; otherwise hand off the source/Editor checkpoint with deferred checks. Include controls, evidence, costs/provenance and open defects. Stop at the requested outcome or explicit limit; do not introduce an endless-work hook.

## Verification

Use `references/verification.md` to choose evidence for function, presentation, feel, performance and player build separately. Run the smallest relevant check after each batch and the complete P0 route before delivery. A compile, generated mesh, exported clip or REA reconstruction verdict does not prove a playable game. Record not-run checks, exact unavailable tooling and owner acceptance separately; changed artifacts need fresh relevant evidence.

## References

- For milestone sequencing and recovery: `references/workflow.md`.
- In Dreamy/template consumers, before custom services/UI or a maintainability refactor: `references/dreamy-reuse.md`.
- Before implementing an underspecified game/clone: `references/input-pack.md`.
- For a whole-game identical clone: `references/exact-clone.md`, including web research, original screenshots, complete state coverage and individual asset JSON links.
- For asset sourcing, processing and animation contracts: `references/asset-routing.md`.
- Only for REA investigation or its observed connection blocker: `references/rea.md`.
- For gate/normal-launch evidence: `references/verification.md`.
- When creating project records or kickoff/resume prompts: `references/templates.md` and the named files under `assets/`.
- For provenance, pinned upstream contracts and untested extensions: `references/sources.md`.
