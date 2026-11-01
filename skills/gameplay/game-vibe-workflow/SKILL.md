---
name: game-vibe-workflow
description: Build or resume a game from a detailed brief, including whole-game exact clones, original ideas and requested slices, with asset integration, screenshot comparison and optional REA investigation.
---

# Game Vibe Workflow

## Scope

Use for starting or resuming a game across briefing, assets, integration and delivery. Preserve existing work and choices. For clones use `game-clone`. Route isolated bugs, single-asset requests or architecture-only reviews to narrower skills.

## Decisions

1. Inspect the project; in Unity read manifest/lock before package claims. For a new game, clone or thin resume, expand intake through `references/input-pack.md` before implementation. For clones read `references/clone-research.md`: search images and available video by function/state, inspect media, and persist an index, linked feature plans and source/coverage manifest. Preserve the requested slice. For complete/identical/y hệt clones also read `references/exact-clone.md`; retain the whole experience instead of an offline loop, a few levels or redesigned menus. Reuse work; a pilot is a checkpoint within scope.
2. In Dreamy consumers, read `references/dreamy-reuse.md` before custom infrastructure/UI: inspect README/source and `_Feature`, reuse suitable installers/prefabs/panels/tweens and record capability gaps. Separate game intent (clone/original/hybrid) from asset sourcing (AI/existing/procedural/hybrid). Use `references/workflow.md` for milestones and `references/asset-routing.md` for assets. Requested extraction routes to `game-asset-extraction`; a clone brief alone does not request extraction.
3. Select investigation mode: `off`, `auto` or `required`. Default `auto` means use ordinary source/visual observation unless a specific unresolved claim needs a supplied shipped artifact or requested runtime evidence. Explicit `off` skips REA discovery, setup and commands. With a complete source repo, inspect it normally. For a relevant REA task read `references/rea.md`; REA is an optional analyst, never a game dependency. If `required` cannot run, preserve useful independent work and report the investigation as blocked/unverified; do not silently substitute a standalone result.
4. After intake, prove one representative integration from asset through gameplay, then complete the required screen/function graph. For an exact clone, prefer suitable extracted assets and finish the complete entry/action/effect/exit/error flow; placeholders or imported files alone are not completion. Use an early build when permitted; no-build means Editor checks and a deferred player gate. If actual Unity/MCP/Game View is needed, notify the user of the reason, project/scene and required Editor/bridge state before switching from batch. Do not claim an offscreen batch preview is the same verification.
5. Persist next action, revision, job/process IDs and evidence. Resume paid jobs after timeouts; repair downloads without regeneration. Bound retries, blocker time and spending so debugging does not displace fidelity work. If delegation is authorized, isolate work and use one editor writer; otherwise work sequentially.
6. Freeze features at the agreed boundary. Verify the final artifact from normal launch when player delivery is in scope and permitted; otherwise hand off the source/Editor checkpoint with deferred checks. Include controls, evidence, costs/provenance and open defects. Stop at the requested outcome or explicit limit; do not introduce an endless-work hook.

## Verification

Use `references/verification.md` for separate function, presentation, feel, performance and player evidence. Run relevant batch checks and the complete P0 route before delivery. Compilation, exported assets or a REA verdict do not prove playability. Record not-run tooling and owner acceptance separately; changed artifacts need fresh relevant evidence.

## References

- For milestone sequencing and recovery: `references/workflow.md`.
- In Dreamy/template consumers, before custom services/UI or a maintainability refactor: `references/dreamy-reuse.md`.
- Before implementing an underspecified game/clone: `references/input-pack.md`.
- For clone research and linked plans per function/state: `references/clone-research.md`, including image/video discovery, inspected media and coverage gaps. For whole-game parity also read `references/exact-clone.md` for complete state coverage and individual asset JSON links.
- For asset sourcing, processing and animation contracts: `references/asset-routing.md`.
- Only for REA investigation or its observed connection blocker: `references/rea.md`.
- For gate/normal-launch evidence: `references/verification.md`.
- When creating project records or kickoff/resume prompts: `references/templates.md` and the named files under `assets/`.
- For provenance, pinned upstream contracts and untested extensions: `references/sources.md`.
