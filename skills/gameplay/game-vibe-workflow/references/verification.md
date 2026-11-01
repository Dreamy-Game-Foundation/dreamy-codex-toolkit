# Evidence and delivery gates

Match evidence to the claim. A scripted path is useful repeatable coverage, not human playtesting. A build that skips the menu cannot prove normal launch.

| Claim | Smallest useful evidence |
|---|---|
| Rule/state works | Reproduction/fixture with expected and actual state deltas |
| Route is traversable | Actual movement through waypoints with progress-to-goal checks |
| UI/art matches | Opened gameplay/UI captures at controlled camera/state/scale |
| Whole-game clone matches | Complete function/state graph plus opened original/clone screenshot pairs by surface, target-version coverage, suitable asset bindings and applicable service/error paths; see exact-clone.md |
| Motion/feel works | Normal-speed interaction and clips including transitions/interruption |
| Audio works | Listen to runtime or synced recording, including mix/loop behavior |
| Performance improved | Profile before/after on matching device/build/scenario |
| Export is portable | Copied-folder import and relevant geometry/map/clip checks |
| Delivery works | Final player artifact launched normally and played through P0 |

Do not treat fixture teleportation, injected rewards or bypassed input as evidence for the path they replace. Log setup shortcuts. Use the real gameplay processing path for assertions. A stuck detector should measure progress toward its goal; moving in place is not arrival. Require the intended result, not merely no console errors.

For Unity, stop Play before script refresh or prefab surgery; poll actual compile/import state after a bridge timeout. Inspect Console and missing references. Capture real Game View/end-of-frame UI when camera-only rendering omits overlays. Select the correct editor instance. Use the installed Input System; recover native input devices on failure, reload and test exit, then confirm real mouse/keyboard/touch behavior. No current MCP/API availability is implied by this reference.

Before changing from batch to interactive Unity/MCP, notify the user why the real Editor/Game View is needed, which project/scene and connection state are required, and what will be checked or changed. Report unavailable MCP/interactive evidence explicitly; offscreen batch previews do not silently satisfy that gate. Preserve the latest no-build policy.

## Review and regression

For video references, retain visible build/version, timestamp, crop and evidence role. Different-version footage may establish an observed action or composition, but cannot silently supply target unlocks, prices or service behavior. Do not infer a rule from a narrated review when its actual frames show a different mechanic.

Keep UI clocks separate from deterministic model clocks in fixtures: freezing time for a conveyor assertion can also freeze panel transitions. Restore the clock before testing animated navigation. A world-coordinate tap under a modal may legitimately hit a modal action; inspect the resulting notice before treating a later slider assertion as a product failure.

When Unity test wrappers lose their job after domain reload, inspect the test runner's persisted XML and owned output before retrying. Record the capture method: an offscreen URP render with a temporarily changed canvas is a preview; an existing Game View RenderTexture readback is separate evidence. A storage-full save failure blocks that review and must not erase earlier results or become a claimed clean run.

Separate function, presentation, feel and performance. Compare baseline/candidate with the same camera, state, real-time speed and lighting. Use deterministic scenarios/seeds when useful. Independent review can strengthen confidence when authorized; otherwise disclose the reviewer's identity/limits instead of inventing fresh-context or human approval.

Fix the largest player-facing defects before expanding scope: obscured camera, weak/unmatched contact, sliding feet, unreadable UI or route blockers. Recheck meshes/collision/navigation after art changes; recheck dependent prefabs after importer/controller rebuilds. A polish experiment that regresses gameplay stays unpromoted.

Record implemented, functional-test, presentation-review, build-verification and owner-acceptance separately. Proposed/implemented does not imply verified; an owner's approval of a source pose does not approve the engine handoff. Every evidence file names source revision and relevant artifact identity. Later merges/build changes invalidate affected evidence.

## Final artifact

First apply the latest requested output and build policy. If the owner stops player builds, do not build to satisfy this section: deliver source/Editor evidence, label the player gate deferred-by-owner, and keep older artifact results scoped to their revision. A normal-launch player gate resumes only when the requested scope permits it. The following checks apply when player delivery is in scope and allowed.

Freeze new content with time for verification and repair. Build the target, then launch the actual output from its ordinary entry point with a fresh state and with an existing save when persistence is in scope. Verify menu/loading/world transitions, real input, UI/audio, runtime-loaded shaders/content, result/reset, save/quit/relaunch and affected platform behavior.

Run the complete P0 route after the final integration. Measure the heavy area and first traversal: shader/loading hitches can be absent from warmed steady-state FPS. Record device, resolution/quality, build type/revision, scenario and measurement method. Fixed-timestep recording throughput is not runtime FPS; an editor compiling other work is a different measurement.

Hand off build ID/path/hash, source revision, controls, evidence, limitations/open defects, source/terms and known/estimated/unknown spend. A showcase/timelapse is optional unless requested. Use the project record conventions or `../assets/gate-result.json` as a starting point. A valid evidence schema proves record structure, not game correctness.
