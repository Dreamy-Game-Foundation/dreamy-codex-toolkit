# TMP fonts and outline presets

Resolve the intended font from an explicit path, unambiguous Editor selection or supplied asset. Inspect the TMP font asset, atlas texture(s), shader, fallback chain and existing material presets. Do not infer the requested font only from its filename if multiple candidates fit.

Replace fonts only within the agreed scope, including inactive labels that belong to it. Preserve excluded nested widgets. An ExtraBold source font may not need synthetic Bold; inspect the render before changing style flags. Preserve meaningful italic, underline and other styles.

Clone a compatible base material from the chosen font or reuse an existing matching preset. Save a distinct asset for each requested appearance, with discoverable names such as '<Font> Outline Black'. Keep the atlas and shader settings compatible. Do not share a preset across unrelated font atlases or overwrite a shared preset used by other screens.

Inspect supported shader properties before setting face/outline color, width, softness or keywords. Different TMP shaders do not have identical outline support. Set face color explicitly if needed; retain intended text tint and inspect the combined result. Tune widths against visible stroke quality and padding rather than enforcing one numeric width on every font/size. Refresh mesh padding after material changes.

Assign the saved preset through the appropriate shared-material property. Avoid leaving transient per-text material instances as prefab references. Preserve TMP's fallback/submesh behavior for multi-atlas fonts. Verify saved references after reopening the asset.

Inspect final text at real sizes: outline cut-off at glyph edges, autosizing, wrapping, long names, numeric counters, EXP separators and background contrast. If Vietnamese or another locale is required, verify representative glyphs and diacritics against actual font/fallback support; the presence of a font asset does not prove coverage. Respect existing localization keys and text binding.

Do not bake sample player values into runtime logic. Report separately whether profile labels are static mock content or bound to live data.
