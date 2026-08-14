---
name: dreamy-feature
description: Orchestrate cross-domain Dreamy features using detected capabilities and verification evidence.
---

# Dreamy Feature

## Purpose

Route feature work across Dreamy packages, project code, static config, persistent state, services, UI, assets, and tests.

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

- Reusable capability already exists? Use verified package/project owner.
- No existing owner and project-specific? Implement under the project feature boundary.
- No existing owner and reusable across games? Treat as package candidate only with dependency direction justified.
- Static definition? Route to DataConfig.
- Persistent player state? Route to Datasave.
- Session state? Keep runtime-owned.
- Cross-scene service? Composition root.
- Feature-wide service? Feature root/presenter/controller.
- Leaf component? Explicit dependency.

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

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Feature code bypasses DataConfig/Datasave boundaries.
- UI owns transaction or save mutation.
- Package candidate depends on current project types.
- Asset loading policy hidden in a panel/list item.

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

## Dreamy Feature Decisions

Ownership: existing Dreamy package beats new project code; reusable cross-game behavior should be considered for a package; project-only behavior belongs under the project feature boundary.

Data: designer-authored mostly read-only data goes to DataConfig; player-owned persistent state goes to Datasave; temporary combat/session state stays runtime-owned.

Services: cross-scene services belong in composition roots or service registration; feature-local services stay under the feature root; leaf components should receive explicit dependencies.

UI: panels render state and send intent; presenters/services/domain logic handle business operations.

## Examples

Shop: OfferDefinition -> DataConfig; currency and purchase state -> Datasave; purchase operation -> ShopService/EconomyService; UI -> ShopPanel intent/render; feedback/audio and analytics after confirmed transaction.

Unit upgrade: upgrade curve -> DataConfig; owned cards and unit level -> Datasave; upgrade transaction -> service; card UI -> view-only render and intent.
