---
name: unity-mcp
description: Use Unity MCP or editor bridge tools safely for stateful scene, prefab, asset, console, test, and build inspection or mutation without treating tool availability as authorization.
---

# Unity MCP

## Purpose

Use this when a task should inspect or mutate Unity Editor state through MCP, a verified editor bridge, or an equivalent stateful tool instead of blind text edits.

## When To Use

- The task mentions Unity MCP, Editor MCP, scene hierarchy, prefab stage, selected object, Console, Test Runner, or Editor state.
- A scene, prefab, ScriptableObject, importer, ProjectSettings, or asset reference must be inspected before mutation.
- A result needs before/after snapshots from the Editor rather than filesystem-only evidence.

## When Not To Use

- The task is pure C# logic, documentation, package metadata, or static JSON validation.
- No MCP/editor bridge is connected and a read-only/static fallback is sufficient.
- The requested operation would be destructive, broad, or unauditable without explicit approval.

## Domain Model

MCP is a transport to a stateful Unity Editor. It can expose open scenes, hierarchy objects, prefab stages, selected assets, components, serialized properties, Console logs, test results, build methods, and asset database operations.

Tool availability is not permission. The owner, target scope, dirty state, serialized references, prefab ownership, and verification path still decide whether an operation is allowed.

## Required Inspection

- Local `AGENTS.md` when present, `Packages/manifest.json`, `Packages/packages-lock.json`, and relevant asmdefs.
- Connected MCP/editor tool list, target Unity project path, Editor version, open scene, dirty state, prefab stage, and selected asset.
- Target object path/GUID, components, overrides, serialized references, and likely consumers.
- Console baseline before mutation.

## Decision Tree

1. If no Unity MCP/editor bridge is connected, use batchmode/static harness fallback and mark missing MCP evidence.
2. If the target is scene/prefab/asset state, inspect ownership and dirty state before mutation.
3. If prefab variant/nested ownership is ambiguous, stop and ask for targeted owner evidence.
4. If mutation is safe and scoped, snapshot before, mutate one target, save only intended assets, refresh, compile/read Console, snapshot after.
5. If broad reimport, GUID regeneration, package upgrade, or destructive delete is required, stop for explicit approval and release-risk note.

## Workflow

1. Discover available MCP/editor tools and their exact project target.
2. Capture preflight snapshot: scene/prefab/asset identity, dirty state, Console, and relevant serialized references.
3. Choose the narrowest operation.
4. Execute through supported Editor/MCP API where available.
5. Save only the intended scene/asset/prefab.
6. Refresh/compile/read Console when scripts or serialized state changed.
7. Capture after snapshot and compare with intended diff.
8. Record evidence or degraded reason.

## Architecture Rules

- Runtime assemblies must not reference Editor assemblies.
- Preserve `.meta` GUIDs, prefab variants, overrides, and serialized references.
- Prefer Unity/editor-supported mutation over YAML edits.
- Use filesystem edits only for source files or when Unity state is not involved.
- MCP evidence supplements, but does not replace, project compatibility and harness evidence.
- When MCP/editor automation creates a UI prefab, add the project's SafeArea component or safe-area container for full-screen, panel, popup, overlay, HUD, and mobile-facing prefabs unless an owning parent already provides safe-area padding.

## Anti-patterns

- Treating MCP connection as blanket approval.
- Mutating the active scene without confirming target scene and dirty state.
- Applying all prefab overrides blindly.
- Broad AssetDatabase refresh/reimport for a narrow change.
- Hiding a degraded MCP/tool failure behind “done.”

## Common Failure Modes

- Connected MCP points to the wrong project or stale Editor session.
- Prefab instance mutation accidentally modifies variant/source ownership.
- Console already had baseline errors that get misattributed.
- Serialized reference disappears after component replacement.
- Tool command succeeds but asset was not saved or reloaded.

## Verification

- Before/after snapshot for the target object/asset.
- Console result after mutation.
- Compile/test/build evidence when relevant.
- Diff review for `.meta`, scene, prefab, ProjectSettings, and generated files.
- If MCP is unavailable, report static/batchmode fallback and exact missing gate.

## Allowed Claims

Claim only MCP/editor state that was actually observed in the connected tool output. Claim Unity compile/test/build success only from harness, Editor, or batchmode evidence. Do not claim supported Dreamy APIs without compatibility records.

## References

- Use `references/stateful-editor-ops.md` for safe MCP/editor operation patterns.
- Pair with `unity-scene-prefab`, `unity-serialization`, `unity-editor-tooling`, or `dreamy-editor-tools` for domain-specific mutation rules.
