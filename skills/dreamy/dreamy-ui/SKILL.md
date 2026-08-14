---
name: dreamy-ui
description: Use Dreamy UI panel, layer, cache, transition, tab, safe-area, and TMP capability when compatible.
---

# Dreamy Ui

## Purpose

Keep UI panels focused on presentation while routing business logic through presenters, services, and domain owners.

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

- Screen/popup/overlay? Use existing layer/navigation owner.
- Panel opened repeatedly? Verify bind/unbind, subscriptions, async cancellation, and tween cleanup.
- Button/list item? Collect intent and render state only.
- Business/economy/save/SDK operation? Presenter/controller/service.
- Back handling/navigation policy? UI manager/root/presenter, not leaf item.
- Tab state? Runtime UI state unless persisted by explicit product requirement.

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
- UI does not own economy, save JSON, config parsing, SDK policy, or raw Addressables policy.
- View renders state; presenter/controller/service owns decisions.
- UI must tolerate reopen, duplicate events, cancellation, and safe-area/mobile constraints.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- ShopPanel directly edits coins.
- RewardButton writes save data.
- UI subscriptions duplicate after reopen.
- Transition tween mutates destroyed/hidden panel.
- Panel cache returns stale data without rebinding.

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

## Panel Responsibilities

Allowed: bind buttons, render state, show/hide, run visual transitions, send user intent, and validate serialized references.

Avoid: loading/saving player data directly, calculating economy, parsing config JSON, initializing SDKs, or owning cross-feature business operations.

Inspect panel prefab or scene, owning layer, PanelManager behavior, presenter/service, navigation, back behavior, safe area, TMP, and Addressables use.

Domain model: Screen/Popup/Overlay -> Panel lifecycle -> Binding -> Presenter state -> Intent -> Navigation/back -> Transition/cache -> Cleanup.
