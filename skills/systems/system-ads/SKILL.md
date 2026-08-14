---
name: system-ads
description: Implement or review mobile ads initialization, load, availability, placement, cooldown, frequency cap, rewarded callbacks, idempotent grants, persistence, consent, and analytics.
---

# System Ads

## Purpose

Guide mobile game ads systems with config ownership, persistent state, transaction safety, analytics boundaries, and fallback behavior.

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

- Interstitial: gate by placement, cooldown, frequency cap, consent, and app state.
- Rewarded ad: grant only on verified reward callback, not on show success.
- Duplicate reward callback: idempotency key prevents second grant.
- No fill/not ready: return explicit unavailable state and keep UI consistent.
- App pause/resume: expect SDK callbacks around lifecycle transitions.

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
- Ad service owns SDK init/load/show state; UI sends placement intent.
- Rewarded grant uses the same transaction discipline as economy rewards.
- Consent/privacy policy gates SDK initialization and tracking behavior.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Granting reward when `Show()` starts instead of reward callback.
- Duplicate callback grants twice.
- Cooldown/frequency cap lives only in UI and resets on reopen.
- Analytics success fires for failed/no-fill show.

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

Initialize -> Load -> Availability -> ShowRequest(placement) -> SDKShow -> VerifiedRewardCallback -> IdempotentGrant -> Persist -> Analytics.

Verify no-fill, load failure, skipped/closed ad, duplicate reward callback, app pause/resume, consent disabled, cooldown, and UI reopen.
