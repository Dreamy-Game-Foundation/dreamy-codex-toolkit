# unity.serialization-safety

## Invariant

Serialized field, type, namespace, asmdef, prefab, scene, ScriptableObject, and `.meta` changes require a preservation or migration path.

## Applies To

MonoBehaviour, ScriptableObject, `[Serializable]` classes, `SerializeReference`, serialized private fields, prefabs, prefab variants, nested prefabs, scenes, asmdef/type moves, namespace/class renames, field renames, field type changes, `.meta` files, and GUIDs.

## Required

- Preserve `.meta` files whenever moving or renaming Unity assets.
- Use `FormerlySerializedAs` for compatible serialized field renames.
- Inspect prefab/scene references before replacing a component or serialized type.
- Treat ScriptableObject assets as serialized production data, not disposable defaults.
- Define an explicit migration strategy for incompatible field type changes and nested serialized structure changes.
- Check MonoScript references and serialized data before namespace/class moves.
- Keep `SerializeReference` type identity changes behind migration or compatibility fixtures.

## Forbidden

- Do not assume compile success means serialized data survived.
- Do not manually regenerate or edit GUIDs.
- Do not delete and recreate an asset as a rename strategy.
- Do not replace a component without checking serialized consumers.
- Do not broad-edit scene/prefab YAML to “fix” missing scripts.

## Decision Tree

Rename field? If the type is compatible, add `FormerlySerializedAs`; if not, write a migration.

Move script file? Preserve `.meta` and verify script references.

Rename namespace/class? Inspect MonoScript/type references and serialized fixtures before and after.

Change nested serializable structure? Add migration plus a fixture test when data exists.

Scene/prefab mutation? Inspect references and overrides before changing the object.

## Exceptions

Throwaway prototype assets may skip migration only when the task explicitly confirms no production/project data depends on them.

## Verification

- Unity refresh/compile.
- Console review.
- Missing script/reference scan.
- Prefab/scene load or re-open.
- Serialized fixture test when data exists.
- Git diff check for unexpected YAML, `.meta`, GUID, or asset recreation changes.

## Related

`unity.meta-guid`, `unity.scene-prefab-safe-mutation`, `dreamy.version-compatibility`.
