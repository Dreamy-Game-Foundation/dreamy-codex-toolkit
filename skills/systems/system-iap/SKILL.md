---
name: system-iap
description: Implement or review mobile IAP product definitions, purchase callbacks, receipts, transaction IDs, duplicate checks, validation policy, restore flow, grants, persistence, and analytics.
---

# System Iap

## Purpose

Guide mobile game iap systems with config ownership, persistent state, transaction safety, analytics boundaries, and fallback behavior.

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

- Product unavailable: UI disables or shows fallback; do not synthesize success.
- Purchase pending: persist pending state if needed, but do not grant as success.
- Store callback success: validate policy, check transaction ID/receipt, then grant idempotently.
- Callback fires twice: duplicate check returns already processed without second grant.
- Restore: non-consumable/subscription restoration differs from consumable purchase.

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
- UI is not the source of truth for purchase result.
- Never grant twice for the same transaction.
- Receipt validation policy must be explicit: local, server, deferred, or unsupported.
- Product catalog comes from config/store sync; player-owned purchase state goes to Datasave.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Granting on button click or pending purchase.
- Missing transaction ID dedupe.
- Treating restore as normal consumable grant.
- Losing grant when app pauses between callback and save.

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
- Read `references/idempotency.md` when transaction duplicate behavior is unclear.
- Read platform references when Android/iOS store behavior is platform-specific.

## Domain Model

ProductDefinition -> StoreProduct -> PurchaseRequest -> StoreResult -> TransactionId/Receipt -> DuplicateCheck -> ValidationPolicy -> Grant -> Persist -> Analytics.

Test unavailable product, cancel, pending, duplicate callback, old processed transaction, validation failure, grant failure, save failure, restore, and app pause/resume.
