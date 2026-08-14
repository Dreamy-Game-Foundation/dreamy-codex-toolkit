---
name: dreamy-dataconfig
description: Use Dreamy DataConfig for typed read-only design data and validation.
---

# Dreamy Dataconfig

## Purpose

Keep static designer-authored data separate from runtime and saved player state.

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

- Designer-authored, mostly read-only tuning or catalog? DataConfig.
- Player-owned mutable state? Datasave.
- Runtime cooldown/current target/current HP? Runtime owner.
- Missing config? Define fallback/error behavior at service boundary, not in every panel.
- Key rename? Preserve stable IDs or provide migration/map.

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
- Config schema has an owner and validation path.
- Runtime consumers treat config as read-only.
- UI and leaf objects should not parse config files independently.
- Remote/fallback config behavior must be explicit and verified before claimed.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Mutating config as player state.
- Unstable keys break saves and analytics.
- Silent default hides missing config.
- Each panel loads/parses JSON independently.

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

## DataConfig Boundaries

Belongs in config: unit stats, level config, shop prices, reward tables, upgrade costs, offer definitions, localization tables, and tuning constants.

Does not belong in config: coins, gems, inventory, level progress, settings, claim state, cooldown state, and session runtime state.

Treat UniTask availability as drift until the consumer manifest declares it or compatibility says it is fixed.

Validate schema, required keys, duplicate IDs, missing references, fallback/default policy, and authoring workflow before changing runtime consumers.
