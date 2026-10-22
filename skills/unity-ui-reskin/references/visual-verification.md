# Evidence for a UI reskin

Capture baseline bindings, relevant Console entries and working-tree state before changing the target. Preserve user edits, including staged changes. Record excluded assets/subtrees in enough detail to verify them afterward; hashes are useful when checking that source assets stayed byte-identical, but do not prove the nested instance received no overrides.

After saving, inspect the actual saved prefab rather than relying on tool success. Check missing scripts; required button/component references; persistent listeners; font, sprite and material references; nested overrides; state indicators and tween targets. Retain locked/available/claimed and selected/disabled affordances unless the requested design explicitly changes them. Decorative replacements must not block interactive raycasts.

Render the reference aspect and inspect the image. Compare hierarchy, alignment, texture proportions, text weight/outline, clipped glyphs, gaps, overlaps and layering. Do not use a full screenshot as a replacement for editable controls. Sample profile data and unwired controls must be identified in the handoff.

For other supported aspects, use the owning Canvas Scaler's actual conversion into logical units. Test a narrower and wider case plus relevant SafeArea insets. Bounds checks provide geometry evidence only. They do not prove visual fidelity, lack of overlap, readable labels or working hit targets.

Exercise relevant clicks, runtime state changes, entry transitions and reopen behavior when the change touches them. If that cannot be done, name the missing check instead of implying functionality was tested. Reskinning alone does not authorize hiding a control, disabling state behavior or changing navigation destinations.

Use supported capture tools when available. For isolated previews, keep temporary objects in a disposable preview context and close it afterward; do not save test scenes into production assets. Screen Space Overlay UI may not appear in a camera RenderTexture capture. Validate capture layers, camera/canvas configuration, frame timing, clear/background and render-pipeline behavior before diagnosing a blank image as a prefab defect. Check orientation against known text before diagnosing an upside-down capture as a layout defect. Do not change production transforms to compensate for a capture issue.

Store temporary evidence outside Assets or in an explicitly temporary project folder where possible. Clean up only task-owned artifacts; do not clear the user's Console, save unrelated scenes, or apply all prefab overrides.

Useful future evaluation scenarios (manual until an evidence-backed harness exists):

- A user changes Canvas Scaler midway through a reskin: re-read it, avoid double scaling and preserve the new settings.
- A popup has a nested excluded currency widget: restyle the popup, retain widget source/contents and navigation references, and check actual rendered text on narrow/wide aspects.
- A selected TMP font replaces all in-scope labels: save two atlas-compatible outline presets, preserve excluded text, and inspect inactive labels plus required localized glyphs.

Do not label these scenarios as passed merely because the skill document includes them. Report which scenarios were actually exercised and the evidence obtained.
