# Verification and delivery

Use the existing [game gates](../../game-vibe-workflow/references/verification.md) and [extraction checks](../../game-asset-extraction/references/validation.md). Keep one checkpoint with target/source revisions, scope, tool tracks, job/PID identity, outputs, failures and next action. Each result names its actual evidence and boundary.

| Gate | Required evidence | Does not prove |
|---|---|---|
| Intake | Selected identity/version/digest, reference coverage and scope | Asset or code recovery |
| Extraction | Source unchanged, receipts verified, catalog links valid, representative media inspected | Import, code recovery or gameplay |
| REA | Nonempty meaningful Evidence matching the question/artifact; coverage and unknowns retained | Original C# source, runtime semantics from metadata alone or whole-game parity |
| Import | Selected assets and dependencies resolve; materials/fonts/prefabs inspected | Functional behavior |
| Compile | Target Editor compiler/Console result at current revision | A playable screen or correct rule |
| Functional | Normal entry/action/effect/exit/error paths, interruption, persistence and transactions | Visual similarity, production services or device performance |
| Visual and feel | Opened matched source/clone captures, transitions at normal speed and inspected audio/input | Complete function graph or a universal similarity score |
| Player/device/services | Normal-launch build/device checks and real service results where in scope | Other untested platforms, versions or live services |

Use `pass`, `partial`, `blocked`, `not-run` or `not-applicable` per gate. A gate is not applicable only when the task excludes it; missing tooling makes it blocked/not-run. REA required and AssetRipper required each retain their own result. The overall claim cannot exceed the least-complete required gate.

For screenshot pairs align source version, level/layout, aspect/viewport, progress/state, camera and locale. If a mismatch is unavoidable, state which comparison it supports. Record deviations and fix/re-capture affected states. Imported art that remains unused, unexplained placeholders or fake online state leave their requirements open. Traverse the retained screen graph and all requested gameplay feature families; one successful level is only a pilot for a whole-game task.

Honor no-player-build instructions. Use Editor evidence when permitted and mark player checks deferred. Before switching to interactive Unity/MCP, follow the linked workflow's notification and actual-instance verification requirements; an installed bridge is not a working connection. Offscreen output is not interactive Game View evidence.

On interruption, reconcile existing outputs and running jobs first. Reuse unchanged source receipts/Evidence; changed code/assets require relevant fresh verification. Close only native sessions/exporter processes created for the task, preserving output and unrelated tools.

Deliver the requested source/player artifact, controls, completion by requirement, remaining defects, provenance and exact verification limits. Do not call the whole game identical from hashes, exported file counts, dummy scripts, metadata, unit tests, a reconstruction verdict or build success. Skill catalog/eval specifications test routing intent; only observed agent/tool/game artifacts support behavioral or real-game claims.
