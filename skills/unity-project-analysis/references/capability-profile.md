# Capability Profile

## Status vocabulary

- `observed`: directly read from a current project file or successful tool result.
- `inferred`: likely from multiple observations but not runtime-confirmed.
- `unknown`: required evidence is absent or unavailable.
- `drift`: observed sources disagree.
- `unsupported`: a required contract was checked and is not available.

## Minimum profile

| Area | Fields | Primary evidence |
|---|---|---|
| Repository | commit, dirty paths, instructions | Git, `AGENTS.md` |
| Engine | Unity version/revision | `ProjectSettings/ProjectVersion.txt` |
| Packages | declared/resolved/source/hash | manifest and packages-lock |
| Dreamy | detected package, verified commit/status/drift | project files plus compatibility registry |
| Assemblies | Runtime, Editor, tests, dependency issues | `*.asmdef` graph |
| Rendering | pipeline package, active asset, quality tiers | manifest, Graphics/Quality settings |
| Input/UI | input package/assets, uGUI/UI Toolkit/TMP | manifest, assets, asmdefs |
| Assets | Addressables/Resources/direct ownership | settings, labels, source owners |
| Platforms | enabled scenes, build targets, build scripts | EditorBuildSettings, PlayerSettings/build scripts |
| Verification | tests and available harness operations | test asmdefs, harness/Editor probe |

## Output contract

Return:

1. Observed profile with evidence paths.
2. Drift and blockers.
3. Unknowns that change the plan.
4. Selected preset, skills, and agent roles with reasons.
5. Required verification operations.

Do not include raw secrets, signing identities, proprietary SDK credentials, or full asset inventories unless the user explicitly places them in scope.
