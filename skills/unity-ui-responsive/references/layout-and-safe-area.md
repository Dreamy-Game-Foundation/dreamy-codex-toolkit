# Layout, content and SafeArea ownership

## Inspect before choosing a repair

Trace the owning Canvas, actual canvas-space rectangle, CanvasScaler, nested canvases, prefab source/variants/nested instances, scene overrides and runtime instantiation route. Read code which changes content, position, size, scale or animation after binding. For shared widgets, find affected consumers, sample each distinct parent/scaler/layout contract and check instance overrides; do not apply all overrides to the source. Keep excluded subtrees intact and report any relevant excluded defect.

Anchor/pivot/offset should express attachment to the meaningful parent: edge/corner for attached controls, center for central content, stretch for regions that follow parent dimensions. These are choices based on design, not compulsory positions. Do not convert all anchors to center or reject fractional anchors used by a real proportional layout. Inspect LayoutGroup, LayoutElement, ContentSizeFitter and AspectRatioFitter before setting driven properties.

Measure rectangles in a common coordinate system after layout settles. Include internal overlaps, spacing, minimum size, header/footer/action clearance, rotated/scaled bounds and hit targets, rather than only screen containment. Fit stable compositions uniformly when appropriate; use reflow/layout or scrolling for growing content. Do not shrink the whole UI to conceal collisions or make labels/controls unreadable or hard to press. Preserve the actual scaler contract rather than resetting it to a universal reference resolution/match setting.

## SafeArea: one owner, background outside

Retain the project convention of including the existing SafeArea component/container for full-screen, panel, popup, overlay, HUD and mobile-facing UI prefabs, including newly authored centered popups. If an ancestor already owns SafeArea, reuse that owner instead of adding an inset again. A prefab lacking a local component may already be protected at its runtime parent; inspect that route first. Explicit user/project instructions take precedence.

Full-screen interactive content belongs under the SafeArea owner. Keep the full-bleed background outside the inset subtree, for example siblings `Background` and `SafeArea/Content` under a full-screen root. A non-full-screen dialog still needs to fit and leave its actions accessible; do not stretch the dialog artwork to fill SafeArea merely to add a container. Reuse the project's verified component; do not invent a Dreamy API, add a package, or move navigation/business ownership into it.

Inspect the application's actual viewport and existing inset conversion before applying screen-space insets to canvas-space content. Avoid applying device/window padding twice. Validate no-inset and asymmetric notch cases; reverse landscape direction when supported. Equal padding on all four sides is only a stress case, not a phone specification.

## Images, formations and radial layouts

Keep images proportional and concentric with their related slots. Inspect transparent sprite padding, pivot and actual drawn image bounds. Image PreserveAspect preserves the rendered sprite's ratio; it does not resize a parent RectTransform or repair child coordinates. A radial/planet/formation composition needs one coordinate/scale contract for image and slots, or explicit conversion from actual image dimensions into the slots' parent space. Do not multiply unrelated local scales or base placement on an assumed screen size.

Check the largest valid formation, newly spawned slots and instance overrides after binding. Include each slot's full bounds and hit area, not just its center, when testing containment/overlap. A visually centered image with displaced controls still fails. Preserve authored arrangement and input semantics.

## Layout and animation ownership

Use an outer transform for fit/layout and an inner transform for visual tweening when both need scale/position ownership. A layout group owns its driven child properties; do not tween that root. Preserve existing timing, easing and delay presets unless changing them is requested. Check end states, interrupted/repeated open/close, resize during animation and cleanup on disable/destroy. Avoid Update/LateUpdate layout polling and repeated forced rebuilds; use existing lifecycle, dimension-change or data events and guard against recursive rebuilds.

## Text, growing lists and interaction

- Inspect TMP font assets/materials and fallback coverage for supported locales, including inactive labels. Exercise valid long text, large numbers, wrap/overflow and empty/loading/error/locked/unlocked/max-level states. Do not hide valid content or silently change locale/strings to make it fit.
- Lists/grids must grow with data, clip at the viewport and permit reaching the final item. Scroll content may intentionally exceed the viewport; glow/decoration may intentionally exceed a control's visual rectangle. Distinguish these from clipped or unreachable interactive content.
- Recheck EventSystem/raycast ownership, decorative raycasts, modal blocking, hit targets after scaling, drag/drop and carousel gestures. Canvas logical pixels are not automatically dp/pt or physical touch sizes; use the project's platform criteria and device evidence where available.

## Primary references

Researched 2026-11-10; these explain Unity behavior, not verified compatibility of any consumer. Read the consumer's installed version before choosing APIs.

- [Canvas Scaler, uGUI 2.0](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/script-CanvasScaler.html): screen scaling and canvas units.
- [Auto Layout, uGUI 2.0](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/manual/UIAutoLayout.html): minimum/preferred/flexible sizes and driven transforms.
- [Image.preserveAspect, uGUI 2.0](https://docs.unity3d.com/Packages/com.unity.ugui@2.0/api/UnityEngine.UI.Image.html#UnityEngine_UI_Image_preserveAspect): sprite aspect preservation.
- [Screen.safeArea, Unity 6000.0](https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/screen/safearea): screen-pixel safe rectangle and application-window considerations. The prefab/container policy above is a toolkit convention, not a Unity requirement.
