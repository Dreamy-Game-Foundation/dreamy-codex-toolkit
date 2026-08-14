---
name: combat
description: Implement or review Unity gameplay attacks, hit detection, damage, health, death, knockback, combat state, and combat feedback.
---

# Combat

## Purpose

Guide attacks, hit detection, damage, health, death, knockback, combat state, and combat feedback with explicit config/save/runtime ownership, lifecycle cleanup, feedback boundaries, and tests.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

AttackIntent -> AttackDefinition -> AttackRuntime -> HitDetection -> DamageRequest -> DamageCalculation -> HealthMutation -> Death/StateChange -> FeedbackEvent.

## Required Inspection

- Project `AGENTS.md`, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Hitscan uses ray/query and emits damage request.
- Projectile owns travel; combat owner decides damage.
- AoE queries targets then applies deterministic requests.
- Animation events signal timing, not final rules.
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

- Definitions/tuning live in DataConfig; player-owned progress lives in Datasave; current session state stays runtime-owned.
- Views render state and send intent; services/domain owners mutate game state.

## Anti-patterns

- VFX directly kills target.
- UI health bar owns health.
- Death event fires twice.

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
- Read `references/combat-flow.md` when the task touches this skill's deeper combat flow behavior.
