# Observer / Event Bus

## When To Use

Use Observer or Event Bus when multiple independent consumers need notification without the publisher depending on them directly.

## When Not To Use

Do not use a global event bus for owned child-to-parent communication, synchronous request/response behavior, or hiding dependency ownership.

## Simpler Alternative

Use a direct method call, callback, injected interface, or local C# event when the relationship is owned and narrow.

## Trade-offs

Events reduce direct coupling but add subscription lifetime, ordering, duplicate delivery, and debugging cost.

## Unity Implications

Pair subscribe and unsubscribe with lifecycle. Pooled objects must clear or reset listeners on despawn and avoid duplicate subscriptions on respawn.

## Verification

Prove subscription cleanup, duplicate-subscription protection, delivery to all intended listeners, and no delivery after owner disposal.
