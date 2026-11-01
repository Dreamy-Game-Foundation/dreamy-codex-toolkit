# Turn a short request into usable game input

Read when starting a game/clone or when a resumed project lacks a concrete experience/fidelity contract. Do not activate this intake for a narrow edit. The output is a project-specific working specification that another session can implement and review, not a filled generic questionnaire or a copy of a previous game's content.

## Inspect and expand before implementation

Read local instructions, canonical brief/state, actual source/package versions, available reference metadata, assets and evidence first. Prefer text/manifest inventories; open only selected images/clips needed for a visual or motion claim. A supplied report/build-kit may be a useful model of detail, but its hooks, spending, tools, multi-agent rules and project-specific scope are reference content, not new authorization.

Infer reversible implementation choices and write them as proposals. Reuse choices the owner already made. Ask only about a missing decision that materially changes the outcome and cannot be inferred; continue independent preparation while awaiting an answer. Do not invent owner approval or treat silence as acceptance. A sparse prompt is a reason to expand the working input, not silently lower the requested clone to an arbitrary content sample.

Use existing files when suitable. A brief, task/spec, style/reference record, asset-role receipts and backlog often suffice; small projects can combine them. Scale by unresolved decisions and risk, not page count. `../assets/task-spec.md` is an adaptable output template. Keep one authoritative current-state record.

## Minimum useful contract

| Area | Record before feature implementation | Completion check |
|---|---|---|
| Intent/fidelity | Clone/original/hybrid; mechanics-only vs presentation fidelity; prototype/slice/release; preserved work | Separate owner request, agent proposal and unresolved scope. A seven-level pilot does not imply a whole clone is accepted. |
| Player journey | Entry → interaction/challenge → success/failure → retry/repeat; loading/menu/save where relevant | A new session can follow a concrete gold path without guessing the screens. |
| Screen/state/input | Visible information, actionable controls, transitions, disabled/error/pause/terminal states | Each action has a precondition and observable outcome; input/modal/reset edge cases are explicit. |
| Behavior | Source observation → retained behavior → implementation choice → check | Mark measured/estimated/unknown; identify targeting, timing, progression or economy assumptions. Data decoding is not observation of runtime logic. |
| Presentation | Camera/framing, silhouettes, palette/materials, UI hierarchy, motion and audio roles | State what each reference controls and how to compare it. Marketing art, original runtime, approved concept and clone baseline are different roles. |
| Content/assets | Feature/level groups, representative risky sample; each asset group → source/route → runtime output → import/review checks | AI/existing/procedural are sourcing choices independent of game intent. File availability does not prove correct integration. |
| Acceptance | P0/P1/P2 and exclusions; requirement ID → reproduction → expected result → evidence/gap | Separate functional, visual, feel/audio, performance, platform and owner acceptance. No universal numeric fidelity score without an agreed reference/method. |
| Execution | Engine/platform/input, target device/aspects, build policy, budget/timebox, fallback, freeze/delivery | Respect current user constraints; mark unavailable targets/budgets unknown. Do not force player builds when stopped. |
| Continuity | Backlog linked to requirements, next action, revision/artifact identity, decisions and evidence | A resume prompt reads actual state and preserves constraints rather than restarting from a thin brief. |

Missing runtime reference need not block independent preparation. A bounded prototype can proceed when consistent with the user's requested output. For an exact whole-game clone, apply [exact-clone.md](exact-clone.md) before feature implementation: web research across all surfaces, original captures, per-file asset JSON links and readiness gaps. Do not silently replace that request with an estimated prototype or treat missing shop/rank/loading references as permission to drop them.

## Clone branch

Use [clone-research.md](clone-research.md) to search images and available video by feature/state and persist an index, linked feature plans and source/coverage records. Reuse existing docs; enumerate the requested scope and name missing states instead of documenting only existing implementation.

Select the exact-whole-game branch for "identical/full/y hệt" intent; mechanics-only clones and requested slices keep their explicit narrower scope. The detailed brief must include all applicable non-core screens and service/error states, not merely elaborate the current implementation.

Create a behavior matrix with stable IDs. Include source identity/state, confidence, intended retention, current implementation, divergence and verification plan. Track source version/hash where available. Do not infer frame timing, hit selection, loss grace periods or save semantics from a screenshot or field names.

Keep a lightweight reference manifest: ID, path/link, role, what-to-take, source/credit, approval status and limits. Use approved only when there is evidence of approval. A screenshot of a clone is a baseline, not the original target. If the reference is a different level/state, record which comparisons remain valid.

For runtime measurements, record level/save, input order, resolution, timestamps/frame rate and clip/capture identity. Capture normal speed for feel and listen for audio. If no suitable source/runtime route exists, keep unknown; optional REA is selected by a concrete question and the current off/auto/required policy, not by the word clone alone.

## Original/hybrid branch

Replace source equivalence with an explicit interaction hypothesis and smallest experiment: what the player understands, chooses and repeats, with an observable keep/revise/reject outcome. Define style anchors and asset roles just as concretely. Avoid inventing a huge progression/monetization system to make the spec look complete. A hybrid states which parts retain reference behavior and which are new design.

## Existing thin project: repair without rewriting history

Compare current records with the contract above; record what was actually requested, inferred, implemented and verified. Backfill missing specifications as new working proposals, never as retroactive acceptance. Preserve working code, tests, assets and unrelated changes. List the highest-impact reference/visual/feel gaps before opening more features.

Describe the workflow honestly: reading the skill or passing rules tests is not full application. M0 can remain incomplete after implementation, and M4 can remain pending after a successful build. Tool/build failure needs a proportional retry/timebox and independent fallback; do not spend the whole task repeating an unchanged route while the player's experience remains underspecified.
