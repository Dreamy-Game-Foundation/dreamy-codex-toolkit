# Clone contract and integration

## Establish the task

Reuse the conversation and existing project records before asking for missing information. Record one authoritative contract in the target project's existing documentation area, outside runtime assets:

| Field | Required content |
|---|---|
| Source | Game/package ID, platform, version/build, supplied artifact path and SHA-256; absent artifact is explicitly unknown |
| Target | Project path/revision, Unity version, current modifications and existing implementation |
| Scope | Whole game, requested slice or plan-only; required screens, feature/content families and delivery artifact |
| References | Source URL/file, publisher, access date, version/platform, covered state and confidence |
| Tool tracks | REA mode; AssetRipper requirement; selected versions/providers; allowed static/runtime work |
| Asset use | Content selected for reference or integration and intended delivery, retaining provenance |
| Constraints | No-build, existing working code, unavailable services/device, time or resource limits explicitly supplied |
| Acceptance | Requirement IDs, acceptance scenarios, evidence needed, gaps and next action |

A store link enables public research and scope preparation. Before binary work, resolve the selected local artifact from the user or current task workspace; do not choose unrelated installed games. A screenshot's version and the APK version may differ. Do not infer original package configuration from exporter-created project settings.

For intake and whole-game scope use [input pack](../../game-vibe-workflow/references/input-pack.md) and [exact clone](../../game-vibe-workflow/references/exact-clone.md). Record the whole screen/state graph when requested: entry, controls, preconditions, state change, result, exit, interruptions and persistence. These are discovery questions, not a reason to invent features absent from the selected game. A slice keeps its explicit boundary. A document-only request does not authorize gameplay changes.

## Link evidence to implementation

Use stable IDs in existing records rather than creating competing catalogs. Each behavior record needs:

```text
requirementId: move-block-through-matching-gate
input/state: selected block at a compatible gate, with a clear route
expected result: to be established from the selected reference
timing/parameters: observed values or explicit unknowns
evidence: artifact hash + Evidence ID/location, or source capture/test reference
evidence type: file observation / static inference / runtime observation / proposed behavior
implementation: owner and code/prefab references
acceptance: input sequence and observable expected state
status: unresolved / implemented / verified / blocked
```

This is a format example, not an assertion about a particular game's movement rule. Name source findings and design choices separately; absent symbols or unobserved behavior remain unknown.

Reuse the extraction skill's [per-file catalog](../../game-asset-extraction/SKILL.md). Every selected binding preserves source digest/object ID → exported file ID/path → imported GUID/path → material/prefab/component → screen/state → inspected capture. Keep unselected exported files indexed. Resolve dependency assets, atlas slicing, fonts/glyphs, pivots, units and material/shader compatibility. Filenames suggest candidates; they do not prove runtime bindings. Do not overwrite source GUIDs or dump an exported project wholesale into an existing consumer.

## Integrate into Dreamy

Use [Dreamy reuse](../../game-vibe-workflow/references/dreamy-reuse.md) before custom infrastructure. Inspect the target's README, manifest/lock, compatibility registry or actual package source and `_Feature` integrations. A toolkit compatibility record for a different commit does not establish support in this project.

Keep game-specific behavior under its project owner. Static level/rule definitions belong to config, persistent progression/balances to save, and board/session state to the runtime session. Resolve services at composition/high-level roots and pass dependencies to leaves. Reuse existing panels/installers/audio/feedback where verified. Runtime assemblies stay free of Editor references; use Unity-supported scene/prefab mutation and preserve `.meta` GUIDs and bindings.

Prove a representative asset-to-gameplay route, then complete the retained graph. Prefer suitable recovered assets when requested. Replacements need a recorded missing/unusable role and a scoped decision. A screenshot background with inert controls is not an interactive screen. Preserve backend-dependent tasks; unavailable real services remain unverified rather than replaced with fake successful purchases, account state or cloud sync. Do not use recovered service credentials.
