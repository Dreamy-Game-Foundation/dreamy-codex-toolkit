---
name: unity-async
description: Repair or review Unity async lifetime, cancellation, exception observation and stale completion across destroy, panel close or pooled reuse.
---

# Unity Async candidate

## Scope

Use for Tasks, coroutines, callbacks or installed UniTask flows with a lifetime hazard. A synchronous local method or text-only rename does not need a new async abstraction. Review-only requests permit diagnosis and suggested checks, not edits.

## Decisions

- Inspect the current async API and package versions; do not invent cancellation overloads. Identify the component, panel, scene or pool-generation owner of each operation.
- Cancel on the owner's actual end of use, which may occur before destruction for cached panels or pooled objects. A cancellation request alone does not prove underlying work stopped.
- Recheck owner/request generation before applying a completion. Prevent old work from modifying a closed, destroyed or reused object.
- Observe exceptions and distinguish expected cancellation from failure. Avoid async void for gameplay flows except unavoidable callback signatures with explicit exception handling.
- Release owned resources in the appropriate cleanup path. Keep Unity-object access on the required thread and preserve existing serialization/runtime assembly boundaries.

## Verification

Exercise completion after close/destroy, rapid close/reopen, pooled reuse, cancellation and thrown exceptions. Verify no late mutation, unobserved failure or resource leak. Use pure tests for coordination logic and lifecycle tests for actual Unity ownership; state unavailable checks precisely.

## References

Inspect nearby project async owners and installed API source for the concrete cancellation/cleanup contract. No shared reference must be loaded merely to activate this skill.
