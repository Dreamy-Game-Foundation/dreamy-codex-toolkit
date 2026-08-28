# unity.ui-input-safearea

Runtime UI must account for input mode, touch behavior, focus, and safe area.

Use the project's existing UI stack and layout conventions.

When creating UI prefabs through MCP/editor automation, include the project's SafeArea component or safe-area container by default for full-screen, panel, popup, overlay, HUD, and mobile-facing prefabs. Omit it only when the prefab is a nested element whose parent already owns safe-area padding.
