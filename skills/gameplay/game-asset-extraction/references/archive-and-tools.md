# Intake and package extraction

Use a task workspace outside source/project trees: packages/raw, exports, reports and tools as needed. Do not mirror a private Downloads path or ship case assets with this skill. Read existing output state before any retry. Preserve source bytes, hash, package metadata, tool/version and output scope.

Inventory the supplied package first. XAPK is a ZIP-family container in the observed case; it contained base and ARM64 split APKs. Identify package/version and splits from its own manifest. Do not assume every XAPK has the same layout or contains every remote asset.

## Standard-library helper

Python 3.10+ is optional tooling for this workflow, not a toolkit-wide installation requirement. Resolve `scripts/` from this skill's directory; run `--help` without third-party dependencies.

```text
python scripts/extract_package.py SOURCE.xapk --output WORK/unpacked-xapk --dry-run
python scripts/extract_package.py SOURCE.xapk --output WORK/unpacked-xapk
python scripts/verify_manifest.py WORK/unpacked-xapk
```

The dry run inspects ZIP metadata and hashes the source, but creates no output. Extraction requires a fresh output; files go under `OUTPUT/files/`, separate from `inventory.json`, `manifest.jsonl` and `summary.json`. Nested APKs remain files. Extract a selected base/split APK in a second fresh directory when needed:

```text
python scripts/extract_package.py WORK/unpacked-xapk/files/base.apk --output WORK/raw-base --include-prefix assets/
```

Use actual split names from inventory. Pass repeated `--include-prefix` values for explicit scope. Byte limits default to 1 GiB per file and 8 GiB selected total; inspect declared size and free disk, then set task-appropriate limits. The helper rejects unsafe/nonportable paths, case collisions, file/directory conflicts, links, special/encrypted entries and size overruns before or during extraction. It never recursively runs payloads. It records successful partial outputs on failure; a failed or partial run is not complete.

Archive inspection and decompression are not a security sandbox. Analyze supplied files with bounded tools; target execution, network fetching, package installation or configuration mutation only follows the actual task scope. Do not scan unrelated installed apps to select a target.

## Route after unpacking

| Evidence | Route |
|---|---|
| `assets/bin/Data`, UnityFS header, `.assets`/resource sidecars | Unity reference |
| `libil2cpp.so` plus global metadata | Static backend evidence; code analysis remains separate from asset export |
| Godot PCK or another engine-specific format | Inspect an available format-aware reader and pilot it; no bundled universal extractor is claimed |
| Plain PNG/audio/fonts/JSON | Copy with provenance, validate the actual format |
| Unknown header/encryption/layout | Record unknown/unsupported and select a concrete alternative, without treating it as empty content |

REA can inventory/materialize formats its installed version actually supports. Reuse its session/evidence if selected; do not infer a Unity asset decoder from archive extraction. Keep any REA mode chosen in the task. Plain source projects, the tested ZIP helper and the tested Unity route do not require REA setup.

Prefer tool installations already present. If a tool must be acquired within task scope, use its official release, verify the published digest when available, keep it isolated and record provenance. This skill bundles helper source and a version pin for optional UnityPy, not binaries, game content or paid provider access.
