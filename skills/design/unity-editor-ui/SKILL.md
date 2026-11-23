---
name: unity-editor-ui
description: Design and polish Unity EditorWindow, custom Inspector and editor tool presentation using the project's UI Toolkit or IMGUI conventions, including skin, docking and resize verification. Excludes in-game uGUI and isolated importer or build logic changes.
---

# Unity Editor UI

## Scope

Own editor presentation, not runtime game UI. Keep asset mutation, Undo/save and assembly ownership with existing editor tooling. Improve a small existing panel without forcing a framework migration.

## Decisions

1. Inspect instructions, ProjectVersion, manifest/lock, asmdefs, existing windows/inspectors, bindings and shared styles. Inspect compatibility/source for the actual Unity/package version before claiming API support. Select the correct connected Editor before stateful operations.
2. Read `references/editor-presentation.md` before implementation. Prefer the project's current UI framework; consider UI Toolkit for new windows when verified for the target, and retain IMGUI where appropriate. Do not treat USS as browser CSS or silently add vector/font packages.
3. For visual direction read [design foundations](../tool-ui-design/references/design-foundations.md). Use Geist-inspired hierarchy, surfaces and restrained accents adapted to native editor controls, light/dark skins and docked density. Preserve requested brand and native property-field semantics. For multi-step tool UX, conditionally read [tool patterns](../tool-ui-design/references/tool-patterns.md).
4. Keep serialized paths, GUIDs, references, prefab override and multi-object behavior intact. Keep Runtime free of UnityEditor references. Use unity-editor-tooling/serialization guidance when installed for actual mutations; inspect local ownership even if those skills are unavailable. Bind events and scheduled work to the window lifetime; do not poll/repaint continuously for decoration.
5. Before importing icons/fonts/illustrations read [commercial assets](../tool-ui-design/references/commercial-assets.md). Native controls and a coherent permissive icon subset are preferred; verify renderer support before choosing SVG. Avoid custom fonts that impair native fields or glyph coverage.

## Verification

After C# changes refresh/compile, read fresh Console and run the smallest meaningful regression where available. Open the actual window/Inspector; check light/dark, narrow/normal/wide docking, target DPI, long labels, focus, close/reopen and relevant selection/binding/Undo behavior. Capture real editor renders using available tools and visual-review when installed. Never run another batch Editor on an already open project. If Editor execution is unavailable, report exact missing checks and degraded visual/compile evidence; static checks or generated previews cannot establish editor compatibility.

## References

- `references/editor-presentation.md`: native presentation, UI Toolkit/IMGUI boundaries and execution matrix.
- [Design foundations](../tool-ui-design/references/design-foundations.md): visual direction and semantic tokens.
- [Tool patterns](../tool-ui-design/references/tool-patterns.md): read only for workflow changes.
- [Commercial assets](../tool-ui-design/references/commercial-assets.md): read for added or redistributed assets.
