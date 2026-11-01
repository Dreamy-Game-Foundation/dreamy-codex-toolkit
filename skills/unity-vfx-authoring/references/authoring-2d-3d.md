# Author and preview an editable effect

Read when constructing/editing an effect or comparing its appearance. Inspect the target prefab/material, nested/variant owner, scene dirty state, relevant consumers and Console baseline. Use narrow supported Editor/MCP operations; save only intended assets and preserve GUIDs, bindings and overrides. A separate lab is useful for initial experiments; do not switch the user's active scene or renderer to create one.

## Authoring sequence

1. Choose an existing effect/prefab to extend or a fresh project-owned path. Create the smallest complete effect that tests silhouette and timing. Author static configuration into assets; runtime code handles actual instance parameters and triggers.
2. Set Main behavior deliberately: one-shot/loop, duration/lifetime, simulation/scaling space, speed, start delay and play-on-awake as required by its owner. Configure Emission, Shape and the size/color/velocity progression needed by the recipe. Add noise, collision, trails, sub-emitters or lights only for a concrete visual role.
3. Assign an inspected compatible material and renderer configuration. Record sorting/depth, billboard/mesh alignment, local/world axes, parent scale and culling bounds. Shader Graph/HLSL and VFX Graph operations must match verified APIs/tools; never construct prefab/scene/graph serialization by guessing.
4. Expose a few meaningful controls such as color, scale, intensity or speed; avoid a generalized effect framework. Keep independent instance overrides separate from shared material assets. Track ownership/release of material instances if used.
5. Save prefab/material, reload through the AssetDatabase or prefab workflow and check dependencies, overrides and GUID identity. A successful creation call alone does not establish persistence. Editor helpers stay in Editor assemblies; refresh/compile/read Console after C# edits before invoking new types.

If automation repeats a real task, a narrow Editor helper can be justified. It should identify exact inputs/target paths, refuse unexpected overwrite, report created/changed assets and be safe to repeat within its ownership. Do not generate an automation framework or depend on private graph APIs before a verified pilot warrants it.

## Example recipe: 2D hit/slash

Illustrative starting values below are **design candidates**, not observed results or universal budgets. Tune to the brief, camera and game timing.

| Layer | Candidate role and setup | Observe |
|---|---|---|
| Main stroke | One drawn sprite or short flipbook, roughly 0.08–0.18 s visual emphasis | Stable pivot, direction, silhouette and peak aligned to the authoritative hit |
| Highlight | Brief bright accent, optional if the main stroke reads clearly | No accidental full-screen flash or loss of silhouette |
| Sparks/dust | Small directional burst with fading size/alpha, roughly 0.15–0.4 s tail | Foreground/background sorting and readable density at actual screen size |

Keep movement in the intended plane, billboard orientation consistent with the orthographic camera and scale consistent with sprite units/pixels. Inspect sorting layer/order, transparency and Light2D response if required. Test behind/in front of characters and across relevant backgrounds; pixel effects need appropriate filtering and pixel density.

## Example recipe: 3D explosion

| Layer | Candidate role and setup | Observe |
|---|---|---|
| Flash | Fast burst at origin; tens of milliseconds as a starting choice | Timing/readability without relying on global exposure changes |
| Shockwave | Expanding ring/mesh with fading material | Ground orientation, clipping, occlusion and no unwanted backface disappearance |
| Sparks/debris | Directional particles/mesh particles | Scale, trajectory, bounds and any collision cost |
| Smoke | Slower expanding/fading particles | Tail survives primary emission, alpha layers do not overwhelm gameplay |

Start without optional lights/distortion. Check camera distance, depth testing, parent movement and local/world simulation. Only enable depth-dependent features after renderer compatibility and cost inspection. Verify in relevant views instead of assuming a single black-background capture proves 3D fit.

For a trail/aura, move the emitter through the intended path, stop it mid-effect and reuse at a distant position. Keep follow-target and simulation space intentional. Use [integration-and-verification.md](integration-and-verification.md) for reset/completion handling; merely making the trail visible is not lifecycle verification.

## Preview and revise

Use a suitable existing preview scene or a small task-owned scene with camera/light as required, then the actual gameplay context. Match camera, resolution/aspect, background, exposure/lighting and sample times between iterations. A seed can help repeat Particle System comparisons; do not promise cross-device deterministic GPU graph simulation.

Capture onset, peak and tail, plus a clip/sequence for motion or loops. Compare silhouette, palette, opacity, timing, direction, attachment, bounds/clipping and loop seam. View light/dark and gameplay backgrounds at actual screen size. Revise the failed criterion while retaining accepted layers; respect the task's attempt/time limit and record unresolved differences.

Nonempty-pixel checks can detect a failed capture, but are not visual acceptance scores. A fading tail can intentionally become invisible; judge each sample against its intended timeline rather than requiring equal visibility throughout.

Continue with [integration-and-verification.md](integration-and-verification.md) for event ownership, testing and evidence.
