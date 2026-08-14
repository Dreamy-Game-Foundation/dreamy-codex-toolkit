---
name: dreamy-architecture
description: Decide Dreamy Unity ownership, dependency direction, package boundaries, data boundaries, services, lifecycle, and runtime/editor split.
---

# Dreamy Architecture

## Purpose

Use this when the task is really an architecture decision: where code belongs, which package owns it, how data flows, or which lifecycle owns cleanup.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

Request -> existing owner scan -> dependency graph -> data/service/UI/asset owner -> rejected alternatives -> minimal architecture decision.

## Required Inspection

- Project `AGENTS.md`, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- If behavior is project-specific, keep it in project code.
- If behavior is reusable across games, consider a package only after dependency direction is clean.
- If state is static design data, route it to DataConfig.
- If state is persistent player-owned data, route it to Datasave.
- If a leaf object needs a service, pass it from a root instead of resolving globally.
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

- Decision records name owner, dependency direction, lifecycle, verification, and rejected alternatives.
- Use existing implementation before package capability, and package capability before new abstraction.

## Anti-patterns

- Do not move feature logic into Core because it feels reusable.
- Do not introduce a DI framework or interface layer only for style.

## Common Failure Modes

- Unsupported or drifted API claim.
- Hidden owner change between package, project, UI, runtime state, or persistence.
- Lifecycle leak through async work, events, tweens, pooled objects, Addressables handles, or scene transitions.
- Verification skipped without a precise degraded reason.

## Verification

- Compile/console/test result when Unity is available, otherwise degraded harness/static evidence with exact reason.
- Focused regression for duplicate calls, cancellation/destruction, save/load, migration, or platform branch when relevant.
- Diff review for serialization, `.meta`, asmdef/manifest, scene/prefab, and unrelated changes.

## Dreamy Integration

- Inspect Dreamy package compatibility before using package APIs.
- Keep observed facts, intended contracts, and unresolved hypotheses separate.
- Route project-specific glue to project code and reusable capability to package/shared ownership only when dependency direction is clean.

## Allowed Claims

Dreamy package APIs are allowed only when backed by `compatibility/dreamy-packages.json` and not listed as drift or unsupported.

## References

- Always read `AGENTS.md`, `rules/index.json`, and the relevant compatibility catalog before making ownership or API claims.
- Use nearby project code and rule files as the reference source; add a skill-local reference only when repeated gotchas need more depth.
