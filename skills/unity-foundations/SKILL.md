---
name: unity-foundations
description: Inspect Unity project structure, manifests, assembly boundaries and lifecycle ownership before foundational C# or package wiring changes.
---

# Unity Foundations

## Scope

Use for project structure, Runtime/Editor assembly boundaries, package wiring and ownership decisions. Prefer a narrower skill for a specific UI, physics or asset-loading task. Documentation edits without Unity/API claims do not need this workflow.

Inspect local instructions when present, manifest and lock, relevant asmdefs, nearby owners, changed assets and existing tests. Package/API support comes from inspected source/version and compatibility records, not convention.

## Decisions

- Runtime must not reference Editor assemblies. Reusable packages cannot depend on concrete game-project code.
- Identify who creates, mutates, persists and cleans up the changed behavior. Keep static configuration, persistent player state and transient session state with their existing owners.
- Resolve services at composition or feature roots/high-level owners; pass explicit dependencies to leaf objects.
- Preserve .meta GUIDs, serialized fields, references and prefab overrides. Use Unity-supported asset mutation for serialized objects.
- Follow local conventions and make the smallest change that preserves dependency direction. Resolve unclear ownership before mutation. Optimize from measurements.

Implement within that boundary, then verify the behavior most likely to regress: async cancellation/destruction, event cleanup, pooling reuse, save migration or platform branches when affected.

## Verification

After C# edits, refresh/compile and inspect Console; run focused tests when behavior warrants them. Review diff/status for serialized, asmdef/manifest and unrelated changes. If Unity is unavailable, report the exact unavailable operation and static evidence separately; static checks do not establish successful compilation or runtime behavior.

## References

Read `references/unity-implementation-invariants.md` before implementing MonoBehaviour, serialization, async, event, pooling or UI lifecycle changes. Use project instructions/rules when present and the installed compatibility context before Dreamy API claims.
