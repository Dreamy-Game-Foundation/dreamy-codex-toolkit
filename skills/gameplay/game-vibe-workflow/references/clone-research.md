# Clone reference research and feature plans

Read for clone intake, research-only planning or a resumed clone with incomplete references. Cover the requested scope: a whole-game clone retains every discovered applicable function/state; an explicit slice retains its boundary. Reuse existing project docs and IDs, not a parallel competing plan. For exact parity also apply [exact-clone.md](exact-clone.md).

## Discover functions before selecting media

Identify the selected game, publisher/package ID, target version/platform, locale and existing source/reference records. Inspect the actual project first. Build a discovery inventory of gameplay and applicable frontend/meta flows: launch/loading/onboarding, Home, gameplay feature families, pause/settings, win/fail/retry, progression/unlocks, shop/offers/restore, lives/currencies, rank/profile, events/pass/daily and service/error paths. These are search prompts; do not claim a feature exists without evidence or add one merely to fill the list.

For each feature family record a stable feature ID, screens/states, controls/preconditions, entry/action/result/exit, persistence/interruption and what is known versus inferred. Include loading/empty/locked/disabled/pending/success/cancel/error/expired states when applicable. Retain missing states in the inventory; neither a missing screenshot nor an unavailable backend removes a required feature.

## Search images and video per uncovered feature

Search proactively using available web/image/video discovery tools, unless the user limits research. Start with official product/help/store/version sources, then public gameplay sessions, first-hour/onboarding and feature walkthroughs. Inspect supplied local media too. Do not stop at the core loop, generic game-title images or level-solution videos.

Use the selected game's name/publisher plus the uncovered feature/state, version/platform and alternate/localized feature names when useful. Example query shapes, adapted to features actually observed:

- `"<game>" "<feature>" screenshot`, `"<game>" "<screen>" "<state>"` for stills.
- `"<game>" "<feature>" gameplay walkthrough`, `"<game>" first hour full gameplay` for transitions and motion.
- Official channel/store videos, YouTube or another accessible public video source; also search UI/menu/settings/shop/rank/event terms relevant to the inventory.

Log meaningful search attempts against feature/state IDs: query/source, date, result/access status, selected source IDs and next gap. Search uncovered rows again with a more specific state/alternate term or another suitable source. Stop within task constraints when no useful route remains; record unavailable/not-found rather than asserting the feature or video does not exist. Respect no-web, selected-source and spending constraints. Do not search an unrelated game just to populate the packet.

## Select and inspect actual evidence

For each source record ID, URL/local source, publisher/author, access date, title, platform/version if visible, role and covered feature/state IDs. Distinguish original runtime, third-party footage, marketing, montage, interpretation and clone baseline. Keep target-version conflicts explicit; source recency alone does not establish a version match.

Open selected images before accepting visual coverage. Reject wrong-title games, unrelated illustrations, portraits, ads and misleading related-page images. A thumbnail/search snippet is discovery, not reviewed evidence. Save/download a useful original screenshot when accessible and within scope; record a stable local path and SHA-256 for retained bytes. Keep its source identity even if the URL later changes.

When video exists and is accessible, inspect the relevant interval, including the before/action/result transition where available. Record video identity/URL, feature/state, timestamp range, visible game/version, playback speed and what was actually observed. Retain selected decoded frames with exact timestamp, dimensions, crop and hash when useful; check the frame visually because seeking can land incorrectly. Keep a video URL as a source even when a full download is unnecessary. Normal-speed playback supports timing/feel claims; a single frame, narrated claim or video thumbnail does not.

If playback/download is unavailable, preserve the URL and exact reason with inspected=false; do not say the video was watched or that its behavior was confirmed. Do not bypass access controls. Alternative accessible sources and independent planning can continue; absent video need not block a static layout plan, but motion/timing stays unknown.

## Persist a linked plan packet

Prefer equivalent existing files. A concrete default when no convention exists is:

```text
Docs/ClonePlan/
  PLAN.md                       # target, scope, complete feature/state index, milestones and gaps
  references.json               # sources, selected media, searches and per-state coverage
  features/
    F001-launch-onboarding.md    # illustrative filenames; actual files follow the selected game
    F002-core-gameplay.md
    F003-results-progression.md
  media/                        # selected retained screenshots/frames; video only if useful/permitted
```

Use [clone-plan-index.md](../assets/clone-plan-index.md), [clone-feature-plan.md](../assets/clone-feature-plan.md) and [clone-reference-manifest.json](../assets/clone-reference-manifest.json) as adaptable output templates. Do not copy illustrative feature names as claims about the game. A compact slice can group related functions in one feature plan. A whole-game inventory must enumerate the complete discovered scope even if implementation milestones cover subsets. Existing `Docs/ExactClone` or another plan root is equally valid when it contains the required links.

The index links every required feature/state to a plan file or a named unresolved discovery task. Each feature plan includes observed behavior, assumptions/conflicts, controls/state transitions, image IDs/paths, video IDs/time ranges when available, selected asset roles, implementation owner/dependencies, tasks and acceptance scenarios. List all requested functions, including unimplemented or blocked ones; do not document only what current code supports. New discoveries update the inventory, affected feature plans and backlog together, without rewriting past acceptance.

`references.json` uses stable cross-links:

- `features`: id, name, scope/discovery status, planPath; states with state ID, screenshotIds, videoIds, coverage/unknowns and nextAction.
- `sources`: id, URL/local source, title, author/publisher, accessedAt, platform/version, role, accessStatus and inspected state.
- `media`: id, sourceId, feature/state IDs, image/video/frame kind, localPath when retained, SHA-256 of retained bytes, source timestamp/range for video/frames, dimensions/crop and review findings.
- `searches`: feature/state IDs, query/channel, searchedAt, status, resultSourceIds and unresolved gap. `gaps`: ID, affected feature/state, missing evidence/conflict/access reason and next action.

The shipped JSON is an empty record template, not a populated research report. Unobserved numeric/version fields stay null; do not hash a remote URL as if it were downloaded media. Store project records outside toolkit-managed skill folders.

## Readiness and handoff

Check that feature/state IDs are unique; index/plan/media links resolve; selected stills/frames have actually been opened; watched intervals are distinguishable from inaccessible candidates; each uncovered state and conflicting version has a gap/next action. Review inventory against navigation and walkthroughs rather than calling a folder full of images complete.

Keep research attempted, source found, media inspected, target-version match, plan written, implementation and acceptance as separate states. For exact parity, missing source-state/motion evidence remains a readiness gap; independent preparation or an explicitly requested prototype may proceed with its limited claim. A file's existence does not establish complete research or a faithful clone. Hand off the plan index, feature files, reference manifest, media and open coverage gaps before parity implementation, then keep them current as discoveries change the task.
