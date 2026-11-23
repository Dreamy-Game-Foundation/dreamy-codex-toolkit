---
name: frontend-design
description: Design and implement polished websites and web app presentation on the existing stack, including responsive layout, typography, interaction states and visual verification. Use tool-ui-design for tool workflow decisions and existing Unity UI skills for in-game interfaces.
---

# Frontend Design

## Scope

Own web presentation from brief or existing screen to working components. Preserve requested brand, framework, content and business behavior. A small styling task does not authorize a full redesign or new backend.

## Decisions

1. Inspect instructions, package/lock files, routes, shared components, styles and available browser tooling. Capture the existing screen when possible; identify concrete hierarchy, spacing, density or interaction defects. Separate observed issues from hypotheses.
2. For a new or substantially redesigned surface, read [design foundations](../tool-ui-design/references/design-foundations.md). Default to a Geist-inspired neutral direction when no brand is specified; describe a short rationale and adapt it to the product. Existing brand and explicit preferences win. Reference principles without copying brand assets or assuming the Geist site is an installable library.
3. Read `references/web-implementation.md` for renderer decisions. Reuse the current component system and stack. Tool/dashboard task flows belong to tool-ui-design; load its patterns only when information architecture or workflow changes, not for every web component edit.
4. Implement useful layouts and real states with semantic tokens. Prioritize typography, alignment, information hierarchy and readable density before decorative art. Keep working actions and original behavior; mark unavailable functionality honestly rather than adding fake success feedback.
5. Before introducing external icons, fonts, stock images or generated artwork, read [commercial assets](../tool-ui-design/references/commercial-assets.md). Use one coherent icon family. Generate bitmap art only when it improves the requested surface and a suitable authorized tool is available; use vector/code for ordinary UI structure.

## Verification

Run the project's relevant checks; inspect actual browser renders at supported small/medium/large widths and applicable loading/empty/error/selected states. Test keyboard/focus, labels, long content, Vietnamese glyphs when relevant, zoom and reduced motion. Fix visible in-scope defects and recapture. Prefer available domain browser tools; follow their instructions before capture. Use visual-review when installed to manage screenshots; otherwise store them outside product assets and return accessible image links. Report static, behavior and visual evidence separately. Missing browser capability means visual verification is degraded, not passed; generated mockups never prove a running UI.

## References

- `references/web-implementation.md`: read for responsive components, interaction and web acceptance.
- [Design foundations](../tool-ui-design/references/design-foundations.md): read when choosing or changing art direction/tokens.
- [Commercial assets](../tool-ui-design/references/commercial-assets.md): read before introducing assets or preparing a commercial handoff.
