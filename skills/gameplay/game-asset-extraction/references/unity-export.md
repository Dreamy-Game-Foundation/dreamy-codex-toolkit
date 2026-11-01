# Unity assets and level data

Detect the version from actual bundle/serialized headers. A player build usually lacks original Packages/lockfiles and authoring settings. Exporter-created settings are derived artifacts, not proof of original package composition or a working renderer. Preserve all selected `.resource`/`.resS` sidecars and bundle dependencies before decoding media.

## UnityPy: portable content

The optional helper targets UnityPy 1.25.4, the version used in the observed case. It does not install packages. Use an existing compatible isolated environment, or create one within task scope:

```text
python -m venv WORK/tools/pyenv
WORK/tools/pyenv/Scripts/python.exe -m pip install -r scripts/requirements-unity.txt
```

On POSIX the interpreter is `WORK/tools/pyenv/bin/python`. `uv` can substitute when already available. Do not change the toolkit's npm dependencies or install Python libraries globally.

Supply explicit data/bundle/resource files, repeating `--input`; avoid loading an entire folder full of unrelated SDK/code/level files. Start with a bounded pilot:

```text
python scripts/export_unity.py --input RAW/assets/bin/Data/data.unity3d --input RAW/assets/bin/Data/resources.resource --input RAW/assets/bin/Data/sharedassets1.resource --output WORK/pilot --type Texture2D --type Sprite --type Mesh --type AudioClip --per-type-limit 2
python scripts/verify_manifest.py WORK/pilot
```

Use actual sidecar names. After the pilot, select a fresh full-output directory, omit the type/limit options if every supported type is needed, and add relevant Addressables bundles/default resources explicitly. Dependency resolution and coverage must be checked rather than inferred from an export count.

The helper emits `files/TYPE/COLLECTION/NAME__OBJECT_ID`, per-object `manifest.jsonl` and a `summary.json` with input hashes, Unity versions, attempted scope and errors. Collection IDs and object IDs preserve duplicate names. Unsupported object types remain recorded as retained in source. `--per-type-limit` bounds attempted objects, including empty ones, not just successful outputs.

Outputs: PNG textures and cropped sprites; OBJ geometry; audio samples; embedded TTF/OTF; video stream bytes; TextAsset bytes; serialized JSON for material/animation/controller/atlas/physics material. JSON may encode binary fields explicitly as base64. Mesh OBJ does not preserve a rig or automatically relink Unity materials. JSON does not wire a playable prefab/controller. Custom MonoBehaviour schemas and original C# are outside this helper.

An empty runtime font texture was observed as 0×0 with zero inline/streamed pixels. The helper records `empty_runtime_texture` and creates no replacement. Do not use this classification for a nonempty source with missing resource bytes, a decoder error or an unsupported texture format. Failures stay in the manifest and make status `partial`/exit 2.

## AssetRipper: native project structure

Use when scene, prefab, material and native serialized asset structure is requested. The observed AssetRipper 2.0.0 Windows release supported a loopback web UI with `--headless`, `--port` and `--log-path`. Recheck the chosen binary's `--help`, logs and API/routes; do not assume every release has identical flags.

In the observed version, POST `/LoadFile` accepted repeated form `Path` values for selected APKs, and POST `/Export/UnityProject` accepted `Path` plus `CreateSubfolder=false`. A 302 response means redirect, not proof of a usable project: inspect logs, actual files and failures. Preserve operation receipts.

The headless exporter can delete an existing nonempty destination. Before calling it, resolve the absolute export path, verify it is within the intended task workspace and require a fresh/absent destination. Never pass a source folder or a broad Downloads/Documents directory. Run a task-owned helper server hidden on Windows, bind loopback, retain PID/executable identity, and stop only that process after all requests finish.

Pixel Flow's export contained dummy script classes and Dummy-mode shaders. Preserve the original export and report those limits. Script count, `.meta` files, a package manifest or ProjectVersion.txt do not establish script recovery, Unity import/compile or game behavior. Restore code/rendering only as a separate requested phase.

## Compressed level JSON

If a sample is plain JSON or literally `gzip:` followed by base64, the standard-library decoder can preserve paths and decode it:

```text
python scripts/decode_levels.py RAW/assets/Levels --output WORK/decoded-levels
python scripts/verify_manifest.py WORK/decoded-levels
```

The decoder has a configurable 32 MiB decoded-per-file guard and reports malformed/unsupported files individually. It does not guess compression/encryption or assume Pixel Flow keys. Compare decoded count with the game's actual manifest and group definitions separately. Keep JSON validity, schema/parameter interpretations and gameplay verification distinct.
