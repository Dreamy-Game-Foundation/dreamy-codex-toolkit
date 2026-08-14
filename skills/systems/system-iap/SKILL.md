---
name: system-iap
description: Implement or review mobile game system behavior for IAP product definitions, purchase callbacks, receipts, transaction IDs, duplicate checks, restore flow, grants, persistence, and analytics.
---

# System Iap

## Purpose

Guide IAP product definitions, purchase callbacks, receipts, transaction IDs, duplicate checks, restore flow, grants, persistence, and analytics with transaction safety, persistence, UI boundaries, lifecycle cleanup, and analytics ordering.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

ProductDefinition -> StoreProduct -> PurchaseRequest -> StoreResult -> TransactionId/Receipt -> DuplicateCheck -> ValidationPolicy -> Grant -> Persist -> Analytics.

## Required Inspection

- Project `AGENTS.md`, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Never grant twice for same transaction.
- Pending purchase is not success.
- Restore differs by product type.
- Receipt policy explicit.
- If the owner is unclear, stop at a plan/architecture decision before mutating code.

## Workflow

1. Inspect current owner and existing project convention.
2. Map static config, persistent state, runtime state, UI, service, asset, and lifecycle ownership where applicable.
3. Choose the smallest change that preserves architecture, serialization, and dependency direction.
4. Add or update focused tests/fixtures when behavior, migration, or lifecycle risk changes.
5. Run compile, console, targeted tests, harness/static validation, or record the exact unavailable gate.
6. Review diff for unrelated churn and unsupported API claims.

## Architecture Rules

- Keep Runtime assemblies free of Editor references.
- Keep DataConfig, Datasave, runtime state, UI, and service responsibilities separate.
- Resolve global services at roots/high-level owners; pass explicit dependencies to leaves.
- Preserve `.meta` GUIDs, serialized references, prefab overrides, and package dependency direction.
- Optimize only from measured evidence.

## Common Patterns

- Service owns the transaction and validation; UI sends intent and renders result.
- Static definitions live in DataConfig; player-owned status and claims live in Datasave.

## Anti-patterns

- Grant on button click.
- Callback retry grants again.

## Common Failure Modes

- Unsupported or drifted API claim.
- Hidden owner change between package, project, UI, runtime state, or persistence.
- Lifecycle leak through async work, events, tweens, pooled objects, Addressables handles, or scene transitions.
- Verification skipped without a precise degraded reason.

## Verification

- Compile/console/test result when Unity is available, otherwise degraded harness/static evidence with exact reason.
- Focused regression for duplicate calls, cancellation/destruction, save/load, migration, or platform branch when relevant.
- Diff review for serialization, `.meta`, asmdef/manifest, scene/prefab, and unrelated changes.

## Allowed Claims

Only claim installed package, Unity, platform, or Dreamy behavior after inspecting manifests, project files, compatibility data, or harness evidence.

## References

- Always read `AGENTS.md`, `rules/index.json`, and the relevant compatibility catalog before making ownership or API claims.
- Read `references/unity-iap.md` when the task touches this skill's deeper unity iap behavior.
- Read `references/idempotency.md` when the task touches this skill's deeper idempotency behavior.
- Read `references/restore.md` when the task touches this skill's deeper restore behavior.
- Read `references/android-purchase.md` when the task touches this skill's deeper android purchase behavior.
- Read `references/ios-purchase.md` when the task touches this skill's deeper ios purchase behavior.
