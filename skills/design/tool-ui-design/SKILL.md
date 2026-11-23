---
name: tool-ui-design
description: Design usable, polished tool workflows such as dashboards, asset browsers, configuration and batch operations within the existing web, native or terminal host. Use frontend-design or unity-editor-ui for platform presentation; excludes isolated logic fixes and in-game HUD layout.
---

# Tool UI Design

## Scope

Own task flow, information architecture, density and feedback in working tools. Keep the existing host and business authority. A tool may be web, native, Unity Editor or TUI; appearance work does not authorize changing that platform.

## Decisions

1. Inspect current source, instructions, users, frequent tasks and representative data. Capture current states where available. Describe concrete problems and the primary user action before choosing a layout; for a narrow edit, keep this brief.
2. Read `references/tool-patterns.md` when changing workflow or layout. Choose tables for comparison, list-detail for browsing/editing, forms for configuration and wizards only for genuinely dependent steps. Preserve selection and context through filters, refresh and failure. Do not replace dense data with unrelated cards.
3. Read `references/design-foundations.md` when establishing or revising visual direction. Default to Geist-inspired neutrals, restrained borders, explicit hierarchy and a limited accent, adapted to the host. Preserve existing brand; terminal tools retain terminal semantics, keyboard behavior and character layouts.
4. Separate presentation from actions and data ownership. Show validation at the field and actionable failure near the operation. Represent actual progress, partial outcomes and availability. Cancel/retry/undo require underlying support; a decorative button must not imply a capability. For web rendering use frontend-design when available; for Unity Editor presentation use unity-editor-ui. Do not load unrelated renderer guidance.
5. Read `references/commercial-assets.md` before adding assets or preparing redistribution. Prefer native controls, one icon family and clear text over decorative images in dense workflows. Keep generated/stock assets consistent and traceable.

## Verification

Exercise the primary task, relevant filter/selection transitions, empty/loading/error and long/dense content with real or clearly labeled fixture data. Check keyboard operation and recovery paths within scope. Capture and inspect the actual host at representative sizes; use visual-review when available for evidence storage. Report implementation checks separately from rendered results and user testing. No screenshot, source review or text benchmark alone establishes complete usability or commercial readiness. If a host is unavailable, finish safe work and identify the missing execution gate.

## References

- `references/tool-patterns.md`: task structure, state and density decisions.
- `references/design-foundations.md`: shared visual language and host-specific adaptation.
- `references/commercial-assets.md`: icon/font/image selection, generation consistency and distribution rights.
