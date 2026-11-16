# UI, rewards and interaction rhythm

Read when polishing press/drag, popups, reward presentation, transitions or loop continuity. Keep existing layout, SafeArea and navigation ownership. A skin/font repair alone belongs to the UI/reskin workflow.

## UI state timeline

Distinguish **press → accepted/pending → confirmed/rejected → ready**. A press can acknowledge input immediately without claiming a successful purchase/reward. Pending actions remain understandable; rejected actions need a clear reason and recovery path. Avoid competing feedback that suggests both success and failure.

Tune the actual bottleneck: acknowledgement delay, blocking tail, overshoot, excessive bounce, focus loss or repeated motion. Preserve requested timing/art presets unless changing them is in scope. Layout/fit owns the container; animation often belongs on an inner visual child to avoid fighting layout or resetting responsive scale. Do not use per-frame layout correction to compensate for conflicting owners.

Press/release, cancel/drag-out and disabled states should match actual interactability. Test pointer release outside, modal/back navigation, keyboard/controller focus or touch as relevant. A visual button demo that bypasses the presenter/domain call is not proof of the real interaction.

## Rewards and celebrations

Use a confirmed transaction/result as the source for count-up, coin fly, progress and celebration. The authoritative balance changes through its existing owner exactly once; presentation interpolates a display and ends at the actual result. Do not grant on particle arrival, tween completion or popup close.

| Experiment | Intended benefit | Invariant/regression |
| --- | --- | --- |
| Short acknowledgement plus optional decorative tail | Immediate result and continuity | Skip/close does not cancel or repeat a committed grant |
| Count-up or reward fly | Explain amount and destination | Target/count/locale correct; display reaches authoritative value |
| Staggered reveals | Make hierarchy clear | Important information and actions remain reachable |
| Shorter blocking section | Reduce unwanted waiting | No duplicate submit or navigation into incomplete state |
| Reduced intensity/motion | Fit quiet/cozy tone or relevant setting | Core outcome remains clear without motion or sound |

Every animated sequence needs ownership for cancel, skip, scene unload and reopen. Old callbacks cannot update a reused panel or the next transaction. Do not reuse pooled items with lingering tweens/subscriptions. Check rapid repeated input, reopen mid-flight and result replacement. Reuse current UI cache/presenter/asset loading contracts.

## Rhythm and continuity

Map one loop at normal speed, including player decisions and transitions. Separate deliberate suspense/recovery from unnecessary dead time. Remove a specific stall rather than increasing animation speed everywhere. Frequent rewards may need restrained feedback; rare milestones can carry greater emphasis. Keeping every cue at peak intensity flattens hierarchy.

For transitions, preserve focus/input gating and final state on interruption; avoid accidental click-through. Respect pause and clock selection: a frozen gameplay clock should not accidentally prevent the pause menu from completing. Conversely, unscaled UI motion should not resume authoritative gameplay. Match project navigation/back handling rather than creating a parallel manager.

Acceptance may be “next action is available after confirmed state while decoration can finish/skip”, or “pending and rejected states are distinguishable”. Specify the actual state/criterion; do not invent a universal transition duration. For long loops, sample the beginning, representative repetition and a high-concurrency case, not just the opening celebration.

Use actual bound values and supported screen/input conditions for the affected surface. Check long counts, localization or SafeArea only when the change touches that risk; avoid a full unrelated UI audit. Audio should remain distinct and mixed under repetition; [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/full-list/) provides supporting guidance for separate volume and alternative cues.
