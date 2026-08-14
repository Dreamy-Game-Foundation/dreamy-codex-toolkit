# csharp.async-lifetime

## Invariant

Every async operation must have an owner, cancellation semantics, and observed failures.

## Required

- Tie GameObject work to destroy cancellation.
- Tie panel operations to panel visibility/close cancellation when reopening can invalidate results.
- Tie app-wide preload or background work to an app/service lifetime.
- Treat cancellation as expected control flow when an owner disappears.
- Observe exceptions from `Task`, `UniTask`, coroutines, callbacks, and explicit fire-and-forget work.
- Check object validity after `await` before mutating Unity objects.
- Use `async void` only at event/callback boundaries.

## Forbidden

- Silent fire-and-forget without `.Forget()` or an equivalent error observation policy.
- Continuing to mutate destroyed/deactivated objects after await.
- Sharing a cancellation token whose owner is shorter-lived than the work consumer.
- Hiding service-owned async work inside a leaf UI/component.

## Decision Tree

Operation tied to GameObject? Use destroy cancellation.

Operation tied to panel visibility? Cancel on close/hide if stale results would mutate UI.

Operation tied to app lifetime? Use app/service lifetime token.

Shared preload? Let the owning service manage in-flight dedupe, cancellation, and result lifetime.

## Exceptions

Fire-and-forget is acceptable only for bounded telemetry/logging or callback boundaries with explicit exception handling.

## Verification

- Inspect all new awaits/coroutines/callback continuations.
- Test owner destruction/close/cancel path when behavior is non-trivial.
- Confirm exceptions are logged or propagated.
- Confirm no Unity object mutation happens after owner invalidation.

## Related

`unity.lifecycle`, `unity.assets-lifetime`, `thirdparty-unitask`.
