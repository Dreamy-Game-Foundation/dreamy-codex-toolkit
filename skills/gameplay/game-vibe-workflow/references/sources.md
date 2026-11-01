# Sources and maturity

## Owner-supplied Oldcraft report

The workflow was synthesized from the World of Oldcraft Report/build kit supplied by the owner: 74 text files, 767,335 bytes reviewed in the original analysis. Images/videos/archive contents were excluded. The report's `brief.html`, `result.html`, `stats.html`, kit `Docs/TASK.md`, `CLAUDE.md`, `Docs/PIPELINE_LESSONS.md`, animation workflows, receipts/helper source and skills provided the main lessons.

Reported useful outcomes: playable greybox before dressing, one character through the pipeline before expansion, saved job IDs across interruption, fixed cameras plus outcome probes, portable export checks and explicit source/export/runtime distinctions. Reported failures: old collision after replacing art, stale prefab/controller bindings, minimap cost, animation contacts, resource pressure and a shader missing only on normal player launch.

The report also states the M4 gate was not run, some final rig/audio checks remained open, automated play-throughs were not human testing and the owner steered the run repeatedly. This skill does not claim fully unattended production, measured game quality or a newly reproduced Unity result. It packages decisions and evidence requirements, not source assets or historical account configuration.

The local report is not required after installation. Selected source hashes and the REA revision are retained in the toolkit's source ledger; the skill has no links to a private Downloads path.

## REA source snapshot

Inspected 2026-10-23 at commit `96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9`. The adapter summarizes contracts in original wording; no upstream implementation or complete skill is vendored, installed or executed.

- [README](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/README.md): purpose, optional providers and target types.
- [Upstream skill](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/.agents/skills/reverse-engineer-anything/SKILL.md): skip REA for full-source architecture analysis; route by evidence need; connection and scope.
- [Installation](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/docs/installation.md): setup preview, client configuration and main/release distinction.
- [Package](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/package.json): source version 6.7.0 and Node engines, not registry/install verification.
- [Managed analysis](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/docs/managed-code-analysis.md): metadata/CIL and coverage limits.
- [IL2CPP guide](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/docs/il2cpp-metadata.md) and [tool contract](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/src/contracts/il2cpp/il2cppToolContracts.ts): static metadata, optional binary links, unknowns and unsupported inputs.
- [CLI implementation](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/src/cli/il2cppCommands.ts): CLI/MCP share inspection with explicit evidence delivery.
- [Windows Ghidra](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/docs/windows-ghidra-p0.md): experimental host/provider restrictions.
- [Evidence workflow](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/.agents/skills/reverse-engineer-anything/references/evidence-workflows.md): evidence IDs, retained views, coverage and finite reconstruction claims.
- [License](https://github.com/morluto/rea/blob/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9/LICENSE): REA-authored code under MIT; no transfer of target/provider rights.

## Evidence status

2026-10-26 operational follow-up: source commit `1173c0a9dc1b352a60943a491462294db8f353ae` was cloned and selected README/package/IL2CPP/CLI/skill contracts inspected. npm rea-agents6.8.0 was run through its advertised scripts/rea.mjs entrypoint with isolated Node24.22.1. Metadata-only inspection of the owner-selected Pixel Flow artifact produced Evidence; selected member names informed the next investigation plan, not recovered formulas. No native decompiler, runtime target or REA MCP registration was used. Source-free receipt: `docs/research/rea-pixelflow-static-20261026.json` in the toolkit repository. Source assets and raw37MB Evidence remain in the game workspace. The earlier pinned source review above is historical and did not execute REA.

The owner requested a stricter exact-whole-game branch and required applying it to Pixel Flow before toolkit promotion. The concrete project preparation ran first: per-file/exported-object JSON catalogs, full surface/state inventory, public web research, inspected source screenshots/video frames, source YAML/GUID investigation and source/candidate gap comparisons. The source-free receipt is `docs/evidence/exact-clone-pixelflow-preparation.json`. It records missing target-version states and substantial existing UI divergences; no completed faithful clone, new Unity/game build, live backend integration or general model semantic validation is claimed.

Owner feedback on the Pixel Flow checkpoint (2026-10-24) exposed an application gap: a short brief and a working rule slice did not provide the source build-kit's detailed journey, screen/state, reference-role and fidelity contracts. The input-pack reference and task template make that intake explicit. This is a documented process correction; new specifications do not establish visual/feel acceptance or a measured behavioral improvement of the skill.

Observed: repository contracts/docs and source report content. Proposed: reusable milestones, independent sourcing/intent axes, off/auto/required adapter policy, 2D/other-engine extensions and bounded delivery. Not established: live REA installation/provider/Unity integration, game fidelity/performance or semantic improvement of this skill. Catalog cases specify expected decisions; structural tests do not establish those decisions were produced by a model.
