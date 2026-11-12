# Authoring and visual matching

Read for new shaders or substantial appearance changes. A narrow bug fix needs only relevant acceptance criteria, not a full art brief.

## Observable behavior

Identify mesh/skinned mesh, sprite, particle renderer or Canvas Graphic. Record camera projection, viewing distance, screen size, lighting/shadow expectations, opacity/ordering, animation, texture/vertex inputs and artist/runtime parameters. Read existing materials/shaders before introducing properties. The optional [brief](../assets/shader-brief.md) separates observations, intended choices and unknowns.

For references, distinguish mesh silhouette/normals, UVs/textures, material shading, lights, environment and post-processing. One screenshot does not establish temporal behavior, hidden surfaces or a unique shading model. State consequential assumptions; use project art to settle ordinary details. A public tutorial does not reproduce screenshots from a separate commercial shader automatically.

## Technique candidates

| Appearance | Candidate | Acceptance that changes the choice |
|---|---|---|
| Flat/stylized surface | Unlit or simplified lit | Required lights, fog, shadows and GI |
| Dissolve | Mask/noise threshold, clip and edge color | At 0/0.5/1, visible/shadow/required depth passes agree |
| Fresnel/rim | View/normal response | Normal space, backfaces and lighting influence |
| Flow/scroll | UV transformation, distortion and masks | Tiling/seams, time source, reset and continuity |
| Vertex animation | Deform in a chosen coordinate space | Bounds/culling, scale and shadow/depth consistency |
| Outline | Inverted hull or screen-space feature | Hull geometry/pass cost versus renderer integration/input buffers |
| Shield/water/depth fade | Transparent shading with scene inputs | Scene color/depth availability, sorting and intersections |

These are candidates, not portable templates. Read [pipeline and passes](pipeline-and-passes.md) before implementation. Keep a suitable existing Graph/HLSL path. Add custom inspectors, generators or a broad shader library only when repeated tasks justify them.

Choose blend convention, queue, ZWrite/ZTest and culling deliberately. Check texture alpha convention and sampling color space; a transparent halo may be a texture/blending mismatch. Do not automatically replace every transparent effect with alpha clip: motion, sorting and acceptance differ.

## Controlled iteration

Start with primary shape/readability, then shading and secondary detail. Compare baseline/candidate at identical camera, transform, light, exposure, background, resolution and quality tier. Inspect dark/light backgrounds, grazing angles, intersections and relevant endpoints. Animated effects need timed captures or a clip.

Save/reload assets before handoff. Test two objects with different parameter values to catch shared-material leakage. State material-wide versus per-instance control and the owner that updates/resets state on reuse. Shaders render presentation; gameplay retains damage, cooldown and other authority.

For automated captures, verify intended material output rather than only counting non-background pixels. The first rendered frame can differ while shaders compile; a sample's default material may also hide the intended look. Inspect actual colors/lighting and compiler readiness using supported Editor controls before accepting the image; do not label an unexplained red/black surface a successful visual match.

Retain the technique, parameter defaults/ranges and captures tied to source/configuration. Visual review is separate from import/compile, build and performance evidence. A lab look is not owner-confirmed production art direction.

## Reusing references

Public examples are teaching resources, not a dependency plan. Before adapting code, inspect pinned source and actual license/notice for that file. Distinguish code from textures/models and commercial examples; preserve attribution. GitHub license detection alone is insufficient. Prefer concise provenance links over copying a repository/manual into context.
