# Adaptive layout during a reskin

Inspect the live owning Canvas Scaler, not only serialized scene defaults: render mode, reference resolution, scale mode, screen-match mode/value, nested canvases and the actual canvas-space rectangle. Preserve the user's current configuration. Do not change a shared canvas merely to simplify one panel.

Use parent semantics for anchors: profile at top-start, settings/resources at top-end, side navigation at the appropriate edge, primary action at bottom-center, and central previews relative to a central content container. These are examples, not mandated positions. Use corner/edge/center presets and local offsets; stretch elements that should grow with a container. Match pivot to the intended attachment. Read left/right choices from current user intent, including localization needs.

Group icons/labels inside controls and controls inside navigation containers. Inspect LayoutGroup, ContentSizeFitter, AspectRatioFitter and LayoutElement ownership before setting positions. Preserve texture proportions and account for transparent art padding and sprite borders. Avoid competing layout controllers.

Canvas Scaler converts screen pixels into logical canvas units. Evaluate margins and fixed design sizes in those logical units. A smaller screen need not require smaller authored RectTransforms when the owning scaler handles it. Re-read the scaler if the user changes it while work is ongoing.

Existing SafeArea ownership should be reused. Full-bleed backgrounds can sit outside padded content. For notches/insets, place interactive content inside the safe area and verify the chosen policy. Do not stack another SafeArea controller on an already managed subtree.

Before adding a responsive script, demonstrate a specific failure that anchors, suitable containers and existing scaling cannot cover. Keep any necessary behavior scoped to its owner, with no editor-only references in Runtime. Preserve animation targets: an entry tween that scales a button to one can fight a layout scaler on the same transform. Use an appropriate wrapper if needed; never silently disable the animation.

If nested content is excluded, an outer instance placement change may still be needed, but do not edit internal labels/layout/materials or apply its overrides to the source. Record that distinction in the handoff.

Check the reference aspect plus a wider and a narrower supported aspect. Include a meaningful inset case when mobile safe areas matter. Detect overlaps and clipping as well as off-screen bounds; a collection of individually in-bounds rectangles can still overlap.
