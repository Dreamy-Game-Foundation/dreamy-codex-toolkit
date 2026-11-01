# Whole-game exact clones

Read when the user asks to clone a complete game identically, including "hoàn thiện y hệt". This branch is stricter than a mechanics prototype. It does not change original-game, explicit slice, small-fix or document-only tasks.

## Prepare the brief before feature implementation

Inspect the chosen game's identity/version, existing code/docs, source/extraction metadata and the user's constraints. Keep working code. If an existing clone began from a thin brief, repair intake first and record current deviations without retroactive approval.

Create a project-specific whole-game experience contract, not a questionnaire or a list of implemented features. Include:

- Normal launch, splash/loading/transition/progress/error/retry; fresh versus returning save and the original onboarding/unlock sequence.
- Home/menu/navigation and every applicable screen: gameplay, pause/settings, result/continue/give-up, shop/offers/purchase/restore, currencies/lives, profile/account/privacy/support, rank/season/team, pass/events/daily/claim. These are discovery prompts, not permission to invent features absent from the target version.
- Entry and exit, visible data, each actionable control and precondition, state transitions and authoritative owner; locked/disabled/empty/loading/pending/success/cancel/error/expired states, interruption/relaunch and persistence.
- All gameplay feature families, source content groups and progression gates. Static field names identify questions; they do not establish native trigger/timing/targeting semantics.
- Camera/layout/material/font/animation/audio/input/aspect contracts; requirement-to-reference/asset/implementation/test links; blockers, build policy and completion gates.

Use stable surface/requirement IDs and one authoritative current state. A milestone can implement a subset, but the brief/backlog must retain the entire requested graph. Do not independently exclude shop/rank/loading/lives or backend-dependent flows because an offline prototype is easier.

## Research the entire experience on the web

Search proactively before implementation: official product/help pages and store/version history, then public full-session gameplay, first-hour/onboarding, menu/settings/shop/rank/event walkthroughs. Follow feature links and transitions beyond the main puzzle/combat loop. Search the uncovered surfaces explicitly; a collection of level solutions is not whole-game research.

Record URL, author/publisher, access date, artifact/version/platform, source role, relevant screens/states and confidence. Prefer the target version. Later web documentation, regional prices, remote-config cohorts and older videos can disagree: retain the conflict and find confirming evidence; never silently apply every current feature to an old package. Do not claim exhaustive Internet coverage. Track coverage per required surface instead of a fixed page count.

Download or capture selected original screenshots and video frames for comparison, with source URL and hash. For frames, retain video identity, timestamp/sample method, resolution/aspect, level/progression and visible state. Check the decoded frame: fast seeking can be wrong for irregular timestamps. Use normal-speed playback for timing/feel claims. If access fails, retain a specific missing-state record and continue useful independent research; do not label a help-page screenshot as the missing game screen.

Open captures before accepting them. Separate original runtime, third-party state montages, marketing/feature illustrations, serialized structure and clone baselines. Reject unrelated games/portraits/related-article pictures and wrong-game search results. A search snippet, thumbnail, art file or count of images is not visual review.

## Individual asset catalog after extraction

Use `game-asset-extraction` for actual extraction when requested. After extraction or when resuming an existing export, produce JSON links to **every exported asset file**, including unselected files. The complete catalog may be split with a small index; do not force all records into model context. Record:

- Stable ID, relative path, resolvable local URI, type/extension and bytes.
- GUID/subasset or source object/path ID where available; exporter/receipt/source version; existing SHA-256 or explicit hash-not-read status.
- Extracted/retained/empty/failed/unavailable state where known, source dependency links and role candidates with confidence.
- Selected/imported derivative path and GUID, scene/prefab/component role and integration/review status when used.

Read filenames/manifests/receipt metadata first; do not load heavy textures/audio/meshes merely to build a catalog. Reuse producer hashes, preserve failures and raw retained objects. Validate ID uniqueness, containment, link existence and selected binding resolution. A hash copied from a receipt is not a newly recomputed integrity check. The extraction skill's `scripts/index_assets.py` supplies a generic file/metadata catalog; extend it with source-object/derivative bindings from the real producer receipts.

Map each required surface to actual source asset IDs. Filenames are candidates, not proven bindings. Resolve dependencies, materials, sprite slicing/atlas, fonts/glyphs, pivots/units and import compatibility. If suitable original assets already exist, integrate them and complete the flow; do not leave placeholder geometry, text-only substitute UI or invented screens for convenience. AI/procedural replacement needs a genuine unavailable/unusable role and a recorded decision. Do not paste a screen capture as fake interactive UI.

Asset availability and recovered behavior are separate. Having all art does not recover IL2CPP callbacks, server schedules or account/billing logic. Keep those as implementation/evidence tasks rather than scope exclusions. Complete client UI/domain/provider adapters within authorization; unavailable production services stay explicitly unverified. Never invent online player data, report a local save as cloud sync, grant paid entitlement on button click or use extracted service credentials.

## Screenshot comparison and Unity notification

Keep original and clone captures side by side by surface/state. Match version, level/layout, progress, active objects, aspect, viewport, camera and localization where possible. State when a pair only supports composition because board/version/aspect differs. Record concrete deviations, asset decisions and the next fix; re-capture affected states after fixes. No universal screenshot similarity percentage replaces functional/feel review.

When Unity integration or actual Game View interaction needs a running interactive Editor/MCP instead of batch, notify the user **before** switching: why batch is insufficient, project/scene/Editor state needed, whether Unity must open or a bridge must reconnect, and the inspection/mutation planned. This is coordination, not automatic re-approval of work already authorized. Verify actual exposed tools and instance; an installed MCP package alone is not a connection. Follow `unity-mcp`/Editor instructions for safe operations. If only batch/offscreen evidence is possible, keep the interactive gate pending and name its limit. A no-player-build instruction remains effective.

## Exact-clone gates

1. **Research/brief:** whole surface graph, source/version, behavior/state contracts, original capture coverage and asset catalog/mapping exist before parity implementation. Missing evidence remains a named readiness gap; independent preparation can continue. An explicitly requested prototype may proceed as a labeled prototype, without promoting it to exact parity.
2. **Implementation:** every retained function has complete entry/action/effect/exit, suitable source assets, persistence and applicable error/cancel paths. A visible button or imported prefab is insufficient.
3. **Functional evidence:** traverse the graph from normal entries, including unlocks, service states and resource/reward transactions. Label injected setup, mocks and shortcuts; they cannot prove the paths they bypass.
4. **Visual/feel evidence:** open source/clone image pairs; repair deviations; inspect transitions at normal speed and listen to audio. Keep device/performance, real services and owner acceptance distinct.
5. **Completion:** no silently omitted required surface, fake service success or unexplained placeholder. Report incomplete/deferred gates with specific dependencies; do not call full/identical from rules tests, asset count, screenshot count or a successful build.

The Pixel Flow owner-case was prepared before promoting this reference. Its source-free summary is `docs/evidence/exact-clone-pixelflow-preparation.json`: the exercise exposed major Home/shop/fail divergences and missing source-state screenshots. It validates useful preparation and gap detection, not a completed faithful game or general model behavior.
