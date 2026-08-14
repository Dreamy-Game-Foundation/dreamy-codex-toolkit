---
name: combat
description: Implement or review Unity combat involving attacks, hit detection, damage, health, death, knockback, combat state, or combat feedback.
---

# Combat

## Purpose

Guide combat implementation with clear ownership, deterministic state, save/config separation, feedback hooks, and tests.

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

- Hitscan: use ray/query hit detection and create damage requests.
- Projectile: projectile owns travel/lifetime; damage system owns damage policy.
- AoE: query targets, then issue deterministic damage requests.
- Melee: model attack window/hitbox/target filtering separately from animation.
- DoT/status: runtime effect owner tracks ticks, duration, stacking, and cleanup.

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
- Attack definitions and tuning live in config; current HP, current target, invulnerability windows, and temporary buffs live in runtime owners.
- Animation events may signal timing, but they do not own final game rules.
- Combat feedback listens to combat result events; VFX should not directly kill or grant rewards.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Double-hit during one attack window.
- Projectile or VFX mutates Health directly without damage policy.
- Death state fires multiple times.
- UI health bar becomes source of truth.

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

AttackIntent -> AttackDefinition -> AttackRuntime -> HitDetection -> DamageRequest -> DamageCalculation -> HealthMutation -> Death/StateChange -> FeedbackEvent.

Inspect source owner, target selection, team/faction filtering, damage modifiers, immunity, knockback, death ownership, feedback hooks, pooling cleanup, and save boundaries.
