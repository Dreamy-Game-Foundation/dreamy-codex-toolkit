---
name: unity-vfx-authoring
description: Create or substantially restyle Unity 2D/3D visual effects from a brief, reference or existing assets, producing editable prefabs with visual and lifecycle verification. Route isolated pooling bugs, shader optimization and standalone image requests to their narrower workflows.
---

# Unity VFX Authoring

## Scope

Turn an effect brief into suitable source assets, an editable Unity effect and evidence in its intended camera/context. Supports particles, sprites/flipbooks, mesh/material effects, lines/trails and capability-gated VFX Graph. Text-only briefs are valid. Preserve plan-only, no-AI, no-build and tool/technique choices; do not turn a small adjustment into a framework or full-game task.

## Decisions

1. Inspect instructions, status, Editor revision, manifest/lock, active pipeline and camera renderer, quality overrides, color space, nearby effects and their owners. A URP package does not identify the active renderer. Record missing facts separately from proposed settings; use [effect-brief.md](assets/effect-brief.md) for substantial tasks.
2. Define purpose, style, space/camera, screen size, timing/loop, trigger/cancel, target device/API, concurrency and acceptance. Resolve consequential gaps from project evidence, otherwise state assumptions or ask narrowly. Decompose into layers with roles and timelines before adding detail.
3. Read [technique-routing.md](references/technique-routing.md) to choose the simplest technique satisfying the brief. Particle System is a starting candidate for ordinary gameplay 2D/3D; VFX Graph requires matching package, renderer and hardware evidence. Never migrate pipeline/packages to fit a recipe by default. UI masking needs a verified rendering path.
4. Reuse suitable project assets or choose procedural, supplied/licensed or AI art by delivery cost and style. Read [art-and-textures.md](references/art-and-textures.md) when creating/importing ingredients. Use an available image skill/tool for AI raster work; a generated atlas still needs alpha, pivot and motion checks. Set a task-appropriate attempt limit and inspect completed outputs before resubmitting.
5. Read [authoring-2d-3d.md](references/authoring-2d-3d.md) for prefab authoring and recipes. Use verified Editor/MCP APIs or existing tools, preserve GUIDs/references, and keep helper code Editor-only. Do not guess graph/prefab serialization or build the static effect hierarchy on every spawn. Start with a small complete effect, save/reload, then iterate from real captures at onset, peak and tail, including motion and the gameplay background.
6. Read [integration-and-verification.md](references/integration-and-verification.md) before integration or performance claims. Gameplay owns authoritative events; roots supply explicit dependencies. Reuse existing feedback/load/pool owners, verifying Dreamy APIs against manifest/lock and source commit/compatibility. Include child effects, trails and sub-emitter tails in completion; reset reused state and reject stale callbacks. Measure representative peak concurrency on the actual target before claiming a budget is met.

## Verification

Separate authored assets, import/compile/Console, visual selection, lifecycle, performance and player/device checks. After C# changes refresh/compile and read Console; choose relevant asset/PlayMode tests. Missing Editor, unsupported graph authoring or unmeasured hardware remains not-run/degraded with a specific reason; prepared code or a tool success is not a rendered effect.

Deliver prefab/dependencies, useful parameters and trigger/stop instructions, source records, captures, actual checks and remaining gaps. Use [effect-recipe.json](assets/effect-recipe.json) when a structured handoff helps; unknown measurements stay null. Build only when required by scope. Review diff/status before completion.

## References

Read only the linked reference needed for the current decision. The basic workflow is self-contained; installed `unity-vfx`, `unity-particles`, `unity-shader`, `unity-material`, `unity-ui`, `unity-mcp`, `unity-profiling`, pooling and feedback skills can supply specialist detail when applicable. Their absence must not block ordinary Particle System authoring.
