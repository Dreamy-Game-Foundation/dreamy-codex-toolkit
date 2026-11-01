---
name: game-clone
description: Recreate a selected Unity game through reference research, AssetRipper asset recovery, focused REA investigation and verified integration into a target project. Use for game cloning; route extraction-only, original-game and isolated bug requests to their narrower workflows.
---

# Game Clone

## Scope

Use for a selected game clone, from plan through requested delivery, especially when combining REA and AssetRipper. Preserve the user's slice or whole-game scope, existing work and tool choices. A store link selects research, not a local binary. Plan-only requests produce a plan without extraction or implementation. Extraction alone routes to `game-asset-extraction`; original games route to `game-vibe-workflow`.

## Decisions

1. Read `references/clone-contract.md` to establish source identity/version, destination, scope, references and deliverable. Use its clone-research guide to find and inspect function/state screenshots and available video, then persist indexed feature plans and source/coverage gaps before parity implementation. Use linked intake/exact-clone guidance for a thin brief or whole game. A pilot does not replace the requested scope.
2. Read `references/toolchain.md` when artifact analysis or extraction is requested. Reuse `game-asset-extraction` for inventory/export/catalogs and `game-vibe-workflow` for project integration. Preserve REA `off/auto/required`; requesting both REA and AssetRipper makes each a required evidence track unless later changed by the user. Missing one leaves that track blocked/not-run while independent work continues. Do not silently substitute tools or run REA setup just because this skill activates.
3. Identify the actual package/engine, split data, dependencies and Mono/IL2CPP layout. Export to a fresh task workspace outside source and target project. Check the resolved absolute destination before calling AssetRipper: an existing destination can be deleted. Pilot representative objects and inspect output/logs before expanding. Keep failures and missing resources visible; use the existing extraction helpers rather than copying them.
4. Investigate concrete implementation questions with available REA tools and their real schemas. Prefer source inspection for complete source repositories. Separate metadata, static interpretations and runtime observations; dummy scripts, method names and pseudocode do not recover original gameplay. Retain Evidence IDs, source digests, tool/provider identity, coverage and unknowns for each answer.
5. Link each implemented behavior to its evidence and acceptance scenario; link selected asset IDs through export paths to imported GUIDs, prefab/components and the screen using them. Inspect the target manifest/lock and verified package/source capabilities; reuse Dreamy owners through the integration workflow. Keep static config, persistent save and session state separate, Runtime free of Editor references, and existing GUIDs/references intact.
6. Read `references/verification.md` for completion. Complete the requested entry/action/effect/exit/error flows with usable assets, then compare matched source/clone states. Resume from recorded receipts, jobs and gaps after interruption instead of rerunning uncertain work. Record next action and remaining scope; stop only task-owned processes by verified identity.

## Verification

Track extraction, REA findings, import, compile, Play Mode, visual/feel, services and player build separately. Honor no-build and REA-off constraints. Verify actual files/media, Evidence and normal entry paths; asset counts, metadata, a screenshot or compile do not establish a faithful game. Report required incomplete gates with their dependencies. Installing this skill neither installs third-party tools nor verifies a real-game clone.

## References

- Before scope or implementation decisions: `references/clone-contract.md`.
- For artifact/tool selection, setup blockers and upstream provenance: `references/toolchain.md`.
- Before milestone or delivery claims: `references/verification.md`.
