# Verify extracted outputs

Receipt integrity is the first layer, not a substitute for decoding or import.

```text
python scripts/verify_manifest.py OUTPUT
```

The helper checks fresh producer summary, unique contained paths, file sizes and SHA-256, and rejects unresolved producer errors or an empty verified set. It reads recorded output only; it neither creates placeholder success nor launches Unity. Changing any exported file invalidates its original receipt. An interrupted run with no complete producer summary remains incomplete even if some files are intact.

## Format checks

Inspect exported VideoClip names as well as sprites when a source popup contains an instructional animation. A matching original clip can supply that media without inventing a replacement board. Record its decoded dimensions/duration, preserve aspect, mute only when that is the intended integration, and distinguish the clip's depicted game from the live reconstructed scene. The authored view owns any temporary render target and must stop/release it on hide, reopen and teardown. File validity, runtime playback and behavioral parity remain separate checks.

| Output | Check | Limit to state |
|---|---|---|
| PNG | Open dimensions and verify structure/CRC; inspect representative sprites/atlases | Valid file is not proof every crop/rotation/alpha matches gameplay |
| Mesh OBJ | Parse vertices/faces; open representative geometry and UVs | Geometry does not prove rig/material/reference recovery |
| WAV/audio | Read channels/rate/frames and full declared payload; listen when claiming sound quality | Byte validity is not an audible/mix review |
| Font | Check sfnt/CFF signature and representative glyphs where relevant | A 0×0 dynamic font texture is not missing font data |
| Video | Validate container, decode when tooling exists and inspect playback | A header-only check must be labelled header-only |
| JSON/TextAsset | Parse when actually JSON; preserve opaque bytes otherwise | Syntax and property names do not prove game semantics |
| Level groups | Count files against the supplied manifest; record mismatches | Shipped count does not cover undistributed remote content |
| Unity export | Check native assets/references, script/shader mode, version and manifest origin | Unity compile/play/build needs its own actual run |

Check source hash again after work. For expensive decoding/import or unusual formats, pilot before scaling. Do not hide unsupported types in a total-success count; distinguish exported, empty-source, retained/unselected, failed and unavailable content. Derived output counts from different tools can overlap and are not unique asset totals.

## Handoff

When continuing into UI authoring, inspect the selected sprite's native border and shape before choosing Image mode. Retain source IDs and copied-file hashes for added art, font/atlas/material and prefab bindings; do not modify source extraction to repair presentation. Similar filenames and duplicate exports do not establish the same asset role.

Duplicate display names can conceal different colors: the Pixel Flow export contained both purple and blue images named Popup_Section_Blue. A first-name match selected the wrong inset. Open the exact candidate, retain its object/file identity, and preserve the imported GUID when replacing only the selected image; update the receipt and inspect the resulting UI again.

For an explicitly requested REA investigation of stripped Unity logic, select the original global-metadata.dat and, only when needed, its matching native binary. Verify the installed package's Node engines, invoke its advertised CLI entrypoint, and require a nonempty Evidence export with artifact identity before claiming analysis ran. Exit code zero or an empty redirected stdout file is insufficient. Names and member ranges establish static structure, not recovered C#, field values, formulas or live behavior. Keep these reports outside runtime Assets and source assets outside the toolkit.

Create an individual asset JSON catalog after extraction, not merely a count or group summary:

```text
python scripts/index_assets.py --input EXPORT_ROOT --output CATALOG.json
python scripts/index_assets.py --output CATALOG.json --verify
```

Output must be outside the indexed source tree and must not already exist. Optionally supply `--object-receipts OBJECTS.jsonl` where each output path is relative to EXPORT_ROOT. The helper preserves failed/empty/retained object status without manufacturing files, reads `.meta` headers and receipt metadata, and never loads asset bodies. Reused producer hashes are explicitly not recomputed. A missing recorded output fails link validation. The game's workflow should enrich selected records with role → source ID → imported path/GUID → prefab/component → capture/integration evidence. Keep all unselected exported files discoverable too.

Deliver source/package identity, tools/versions and release digests when acquired; raw/source location; exported content index and receipts; valid/failed/empty/unexamined counts; actual format checks and representative visual/audio review; native project location when produced; dummy script/shader and unresolved import/dependency work; and exact not-run checks.

Keep game assets and private evidence in the task workspace. Share only source-free summaries/fingerprints in the toolkit. When continuing into a clone, pass the individual asset catalog, groups and limitations to `game-vibe-workflow`; require fresh engine evidence for the representative integration, and player evidence only when builds are permitted. Exact whole-game clones also require full brief/web/screenshot coverage before parity implementation. Extraction does not prove a runnable or faithful game.
