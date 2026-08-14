---
name: dreamy-core
description: Use verified Dreamy Core service, event, state, lifecycle, logging, and tick capabilities.
---

# Dreamy Core

## Purpose

Guide Core usage for services, event bus, state machines, lifecycle, logging, ticking, and extensions.

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

- Service lookup needed? Allow at composition/feature/presenter roots; inject to leaves.
- Cross-feature notification? Use event bus only when direct ownership would couple unrelated features.
- Mutually exclusive runtime mode? Use a state machine with transition guards.
- Simple boolean or one-off branch? Do not create a state machine.
- Repeated ticking across systems? Prefer a central tick service only when it reduces scattered Update loops.

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

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Event soup where direct call or owner method would be clearer.
- Duplicate service registration or late registration race.
- State machine without entry/exit cleanup.
- Tick service used as a hidden global update bucket.

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

## Verified Capability Areas

- ServiceLocator for bootstrap, installers, feature roots, presenters, and top-level controllers.
- EventBus for cross-feature notifications and decoupled application events.
- StateMachine for explicit mutually-exclusive states.
- AppLifecycle and AppTickService for centralized app lifecycle and ticking when it reduces scattered Update loops.
- DreamyLog and extensions when compatibility records verify availability.

Avoid ServiceLocator in UI list items, projectiles, VFX objects, pooled leaves, and tiny components.

Read deeper references when present:
- `references/service-locator.md` for registration timing, lifetime, duplicate registration, and test strategy.
- `references/event-bus.md` for event ownership and unsubscribe rules.
- `references/state-machine.md` for guards, entry/exit, and simple-boolean alternatives.
- `references/app-lifecycle.md` and `references/tick-service.md` for app-owned lifetimes and Update replacement.
