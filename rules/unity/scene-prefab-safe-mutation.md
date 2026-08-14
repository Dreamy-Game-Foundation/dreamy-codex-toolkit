# unity.scene-prefab-safe-mutation

## Invariant

Scenes and prefabs must be mutated through understood ownership, overrides, and serialized references.

## Required

1. Inspect hierarchy.
2. Identify owner prefab.
3. Check prefab variant and nested prefab context.
4. Check overrides.
5. Check serialized references and consumers.
6. Determine runtime owner.
7. Mutate through Unity/editor tooling when possible.
8. Save only the intended target asset or scene.
9. Refresh.
10. Re-open or re-read state and verify.

## Forbidden

- Blind YAML replacement.
- Modifying a nested prefab instance as if it were local scene data.
- Applying all overrides globally without understanding ownership.
- Replacing a component without checking serialized consumers.
- Broad scene rewrite for a one-object change.
- Deleting `.meta` files or regenerating GUIDs.

## Decision Tree

Scene-local object? Mutate scene after checking references.

Prefab instance? Identify whether the change belongs to the instance override or source prefab.

Prefab variant? Apply only to the variant layer that owns the intended difference.

Nested prefab? Mutate the nested source only when all instances should change.

Component replacement? Inspect all serialized consumers first and plan migration.

## Exceptions

Raw YAML inspection is allowed for diagnosis. Raw YAML editing is acceptable only for narrow, reviewed emergency repair when editor tooling cannot express the change and the diff is inspected.

## Verification

- Re-open target scene/prefab.
- Confirm intended hierarchy/component/reference state.
- Unity compile and Console review when scripts are involved.
- Relevant EditMode/PlayMode test where behavior changed.
- Diff review for unintended scene-wide rewrites.

## Related

`unity.serialization-safety`, `unity.meta-guid`, `unity.compile-console`.
