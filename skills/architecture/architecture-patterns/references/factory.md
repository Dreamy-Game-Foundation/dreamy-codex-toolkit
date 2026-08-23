# Factory

## When To Use

Use Factory when creation has real variation, pooling, Addressables loading, dependency wiring, platform-specific construction, or invariants that callers should not repeat.

## When Not To Use

Do not create a factory for a simple constructor, speculative future creation modes, or to make code look more abstract.

## Simpler Alternative

Call the constructor, instantiate the prefab from the existing owner, or use the current project creation convention.

## Trade-offs

Factories centralize creation rules, but can hide ownership and become generic pass-through layers.

## Unity Implications

For prefab or pooled creation, define who owns spawned instances, dependencies, Addressables handles, despawn, and cleanup.

## Verification

Test creation invariants, dependency wiring, failure behavior, and release/despawn ownership.
