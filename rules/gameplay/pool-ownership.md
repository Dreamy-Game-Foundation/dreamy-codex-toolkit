# gameplay.pool-ownership

## Invariant

Objects spawned from a pool must return to the same pool that created or owns them, with mutable runtime state reset before reuse.

## Required

- Return pooled objects through the owning pool API.
- Reset mutable runtime state before reuse.
- Cancel async work, tweens, coroutines, timers, event subscriptions, and callbacks on despawn.
- Clear owner/source/target/hit lists/collision state/trails/particles as applicable.
- Pool only when reuse frequency or allocation cost justifies it.
- Document ownership when pooled instances can be spawned by multiple systems.

## Forbidden

- `Destroy` on pooled objects as normal lifecycle.
- Returning an object to a different pool.
- Reusing objects with stale owner, target, subscription, tween, cancellation, or collision state.
- Pooling tiny rare objects by default.
- Letting pooled leaf objects resolve global services on spawn.

## Decision Tree

Frequent spawn/despawn or expensive allocation? Pool.

Rare tiny object? Instantiate normally unless profiling says otherwise.

Projectile/VFX/UI item? Define reset contract before pooling.

Pooled object uses async/tween/event? Cleanup on despawn before return.

## Exceptions

Destroying pooled instances is acceptable only for pool disposal/shutdown, invalid prefab migration, or explicit capacity shrink controlled by the pool owner.

## Verification

- Inspect spawn, init, hit/complete, despawn, and pool disposal paths.
- Test duplicate spawn/despawn and reactivation.
- Confirm no stale callbacks after despawn.
- Confirm pool owner and return API match.

## Related

`csharp.events-lifetime`, `csharp.async-lifetime`, `unity.assets-lifetime`.
