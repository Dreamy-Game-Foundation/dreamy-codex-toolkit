---
name: thirdparty-unitask
description: Use UniTask cancellation, player loop timing, `UniTaskVoid`, `.Forget`, exception observation, `WhenAll`, and Unity lifetime ownership with explicit Unity lifecycle, version detection, ownership, and verification.
---

# Thirdparty Unitask

## Purpose

Guide UniTask cancellation, player loop timing, `UniTaskVoid`, `.Forget`, exception observation, `WhenAll`, and Unity lifetime ownership without assuming absent packages or hiding lifecycle/handle ownership.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

Owner -> CancellationToken -> UniTask/WhenAll -> ExceptionObservation -> ContinuationOwnerCheck -> Result/Cancellation.

## Required Inspection

- Project `AGENTS.md` when present, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Object-tied tasks cancel on destroy.
- Panel-tied tasks cancel on close/hide when stale result matters.
- Fire-and-forget observes errors.
- async void only at callback boundary.
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

- Lost exceptions in .Forget.
- Continuation mutates destroyed object.

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

- Read project `AGENTS.md` and `rules/index.json` when present; for global installs, use the packaged skill/rule context and relevant compatibility catalog before making ownership or API claims.
- Read `references/cancellation.md` when the task touches this skill's deeper cancellation behavior.
- Read `references/fire-and-forget.md` when the task touches this skill's deeper fire and forget behavior.
- Read `references/player-loop.md` when the task touches this skill's deeper player loop behavior.
- Read `references/unity-lifecycle.md` when the task touches this skill's deeper unity lifecycle behavior.
