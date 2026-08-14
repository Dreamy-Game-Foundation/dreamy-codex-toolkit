---
name: movement
description: Implement or review Unity character movement involving input intent, authority, physics versus transform motion, grounding, rotation, root motion, navigation, or mobile joystick control.
---

# Movement

## Purpose

Guide movement implementation with clear ownership, deterministic state, save/config separation, feedback hooks, and tests.

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

- Physics body? Move through Rigidbody/Rigidbody2D in fixed-step with clear collision ownership.
- Kinematic/controller motion? Own grounding, slope, step, and collision response explicitly.
- Transform-only motion? Use for non-physical actors or visual-only movement.
- NavMesh/AI movement? AI decides intent; navigation system owns path following.
- Mobile joystick/camera-relative input? Convert input intent before movement authority applies it.

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
- Input creates movement intent; movement authority applies it.
- Runtime state owns current velocity, grounding, dash/cooldown, and navigation target.
- Config owns speed, acceleration, friction, and tuning curves.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Mixing transform writes with physics-controlled bodies.
- Input component directly mutates domain state.
- Grounding state split across Animator, controller, and MonoBehaviour flags without owner.
- Mobile joystick and keyboard paths diverge in rules.

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

InputIntent -> MovementAuthority -> MovementState -> Motor/Physics/Nav -> Collision/Grounding -> Animation/Feedback.

Inspect update loop choice, physics mode, root motion, rotation authority, camera-relative transform, nav fallback, and deterministic tests for movement state transitions.
