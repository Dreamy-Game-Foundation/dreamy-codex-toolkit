---
name: game-asset-extraction
description: Extract assets and level data from a supplied game package or Unity build, with source-preserving unpacking, format-aware export and verified receipts.
---

# Game Asset Extraction

## Scope

Use when the user requests game asset extraction (including "duc asset" / "đục asset") from a selected APK/XAPK/ZIP, build folder, bundle or data file. A package path supplied after an extraction request selects that input. Preserve it and export to a separate fresh workspace. Asset generation, ordinary source edits, unrelated installed-game searches and code/gameplay reconstruction belong elsewhere.

## Decisions

1. Resolve the exact input, requested content and destination from the task. Inventory package entries, sizes, split packages, engine headers and source hash before conversion. Do not execute the game to inspect it. Read `references/archive-and-tools.md` for intake and the standard-library package helper.
2. Choose by bytes/layout, not extension alone. Unpacking an APK does not decode Unity assets. For Unity use `references/unity-export.md`: AssetRipper for native asset/prefab/scene structure, UnityPy for selected PNG/OBJ/audio/font/video/TextAsset/serialized data. Keep raw resource sidecars and separate reports. Other engines need their own demonstrated reader; unsupported/encrypted input stays explicit rather than producing an empty success.
3. Pilot a few representative objects with the actual tool/version before broad export. Use local/task-isolated dependencies and inspect existing tools first. Do not auto-install global software, register REA or add game assets to the toolkit. REA is optional for a specific container/behavior question; it is not needed for the demonstrated Unity route, and an explicit REA-off choice remains effective.
4. Use the helpers only for their supported operation: `scripts/extract_package.py` for ZIP-family inventory/extraction; `scripts/export_unity.py` for explicit Unity data/bundle/resource files; `scripts/decode_levels.py` only for observed plain JSON or `gzip:` base64 data. Decode a small sample, preserve relative paths and compare counts with the selected game's actual manifest/schema. Pixel Flow's level fields/counts are not universal.
5. Persist inputs/hashes, tool versions, selected scope, source object IDs, output paths/hashes, failures and unavailable data. Inspect an existing partial run before retrying; helpers refuse existing output directories. A source Texture2D with zero dimensions and no pixels is empty runtime data, not an image to fabricate. A missing resource stream is a different failure.
6. After export, create a JSON catalog linking every exported asset file, including unselected content, using `scripts/index_assets.py` or the project's richer producer index. Preserve stable IDs, paths/URIs, type, bytes, GUID/source-object IDs, receipt hashes or explicit unread status and failure/retained state. Read metadata first, validate every link, then add selected runtime binding mappings. For a clone, hand this catalog to `game-vibe-workflow`; suitable source assets should become complete functional screens/gameplay, not remain unused beside placeholders.

## Verification

For requested REA metadata analysis, read `references/validation.md`; verify actual Evidence before claiming success.

Run `scripts/verify_manifest.py OUTPUT` for helper receipt integrity, then the format checks in `references/validation.md`. Inspect representative art, mesh and motion/audio where claimed. Verify source identity after work. Treat extraction, Unity import, compile/play/build and gameplay fidelity as separate results. Dummy scripts/shaders and JSON dumps do not establish recovered logic or a runnable project. Preserve open failures and stop task-owned background tools by verified PID after completion.

Run `scripts/index_assets.py --input EXPORT_ROOT --output CATALOG.json` and `--output CATALOG.json --verify` for per-file links. Optional `--object-receipts OBJECTS.jsonl` uses root-relative producer `outputs` paths; keep source metadata status and unexported objects. This metadata-only check reuses recorded hashes; it does not recompute heavy asset hashes or prove imports/media correctness.

## References

- Intake, fresh outputs and tool boundaries: `references/archive-and-tools.md`.
- Unity export, isolated setup and CLI examples: `references/unity-export.md`.
- Media, count and handoff checks: `references/validation.md`.
- Observed Pixel Flow results, source links and limits: `references/pixel-flow-case.md`; load for that case or its demonstrated empty-texture failure.

After extraction, hand asset groups, receipts and unresolved import/material/code work back to the game's workflow when requested. Extraction alone does not authorize building, publishing or redistributing a clone.
