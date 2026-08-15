# Stateful Editor Operations

## Preflight Snapshot

- Project path and Unity version.
- Open scene and dirty state.
- Prefab stage or selected asset identity.
- Target object path, GUID, components, serialized references, and overrides.
- Console baseline.

## Safe Mutation Pattern

1. Verify the MCP/editor bridge is attached to the intended project.
2. Read target state before changing it.
3. Mutate exactly one intended owner or a declared set of owners.
4. Save only the intended scene, prefab, or asset.
5. Refresh/compile/read Console when relevant.
6. Re-read the target and compare before/after.

## Stop Conditions

- Wrong project/editor session.
- Unknown prefab variant or nested prefab ownership.
- Existing dirty scene not owned by this task.
- Missing serialized reference consumer analysis.
- Operation requires broad reimport, GUID regeneration, or destructive delete.
