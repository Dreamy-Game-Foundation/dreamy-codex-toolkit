---
name: unity-ui-reskin
description: Restyle Unity uGUI prefabs from screenshots or supplied art, replace TMP fonts and outline materials, and correct adaptive anchors while preserving nested prefab ownership and UI bindings.
---

# Unity UI Reskin

## Purpose

Translate a visual reference into an editable uGUI prefab using the project's art and typography, preserving its runtime behavior and existing scaling contract.

## When To Use

- Rebuild or reskin a Canvas-based panel, popup, HUD, or reusable widget to match a screenshot.
- Replace UI sprites, TMP fonts, outline presets, or repair responsive placement during that work.

## When Not To Use

- Pure navigation/presenter changes: use `dreamy-ui` when installed, or the project's existing UI architecture.
- UI Toolkit/UXML, web interfaces, or requests to generate new artwork: use a workflow appropriate to that output.
- A single known property edit does not require the full screenshot reconstruction process.

## Domain Model

Reference -> editable scope -> prefab ownership -> art/font mapping -> layout/scaling -> preserved bindings -> rendered evidence.

## Required Inspection

- Inspect project instructions, working-tree changes, relevant package manifests and UI ownership code. Verify package capabilities before relying on them.
- Through available Editor resources, identify the exact project, prefab stage, dirty state, selection, Canvas Scaler, SafeArea owner, and Console baseline. On user steering or reload, re-read affected state; do not assume cached state is current.
- Record editable and excluded assets/subtrees. Distinguish nested instance placement from edits to its source prefab or contents.
- Inventory existing sprites, texture transparency/borders, TMP font assets, material presets, layout components, button references, persistent listeners, state indicators, and tween targets. Inspect selected assets to resolve references such as “this font” when unambiguous.

## Decision Tree

- Existing art matches the reference: reuse it; do not flatten interactive UI into a screenshot.
- Canvas Scaler and SafeArea already own scaling: adapt anchors and containers to that contract; do not add a second scaler or custom scaling script by default.
- Nested content is excluded: preserve its contents/source and only adjust outer placement when required within the agreed scope.
- Screenshot and explicit user placement differ: follow the latest user instruction.
- Font replacement: select a compatible font asset and persistent preset tied to its atlas, not merely a material with the right color.
- Editor is unavailable: produce scoped static work where safe and state which visual/runtime checks remain unavailable.

## Workflow

1. Capture current ownership, bindings and visual baseline; map reference regions to editable elements and existing assets.
2. Establish layout groups, edge/center anchors and SafeArea handling. Read `references/adaptive-layout.md` when adjusting scaling, containers or anchors.
3. Apply sprites, typography and decoration through verified Editor APIs. Read `references/tmp-materials.md` for font or material changes.
4. Preserve interaction/state behavior; isolate animated scale targets from layout containers when their ownership would conflict. Do not hide existing features solely because they are absent from the picture.
5. Save only intended assets, reload/inspect saved references, then render and inspect the result. Read `references/visual-verification.md` for evidence and proportional validation.
6. Report changes, functional limitations and checks actually performed. Newly drawn controls or sample profile values are not automatically wired features.

## Architecture Rules

- Use `unity-mcp` and `unity-scene-prefab` when available for their Editor/serialization safety rules; preserve GUIDs, variants and binding identity.
- Keep reskin work in the view. Keep economy, saves, navigation policy and SDK decisions with existing owners.
- Honor Canvas Scaler settings and excluded subtrees. Do not globally alter shared font/material assets to style one panel.
- Disable decorative raycasts; preserve hit graphics and state affordances. Store reusable outline materials as assets.

## Anti-patterns

- Encoding screenshot coordinates as arbitrary per-element anchor fractions instead of meaningful parent anchors.
- Adding an ExecuteAlways scale controller before inspecting the real Canvas Scaler.
- Disabling runtime state visuals, hiding developer/navigation controls, or replacing bound components just to match a still image without considering behavior.
- Assigning an unsaved material instance or one tied to another font atlas.
- Treating successful bounds checks as proof of visual fidelity or click behavior.

## Common Failure Modes

- Layout groups override manual positions; a tween overwrites layout scale.
- Source prefab or user edits change during work; stale snapshots overwrite them.
- Borders, transparent padding, glyph clipping or auto-size make correct RectTransforms look wrong.
- A screenshot is blank, flipped or excludes overlay canvases because the capture setup is incorrect.
- Inactive labels retain old fonts or excluded widgets accidentally receive overrides.

## Verification

- Inspect an actual rendered result against the reference, including text, spacing, aspect and overlap.
- Check saved binding references, missing scripts, relevant Console changes and excluded-asset preservation.
- Check representative aspect ratios using the real Canvas Scaler; validate SafeArea and relevant animation/hit-target behavior.
- Compile when scripts changed. A visual-only change normally needs targeted Editor checks rather than new gameplay tests.

## Allowed Claims

Distinguish rendered inspection, geometric bounds, binding inspection and Play Mode/device checks. Claim functional navigation only when exercised. Do not claim pixel-perfect matching from a layout calculation or a clean Console from pre-existing errors.

## References

- `references/adaptive-layout.md`: anchor/scaler ownership and container decisions.
- `references/tmp-materials.md`: font replacement and persistent material presets.
- `references/visual-verification.md`: rendered evidence, aspect checks and focused regression scenarios.
