---
name: projectile
description: Implement or review projectile spawn, initialization, travel, targeting, collision, hit policy, pierce, bounce, lifetime, pooling, and despawn.
---

# Projectile

## Purpose

Guide projectile implementation with clear ownership, deterministic state, save/config separation, feedback hooks, and tests.

## When To Use

- The request directly touches this domain.
- The implementation needs architecture, lifecycle, data ownership, or verification decisions in this area.
- Nearby code already uses this domain and the change could break it.

## When Not To Use

- A narrower Dreamy package skill owns the decision.
- The task is only documentation or release metadata with no domain behavior.
- Existing project instructions explicitly route to another skill.

## Required Inspection

- Project `AGENTS.md` and local instructions.
- `Packages/manifest.json` and `Packages/packages-lock.json` when this is a Unity project.
- Relevant asmdefs, scenes, prefabs, assets, tests, and nearby code owners.
- `compatibility/dreamy-packages.json` before making Dreamy API claims.

## Decision Tree

- Direct projectile: initialize velocity, source, damage definition, and lifetime at spawn.
- Homing projectile: runtime target owner must handle target death/despawn.
- Pierce/bounce: keep per-shot hit list and reset it on despawn.
- Pooled projectile: despawn through owning pool and reset state before reuse.
- Visual-only projectile: route combat result elsewhere; visual timing is not damage truth.

## Workflow

1. Inspect the current implementation and owner.
2. Identify data, service, UI, asset, and lifecycle boundaries.
3. Make the smallest safe change that follows existing conventions.
4. Preserve serialized references, meta GUIDs, and user-owned text.
5. Run the smallest available compile, test, harness, or static validation.
6. Report evidence and remaining risks.

## Architecture Rules

- Keep Runtime assemblies free of Editor references.
- Keep persistent player state out of read-only config.
- Keep business rules out of leaf views and pooled visual objects.
- Prefer explicit dependencies over global lookup in leaf components.
- Do not optimize without profile evidence.
- Spawn owner provides source, team, damage policy, collision mask, and dependencies.
- Projectile owns travel, collision detection, timers, trails, and despawn; combat service owns final damage rules.
- Avoid ServiceLocator in projectile leaves.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Destroying pooled projectile on hit.
- Stale target/owner/hit list after reuse.
- Trail or particle state leaking between shots.
- Async/tween callback firing after despawn.

## Verification

- Compile/console/test result, or a concrete not-run reason.
- Diff review for ownership, dependencies, and serialization safety.
- Harness evidence when available.

## Allowed Claims

Dreamy package APIs are allowed only when backed by the compatibility registry and not listed as drift or unsupported.

## References

- `compatibility/dreamy-packages.json`
- `rules/index.json`
- `docs/skill-authoring.md`

## Domain Model

SpawnRequest -> Initialize(source, owner, target, definition) -> MovementModel -> Collision/HitPolicy -> DamageRequest -> Feedback -> Despawn/ReturnToPool.

Mandatory pooled reset: velocity, target, owner/source, hit list, timers, trail, particle, collision state, subscriptions, cancellation, and active tween/sequence.
