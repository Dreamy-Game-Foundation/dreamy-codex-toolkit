---
name: unity-ui-responsive
description: Check and repair responsive Unity uGUI prefabs when creating or changing panels, popups, HUDs, widgets, layouts, sprites, fonts, text, animation or content bindings that affect presentation, including affected shared-widget consumers. Excludes gameplay-only prefabs and business changes without presentation impact.
---

# Unity UI Responsive

## Scope

Own responsive layout and SafeArea decisions for uGUI prefab presentation work. Check and fix defects within the authorized scope before reporting completion; do not stop at an issue list or request permission again for authorized repairs. Respect project instructions and design; do not redesign, change business logic, add packages or audit the entire project for a small edit.

## Decisions

1. Inspect Unity version, manifest/lock, project conventions and live CanvasScaler (render mode, reference resolution, scale/match mode and canvas rectangle). Identify source/variant/nested ownership, overrides, parents and runtime route. Read binding, spawn, layout and animation code; never assume a Dreamy package/component exists. Shared-widget edits require checking affected consumers and their overrides.
2. Read `references/layout-and-safe-area.md` for layout repairs, SafeArea ownership, radial/formation content or tween conflicts. Use meaningful parent anchors/pivots/offsets, stretch where needed and existing components before custom behavior. Fractional anchors are not inherently wrong. Measure internal overlap and bounds, minimum sizes, spacing, header/footer and actions; choose layout, reflow, scroll or uniform fit that preserves readability and usable hit targets.
3. Preserve the project's SafeArea convention: full-screen, panel, popup, overlay, HUD and mobile-facing UI prefabs include the existing SafeArea component/container unless a parent already owns the inset. Background stays outside SafeArea for full bleed. Keep one inset owner; inspect existing centered popups in context rather than assuming absence of a local component is a defect.
4. Prefer the Editor/MCP connected to the correct project; never open a second Editor on that project. Preserve GUIDs, fileIDs/references, nested ownership and overrides. Mutate narrowly with Editor-supported operations, save/reopen the correct prefab and verify references. Do not blindly rewrite prefab YAML or create a disposable Editor generator just to edit a prefab. Keep Runtime free of UnityEditor references.
5. Separate fit/layout transforms from tween transforms; retain timing/easing/delay presets. Do not tween layout-group-controlled roots or poll layout in Update/LateUpdate. Reuse lifecycle, dimension-change and data events with cleanup.

## Verification

Read `references/verification.md` before completion. Check geometry, resize, text, input and supported states with the real CanvasScaler and supported orientation/platform matrix. Capture and personally inspect actual renders for visible changes when tools are available; fix new in-scope defects and capture again. Exercise real binding/layout/animation in Play Mode when available. Choose the smallest regression proving a real failure; decorative edits do not mandate new tests.

Complete available safe work when tooling is missing and report exact missing checks. Separate static, geometry fixture, prefab render, Play Mode, Simulator and real-device evidence. Compile/project-inspect/test passes do not establish visual or touch correctness, and a few cases do not prove compatibility with every phone. Review diff/status and retain unrelated edits.

## References

- `references/layout-and-safe-area.md`: layout/content/input decisions and the single detailed SafeArea policy.
- `references/verification.md`: aspect/inset matrix, rendered evidence and runtime/device verification.
- When installed, use `unity-scene-prefab`/`unity-mcp` for asset operations, `unity-ui-reskin` for reference matching/fonts, `unity-testing` for regression selection and `visual-review` for screenshot storage. Inspect current project/version sources before API claims.
