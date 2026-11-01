# Playable-slice workflow

This is an experimental synthesis of the owner-supplied Oldcraft report, not a benchmark proving every genre or engine. Scale the records and gates to the requested prototype, vertical slice or release. Do not import MMO features into unrelated games.

## Intake and scope

Capture intent, core interaction, repeat/restart, platform/input, existing work, P0/P1/P2, exclusions, visual anchors, target device and build conditions. Separate target observations, design choices and unresolved questions. A single-player MMO-like slice does not imply networking.

For a new or underspecified game, expand the experience contract using [input-pack.md](input-pack.md) before feature implementation. Tie the journey, screens, assets and acceptance to actual references. Reuse records and distinguish an agent pilot from the full requested scope. Missing fidelity evidence stays a gap even when a prototype can proceed.

For a complete identical clone, first apply [exact-clone.md](exact-clone.md). M0 includes whole-game web research, original screenshot/state coverage, JSON links to each extracted asset and explicit implementation gaps. Complete loading/Home/shop/rank/settings and every applicable function; the representative slice tests integration without narrowing the final graph. M0 integrity can pass while exact-parity readiness remains incomplete.

For a clone, make a behavior matrix: observed source → behavior to retain → implementation decision → verification. Include camera/framing, movement, action/reward timing, hit feedback, UI hierarchy and progression only as relevant. Mark parameters measured/estimated/unknown; a screenshot cannot establish attack timing or economy. Convert REA findings into this matrix when that optional investigation is selected.

For an original idea, state the interaction hypothesis and smallest experiment that can keep, revise or reject it. A plausible art direction is not evidence the interaction works. Inspect existing code and assets before proposing replacements.

## Milestones

For Dreamy consumers, M0 also includes the reuse decision map in [dreamy-reuse.md](dreamy-reuse.md). M2 proves the real installer → asset/address → panel/presenter → domain/save → tween/feedback lifecycle. M5 checks removal of superseded infrastructure and update instructions, separately from visual parity and deferred release gates.

| Gate | Deliverable | Required evidence |
|---|---|---|
| M0 Scope/environment | Working input pack: journey, screens, behavior/hypothesis, style/reference roles, assets, acceptance/backlog, state and risk probes | Correct project/tool state; explicit assumptions and check/capture/build policy or precise gaps |
| M1 Placeholder loop | Input, camera, interaction, result, UI state, reset | One real playable route reaches its outcome without a dead end |
| M2 Representative slice | One main asset, animation if relevant, UI, feedback/audio and encounter | Full pipeline works in engine; early player check when permitted, otherwise explicitly deferred |
| M3 Expand P0 | Small content/feature batches | Each variant and integration preserves the route and relevant budgets |
| M4 Review/polish | Fix highest-impact defects | Functional, visual/motion/audio, feel and measured performance requirements |
| M5 Freeze/deliver | Requested source/Editor checkpoint or player artifact, records and instructions | Relevant P0 checks; normal-launch player verification when requested/permitted, otherwise deferred |

A failed or omitted gate remains failed/not-run. A showcase video cannot turn it green. When available time is exhausted, deliver a checkpoint and remaining gaps rather than inventing acceptance.

## Prove before multiplying

Select a representative risk-bearing sample: for character 3D, one body/rig/gait/action/weapon in a small playable encounter; for 2D, one sprite/atlas/state/hitbox and encounter. Include UI and feedback, then verify in engine and build when permitted. Capture integration time and cost, not just generation time. Check an extreme variant before a large batch when body proportions, transparency, language length or target-device tier vary materially.

Keep gameplay authority separate from presentation: determine who owns damage, rewards, state, displacement and yaw. Root-motion-driven games remain valid; the invariant is applying movement once and keeping visual contact aligned with gameplay. Use installed capabilities and project conventions before introducing another framework.

## Batch loop

Choose one task with an owner, inputs/revision, output, acceptance, protected work, timebox and fallback. Implement/prepare → check narrowly → integrate → rerun the route and affected variants → inspect normal-speed presentation → retain or revert the scoped change → update state and checkpoint.

Preserve other contributors' edits. If parallel work is authorized, one integrator owns the Unity Editor and one owner drives each interactive Blender session; others supply files, receipts and handoffs using distinct scratch directories. Background generation/bakes remain constrained by CPU, RAM, disk and spend. More workers are not a success metric.

When replacing placeholder art, recheck visible geometry, collision, ground contact, navigation and camera obstruction together. When rebuilding an importer/controller, validate dependent prefabs and preserved references, not just the asset that was rebuilt. Keep Runtime assemblies free of Editor references and preserve Unity GUIDs/serialized bindings.

## State and recovery

For a short project, use brief, current state, style, asset receipts and evidence. For long sessions add append-only progress/decisions and an integration queue. Keep one authoritative current state; avoid reports diverging from the actual revision.

On resume: read brief/state/decisions → confirm project and artifact revision → inspect running jobs/processes → run a scoped smoke or gold path → record interruption → continue next action. Check existing outputs before redoing work.

On timeout, distinguish ongoing work, completed output, unknown submission and confirmed failure. For an editor inspect compilation/import/modal state; for a process inspect its owned PID/log; for a provider query the saved job ID. A host timeout is not a failure receipt. Limit retries and stop pursuing an unchanged failing route at the configured timebox.

Track coding/gen cost, pending jobs, integration time, memory, free disk and build size. Reserve time/resources for testing and delivery. Separate reproducible caches, source masters, runtime exports and previews; retain provenance and necessary source without preserving every redundant derivative. Do not apply the old project's cleanup policy to user data. Mark binary Unity data correctly rather than applying text line-ending conversion.

Do not add mandatory screenshot intervals, timelapse, global software installation, model selection, publication or endless continuation. Those belong to the current brief when requested.
