# Asset routes

Choose per asset group. A clone can use original art; an original game can reuse licensed packs. Respect an existing user-selected provider or source. Judge total delivery cost: discovery/generation + cleanup + rigging + import + integration + later maintenance.

| Need | Candidate routes | Pilot before expanding |
|---|---|---|
| Signature character/building/key art | AI, supplied design, manual edits | Identity/style and a working gameplay-camera sample |
| Background props/terrain/audio/font | Existing pack, procedural, AI | Source terms, render/import compatibility and scene fit |
| Character with many actions | Compatible rig/clip library or custom production | Rest/bind pose, retargeting, grip, contact and transitions |
| Unusual anatomy | Anatomy-specific rig/gaits | A gait and action in the real controller |
| Repeated layout | Tilemap, modular kit, procedural/kitbash | Scale, seams, collision and navigation |
| UI/icons/VFX | Engine-native layout/effects plus selected art | Readability, interaction, lifecycle and real captures |

## AI route

For engine-native 2D/3D effect creation or substantial restyling, use `unity-vfx-authoring` when available to choose techniques, author editable prefabs and verify visuals/lifecycle. Existing assets, procedural ingredients and AI art remain per-task choices; isolated pooling bugs and standalone images use their narrower workflows.

Write purpose, screen size, dimensions, anchor, format, mesh/texture budget, rig/collision needs and allowed attempts. Explore meaningful design variants; after selection, change only the failed criterion and preserve accepted identity. Do not combine faithful recreation with unrelated style changes.

Prepare inputs for the destination. A hero concept, orthographic parts sheet, prop image-to-3D input and motion starting pose solve different problems. Pick camera/background/lighting accordingly. For assemblable parts retain matching pose, scale and intended views. Generate hair, separate parts, multiview or video only when the actual production route needs them.

Discover the selected provider's current endpoint/schema and planned cost; historical model names are not live availability. Save the prompt, input hash, endpoint/version, request ID, costs and local outputs immediately. Retain rejected attempts and reasons. Download completed outputs; CDN URLs alone are not durable assets. On a failed download reuse the completed result. For an unknown submission search the request history before another paid call.

Use a configured attempt limit per stage; three total is a starting recommendation, not a requirement to spend three times. After the limit use the fallback or simplify within scope. Record technical completion, engine checks and visual selection separately.

## Existing assets

When the user requests extraction from a selected APK/XAPK/build/bundle, use `game-asset-extraction` for source-preserving inventory, a bounded export pilot and receipts. Hand its outputs and unresolved import/material/code work back to this workflow. Extraction can run with REA off; a clone brief does not itself select this route.

Inventory supplied/cached sources first. Record source, version, terms and required attribution for runtime content. Reference-only imagery is not automatically runtime material. Import one sample into a separate area; check render pipeline, dependencies, demo scripts, units, orientation, pivot, rig, maps and input side effects.

After extraction, create a JSON catalog with a resolvable link per exported file, including unselected files, and map required screen/gameplay roles to actual IDs and import bindings. Prefer metadata/receipt hashes rather than opening all heavy assets. For exact clones, integrate suitable original UI/art when available and finish its full functional flow; cataloging or importing alone is not completion. See [exact-clone.md](exact-clone.md) for catalog fields, missing-role decisions and source/candidate comparison.

Pick a coherent anchor pack. Normalize scale, palette/materials and lighting when combining packs. Prefer project-owned wrapper prefabs/config over incidental vendor-source rewrites. Keep the sample working in the actual project before bulk import. A free download or REA extraction does not establish redistribution rights.

## Processing and hybrid pipelines

3D: source → cleanup → topology/decimation as needed → UV/bake as needed → materials → rig/actions as needed → portable export → engine import → prefab → gameplay/build.

2D: source → alpha cleanup if needed → scale/pivot → slice/atlas → animation/state → collision/hitbox → gameplay/build. Inspect alpha edges and readability at real screen size. This is a proposed extension beyond the Oldcraft 3D evidence.

Hybrid examples: AI designs/materials + existing rig/clip/SFX + procedural layout/collision + project gameplay. Preserve source, processed and runtime artifacts with stable IDs. Record each stage's actual tool instead of crediting the whole chain to the first generator.

## Motion contract

Declare duration, fps, loop/one-shot/final hold, contact/release timing, movement/yaw owner, scale/basis, stride, cancellation and clip names. Gameplay owns authoritative damage; visual contact must agree with it. Choose code-driven or root-motion-driven movement deliberately.

Check deformed soles and geometry, not just control origins or renderer bounds. Inspect anatomical bend, grip, cross-clip defaults, loop seams and poses between keys. Walk is not necessarily a slowed Run. Gait phase should match blended travel states; complete authored turns and interrupted gameplay are separate checks. Recalibrate body variants rather than copying another character's stride, turn angle or clearance.

Keep editable authoring and baked runtime versions separate. Time intervals are `(last - first) / fps`; changing fps alone changes speed. A video reference is not mocap, and a generated rig is not proof of correct skinning. Test the rough motion in the controller before polishing it.

Reimport an export from a copied folder/clean scene so textures cannot silently resolve from old paths. Verify source/export pose fidelity separately from engine setup. Preserve approved geometry, weights, maps and unrelated clips during narrow revisions. Historical build scripts with fixed coordinates are adaptation references, not universal unattended rebuilders.

Use `../assets/asset-record.json` when a structured receipt helps. Missing cost/coverage stays unknown, not zero or accepted.
