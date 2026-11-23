# Web presentation implementation

Inspect package/lock files, routing, UI primitives, CSS strategy, assets and project commands before editing. Keep the existing framework and component system. Do not install React, Next, Tailwind or a new design system simply because the visual reference uses one.

Build a semantic shell with readable content widths, type hierarchy and task-appropriate density. Use existing design tokens or add narrowly scoped semantic variables; check consumers before changing global values. Keep layout constraints explicit: wrapping text, flexible columns, overflow ownership and minimum widths. Tables may scroll where comparison requires it; unrelated page content should reflow.

Use native semantic controls first. Interactive components need accessible names, visible focus, keyboard support, correct disabled/busy states and associated validation. Dialogs/popovers need focus behavior and dismissal appropriate to the existing component library; reuse proven primitives rather than recreating complex keyboard interactions for decoration. Hover must not be the only way to discover an action.

Use the project's font loading policy and licensed subset if introducing a font. Check Vietnamese coverage, fallback layout, long strings and zoom. Keep text as text; image-based labels impair accessibility and localization. Add artwork only after structure reads clearly. Honor reduced motion and avoid animation that blocks action.

For browser operations, use the environment's available domain tool and read its instructions; no CLI/package is universally required. Start only the local server needed for the task, retain its process identity and clean up the process you own. Do not publish to obtain screenshots.

Acceptance: actual renders at representative supported widths (for a new web pilot, 390/768/1440 CSS px are useful starting probes), keyboard traversal, focus visibility, clipping/overflow, zoom/reflow, long and translated content, applicable loading/empty/error/selection states. Check contrast using real computed colors. Run relevant project checks and a targeted behavior regression if behavior changed; cosmetic edits do not need tests mirroring CSS constants.

Keep before/after captures source/state-bound and outside shipped assets. Report which viewport/state was inspected and what remains untested. Static HTML validation, an HTTP 200 or a generated mock image is not browser render evidence.
