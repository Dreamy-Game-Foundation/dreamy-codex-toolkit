# Choose the rendering technique

Read when choosing an implementation, diagnosing a compatibility gap or placing an effect in UI. Identify exact Editor revision, declared/resolved package versions, active pipeline asset including quality overrides, camera renderer, color space and target graphics API. Installed packages and a live MCP connection are capability observations, not proof that a particular effect renders.

| Brief | Starting candidate | Verify before committing |
|---|---|---|
| Small 2D hit, dust, sparks, heal, celebration | Particle System with sprites/billboards | Sorting layer/order, emitter plane, projection, alpha and screen size |
| Drawn slash or signature silhouette | Sprite/flipbook, optionally particles | Stable frame bounds/pivot, order, temporal continuity and direction |
| Ordinary 3D fire, smoke, explosion, aura | Particle System, optional mesh layers | Depth/occlusion, simulation space, bounds and layer cost |
| Beam, projectile trail, sword ribbon | Line/Trail or mesh plus particles | Endpoint owner, texture tiling, corner quality and reset |
| Shield, dissolve, surface shockwave | Mesh/material with suitable shader | Pipeline/renderer support, blending/depth and per-instance control |
| Dense GPU effect or explicit graph request | VFX Graph after preflight | Resolved package, renderer, graphics API, required GPU features and authoring tool |
| Canvas reward burst or masked overlay | Existing UI animation, verified bridge or camera composition | Canvas render mode, clipping/mask, sorting, input and render ownership |

Particle System is a practical starting policy, not an instruction to override an explicitly chosen graph or existing suitable setup. The [Unity 6.0 comparison](https://docs.unity3d.com/6000.0/Documentation/Manual/ChoosingYourParticleSystem.html) distinguishes its pipeline coverage from VFX Graph. Do not interpret “3D” as requiring a GPU graph or “2D” as requiring a flipbook.

## Graph and shader capability gate

Inspect documentation for the project's resolved versions. [VFX Graph 17.0.4 requirements](https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/System-Requirements.html), inspected 2026-11-02, list compute/buffer requirements and mobile/OpenGL ES restrictions. This dated source is not a support promise for another package version. A compute capability flag alone does not establish renderer, driver, shader or target support.

URP 2D Renderer and Universal Renderer are distinct configurations. For effects requiring 2D light response, inspect the shader/output configuration and actual renderer; follow [Unity's versioned 2D lighting guidance](https://docs.unity.com/en-us/engine/6000.0/manual/unity2d/2d-urp/2d-index/prep-shader) and verify the effect in the target scene. Never infer Light2D response from the presence of URP or a generic particle material.

For depth-dependent fading, distortion, decals or lighting, verify the required camera textures/features and their cost. Prefer the current project's compatible material to a guessed shader name. Do not enable global camera/pipeline features solely to make an optional decorative layer work without assessing scope and existing owners.

If an explicit technique is unavailable, record the exact missing package/API/renderer/tool. Continue independent recipe/art work, but keep that technique unfulfilled. Use a fallback only if consistent with the user's requirements. Do not silently install packages, change graphics API or migrate a pipeline to satisfy a recipe.

## UI and degraded operation

A world ParticleSystemRenderer does not automatically participate in Canvas layout, Mask or RectMask2D clipping. Raising sorting order is not a masking solution. Inspect existing UI-native effects or a verified bridge/composition path; test the actual Canvas mode and mask. Do not introduce a UI particle dependency for an effect already served by authored UI animation.

No Editor: deliver the requested design, ingredients or authoring source with import/render/test not-run. No reliable graph authoring tool: do not synthesize `.vfx` or `.shadergraph` files from guessed formats. An available MCP tool name is not evidence it can create the nodes needed. Read capabilities and verify version-specific operations first.

Next: use [art-and-textures.md](art-and-textures.md) for ingredients or [authoring-2d-3d.md](authoring-2d-3d.md) for assembly.
