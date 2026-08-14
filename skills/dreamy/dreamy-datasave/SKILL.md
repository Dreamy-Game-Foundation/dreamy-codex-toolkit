---
name: dreamy-datasave
description: Use Dreamy Datasave for versioned persistent player state, migrations, backup, and codecs.
---

# Dreamy Datasave

## Purpose

Protect persistent player data with versioning, stable IDs, migrations, and safe save timing.

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

- Must survive restart and belongs to a player? Datasave.
- Static tuning/catalog? DataConfig.
- Current session-only state? Runtime owner.
- Schema changes? Add data version and migration.
- External transaction? Persist processed transaction ID before/with grant outcome.
- Future version file? Fail safely or route through explicit forward compatibility policy.

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
- Save stable IDs, not UnityEngine.Object references.
- Save timing follows transactions and app pause/resume; never every frame.
- Corruption recovery and backup policy must be explicit.
- Encryption is tamper resistance, not real authority.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Old save schema loads with silent default data loss.
- Duplicate purchase/reward because transaction ID is not persisted.
- App pause interrupts a transaction between grant and save.
- Future save version overwrites current install.

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

## Datasave Rules

- Use a versioned envelope for persistent data.
- Save stable IDs, not UnityEngine.Object references.
- Migrate on breaking schema changes.
- Save after meaningful transactions and on app pause, not every frame.
- Define corruption handling, backup restore, and codec expectations explicitly.
- Treat local save security as tamper resistance, not real server authority.

Critical scenarios: first install, normal load, missing file, corrupt primary with valid backup, old version, future version, migration failure, app pause during transaction, duplicate save calls.
