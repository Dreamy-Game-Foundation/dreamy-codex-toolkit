# Project records and prompts

Reuse existing repo conventions. The optional files in `../assets/` are output templates, not mandatory project structure. Copy/adapt only what the task needs; do not overwrite user records.

| Template | Use |
|---|---|
| `../assets/project-brief.md` | Intent, clone/original decisions, asset routes, REA mode, P0 and budgets |
| `../assets/task-spec.md` | Detailed working journey, screens/input, behavior, style/refs, asset roles, acceptance and execution constraints |
| `../assets/current-state.md` | Revision, next action, running jobs, evidence and unresolved gaps |
| `../assets/asset-record.json` | Provenance/stages and independent review dimensions |
| `../assets/gate-result.json` | Expected/actual checks attached to artifact/revision |
| `../assets/clone-plan-index.md` | Clone target/scope, full feature/state inventory, links to feature plans, research gaps and milestones |
| `../assets/clone-feature-plan.md` | One feature family: state/control contract, inspected screenshots/video intervals, implementation tasks and acceptance |
| `../assets/clone-reference-manifest.json` | Empty source/media/search/coverage record template; populate from actual observations |

For clone work, read [clone-research.md](clone-research.md) before parity implementation. Reuse equivalent existing files; the plan packet must cover the requested functions and retain missing evidence even when filenames differ. Templates are adaptable; coverage and traceability are the requirement.

Use `Docs/INVESTIGATION.md` or the existing analysis convention only when REA is selected. Record mode, target identity, question, permitted operation scope, evidence IDs/paths, observations, inferences and unknowns. Keep project state outside toolkit-managed installation files.

## Kickoff

```text
Use $game-vibe-workflow for the supplied brief and project.
Inspect existing code/assets/config and preserve accepted work.
Expand a short request into a working input pack before feature implementation:
journey, screen/state/input contracts, source behavior or interaction hypothesis,
style/reference roles, asset roles, P0 acceptance, assumptions and constraints.
Separate an agent-selected pilot from owner-confirmed scope. Use input-pack.md
and task-spec.md as needed; reuse existing records and one current state.
For clones, search feature/state images and available video, inspect selected
media and persist an index linking every required function to feature plans,
source IDs/time ranges and gaps before parity implementation. A requested slice
stays bounded; inaccessible video remains unviewed rather than behavior evidence.
Use auto unless the brief explicitly says off or required; auto does not mean
install REA or investigate a complete source repo through binary tools.
Build a placeholder loop, prove one representative slice through the engine
and an early build when permitted, then expand in small verified batches.
An owner stop/no-build instruction takes precedence; use Editor evidence and
keep player checks deferred, without calling the clone fidelity gate passed.
Keep current state, receipts and evidence on disk. Resume existing jobs after
timeouts. Freeze by the agreed deadline and verify the final normal-launch
artifact when in scope/permitted; otherwise hand off a source/Editor checkpoint
with implemented/verified/pending work and deferred player gates separately.
```

## Resume

```text
Resume from the actual project state/revision and latest brief decisions.
Confirm the editor/project and running process/job identities before mutation.
Preserve the chosen REA mode and previously selected target; reuse matching
evidence. Do not resubmit paid jobs or repeat uncertain analysis blindly.
Run the smallest smoke/gold path that establishes current state, then continue
the recorded next action within remaining budget and feature-freeze limits.
```

## Review and delivery

```text
Review the requested P0 on revision/build [identity], using the actual evidence.
Separate function, presentation/motion/audio, feel, performance and build checks.
List the largest defects with reproduction, expected/actual and source evidence.
Keep REA/static findings and runtime/game acceptance distinct.
Missing evidence is not-run/unknown, not pass. Owner approval stays pending
until confirmed. After final changes, test the actual player when permitted;
otherwise preserve the no-build policy and identify the deferred gate.
Deliver source/artifact identity, controls, evidence, provenance and open defects.
```
