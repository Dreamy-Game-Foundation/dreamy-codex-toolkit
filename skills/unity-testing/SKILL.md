---
name: unity-testing
description: Select and execute the lowest Unity test layer that proves a changed behavior, lifecycle, serialization, build or device risk.
---

# Unity Testing

## Scope

Use when choosing or running verification for Unity changes. Inspect local instructions, manifest/lock, existing test assemblies, fixtures and changed owners before selecting commands. A prose-only edit does not need new behavior tests; performance claims require measurements, not unit assertions.

## Decisions

- Pure deterministic logic: pure C# tests where available; avoid broad PlayMode setup.
- Serialized data, prefab references and Editor tooling: EditMode/Editor integration with representative assets and preserved GUIDs/overrides.
- MonoBehaviour lifecycle, async destruction/cancellation, event duplication, pooled reuse and scene transitions: PlayMode with explicit cleanup and deterministic timing.
- Platform compilation and packaging: build the affected target. Memory/thermal/input/store behavior needs relevant device evidence.
- Identify fixture owner, setup, cancellation/disposal and teardown. Keep Runtime test assemblies free of Editor references.

Choose economical regression protection for the concrete failure, including save/load or migrations where affected. Run the original reproduction before broadening coverage; do not generate a test for every implementation detail. Review source/version compatibility before claiming package behavior.

## Verification

Record command/tool, input version or fingerprint, exit status, actual result and remaining gaps. After C# changes, refresh/compile and inspect Console. Static validation, a passing linter or a valid project profile does not prove PlayMode/build/device success. Missing Unity/license/tooling is degraded/not-run with its exact reason. Reuse evidence only while its relevant inputs remain unchanged; review diff/status before completion.

## References

Read `references/proof-selection-matrix.md` to choose the lowest layer that proves the risk. Use relevant project test fixtures and instructions when present; global installs need no project-local toolkit.json. Keep Dreamy claims tied to verified compatibility evidence.
