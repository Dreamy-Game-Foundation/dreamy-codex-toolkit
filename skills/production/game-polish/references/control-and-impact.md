# Control, physicality and impact

Read for movement, combat, contact, camera or audiovisual tuning. Recipes are candidate experiments, not mandatory effects. Use source/version-matched APIs and existing ownership.

## Control response

Trace device/action sampling, state validity, movement/attack update, animation and first visible response. Identify whether perceived delay comes from input, intentional anticipation, simulation, camera smoothing or presentation. Instrument timestamps only when needed, naming clock and measurement boundaries. Frame recording estimates visible timing; it is not precise end-to-end hardware latency.

- Buffer only the intended action, consume once at a valid transition, expire it and clear it on incompatible state/lifetime changes. Test early/late presses, hold/release, pause/modal transitions and repeated activation. Avoid stale intent causing an unexpected action.
- Coyote time, corner correction, aim assistance and collision leniency alter action validity. Apply only when consistent with the requested design; test that they cannot create extra jumps/hits or cross intended geometry. Do not silently change difficulty for a cosmetic pass.
- Diagnose acceleration, braking, turn rate, air control and gravity together with camera/animation. Preserve intended weight. Expose a few useful parameters with units; tuning several unrelated curves simultaneously loses attribution.
- For touch/drag, distinguish press acknowledgement, gesture threshold and accepted action. Verify the real input route and UI gating when available; simulated object motion bypassing input cannot establish responsiveness.

## Contact timeline

Name anticipation, authoritative contact, impact, follow-through and recovery in the actual interaction. They need not have equal duration or all be exaggerated. Ensure the player can read when an action succeeds and when control becomes available again.

| Candidate layer | Role | What to check |
| --- | --- | --- |
| Pose/recoil/reaction | Convey direction and mass | Contact frame, foot sliding, recovery, readability without extras |
| Squash/stretch | Visual deformation | Visual child owns deformation; collider/root behavior preserved unless deliberately changed |
| Flash/spark/trail | Mark contact/direction | Hit/miss distinction, correct position, background contrast, overlap and tail |
| Audio transient/body/tail | Confirm material, weight and outcome | Listen for onset sync, masking, clipping and voice spam |
| Camera impulse | Reinforce selected impacts | Aim/framing remain legible, composition restored, reduced-motion setting respected |
| Haptic | Supplement tactile emphasis | Actual device/support/settings; no haptic capability claim from Editor success |
| Brief hold/slow motion | Emphasize a selected moment | Clock scope, concurrency, interruption, pause/network semantics |

Choose the smallest combination that conveys the intended event. Strong/weak, hit/miss and success/failure must retain semantic distinctions. Variation may reduce repetition but must not scramble event meaning. Do not celebrate every input as a confirmed successful hit. In predicted/networked flows, immediate local input feedback and authoritative impact feedback may have different triggers; handle rejection/reconciliation at the existing owner.

## Clock and lifetime traps

Before hit-stop, determine whether an existing local presentation clock or global simulation policy applies. A blanket `Time.timeScale` change can freeze physics, UI, buffers and cleanup while audio uses another clock; it may break network behavior. Do not introduce global freeze by default. Concurrent requests must not restore an obsolete scale or override a pause. Capture and restore only state owned by the effect; test cancellation, scene change and overlapping holds.

Tween/async/event owners cancel on teardown, reject stale completion and restore owned visual state. Pooled effects reset trails, scale/color/material overrides, subscriptions and callback identity. Reuse the project's feedback/audio/load/pool roots instead of adding service lookups to leaf objects. Gameplay owns damage, reward and cooldown. A feedback animation does not become the source of truth.

## Camera, mix and busy scenes

Inspect framing/follow lag/look-ahead before adding shake. Test near boundaries, targets at screen edges, occlusion and simultaneous impacts. Avoid cumulative drift. An amplitude that works in isolation can hide the action under continuous fire; prioritize, throttle or merge channels using existing policy.

Listen to mix under representative concurrency, including quieter and important cues. Use meaningful variation within controlled ranges and existing volume/mute settings. Keep crucial state legible if audio, haptics or camera motion is disabled. When changing flashes/motion, respect the project's relevant intensity/reduced-motion options; do not turn a scoped polish task into an unrelated settings rewrite.

Measure target performance before claiming a budget is met. Neither a fixed particle count nor pooled allocation alone proves a stable frame time. Record unmeasured device/haptic/performance branches explicitly.

For deeper art work use available VFX/animation/camera/audio skills. [GDC's Juice It or Lose It overview](https://gdcvault.com/play/1016487/Juice-It-or-Lose) motivates coordinated layers; [XAG 117](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/117) informs relevant motion controls. Neither is an API contract or proof that this recipe fits every game.
