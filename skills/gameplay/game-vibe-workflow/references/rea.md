# Optional REA investigation

REA is an external analysis tool, not the game engine, asset generator or a dependency of this toolkit. The initial adapter was source-reviewed against [morluto/rea at 96ea32b7](https://github.com/morluto/rea/tree/96ea32b7e4e28d3c9cd79a1de4b8e1ba3b4244e9), without executing REA at that stage. A later static CLI case is recorded below. Recheck the installed version and advertised schemas; repository main and an npm release can differ.

## Select the mode

An owner-requested Pixel Flow investigation later ran the npm6.8.0 CLI with an isolated Node24.22.1 on Windows, after inspecting source commit1173c0a9dc1b352a60943a491462294db8f353ae. Built-in IL2CPP metadata inspection produced a nonempty Evidence export; native provider execution and MCP connectivity were not exercised. See `sources.md` for the source-free case record. Invoke the package's advertised bin rather than an internal module: an internal module can exit0 without executing a command. Validate both the Evidence identity and output bytes before claiming a result.

| Mode | Behavior |
|---|---|
| `off` | No REA discovery, readiness, setup or analysis. Use supplied source, references, observation and explicitly marked estimates. |
| `auto` | Default. Use REA only for a specific question needing a supplied shipped artifact or requested runtime evidence that ordinary source/visual inspection cannot settle. If unavailable, continue independently with the unresolved claim marked unknown. |
| `required` | The user needs REA-backed findings. Verify the actual tool/provider and scoped target. If unavailable, keep the investigation blocked/not-run; independent gameplay/asset work can continue, but cannot satisfy that requirement. |

A complete source repository normally needs `rg`, source inspection and tests, not REA. A new game with a written design normally needs no REA. A clone based only on screenshots can begin with a behavior matrix; do not search for an unrelated installed game or binary just to use the tool.

Resolve the target from the current request/workspace. Record the selected artifact path/hash/build, subsystem question, allowed static/runtime operations and output location. Investigation scope does not turn reference assets into content for redistribution. Use requested or authorized targets; do not silently broaden a static inquiry into executing or interacting with an application.

## Preparation without a mandatory install

When connected tools are available, use their real schemas and the matching upstream `reverse-engineer-anything` instructions when installed. Do not run setup/doctor before every working call. Keep REA output in a project investigation directory, not in game `Assets` or runtime packages.

If the required connection is absent, identify the blocker. An existing `rea --version` / `rea --help` can establish local CLI identity. For an actual Codex registration blocker, upstream documents `rea doctor --client codex --json`; it diagnoses configuration and does not prove tools exist in the current session. A CLI fallback does not establish MCP connectivity.

If installation/configuration is part of the user's requested scope, upstream setup can be previewed with `npx rea-agents@<selected-version> setup --client codex --dry-run --json`. Package resolution can download code/write npm cache. Inspect the plan's paths, backups and bundled skill replacement before applying setup within existing authorization, then reconnect and verify tools. Merely adding this skill never invokes setup, installs REA/Hopper/Ghidra/Java, replaces Codex config or changes global skills.

The inspected source package reports version 6.7.0 and Node range `^22.23.4 || ^24.22.1 || >=26.12.1`; that is a pinned source fact, not proof of the installed or published release. The toolkit's Node 20 floor does not establish REA readiness. Check the chosen package's own engines/requirements at execution time.

## Route by the actual artifact

Tool names below are observed upstream contracts, not promises about tools installed in a future session. Start with summary/selected records when the actual schema supports them.

| Supplied target | Initial route | What it does and does not establish |
|---|---|---|
| Full source repo | Ordinary source inspection | No REA readiness/provider calls needed |
| Unity Mono/.NET PE/CLI assembly | `inspect_managed_artifact`, then selected `inspect_managed_members` | Static metadata/CIL/member relationships; not execution, source recovery or proof of live behavior |
| Unity IL2CPP `global-metadata.dat` | `inspect_il2cpp_metadata` with explicit local path | Names/owners/literals and layout coverage for supported versions; not C# recovery or gameplay equivalence |
| IL2CPP metadata plus caller-selected native binary | Optional `binary_path`, then supported focused native route | Static addresses/type links if the layout is admitted; retain identities of both inputs and uncertain/shared addresses |
| Native executable/library | `open_binary`, then focused available analysis tools | Provider-specific pseudocode/assembly/refs; inspect availability, close the opened session when finished |
| Extracted JS/Electron tree or ASAR | `analyze_javascript_application` | Modules/imports/IPC with evidence; static analysis does not run the app |
| APK code | `inspect_android_package` when available | Requires separate JADX/JDK/host support; an IL2CPP APK's native code needs its own appropriate route |
| Requested browser/runtime scenario | Corresponding advertised observation/capture tools | Only declared actions and lifecycle; do not infer Windows support from Linux/macOS process-capture docs |

The inspected IL2CPP contract supports metadata versions 24/27/29/31/39 with layout restrictions. Unknown magic, encryption or unsupported layouts must stay unsupported/unknown. Version 27 can retain unknown type names. Optional binary linking does not prove the two files are from the same build; structural agreement and addresses do not establish execution or actual method semantics.

On Windows, deep Ghidra analysis has an experimental Windows x64 boundary with specific native controls, local NTFS, Ghidra/JDK and target restrictions. Do not claim general provider parity or infer readiness from the host name. Built-in static managed/metadata analysis has different prerequisites and does not inherently require a disassembler. Read the exact upstream host guide for a concrete provider task.

## Investigate one behavior, then implement

1. Write the smallest question that changes implementation: cooldown timing, damage/reward calculation, motion parameter, UI state transition or data format.
2. Inspect an overview only as needed, select relevant symbols/types/strings, then trace the narrow call/data path. Avoid whole-app dumps and unrelated resources.
3. Keep returned Evidence ID, artifact hash, provider/version, input scope, locations, coverage, limitations and unknowns. For retained summaries use the returned parent evidence ID and `inspect_analysis_view` when advertised. Page only enough to answer the question; do not repeat the producer to repair truncated output.
4. Separate file observations, derived/static interpretations, runtime observations and proposed design choices. Missing rows in partial evidence do not prove absence. Decompiler output is not original source.
5. Write the implementation-facing finding into the behavior matrix: input/state → observable result → timing/parameter → evidence → uncertainty → acceptance test. Keep raw analysis separate from new gameplay/asset code.
6. Implement with normal project tools, then test both the claimed behavior and full gameplay route. Upstream `verify_reconstruction`, if used, covers its declared finite claims, not whole-game fidelity, visual quality, performance or licensing.

Use a bounded investigation timebox; do not reverse engineer the entire game when only one mechanic needs evidence. If a host timeout leaves work uncertain, inspect existing session/output before retrying or opening duplicates. Preserve the accepted standalone route if REA is explicitly disabled.

## Handoff example

```text
Mode: auto
Question: Does the requested attack reset its cooldown after a miss?
Target identity: caller-supplied artifact/build and SHA-256
Evidence: IDs and relevant method/location or observed runtime scenario
Observed: only statements supported by that evidence
Inferred: candidate condition/state transition, with supporting references
Unknown: unobserved branches, missing runtime context or partial coverage
Implementation decision: preserve or deliberately adapt, according to brief
Game test: miss/hit/repeat cases plus the playable route on the final build
```

For source provenance and pinned links to installation, managed, IL2CPP, Windows and Evidence contracts, read `sources.md`.
