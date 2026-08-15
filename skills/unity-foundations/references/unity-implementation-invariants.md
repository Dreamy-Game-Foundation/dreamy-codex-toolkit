# Unity Implementation Invariants

## MonoBehaviour

- `Awake` establishes local references and invariant defaults.
- `OnEnable` subscribes only what `OnDisable` unsubscribes.
- `Start` may depend on other enabled scene objects being awake.
- Destroy, scene unload, pool despawn, and panel close must release owned work.
- Disabled objects do not receive Update but may retain subscriptions and tasks.

## Serialization

- Preserve serialized field names or provide migration/FormerlySerializedAs where applicable.
- Do not move serialized types across assemblies without migration evidence.
- Treat prefab overrides and scene references as user-owned data.
- Runtime-created state should not mutate authoring assets.

## Async And Events

- Every async operation has an owner, cancellation path, duplicate-call behavior, and exception observation.
- Pooled objects reset mutable state and retained subscriptions on despawn/re-enable.

## UI

- Presenter owns interaction logic; view owns rendering and Unity references.
- Avoid duplicate button listeners across panel reopen.
- Safe area/input/navigation belongs to panel or navigation owner, not random children.
