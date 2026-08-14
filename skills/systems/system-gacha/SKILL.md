---
name: system-gacha
description: Implement or review gacha systems involving pool definitions, weights, rarity, roll, pity, guarantee, duplicate conversion, reward grant, persistence, presentation, and analytics.
---

# System Gacha

## Purpose

Guide mobile game gacha systems with config ownership, persistent state, transaction safety, analytics boundaries, and fallback behavior.

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

- Pool/weights/rarity/pity rules: DataConfig.
- Currency, pity counter, owned items, duplicate conversion state: Datasave through transaction owner.
- Roll result: determined before presentation animation.
- Multi-roll: one audited transaction containing all results.
- Server-authoritative game: client display waits for server result policy.

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
- Presentation animation is not the source of truth.
- Roll, cost, pity update, grant, duplicate conversion, and persistence form one logical transaction.
- RNG seed/authority policy must be explicit for deterministic tests or server play.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Animation decides reward result.
- Pity increments on failed purchase.
- Duplicate conversion grants without persisting owned item state.
- Multi-roll partially persists after failure.

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

PoolDefinition -> Weight/Rarity -> RollRequest -> CostTransaction -> Pity/Guarantee -> Result -> DuplicateConversion -> Grant -> Persist -> Presentation -> Analytics.

Verify weight boundaries, pity trigger, duplicate conversion, insufficient currency, duplicate click, save failure, and result/presentation separation.
