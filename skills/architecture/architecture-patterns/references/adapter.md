# Adapter

## When To Use

Use Adapter when code must translate an incompatible third-party, SDK, platform, or package API into a stable local contract.

## When Not To Use

Do not use Adapter when the current API already matches the consumer, or when it only renames methods without isolating volatility.

## Simpler Alternative

Call the stable API directly, or keep a small mapping method inside the owning integration.

## Trade-offs

Adapters isolate volatile dependencies, but add another contract that must stay honest as the underlying API changes.

## Unity Implications

Adapters are useful around SDK callbacks, platform APIs, analytics, ads, IAP, or package drift. Keep UnityEditor-only adapters out of Runtime assemblies.

## Verification

Test mapping, error translation, lifecycle cleanup, and behavior when the wrapped API is unavailable or changes status.
