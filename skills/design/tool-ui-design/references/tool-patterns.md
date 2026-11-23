# Tool workflow patterns

Read for layout or workflow changes. Identify the primary task, frequency, data volume and existing authority before choosing components.

| Task | Useful structure | Preserve |
|---|---|---|
| Compare many records | Table with search/filter, explicit sort and relevant row actions | Column meaning, selection, units and important differences |
| Browse then inspect/edit | List/tree and detail pane | Selected identity, dirty state and back/navigation context |
| Configure options | Grouped form with inline help and validation | Defaults, dependencies, field errors and apply/save semantics |
| Dependent steps | Wizard with state and review summary | Back behavior and already-entered values; no fake progress |
| Run batch operation | Scope preview, action, progress, per-item results | Partial success, error detail, log destination and supported recovery |
| Explore spatial data | Canvas plus compact properties | Navigation, selection, zoom and accessible alternatives where practical |

Use a persistent toolbar for frequent actions; place secondary row actions nearby or in a predictable menu. Destructive actions need scope clarity according to the existing operation's risk, not an extra confirmation for every click. Command palettes and shortcuts supplement discoverable controls.

Distinguish no records, no search results, unavailable data and failed fetch. Keep the user's query when a request fails. Clarify whether bulk selection means visible rows, filtered records or all records. Do not silently lose dirty edits when selection changes. Filtering must not make a selected hidden record look like another record.

Progress must reflect real operation state. Show indeterminate activity if total is unknown; display determinate percent only when justified. Retry/cancel/undo are exposed only if supported by the owner. Disable duplicate submissions when required by the operation; keep presentation callbacks from committing data or rewards twice.

Terminal hosts retain keyboard-first flows, wrapping, terminal colors and character-width constraints. Provide legible no-color/noninteractive output where supported; do not replace an existing TUI with a browser or require images.

Exercise the primary task with empty/dense/long data and failure. Verify filter/selection transitions, dirty edits, partial results and recovery only as relevant. Reuse real domain tests for behavior risk; screenshot review establishes visible states, not data correctness.
