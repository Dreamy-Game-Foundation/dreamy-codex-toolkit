---
name: thirdparty-dotween
description: Use for DOTween sequence, kill, lifecycle, and tween ownership.
---

# Thirdparty Dotween

## Purpose

Use for DOTween sequence, kill, lifecycle, and tween ownership.

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

- UI show/hide? Kill or reuse previous tween before starting another.
- Pooled object? Kill/reset tween on despawn before returning to pool.
- Object lifetime tied to tween? Use linking/kill policy verified by installed DOTween version.
- Sequence with callbacks? Ensure `OnComplete` does not mutate destroyed/hidden objects.
- Reusable animation? Keep tween ownership in presenter/view owner, not global helper.

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
- Every tween/sequence has an owner and cleanup point.
- Reopening a panel should not stack duplicate tweens.
- Pooled instances must not keep active tweens after despawn.
- Avoid hiding business logic in animation callbacks.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- `OnComplete` grants reward or mutates save.
- Old tween changes object after it has been returned to pool.
- Multiple Show calls create stacked sequences.
- Kill is missing on hide/destroy/despawn.

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
- Read lifecycle references when tween ownership spans pooled objects, panels, or async flow.

## Domain Model

TweenRequest -> Owner -> Tween/Sequence -> Link/Kill Policy -> Callback Guard -> Completion or Cancellation -> Cleanup.
