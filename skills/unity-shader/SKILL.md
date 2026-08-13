---
name: unity-shader
description: Use for Unity Shader Graph, HLSL, variants, keywords, precision, transparency, batching, and build size.
---

# Unity shader

## Purpose

Guide Shader Graph, HLSL, variants, keywords, precision, transparency, batching, and build size with explicit ownership, measurable performance, mobile constraints, and safe Unity asset handling.

## When To Use

- The task changes rendering, visuals, navigation presentation, camera composition, or graphics performance.
- The implementation needs a Unity-specific tradeoff between quality, memory, build size, and frame time.
- A mobile build or production preset needs graphics behavior verified.

## When Not To Use

- The task is purely gameplay state with no visual/runtime rendering impact.
- A narrower Dreamy package skill owns the behavior.
- The request only edits docs or release metadata.

## Required Inspection

- Project AGENTS.md, render pipeline assets, quality settings, scenes, prefabs, materials, shaders, and relevant asmdefs.
- Packages/manifest.json and Packages/packages-lock.json for render pipeline, Cinemachine, or navigation packages.
- Existing profiling evidence before claiming an optimization.

## Decision Tree

1. Is there an existing project rendering convention? Follow it.
2. Is the issue quality, CPU, GPU, memory, build size, or workflow? Optimize the right budget.
3. Can the change be verified statically? Use static validation; otherwise require Unity harness evidence.
4. Is the claim unverified on device? Mark it as a risk.

## Workflow

1. Inspect assets and owners before editing serialized data.
2. Identify the runtime owner, authoring asset, and platform budget.
3. Make the smallest change that preserves references and existing quality tiers.
4. Avoid hidden global material, shader keyword, or camera priority side effects.
5. Run validation, harness, or document the missing Unity gate.

## Architecture Rules

- Do not mutate shared materials at runtime unless that is the intended global effect.
- Keep visual feedback from owning gameplay state.
- Prefer measured profiling evidence over guessed optimization.
- Keep mobile memory, overdraw, and shader variant cost visible.

## Common Failure Modes

- Broken serialized references or missing render pipeline assets.
- Runtime changes to shared assets that leak across instances.
- Unbounded VFX/particle spawn cost.
- Camera or navigation ownership hidden in leaf gameplay objects.

## Verification

- Static diff review plus compile/console/profile/harness evidence when available.
- For mobile-sensitive changes, record before/after budget or explicit not-run reason.

## Allowed Claims

Only claim package support when present in Packages/manifest.json or verified compatibility metadata.

## References

- rules/unity
- docs/harness.md
- compatibility/third-party.json
