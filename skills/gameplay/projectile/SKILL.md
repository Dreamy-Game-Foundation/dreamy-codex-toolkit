---
name: projectile
description: Implement or review Unity gameplay projectile spawn, initialization, travel, collision, target, pierce, bounce, lifetime, pooling, and despawn.
---

# Projectile

## Purpose

Guide projectile spawn, initialization, travel, collision, target, pierce, bounce, lifetime, pooling, and despawn with explicit config/save/runtime ownership, lifecycle cleanup, feedback boundaries, and tests.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

SpawnRequest -> Initialize(source,target,definition) -> Movement -> Collision/HitPolicy -> DamageRequest -> Feedback -> Despawn/PoolReturn.

## Required Inspection

- Project `AGENTS.md`, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Pooled projectile resets owner, target, hit list, timers, trail, collision, subscriptions, and cancellation.
- Spawner passes dependencies; projectile does not resolve global services.
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

- Definitions/tuning live in DataConfig; player-owned progress lives in Datasave; current session state stays runtime-owned.
- Views render state and send intent; services/domain owners mutate game state.

## Anti-patterns

- Destroy pooled projectile on hit.
- Old target or tween survives reuse.

## Common Failure Modes

- Unsupported or drifted API claim.
- Hidden owner change between package, project, UI, runtime state, or persistence.
- Lifecycle leak through async work, events, tweens, pooled objects, Addressables handles, or scene transitions.
- Verification skipped without a precise degraded reason.

## Verification

- Compile/console/test result when Unity is available, otherwise degraded harness/static evidence with exact reason.
- Focused regression for duplicate calls, cancellation/destruction, save/load, migration, or platform branch when relevant.
- Diff review for serialization, `.meta`, asmdef/manifest, scene/prefab, and unrelated changes.

## Allowed Claims

Only claim installed package, Unity, platform, or Dreamy behavior after inspecting manifests, project files, compatibility data, or harness evidence.

## References

- Always read `AGENTS.md`, `rules/index.json`, and the relevant compatibility catalog before making ownership or API claims.
- Read `references/projectile-pooling.md` when the task touches this skill's deeper projectile pooling behavior.
