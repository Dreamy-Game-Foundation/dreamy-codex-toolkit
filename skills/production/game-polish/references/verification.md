# Verification and handoff

Read before accepting a polish experiment or reporting results. Match evidence to the claim; do not turn a small change into an unrelated full-project certification.

## Compare the interaction

Use matching camera, state, real-time speed, resolution/quality and input scenario for baseline/candidate. Record revision plus relevant dirty/config state. Use the real gameplay path for claims about controls/results; disclose setup shortcuts. Deterministic seeds help comparison when supported but do not make all rendering or simulation deterministic.

Review normal-speed motion first. Slow motion/frames can diagnose onset, contact, recovery and clipping. A screenshot proves framing/layout at a moment, not timing or enjoyment. Listen to runtime or a synced recording for audio claims. Check haptics and device input on the relevant hardware when claiming they work. Use available capture tools; do not install packages or generate mock images as proof of runtime output. When available, visual-review can manage real review screenshots; clips/audio still need their own evidence.

| Claim | Smallest relevant evidence |
| --- | --- |
| Code/asset integration | Refresh/compile and Console after C# edits; changed prefab/scene saved and reloaded when relevant |
| Input/timing behavior | Repeatable real input scenario, measured event/state timing with clock and method; recording frame granularity disclosed |
| Contact/animation/readability | Normal-speed interaction, representative camera/background and dense case; compare hit/miss and interrupted state |
| Audio sync/mix | Listening result from runtime/synced recording, representative overlap and relevant mute/volume settings |
| Authority/lifetime safety | Focused regression for changed grant/hit path, duplicate input/event, cancellation, pool reuse, pause or scene teardown |
| Performance/budget | Before/after profile on matching device/build/scenario and representative concurrency; name metric and method |
| Subjective preference | Real playtest/A-B with evaluator, conditions and limits stated |

An instrumented timestamp can establish a segment of the response pipeline, not end-to-end hardware latency. Editor FPS, video recording throughput and static allocation inspection are not target-device frame-time proof. Automated scripts establish behavior/coverage, not a human preference. Agent inspection must identify itself as such.

## Regression selection

Run the lowest layer that proves the changed risk. Pure timing/state logic may use unit/EditMode tests; animation/input/pause/pool integration may need PlayMode/manual repro. After C# changes refresh/compile and read Console. Do not launch batchmode into a game already open in Unity. No build is required unless scope calls for it; preserve a user's no-build policy.

Relevant scenarios include early/late input, repeated events, hit/miss, overlapping effects, skip/cancel/reopen, pause/slow motion, destruction and pool reuse. Select from the actual change rather than executing every scenario for a one-parameter edit. Test the acceptance condition and expected state, not merely “no exception”. Keep GUIDs, serialized references, prefab overrides and Runtime/Editor boundaries intact; review diff/status for unrelated changes.

Keep a candidate when acceptance is met and invariants hold. Revert/revise a change that worsens control, readability, authority or measured budget. Report disagreements between visual preference and function/performance rather than averaging them away. A game-wide task still needs its agreed coverage after a successful pilot.

## Evidence states and delivery

Use `pass`, `fail`, `degraded` or `not-run` with exact command/scenario, reason and missing gate. A no-Editor environment can support diagnosis/source changes but cannot establish import/compile/render. Missing audio capture means no recorded mix proof; missing target means no haptic/device proof. Retain useful independent work without relabeling missing gates.

Hand off changed assets/code, rationale, useful parameter old/new values with units, scenario/evidence links, checks and remaining gaps. Separate implemented, functionally verified, presentation reviewed, performance measured and human accepted. Do not claim retention/revenue gains from a polish pass. If iteration reaches an explicit task/time/attempt limit, identify the unmet criterion and next experiment; do not start an endless retry or background model loop.
