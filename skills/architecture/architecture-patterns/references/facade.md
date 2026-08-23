# Facade

## When To Use

Use Facade when a subsystem has multiple moving parts and consumers need a small stable entrypoint for a coherent operation.

## When Not To Use

Do not use Facade to hide a single trivial call, bypass ownership, or create a manager that absorbs unrelated responsibilities.

## Simpler Alternative

Expose the existing service or feature root directly when its contract is already small and stable.

## Trade-offs

Facades reduce consumer knowledge, but can become god objects if boundaries are not narrow.

## Unity Implications

Use facades at feature, platform, or package boundaries. Keep scene, save, UI, and asset ownership explicit behind the entrypoint.

## Verification

Test the facade contract and at least one integration path through the subsystem it coordinates.
