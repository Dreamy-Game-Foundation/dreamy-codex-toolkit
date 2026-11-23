# Shared interface design foundations

Read when choosing art direction, redesigning a surface or defining shared tokens. Preserve a supplied brand and existing design system. This is an original recipe inspired by public design principles, not a copy of a vendor's components, brand or tokens.

## Choose a direction

Default for unbranded tools: **Geist-inspired precise neutral**. Use clear type hierarchy, quiet surfaces, fine separators, consistent component geometry and purposeful contrast. Start with one emphasized action per task region; use accent for focus/selection or product identity, not every border. Light and dark are both valid; neither is imposed.

Sources checked 2026-11-23:

- [Geist](https://vercel.com/geist/introduction): consistent web experiences, contrast and component vocabulary. Learn principles; do not assume permission to copy brand assets or a component implementation.
- [Carbon table guidance](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): comparison, selection, toolbar and expandable detail for dense tools.
- [Material 3](https://m3.material.io/get-started): expressive typography, shape and motion where onboarding or product storytelling needs emphasis. Keep dense work areas calm.
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction): accessible primitives when the existing React stack fits; not a required dependency or finished art direction.

Public documentation is design evidence, not measured popularity or a blanket reuse license. Recheck version-specific implementation and asset terms when adopting material.

## Brief and token recipe

For substantial work write a short brief: user/task, host/viewport, chosen direction and rationale, density, brand exceptions, typography/icon family and required states. For a local edit a few sentences suffice.

Use semantic names so host skins can map differently:

| Token family | Purpose | Starting decision |
|---|---|---|
| background, surface, elevated | Page, work area, temporary surface | Few distinguishable levels; borders may separate same-color surfaces |
| text, muted, inverse | Hierarchy and readable labels | Muted still readable; critical data never disappears into gray |
| border, focus, selected | Structure and navigation | Focus is visible independently of hover and selection |
| accent, success, warning, error | Identity and feedback | State also has text/icon; accent is not synonymous with success |
| spacing, radius, type, density | Rhythm and controls | Start with 4/8/12/16/24/32 logical units and modest radii; adapt to host |

These are suggested relationships, not universal fixed colors. Define light/dark mappings deliberately rather than inverting hex values. Start with existing system fonts; consider a licensed sans family for web, native editor font for Unity, mono for paths/code/numeric detail. Check Vietnamese accents, long filenames and fallback metrics. Do not shrink typography merely to fit more data.

Use one icon family/weight with optical alignment at actual 16/20/24 sizes when appropriate. Icons accompany unfamiliar actions with text or accessible labels. Do not use emoji as a substitute for a coherent control icon set.

## Avoid the unfinished look

- Align related content and consistent baselines; use spacing to group rather than placing every field in a card.
- Distinguish title, section, body and metadata; emphasize what users decide, not every label.
- Keep radius, border, shadow and icon treatment consistent. Use effects only to explain hierarchy or interaction.
- Design empty, loading, error, selected and disabled states with realistic data; include a useful next step when available.
- Avoid repeated generic hero sections, excessive gradient blobs, gratuitous glass effects and unrelated stock art. Decoration is allowed when the brief benefits from it.
- On small screens/docks reflow or scroll appropriate regions; keep primary actions reachable. Dense interfaces need legible hit targets and keyboard navigation.
- Motion should acknowledge action and preserve orientation; do not delay repeated work. Respect reduced motion where available.

## Adapt to host and verify

Web uses CSS and semantic HTML; Unity uses version-supported USS/IMGUI and native controls; TUI uses character cells/ANSI and keyboard conventions. Share semantic intent, not unsupported renderer properties or identical pixel sizes.

Check actual renders for hierarchy, clipping, alignment, icon consistency, contrast and state clarity. Web contrast targets from [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/): normal text 4.5:1, large text 3:1, applicable non-text controls/indicators 3:1. A handful of checks does not prove full conformance. Keep visual evidence separate from compile/tests and usability hypotheses.
