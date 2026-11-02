---
name: dreamy-ui
description: Wire or review Dreamy panel, popup, overlay and navigation lifecycles, presenter boundaries, back handling and repeated open/close behavior.
requires.packages: ["com.dreamy.ui"]
---

# Dreamy UI candidate

## Scope

Use when panel ownership, navigation or binding lifetime changes. General canvas/layout work belongs to Unity UI; screenshot/font reskins belong to the installed reskin workflow. A documentation-only format change does not require panel work. Respect review-only scope.

## Decisions

- Verify manifest/lock, installed package APIs, current panel/presenter and navigation owner before wiring. Preserve existing serialized bindings, prefab ownership and back-stack conventions.
- Views render state and expose intent. Presenters/services own save mutation, economy, SDKs and navigation policy; do not resolve these from leaf controls.
- Pair bind/unbind, subscribe/unsubscribe, start/cancel and tween start/kill with the same owner. Reopening a cached panel must attach one listener and reject stale asynchronous results.
- Define modal/back behavior and input blocking at the navigation owner. Preserve safe-area behavior and intended cache policy.
- Keep reusable UI capability in its package and game-specific presentation glue in the project. Do not turn a local screen fix into an unrelated navigation rewrite.

## Verification

Exercise open twice, close twice, reopen, back from a modal and scene teardown as relevant. Closed panels must not receive events or apply completed loads. Check serialized bindings and compile/Console evidence; state exact limits if Editor checks are unavailable.

## References

Read `references/panel-lifecycle.md` for cached/reopened panels and `references/presenter-boundary.md` for separating view intent from state mutation.
