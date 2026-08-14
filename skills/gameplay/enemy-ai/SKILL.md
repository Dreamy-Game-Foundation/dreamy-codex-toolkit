---
name: enemy-ai
description: Implement or review enemy AI involving sensing, target selection, decision state, actions, navigation, cooldowns, fallback behavior, death, disable, and pooling.
---

# Enemy Ai

## Purpose

Guide enemy ai implementation with clear ownership, deterministic state, save/config separation, feedback hooks, and tests.

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

- Simple patrol/chase/attack? Use explicit state owner with guarded transitions.
- Navigation failure? Define fallback, repath timing, and stuck handling.
- Target lost/dead? AI clears target and transitions intentionally.
- Animator-driven action? Animator signals timing; AI/combat owner decides rules.
- Pooled enemy? Reset state, subscriptions, target, nav, cooldowns, and effects on despawn.

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
- Sense -> Decide -> Act should have one state owner.
- AI reads config for ranges/cooldowns; runtime owns current target/state/cooldown.
- Combat and reward systems own damage/death/reward policy.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- AI state scattered across Animator, NavMeshAgent, and MonoBehaviour booleans.
- Dead/disabled enemy still receives event bus updates.
- Duplicate attack subscriptions after pooling.
- Target reference points to despawned object.

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

Sense -> TargetSelection -> DecisionState -> Action -> Navigation/CombatRequest -> Cooldown -> Fallback -> Death/Disable Cleanup.

Inspect perception ownership, faction filters, state transition guards, nav authority, action cancellation, death cleanup, and pooling reset.
