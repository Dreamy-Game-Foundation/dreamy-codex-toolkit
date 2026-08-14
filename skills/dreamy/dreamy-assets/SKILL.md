---
name: dreamy-assets
description: Use Dreamy Assets loader, cache, progress, and release ownership when available.
---

# Dreamy Assets

## Purpose

Manage runtime content loading, shared in-flight requests, cache ownership, and release lifecycle.

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

- Static scene-only reference? Serialized field can be simpler.
- Runtime dynamic asset? Use verified Dreamy AssetLoader/Addressables owner.
- Frequent pooled prefab? Load once and let the pool/service own instances and release.
- Sprite atlas/UI content? Decide cache owner and release at screen/feature/app lifetime.
- Large optional remote content? Require remote content, failure, progress, and cancellation policy.

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
- Who loads must know who releases.
- In-flight deduplication belongs in loader/service, not leaf UI.
- Project owns Addressables groups/profiles/build configuration.
- Package owns reusable loading helpers only.

## Common Failure Modes

- Unsupported Dreamy API claims.
- Ownership drift between package and project code.
- Hidden serialized reference breakage.
- Lifecycle leaks in async, events, tweens, pooled objects, or Addressables handles.
- Immediate release after returning loaded result.
- Repeated load/release in scroll lists or hot loops.
- Leaf UI hides Addressables handle ownership.
- Cancelled panel load still mutates closed panel.

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

## Asset Decisions

Serialized scene references are fine for static scene-owned content. Runtime content, reusable prefabs, sprites, atlases, remote content, and pooled load flows should route through the verified loader when available.

Who loads must know who releases. Avoid random Addressables calls scattered across leaf MonoBehaviours.

Verify load ownership, cache policy, in-flight dedupe, release, prefab instantiation, failure behavior, cancellation, warmup, and Resources fallback policy.
