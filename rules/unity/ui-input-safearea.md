# unity.ui-input-safearea

Runtime UI must account for input mode, touch behavior, focus, and safe area.

Use the project's existing UI stack and layout conventions. For UI prefab presentation changes, follow `unity-ui-responsive` for responsive repairs and the detailed SafeArea policy. Retain SafeArea inclusion with full-bleed backgrounds outside the inset subtree; reuse an existing parent owner to avoid double insets. This is agent guidance, not an automation hook.
