---
name: thirdparty-dotween
description: Use DOTween tween ownership, sequences, Kill, SetLink, callbacks, pooled object lifecycle, panel transitions, and reuse with explicit Unity lifecycle, version detection, ownership, and verification.
---

# Thirdparty Dotween

## Purpose

Guide DOTween tween ownership, sequences, Kill, SetLink, callbacks, pooled object lifecycle, panel transitions, and reuse without assuming absent packages or hiding lifecycle/handle ownership.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

TweenRequest -> Owner -> Tween/Sequence -> Link/KillPolicy -> CallbackGuard -> Complete/Cancel -> Cleanup.

## Required Inspection

- Project `AGENTS.md`, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Kill/reuse previous tween before starting another.
- Pooled object kills tweens on despawn.
- Callbacks guard owner validity.
- If the owner is unclear, stop at a plan/architecture decision before mutating code.

## Workflow

1. Inspect current owner and existing project convention.
2. Map static config, persistent state, runtime state, UI, service, asset, and lifecycle ownership where applicable.
3. Choose the smallest change that preserves architecture, serialization, and dependency direction.
4. Add or update focused tests/fixtures when behavior, migration, or lifecycle risk changes.
5. Run compile, console, targeted tests, harness/static validation, or record the exact unavailable gate.
6. Review diff for unrelated churn and unsupported API claims.

## Architecture Rules

- Keep Runtime assemblies free of Editor references.
- Keep DataConfig, Datasave, runtime state, UI, and service responsibilities separate.
- Resolve global services at roots/high-level owners; pass explicit dependencies to leaves.
- Preserve `.meta` GUIDs, serialized references, prefab overrides, and package dependency direction.
- Optimize only from measured evidence.

## Common Patterns

- Check manifest/lock before using package APIs.
- Wrap vendor behavior at service/owner boundaries rather than scattering calls through leaves.

## Anti-patterns

- OnComplete grants rewards.
- Stacked Show tweens.

## Common Failure Modes

- Unsupported or drifted API claim.
- Hidden owner change between package, project, UI, runtime state, or persistence.
- Lifecycle leak through async work, events, tweens, pooled objects, Addressables handles, or scene transitions.
- Verification skipped without a precise degraded reason.

## Verification

- Compile/console/test result when Unity is available, otherwise degraded harness/static evidence with exact reason.
- Focused regression for duplicate calls, cancellation/destruction, save/load, migration, or platform branch when relevant.
- Diff review for serialization, `.meta`, asmdef/manifest, scene/prefab, and unrelated changes.

## Dreamy Integration

- Prefer Dreamy wrappers when verified and already used by the project.
- If Dreamy compatibility records mark drift, treat integration as a blocker or explicit assumption.

## Allowed Claims

Only claim third-party APIs or version behavior when the package is present in `Packages/manifest.json`, lock data, or `compatibility/third-party.json`.

## References

- Always read `AGENTS.md`, `rules/index.json`, and the relevant compatibility catalog before making ownership or API claims.
- Read `references/tween-lifecycle.md` when the task touches this skill's deeper tween lifecycle behavior.
