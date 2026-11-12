# Concept images to editable effects

Read when a VFX brief needs visual exploration or a concept before Unity authoring. Skip generation when supplied art already settles the direction, the task is a small edit, or the user requests no AI. A concept-only VFX task ends with the selected design and handoff; it does not authorize Unity edits.

## Frame the concept

Use the brief's gameplay purpose, art style, camera, screen footprint, palette and timing. Separate reference observations from proposed design. Choose a modest attempt budget appropriate to the task; explore a few meaningfully different silhouettes or layer structures only when that helps selection.

Use an available image skill/tool for raster concepts and edits. Supply relevant project/reference images through its supported input mechanism. If generation is unavailable or forbidden, use supplied images or a written layer/timeline proposal and report image generation as not-run. Do not silently change the chosen route.

Adapt [concept-board.md](../assets/concept-board.md) for prompts and comparison notes. Request an onset/peak/tail board with consistent camera, scale, ground plane and pivot. Use proposed timestamps from the intended duration; static frames express design intent, not measured animation. For a loop, show representative sustain and a proposed loop seam or cancellation tail. Panel labels can be supplied as a caption if generated text is unreliable.

Show the effect against the intended gameplay background with a stable subject or scale cue. Keep bloom, camera shake, occlusion and density compatible with readability. A concept background may be opaque; request real transparency separately for textures that need alpha. Keep concept boards outside runtime asset folders.

## Select a direction

Inspect completed images at the intended screen size. Compare silhouette, palette, focal point, layer separation, background contrast and plausible timing. Preserve selected files and prompt/input identity. Revise the criterion that failed within the attempt budget instead of regenerating accepted art.

When asked to choose, obtain the user's selection. Otherwise choose a suitable direction within the authorized brief, record that it is an agent selection and continue; do not invent an approval requirement. Show useful variants and explain the chosen direction briefly. Unresolved material style or behavior conflicts remain questions or gaps.

## Translate the selected concept

Map each visible layer to an editable ingredient and Unity technique: for example, flash to a radial sprite, expanding ring to a sprite or mesh, sparks to particles, and a dissipating wisp to a sprite or validated flipbook. Record role, source file, pivot, alpha/channel contract, timeline, size/color progression and proposed binding. Depth, velocity and hidden geometry inferred from a flat image remain proposals.

Generate, reuse or procedurally author only the ingredients the selected direction requires. Request individual textures without captions, scenery or baked perspective where inappropriate; preserve scale and pivot for animation frames. Cropping a multi-panel concept board does not establish a usable atlas or runtime asset. Follow [art-and-textures.md](art-and-textures.md) for alpha/import and flipbook checks.

Build the small complete effect through [authoring-2d-3d.md](authoring-2d-3d.md). Compare real Unity captures at corresponding onset/peak/tail times using the intended camera, background and screen footprint. Adjust layers against the selected design and check actual motion, stop/reuse and performance separately. Label generated images as concepts and actual Editor/player captures as execution evidence; a selected concept proves neither a rendered prefab nor working timing.
