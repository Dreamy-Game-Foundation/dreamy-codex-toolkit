# Commercial asset selection and generation

Read before introducing icon/font/image assets or handing off a product/template for distribution. These are selection rules, not a blanket legal clearance for a provider or asset.

## Select for the actual distribution

Distinguish internal use, embedding in a commercial app and redistributing editable source/templates/assets to buyers. Check the exact downloaded file/package version and license/terms for the intended distribution. A free download or commercial-use label does not by itself permit resale as an asset pack. Public reference screenshots do not grant rights to copy their art or trademarks.

Prefer existing cleared project assets → coherent permissive icon/font subset → original vector/code → generated illustration when useful → suitable stock. Do not add an image where typography and native controls solve the task.

Sources checked 2026-11-23; recheck actual downloaded versions and provider terms when using:

| Source | Selection guidance |
|---|---|
| [Lucide](https://lucide.dev/license) | Default neutral tool icon candidate; ISC plus notices for inherited Feather icons under MIT. Retain applicable copyright/license notices, including for subsets/conversions |
| [Phosphor](https://github.com/phosphor-icons/core/blob/main/LICENSE) | MIT alternative when the required weight/style fits; retain notices; choose a family instead of mixing unrelated icon styles |
| [Google Fonts](https://developers.google.com/fonts/) | Check each family/version's license, embedding/redistribution/modification conditions and any Reserved Font Names. Check Vietnamese glyphs and fallback; do not assume every Google brand font is available |
| [Kenney](https://kenney.nl/support) | Asset-page packs are described as CC0; verify the specific pack's included license and style fit rather than treating all website content as assets |
| [Unsplash](https://unsplash.com/license), [terms](https://unsplash.com/terms) | Optional photography; check the particular service/image and intended use. Do not default to redistributing stock in sold source packs; evaluate subject/brand rights as relevant |
| Original/generated art | Keep provenance; generated output is not automatically CC0, exclusive or cleared. Check provider/plan terms at generation time and rights to reference inputs |

Prefer locally shipped assets when offline tools need them; preserve the project's loading policy. A change of file format or an SVG-to-PNG conversion does not remove the original license. Native Unity icons may have separate distribution constraints; do not extract them into a resold cross-platform icon pack by default.

## Record what is actually shipped

Reuse the project's asset ledger; if absent and assets are introduced, create `design/asset-manifest.json` or the repository-appropriate equivalent. No empty manifest is needed for a CSS-only task. Record per asset:

- Local path, hash and modifications, author when known.
- Source URL and version/commit or download date; license/terms URL and local notice/license path.
- Intended use/distribution, assessment and required attribution. Unknown rights remain unknown; replace or omit that asset from the deliverable rather than silently clearing it.
- For generated art: provider/model/date, recipe or prompt, reference input provenance and recorded terms/usage assessment. Do not include secrets or private prompts in public notices.

Keep required license texts/notices in the distribution, for example through the repository's `THIRD_PARTY_NOTICES.md`. The repo's own MIT license does not relabel third-party artwork/fonts. Templates sold with source require a fresh look at redistribution, not only runtime embedding.

## Generate a coherent set when needed

Define a recipe: palette, stroke/shape, perspective, material/light, detail density, background/alpha, aspect ratio and output sizes. Reuse an approved key visual as reference when the tool supports it. Record provider/version and seed if available, without promising deterministic generation across versions.

Prefer vector families for CRUD/navigation icons; use bitmap generation for hero art, empty-state illustration or textures when the task benefits. Follow the image tool's actual instructions and authorization. Do not invent a provider API or add a paid service. If generation is unavailable, use an appropriate original SVG/code/native-control fallback and report the limitation.

Keep UI labels as editable text. Inspect actual-size readability, silhouette, alpha edges, light/dark backgrounds and compression; preserve editable/original sources when needed. Generated mockups communicate a concept, never verification of implemented UI.
