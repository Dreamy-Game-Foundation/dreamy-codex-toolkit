# Integrate, verify and hand off

Read before adding triggers/pooling, choosing evidence or making target-performance claims. Use existing project owners. A visual effect reacts to confirmed gameplay/system events; it does not decide damage, rewards, purchase success, hits or cooldowns. Match visual peak to the authoritative event without moving game rules into the effect.

## Ownership and completion

Resolve services at a composition/feature root, presenter or high-level owner and pass explicit dependencies to leaves. Use `dreamy-feedback` or other package APIs only after manifest/lock plus compatibility or inspected source commit verifies them. A skill installed in Codex is not proof its Unity package exists. Identify spawn/load, cancel, stop, release and scene-lifetime owners.

- Reuse an existing bounded pool/load service when appropriate; low-frequency effects may use simple owned instantiate/release. Do not introduce a cross-game runtime system for one local effect.
- One-shot completion includes child systems, delayed sub-emitters, trails and visible tails. Do not return solely after the root's emission duration, or assume all children finish when one callback fires. Loops need an explicit stop/cancel contract.
- Distinguish graceful stop (no new emission, allow tail) from immediate cancel (clear and release according to the owner). Verify the selected system's actual API/liveness semantics, especially graph bounds/culling or trail residuals.
- On reuse reset particle/trail state, transform/parent, parameter/material overrides, subscriptions, callbacks and async work. Reject completions from an older use, for example using a lease/generation owned by the pool. Never Destroy an object whose owner expects a pool return.
- Scene unload, destruction, pause/timeScale, slow motion, emitter movement and changes of follow-target are explicit lifetime cases. Suspend trail emission while relocating, clear history at the new spawn position, then enable it deliberately; otherwise a stale segment can connect the old and new positions. Inspect child simulation/scaling under the actual parent.

## Evidence ladder

| Claim | Minimum relevant evidence |
|---|---|
| Asset authored/persisted | Saved prefab and dependencies, reload/binding inspection, stable GUIDs when editing |
| Compiles/imports | Actual Editor refresh/compile and Console; shader/import errors checked |
| Visually selected | Inspected captures at relevant times/context plus motion/loop evidence where required |
| Lifecycle works | Relevant runtime/PlayMode scenario: complete tail, stop/cancel, repeated spawn/reuse, destruction/unload, no stale release or shared-state leak |
| Performance meets target | Measured configuration, baseline, representative/peak concurrency, units, capture and comparison against an explicit budget |
| Works in target player/device | Corresponding build/device execution; Editor result alone is insufficient |

Use the lowest test layer proving the change. EditMode is appropriate for asset persistence/helper behavior; PlayMode for actual lifecycle/cancellation/reuse. A test run with no relevant cases proves neither. After C# edits compile/read Console; keep Runtime free of Editor references. Do not clear existing Console errors to hide baseline problems.

No Editor, license, graphics context, compatible graph tool or device: identify the precise gap and retain `not-run`/`degraded`. Do not label generated code, saved JSON, package inspection or a successful tool response as rendered/functional verification. Capture/profiling operations must be discovered; the toolkit harness currently offers inspect/compile/Console/tests, not a standard screenshot/GPU command.

## Performance decision

Record exact Editor/package/renderer, device/GPU, graphics API, resolution, quality, warmup and concurrency. Compare scene baseline to the same scene with the effect at typical and requested peak load. Measure CPU/GPU frame time when available, allocation after warmup, material growth, texture memory and draw calls/batches. Overdraw/bandwidth needs suitable graphics evidence; a particle count alone does not measure it.

Optimize the measured bottleneck: transparent screen coverage/layer count, texture samples and lighting, collision/sub-emitter complexity, capacity/spawn rate or texture memory. Preserve the readable shape and impact. There is no universal mobile particle or draw-call limit. Editor FPS, guessed budget or one rendering-stat sample does not establish device performance.

Quality tiers/fallbacks require a selection rule and a tested corresponding configuration. Keep an explicitly required graph unresolved if only its fallback works. Preserve no-build scope; if the task claims target-player behavior, perform that gate or report it unverified.

## Handoff and resume

Deliver prefab/dependencies and imported paths/GUIDs, source/provenance, recipe/parameters, trigger/stop instructions and actual captures/test/profile artifacts. Separate `observed`, `intended` and `unknown` in the [recipe template](../assets/effect-recipe.json); unknown numbers are null rather than zero. Keep raw evidence status, including harness `degraded`, and identify the next action for missing gates.

Review diff/status for references, `.meta`, material sharing, assembly direction and unrelated changes. Keep task records outside managed skill directories. Install/update of toolkit skills follows the existing installer for the selected target; generating an effect does not authorize global installation or changes to an unrelated project.
