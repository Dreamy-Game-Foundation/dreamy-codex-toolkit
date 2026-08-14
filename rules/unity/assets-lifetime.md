# unity.assets-lifetime

## Invariant

Every asset load, cache, retained handle, instantiated prefab, and release must have an owner.

## Required

- Name who owns each async load and retained Addressables/Dreamy Asset handle.
- Define release strategy before retaining or caching loaded assets.
- Keep in-flight request deduplication at service/loader level when multiple consumers can request the same asset.
- Do not release assets while consumers still use them.
- Load frequent pooled prefabs once at the owning pool/service, then reuse instances.
- Prefer `com.dreamy.assets` / AssetLoader when the project has verified package support.
- Let the project own Addressables groups, profiles, and build configuration.

## Forbidden

- Repeated load/release in hot loops.
- Hiding handle ownership inside leaf UI or pooled leaf objects.
- Returning a loaded result after releasing the underlying handle.
- Mixing Resources, Addressables, and Dreamy loader paths without an explicit policy.

## Decision Tree

Static scene-only reference? Use serialized reference when lifecycle is simple.

Runtime dynamic asset? Use verified AssetLoader/Addressables owner.

Frequent pooled prefab? Load once at pool/service, instantiate/return through pool.

Large optional remote content? Use remote Addressables/content policy with failure and cancellation handling.

## Dreamy Override

Package code owns reusable runtime loading helpers. Project code owns Addressables groups/profiles/build configuration and content labels.

## Verification

- Inspect each load path for owner, cache, release, cancellation, and error behavior.
- Test cancellation/failure path for user-facing async loads.
- Confirm no immediate-release-before-consumer pattern.
- Profile only when optimizing memory/load performance.

## Related

`dreamy.asset-loader`, `csharp.async-lifetime`, `gameplay.pool-ownership`.
