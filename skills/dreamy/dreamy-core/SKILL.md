---
name: dreamy-core
description: Use verified Dreamy Core service locator, event bus, state machine, app lifecycle, logging, and tick capabilities safely.
---

# Dreamy Core

## Purpose

Guide use of Core primitives while keeping leaf objects explicit and package claims verified.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

Composition root -> service registration -> feature root/presenter -> explicit leaf dependency; Event source -> event definition -> subscriber lifecycle; State -> guard -> entry/exit.

## Required Inspection

- Project `AGENTS.md`, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Service lookup at composition roots, feature roots, presenters, or high-level controllers is acceptable.
- Leaf UI, projectiles, VFX, and pooled items should receive dependencies explicitly.
- Use EventBus for cross-feature notification, not local direct calls.
- Use a state machine for mutually exclusive states, not simple booleans.
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

- Resolve once at owner boundary and pass dependencies downward.
- Pair event subscription with lifecycle cleanup.
- State machines own transition guards and entry/exit cleanup.

## Anti-patterns

- ServiceLocator.Get in each projectile or list item.
- Event soup replacing clear owner calls.
- State machine with no single state owner.

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
- Read `references/service-locator.md` when the task touches this skill's deeper service locator behavior.
- Read `references/event-bus.md` when the task touches this skill's deeper event bus behavior.
- Read `references/state-machine.md` when the task touches this skill's deeper state machine behavior.
- Read `references/app-lifecycle.md` when the task touches this skill's deeper app lifecycle behavior.
- Read `references/tick-service.md` when the task touches this skill's deeper tick service behavior.
