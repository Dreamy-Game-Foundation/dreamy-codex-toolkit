---
name: thirdparty-unitask
description: Use for UniTask cancellation, player loop, async lifetime, and observed package availability.
---

# Thirdparty Unitask

## Purpose

Use for UniTask cancellation, player loop, async lifetime, and observed package availability.

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

- Object-tied task? Use destroy cancellation such as `GetCancellationTokenOnDestroy` when available.
- Panel-tied task? Use panel close/hide lifetime if stale results can mutate UI.
- App/service preload? Service owns token, dedupe, exception handling, and result lifetime.
- Fire-and-forget? Use `UniTaskVoid` or `.Forget()` only with explicit error observation.
- Multiple tasks? Use `WhenAll` only when cancellation/exception semantics are intended.
- PlayerLoopTiming matters? Pick timing based on Unity lifecycle, not habit.

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
- `async void` is only for callback/event boundaries.
- Cancellation is expected control flow.
- Never continue mutating destroyed Unity objects after await.
- Do not assume UniTask exists in a Dreamy package unless manifest/compatibility verifies it.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Lost exceptions in fire-and-forget flows.
- Panel closes while async load later binds UI.
- Pooled object continues old task after despawn.
- Cancellation logged as an error path.

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
- Read `references/cancellation.md` for owner-token design when present.
- Read `references/fire-and-forget.md` before approving unawaited operations.
- Read `references/player-loop.md` when timing affects physics/UI/frame behavior.

## Domain Model

UniTask/UniTaskVoid -> Owner CancellationToken -> Await/WhenAll -> Exception Observation -> Continuation Owner Check -> Result or Expected Cancellation.
