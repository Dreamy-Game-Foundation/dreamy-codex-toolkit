# csharp.events-lifetime

## Invariant

Every subscription must have a matching unsubscribe at the correct lifecycle boundary.

## Required

- Use `OnEnable` with `OnDisable` for active-listener subscriptions.
- Use `Awake`/`Start` with `OnDestroy` for object-lifetime subscriptions.
- Pair service registration with service disposal/shutdown.
- Store delegate instances when unsubscribe is required.
- Reset event subscriptions when pooled objects despawn or reactivate.
- Ensure EventBus and UnityEvent listeners do not hold destroyed objects.

## Forbidden

- Anonymous lambda subscription when later unsubscribe is required.
- Duplicate subscription after pooling/reactivation.
- EventBus listeners that outlive their owner.
- Assuming disabled MonoBehaviours no longer receive C# events.

## Decision Tree

Listener should receive events only while visible/enabled? Subscribe in `OnEnable`, unsubscribe in `OnDisable`.

Listener should receive events for entire object lifetime? Subscribe after construction/Awake, unsubscribe in `OnDestroy`.

Service listener? Register during service startup and unregister on dispose/shutdown.

Pooled object? Unsubscribe/reset during despawn before returning to pool.

## Exceptions

One-shot event handlers may self-unsubscribe inside the handler when all exit paths are covered.

## Verification

- Search changed code for `+=`, `AddListener`, EventBus registration, and callbacks.
- Confirm a symmetrical cleanup path exists.
- Test enable/disable/reactivation for pooled or UI objects.
- Confirm no duplicate event handling after reopen/despawn.

## Related

`unity.lifecycle`, `gameplay.pool-ownership`, `csharp.async-lifetime`.
