# Unity Editor presentation

Inspect ProjectVersion, manifest/lock, asmdefs, existing inspectors/windows and the target version's actual APIs. [Unity USS documentation](https://docs.unity3d.com/6000.0/Documentation/Manual/UIE-USS.html) explains the system for that documented version; it is not proof of execution in the target project.

## Choose and preserve the renderer

- New window: consider UI Toolkit when the target and project conventions support it. Use existing UXML/USS/C# separation or the established code-driven approach; no forced scaffold.
- Existing IMGUI: scoped hierarchy, grouping, spacing and control consistency improvements may be sufficient. Do not migrate for visual polish alone.
- USS is not CSS. Verify properties, selectors, transitions and layout features against the actual Unity version. Match semantic tokens without promising browser effects, SVG support or custom font support.
- Prefer native property/object/enum/numeric fields where appropriate. Maintain multi-object editing, prefab overrides, mixed values, validation and serialized binding. Do not replace a bound field with a pretty unbound control.
- Use native skin/font behavior as the base; avoid global Editor theme modifications. Style only owned surfaces; avoid brittle private internal class names.

## Layout and lifecycle

Give frequent work a compact toolbar, a clear content region and an inspector/detail region only if needed. Adapt when docked narrow: wrap/reflow or scroll the right region while keeping actions reachable. Check long paths, large values and localized labels. Favor tooltips and copy actions for truncated paths without hiding identity entirely.

Keep state and handlers owned by the window. Avoid duplicate subscriptions on rebuild/reopen; detach handlers and scheduled work on the appropriate lifecycle boundary. Persist only intended preferences through the project's existing owner. Animation must not create permanent idle polling/repaint.

For data changes, preserve the existing SerializedObject/property flow, Undo, dirty/save and refresh contract. Never blindly edit prefab/scene YAML or regenerate GUIDs to make a UI change. Runtime assemblies must not reference UnityEditor.

## Verify in the Editor

Select the correct project/instance. Inspect → mutate narrowly → save → refresh/compile → read fresh Console → reopen/inspect. Do not start a second batch Editor on a project already open. Run the smallest relevant test when behavior, serialization or lifecycle changed.

Inspect actual light/dark renders and narrow/normal/wide docked widths at target DPI. Check focus, text clipping, control hit regions, selected/mixed values and applicable disabled/error state. Close/reopen and test domain reload where relevant. If a custom Inspector changed, check multi-selection, prefab override and Undo through a real edit where supported.

Report compile, Console, tests and screenshot observations separately. If Unity is unavailable, give the missing operation and reason and limit the claim to static inspection; an HTML mockup does not establish Unity compatibility or editor appearance.
