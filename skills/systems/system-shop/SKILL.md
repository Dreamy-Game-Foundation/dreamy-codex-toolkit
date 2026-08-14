---
name: system-shop
description: Implement or review mobile shop systems involving offer definitions, eligibility, price, currency transaction, reward grant, persistence, UI refresh, and analytics.
---

# System Shop

## Purpose

Guide mobile game shop systems with config ownership, persistent state, transaction safety, analytics boundaries, and fallback behavior.

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

- Offer definition, price, labels, limits: DataConfig.
- Currency balance, purchased/claimed state, inventory grant: Datasave through transaction owner.
- UI button/list: render eligibility and send purchase intent only.
- External purchase involved? Delegate to IAP skill and require idempotency.
- Server authority available? Local result is pending until verified by the authority policy.

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
- Currency deduction and reward grant are one logical transaction.
- UI never grants directly.
- Analytics fire after confirmed result, not before transaction outcome.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Duplicate purchase button click grants twice.
- UI parses shop JSON and bypasses config/service.
- Currency deducted without reward grant on failure.
- Analytics reports success before persistence.

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

OfferDefinition(DataConfig) -> ShopService -> Eligibility -> Price -> Transaction -> Grant -> Persist -> UIRefresh -> Analytics.

Verify insufficient funds, duplicate click, missing offer, expired/locked offer, grant failure, save failure, reopen UI, and analytics ordering.
