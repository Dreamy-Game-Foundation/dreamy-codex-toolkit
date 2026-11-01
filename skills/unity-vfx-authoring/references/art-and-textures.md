# Art direction and ingredients

Read when translating a brief/reference into layers or creating/importing textures and meshes. Start with the existing effect style, camera and intended screen size. For reference matching, distinguish observed silhouette/palette/key times from inferred motion and missing viewpoints. A single reference image does not specify duration, velocity or loop behavior.

## Design by function

Give each layer a purpose: anticipation, impact/readability, direction/force, sustain or dissipating tail. Small effects may need only one or two layers. Define shape, palette, size/opacity progression, orientation and timing before increasing particles or adding noise/distortion. Preserve visibility of gameplay targets, characters and relevant UI.

Use the [brief](../assets/effect-brief.md) and [recipe](../assets/effect-recipe.json) only when useful. Scale documentation to the task; a small color change does not need a new specification. Keep editable source and imported runtime bindings traceable.

## Select an asset route per ingredient

| Route | Useful when | Check |
|---|---|---|
| Existing project assets | Style and compatible material already exist | Ownership, actual consumers, pipeline and ability to edit without global changes |
| Procedural shapes/noise | Dot, ring, streak, gradient, mask or simple mesh is sufficient | Dimensions, alpha/data meaning, seams and visual quality at destination size |
| Supplied/licensed pack | A coherent library lowers production work | Provenance/terms, dependencies, demo side effects, import/material compatibility |
| AI raster art | A distinctive drawn silhouette/texture materially helps | User choice, tool availability, transparency, style, cleaning and integration effort |

Reuse before generating more. Do not mandate image generation, a paid provider, Blender or a new pack for a simple native effect. Honor the user's selected route. Use an available image skill/tool for AI raster creation/editing rather than inventing a provider API. Explicitly request transparent output when the asset needs it; a painted checkerboard is not alpha. Do not distribute third-party game assets in the toolkit.

Record source/version or prompt/input identity, request/output identity, processing and selected local files. Retain completed output before another generation; retry a download independently of generation. Agree a task-appropriate attempt budget, revise the failed criterion and preserve accepted art. If status is uncertain, inspect the existing request/output before resubmitting; report an unresolved gap instead of looping indefinitely.

## Import and visual checks

- Color textures and data/noise masks have different sRGB needs. Choose import settings from the channel's meaning and shader, not from a universal “VFX texture” preset.
- Inspect alpha edges on light and dark backgrounds, straight/premultiplied blending expectations, padding, transparent area and compression at gameplay scale. An additive texture may need a different background/channel contract from an alpha-blended sprite.
- Choose wrap/filter/mipmap/max size for use: tiling noise versus clamped sprites, pixel art versus soft effects, world distance versus fixed UI size. Verify target compression, not just source PNG appearance.
- Simple meshes need correct units, pivot, normals/UV and winding for the chosen camera/shader. Do not add rigging/complex modeling unless the effect requires it.

## Flipbook gate

Set grid or sprite order, frame count/rate, duration, pivot, bounds and whether the last-to-first transition loops. Check consecutive frames and playback: no unwanted shape jumps, drifting pivot, cropped tail or duplicated pause frames. AI-generated sheets are candidates, not verified motion. Use a single sprite with native scale/opacity/rotation animation when it achieves the goal more reliably.

[Texture Sheet Animation](https://docs.unity3d.com/6000.0/Documentation/Manual/PartSysTexSheetAnimModule.html) documents Unity's grid/sprite animation route; confirm the project's version and renderer requirements. Preserve enough padding to prevent atlas bleeding and test filtering/compression in-engine.

Next: [authoring-2d-3d.md](authoring-2d-3d.md) assembles the selected ingredients.
