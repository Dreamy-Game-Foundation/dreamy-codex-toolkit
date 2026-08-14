---
name: unity-project-analysis
description: Inspect unfamiliar Unity projects before planning, routing, migration, package, rendering, platform, build, or architecture work; produce an evidence-backed capability profile without mutating project state.
---

# Unity Project Analysis

## Purpose

Build a compact project profile from observed files so later agents select compatible skills, packages, tools, and verification paths.

## When To Use

- Starting work in an unfamiliar Unity repository.
- Planning a feature, migration, package upgrade, platform build, or performance investigation.
- Selecting a Dreamy preset, skill set, agent, harness operation, or test matrix.
- A recommendation depends on Unity version, render pipeline, packages, asmdefs, input, UI, networking, Addressables, or target platforms.

## When Not To Use

- The project profile was produced at the same commit and none of its inputs changed.
- A tiny local task cannot be affected by project capabilities or Unity state.
- The request is only to explain a general Unity concept without project-specific claims.

## Domain Model

Repository evidence -> engine/package/assembly/asset/platform profile -> capability status -> routing and verification constraints.

Every field is one of `observed`, `inferred`, `unknown`, `drift`, or `unsupported`. Never convert absence of evidence into support.

## Required Inspection

- Project and parent `AGENTS.md` or equivalent local instructions.
- `ProjectSettings/ProjectVersion.txt`.
- `Packages/manifest.json` and `Packages/packages-lock.json`.
- Relevant `*.asmdef` files, especially Runtime/Editor/test boundaries.
- `ProjectSettings/GraphicsSettings.asset`, `QualitySettings.asset`, and `EditorBuildSettings.asset` when the task depends on rendering, quality, or scenes.
- Existing tests, build scripts, Addressables settings, input assets, and nearby implementation owners.
- `compatibility/dreamy-packages.json` before any Dreamy package capability claim.

Read `references/capability-profile.md` when producing or consuming the structured profile.

## Decision Tree

- No `Assets`, `Packages`, or `ProjectSettings`: classify as non-Unity or incomplete; do not install a Unity preset automatically.
- Manifest exists but lock is missing: packages are declared, not fully resolved.
- Render pipeline package exists: confirm the active pipeline asset before classifying URP/HDRP.
- A package is present but version/API evidence is absent: mark detected, not supported.
- Runtime asmdef references Editor: report a blocker before feature work.
- Project capability cannot be proven statically: select a harness/Editor probe and keep the field `unknown` until it runs.

## Workflow

1. Record repository commit, worktree state, OS, and analysis timestamp.
2. Detect the Unity project root and exact Editor version.
3. Parse manifest and lock separately; record declared and resolved packages.
4. Map asmdef dependency direction and Runtime/Editor/test partitions.
5. Detect render pipeline, input, UI, Addressables, networking, testing, build targets, and Dreamy packages from concrete files.
6. Identify feature, service, data, UI, asset, and lifecycle owners only where source evidence exists.
7. List drift, missing evidence, and operations required to confirm runtime-only capabilities.
8. Select the smallest applicable preset, skills, agents, and harness operations.
9. Return the profile without modifying project files.

## Architecture Rules

- Analysis is read-only and must not refresh, reimport, upgrade, or rewrite project assets.
- Preserve observed, inferred, intended, and unsupported facts as separate fields.
- Package presence does not prove API availability or compatibility.
- Render pipeline package presence does not prove active asset configuration.
- Select the smallest role set; do not route every multi-step task to every specialist.
- Dreamy compatibility claims require the verified registry commit and no blocking drift.

## Anti-patterns

- Assuming Unity 6 because a README says so.
- Calling every project with `Packages/manifest.json` fully supported.
- Treating grep hits as proof that a package or system is configured correctly.
- Inventing performance budgets without device/product requirements.
- Mutating `CLAUDE.md`, `AGENTS.md`, manifests, scenes, or settings during analysis.

## Common Failure Modes

- Stale profile after package, asmdef, branch, or ProjectSettings changes.
- Declared package version differs from the lock or verified compatibility record.
- URP/HDRP detected from dependency only while another pipeline is active.
- Editor-only source or tests counted as runtime capability.
- Optional third-party skill activated when its package is absent.
- Unsupported/private Editor API treated as automatable.

## Verification

- Every profile field cites one or more inspected paths or an executable evidence artifact.
- Manifest and lock versions are reported separately.
- Unknown and unsupported capabilities remain explicit.
- Selected preset/skills/agents are traceable to detected capabilities.
- Re-run analysis when the commit or any profile input changes.

## Allowed Claims

Claim only observed project structure. Claim Dreamy API compatibility only from `compatibility/dreamy-packages.json` at its verified commit. Claim runtime behavior only after the matching Unity/harness operation runs successfully.

## References

- `references/capability-profile.md` defines the project profile and evidence rules.
- `compatibility/dreamy-packages.json` is the Dreamy package claim registry.
- `schemas/project-profile.schema.json` is the current machine profile baseline; extend it before emitting new canonical fields.
