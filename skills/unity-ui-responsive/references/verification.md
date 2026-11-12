# Responsive verification and evidence

## Matrix proportional to the task

Default landscape matrix:

| Aspect | Screen sizes |
| --- | --- |
| 16:9 | 1920×1080 and 1280×720 |
| 19.5:9 | 2340×1080 |
| 20:9 | 2400×1080 |
| 4:3 | 1280×960 |

Adapt to supported orientation/platform and project acceptance criteria; transpose for portrait when appropriate. Do not force a landscape game to support portrait. Record selected cases and any omitted cases/reason. Use no-inset plus relevant asymmetric notch cases; test both landscape directions if supported. Uniform four-edge insets are optional stress data, never a fabricated device model. Record actual inset rectangles and screen dimensions.

Use the live CanvasScaler's conversion to canvas units, including render mode, reference size, scale/match mode, viewport and parent transforms. Raw screen size is not always logical Canvas size. Combine bounds/internal-overlap checks, resizing, valid text/content extremes and input. For a widget, check affected consumers under their distinct parent contracts; do not expand a small edit into a whole-project audit.

## Actual renders

For visible changes, capture real rendered UI when tools are available and personally view the images. Inspect proportional art, concentric slots, text glyphs/wrap, spacing, clipping, header/footer/actions and overlap. Fix newly discovered in-scope defects and recapture; preserve design and excluded ownership. Save/reopen the correct prefab and verify saved bindings/overrides.

Use the existing correctly connected Editor/capture path; do not open a second Editor or install capture packages. Check camera belongs to the intended scene, canvas render mode/layers, overlay capture support, frame timing and image orientation. Ensure the screenshot actually contains the target UI. A blank capture or wrong camera is missing evidence, not a pass or proof of a broken prefab.

Store captures outside Assets and Git using the project's visual-review convention when present. If `visual-review` is installed, read its storage workflow; do not enable hooks as part of this skill. Use a task-owned external temporary directory if no convention exists. Record capture paths/state/configuration and make them accessible for review. Do not generate illustrative images as verification.

## Runtime and regression

When the environment permits, exercise Play Mode using real binding, layout and animation: reopen/close repeatedly, switch panels, resize, drag/drop/carousel and scroll to the last item as applicable. Check dynamically spawned items and relevant valid states/locales. Preserve player saves; use existing non-destructive fixtures rather than modifying player progression outside scope. Keep fixture overrides/disabling of business scripts explicit: a fixture render does not prove gameplay.

Refresh/compile and inspect Console after C# edits. Select the smallest useful regression for the demonstrated failure, such as a last-item reachability or slot-bounds invariant with real layout inputs. Do not require tests for every decorative edit or assertions that repeat implementation. Project inspection, compilation and test pass are separate from visual/input evidence.

Use Simulator/device checks when available; record model/configuration, orientation, screen/viewport/insets and tested input. Simulator emulation is not a real touchscreen. Do not claim support for every phone from a few configurations.

## Report evidence by layer

| Evidence | Supports | Does not establish |
| --- | --- | --- |
| Static inspection | Ownership, serialized settings, source/binding reasoning | Render or touch behavior |
| Geometry fixture | Bounds/overlap under recorded scaler/data assumptions | Visual fidelity, real binding, gameplay |
| Prefab render | Appearance of the captured prefab/state | Actual gameplay, gestures, other devices |
| Play Mode | Exercised real runtime paths and inputs | Physical touch/device behavior |
| Simulator | Recorded emulated configuration | Real-device input/performance |
| Real device | Exercised behavior on the named device/configuration | Every phone/configuration |

If Editor, license, capture, Simulator or device access is missing, finish safe available checks and report the exact unavailable command/tool, reason, evidence obtained and remaining gap. Mark missing layers degraded/not-run; do not manufacture passes. Report an unresolved excluded defect or genuine blocker precisely instead of claiming full completion of verification.
