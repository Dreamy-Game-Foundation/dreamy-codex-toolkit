# Pixel Flow: observed case and limits

Observed 2026-10-24 from an owner-supplied `Pixel+Flow!_0.36.3_APKPure.xapk`, SHA-256 `ad7b8a8f7659ec86a583976e466458b69fd58f08f2667f6f17925fa570e9bad2`. Original task outputs remain local; no APK, assets, game code or absolute personal paths are bundled here. Source-free evidence is retained in the toolkit's `docs/evidence/game-asset-extraction-pixelflow.json`; local receipt fingerprints are recorded in the source ledger.

The XAPK had base and ARM64 split APKs. UnityFS headers recorded Unity 6000.0.58f2; native files and global metadata established IL2CPP packaging. UnityPy 1.25.4 and AssetRipper 2.0.0 ran locally without launching/installing the game. AssetRipper's download digest matched its release record.

## Retained observations

- Portable output: 1,215 sprites, 726 textures, 439 meshes, 154 audio clips, 10 videos, 15 fonts and 12 TextAssets, plus serialized data exports.
- Level output: 3,117 `gzip:` base64 JSON definitions in 22 groups; all group counts matched their manifest, plus one plain manifest JSON.
- Native project output: 460 prefabs, 4 scenes, 1,016 materials. Exported scripts were dummy classes and shaders used Dummy mode.
- Format/receipt checks: 1,941 PNGs, 439 OBJs, 154 WAV payloads, 15 font signatures, 4,187 JSON documents, 10 video container headers, 3,640 output receipts and unchanged original XAPK hash. Video full decode, listening to all audio, Unity compile/play/build and gameplay equivalence were not run.
- Fifteen initial texture read exceptions were diagnosed individually: all were 0×0 `Font Texture` objects with zero inline and streamed pixels. Re-reading them exercised the corrected empty-source guard; no image was fabricated. The original exception history and resolution record were both retained.

The generalized helper scripts are derived from this method and use parameters/fresh outputs, not the case's paths. Their synthetic regression tests and small real-source pilots are separate evidence from the original full extraction. One successful game/version does not establish every Unity release, custom bundle, protection scheme or other engine.

## External sources

- [UnityPy](https://github.com/K0lb3/UnityPy): supported object interfaces; the installed case used version 1.25.4. Its optional dependency stays pinned in `scripts/requirements-unity.txt` until deliberately updated and verified.
- [AssetRipper 2.0.0 release](https://github.com/AssetRipper/AssetRipper/releases/tag/2.0.0): acquired Windows x64 archive, SHA-256 `9a7ef0e7c5c3ea5b90b4e6d855e2d98d5f7ec8c3f9e26fccbc194c6a7b01baf7`.
- [Arguments](https://github.com/AssetRipper/AssetRipper/blob/bb5f08ac061d43f85ae14386009b58b93b95156c/Source/AssetRipper.GUI.Web/Arguments.cs), [routes/launcher](https://github.com/AssetRipper/AssetRipper/blob/bb5f08ac061d43f85ae14386009b58b93b95156c/Source/AssetRipper.GUI.Web/WebApplicationLauncher.cs), [commands](https://github.com/AssetRipper/AssetRipper/blob/bb5f08ac061d43f85ae14386009b58b93b95156c/Source/AssetRipper.GUI.Web/Pages/Commands.cs), [export behavior](https://github.com/AssetRipper/AssetRipper/blob/bb5f08ac061d43f85ae14386009b58b93b95156c/Source/AssetRipper.GUI.Web/GameFileLoader.cs): inspected source at the pinned revision, corroborated by actual CLI/local API calls in the case.
- Optional [REA source](https://github.com/morluto/rea/tree/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9): container/analysis alternative, not executed in this case and not a Unity exporter dependency.
