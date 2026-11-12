# Pipeline and pass contracts

Read for pipeline functions, lighting, shadows, depth/normals, vertex deformation or renderer-specific behavior.

## Establish the target

Read Editor revision, declared/resolved packages, Graphics/Quality assignments, camera renderer overrides and target API. Distinguish Built-in, URP, HDRP and custom SRP; within URP inspect 2D versus Universal Renderer and the active render path. Do not infer Light2D support from a 3D lighting include or assume all URP paths consume the same passes.

Use installed package source first. For Unity Graphics on GitHub, resolve the target's matching tag/commit; master tracks development and is not a stable include contract. Record provenance and missing verification. A source commit proves what was read, not that a target build ran.

Do not translate Built-in Surface Shader/CG or GrabPass assumptions directly into URP/HDRP. An SRP sample is not permission to replace the project's pipeline. Renderer-feature/RenderGraph work belongs to rendering owners with its own version inspection.

## Map relevant passes

| Contract | Inspect and verify |
|---|---|
| Visible surface | Pipeline/LightMode tags, render path, blend/depth/cull, fog and lighting inputs |
| Shadow casting | Pass selection, deformation, clipping, bias and relevant light types |
| Depth/depth normals | Whether a prepass is requested, output encoding and matching clip/deformation |
| Motion vectors | Whether needed, current/previous deformation and actual output |
| Outline | Whether/how the renderer schedules the extra pass; batching/cost checked separately |
| Sprite/Canvas | Sorting, 2D lighting or UI stencil/clip/alpha contract |

Do not require every row for every shader. Transparent surfaces need deliberate depth/shadow decisions. Missing scene depth/color may be a renderer input issue; enabling a global setting affects cameras/quality tiers and needs scope review.

Share mask thresholds and deformation across dependent passes. The forward result can look correct while shadows/depth use the undeformed mesh. Check bounds/culling for vertex displacement and normal/tangent transforms when orientation changes.

Compare material buffer layout across passes against installed SRP expectations. A `UnityPerMaterial` buffer alone does not prove SRP Batcher compatibility; inspect actual material/renderer diagnostics. GPU instancing, SRP batching, instances and property blocks have contextual tradeoffs, not a universal winner.

## Inspected design sources

- [Unity Graphics README](https://github.com/Unity-Technologies/Graphics/blob/0efc28ea742b1966b9dd9cc4489e58b986a13faf/README.md): branch/tag provenance; installed target source takes precedence.
- [Nilo tutorial shader](https://github.com/ColinLeung-NiloCat/UnityURPToonLitShaderExample/blob/fbe276e0df1d1f9379e13581c20b6a080a1a6977/SimpleURPToonLitOutlineExample.shader) and [shared HLSL](https://github.com/ColinLeung-NiloCat/UnityURPToonLitShaderExample/blob/fbe276e0df1d1f9379e13581c20b6a080a1a6977/SimpleURPToonLitOutlineExample_Shared.hlsl): tutorial pass organization, not a portable production template.
- [Toon RP README](https://github.com/Delt06/toon-rp/blob/687b7b26747a8bd6b0905299e5248bbca0285a77/README.md): a separate custom SRP, not a URP shader drop-in.

Inspected 2026-11-03. These sources are not compatibility/performance receipts for the user's project.
