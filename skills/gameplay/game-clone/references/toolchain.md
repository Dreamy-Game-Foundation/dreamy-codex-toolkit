# REA and AssetRipper toolchain

## Ownership and prerequisites

Both tools are external analysts/exporters. Neither belongs in the game's runtime dependencies. Installing `game-clone` supplies instructions, not binaries, provider engines, an MCP registration or an entitlement to tool features. Reuse tools already present. Setup/downloads occur only within the requested setup scope; never upgrade global Node, rewrite Codex config or replace the independent REA skill merely to activate a clone workflow.

Record readiness separately for the executable/package version and digest, Node/runtime, CLI, MCP, native provider and Unity Editor. A successful CLI command does not establish MCP connectivity. Inspect live schemas/`--help`; pinned source can differ from installed releases. For a missing REA connection, read upstream recovery guidance when available and the existing [REA guide](../../game-vibe-workflow/references/rea.md). Preview configuration changes before applying changes already authorized by the task. Use task-local tool directories where needed.

REA modes retain their established meanings: `off` prohibits discovery/setup/analysis; `auto` investigates only concrete gaps; `required` needs actual REA-backed evidence. An explicit request to use both repositories requires a result or an unresolved status for each track. If the user later disables REA, update the contract rather than overriding that choice. Preserve independent asset/integration progress when one track cannot run.

## Source inventory and export

Use [extraction intake](../../game-asset-extraction/references/archive-and-tools.md) and the existing helpers for package inventory, hashes and fresh outputs. Detect Unity from actual headers/layout. Retain split APK/data packs and `.resource`/`.resS` sidecars and bundle dependencies. Missing downloadable assets are uncovered data, not an empty successful export.

For AssetRipper use [Unity export](../../game-asset-extraction/references/unity-export.md). Before export, resolve the absolute input, workspace and destination; verify the destination is a new path under the selected task workspace, outside source and target project. Reject existing destinations before invoking an exporter that may delete them. A source hash is rechecked after work.

Start with a bounded pilot of representative texture/sprite, mesh/material and prefab/scene content where present. Inspect media and dependency links, stdout/logs, files and errors. HTTP redirects or exit zero alone do not prove export success. Store original exports separately from fixed/imported derivatives. Keep dummy code/shaders, missing streams, empty runtime textures and unsupported layouts as distinct results. UnityPy is a scoped alternative when suitable, not evidence that a required AssetRipper run occurred.

If starting a task-owned loopback exporter on Windows, launch hidden, retain PID/executable identity and stop that process after requests finish. Do not kill other exporter instances. After timeout, inspect process/job/output receipts before retrying. Never clear output or rerun an uncertain export just to get a cleaner report.

## Route the code question

| Artifact/question | Route | Limit |
|---|---|---|
| Complete source | Ordinary source inspection/tests first | No mandatory REA readiness calls in auto mode |
| Unity Mono assemblies | Advertised managed metadata/member/CIL analysis | Decompiled output is not original source or execution |
| Unity IL2CPP metadata | Advertised metadata inspection, then focused type/method/string queries | Names/layout do not establish gameplay rules |
| Metadata plus selected native binary | Verify both identities; optional supported linking and focused native provider | Shared/inferred addresses and same-build pairing remain explicit |
| Native behavior question | Available native analysis; runtime only for requested operations | Provider readiness and host support must be demonstrated |
| APK Java/Kotlin/JNI | Available Android tools with matching prerequisites | JADX does not reconstruct Unity IL2CPP gameplay |

Ask one implementation-relevant question at a time. Retain full Evidence or a saved bundle, its ID/digest, input identity, locations, tool/provider version, coverage and unknowns. Distinguish static interpretation from a runtime capture. Keep raw reports outside game `Assets`; new code implements established behavior through the project's owners. If a provider times out, use that version's recovery guide before retrying unchanged analysis.

## Maintained provenance

Reuse these pinned source records in `docs/research/source-ledger.json` rather than copying upstream implementations:

- `game-vibe-rea`: [REA 96ea32b7](https://github.com/morluto/rea/tree/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9), routing/managed/metadata and installation contracts.
- `game-vibe-rea-static-20261026`: [REA 1173c0a9](https://github.com/morluto/rea/tree/1173c0a9dc1b352a60943a491462294db8f353ae), existing static metadata case; does not validate native execution or MCP.
- `game-assets-assetripper`: [AssetRipper bb5f08ac](https://github.com/AssetRipper/AssetRipper/tree/bb5f08ac061d43f85ae14386009b58b93b95156c), CLI/loopback export and destination behavior.

These are historical inspected contracts. Record the actual chosen package/binary in every new run, check current prerequisites at execution time, and keep this skill experimental until the claimed workflow has corresponding evidence. No game assets or third-party binaries are packaged with the toolkit.
