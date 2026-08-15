# Failure Signatures

## pooled-event-duplicate

Symptoms:
- Callback count grows after each respawn or panel reopen.
- Fresh instantiate may not reproduce.

Likely causes:
- Duplicate subscription.
- Missing unsubscribe.
- Pool reset omission.

Inspect:
- `OnEnable`, `OnDisable`, spawn/despawn, panel open/close, event owner.

Verification:
- Spawn/despawn or open/close N times and assert one callback.

## async-owner-destroyed

Symptoms:
- Continuation touches destroyed object.
- Exception appears during scene unload or panel close.

Likely causes:
- Missing cancellation owner.
- Fire-and-forget exception unobserved.

Inspect:
- Cancellation token source owner, close/destroy path, duplicate request behavior.

Verification:
- Start operation, destroy/close owner, assert cancellation or no mutation after owner death.
