---
name: unity-shader
description: Create, debug or optimize Unity Shader Graph and ShaderLab/HLSL shaders, including visual matching, pipeline passes, keywords and build variants. Use when shader behavior or source must change; route material-only tuning, whole VFX authoring and render-pipeline setup to their owners.
---

# Unity Shader

## Scope

Turn a shader brief, visual reference or reproducible failure into editable shader/graph dependencies, a material and scoped evidence. Choose author, debug or optimize mode. Text-only briefs are valid. Preserve plan-only, no-build, no-upgrade and explicit Graph/HLSL constraints; do not expand a shader task into a pipeline migration or VFX framework.

## Decisions

1. Inspect instructions, assets/owners, Editor revision, manifest/lock, active Graphics/Quality pipeline and camera renderer, render path, color space and target graphics API. A package declaration alone does not establish the active renderer or tested support. Check Editor/bridge/graph/capture capabilities before choosing tools.
2. Author: define appearance, lighting, opacity, animation, artist parameters and camera/device acceptance; use [shader-brief.md](assets/shader-brief.md) for substantial tasks. Read [authoring-and-visual-matching.md](references/authoring-and-visual-matching.md) when creating or matching a look. Separate shader contributions from mesh, texture, lighting and post-processing. Debug starts from repro/compiler diagnostics; optimize starts from a relevant baseline/capture.
3. Keep suitable existing Graph/HLSL conventions. Read [pipeline-and-passes.md](references/pipeline-and-passes.md) for includes, lighting, depth, shadows, deformation or renderer differences. Resolve contracts against installed pipeline source or a verified matching commit; GitHub examples and screenshots are references, not compatibility receipts. Never import a custom SRP or change packages to fit a tutorial by default.
4. For Graph, subgraphs or Custom Functions, read [shader-graph-and-custom-functions.md](references/shader-graph-and-custom-functions.md). Use verified Editor tools or compatible templates; do not guess graph serialization/internal APIs. Missing Graph authoring capability remains a gap when Graph is required, rather than silently changing the requested output.
5. Author a small complete sample or fix one cause. Preserve GUIDs, property reference names, keyword/binding contracts and prefab overrides. Share alpha/deformation logic across the passes that need it. Keep runtime parameter updates/reset under an explicit owner; do not mutate shared materials accidentally. Choose material instances, property blocks or instancing against the actual batching path. Helpers belong in Editor assemblies; project glue stays under its owner, reusable code in a package/shared module.
6. Read [debugging-performance-and-variants.md](references/debugging-performance-and-variants.md) for errors, precision, overdraw, keywords, stripping or optimization. Choose uniform branches versus variants by usage and measured cost, not a blanket rule. Compare captures with fixed camera/light/exposure/resolution and boundary states; test runtime-only combinations in a player when scope requires build correctness.

## Verification

Separate asset import/save/reopen, shader diagnostics, visual acceptance, parameter isolation/lifecycle, player variants and device performance. After C# changes refresh/compile and inspect Console. C# compile success is not proof that all shader passes/variants/APIs compile or render. Missing Editor/build/device checks stay not-run/degraded with the exact reason; Editor FPS is not a mobile budget receipt.

Deliver files/dependencies, material setup and parameter controls, source/license notes for reused code, captures, actual checks and remaining gaps. Build only within scope. Review diff/status and preserve unrelated changes before completion.

## References

Read only the linked reference needed for the decision. Available material, VFX authoring, UI, URP/rendering, Editor and profiling skills provide their domain detail; no sibling skill is required. Material-only tweaks belong to the material owner; whole-effect timing/pooling belongs to VFX authoring; renderer features/pipeline setup belong to rendering owners.
