# Strategy

## When To Use

Use Strategy when multiple algorithms or policies must be interchangeable behind the same observable contract, such as damage formulas, target selection, reward calculation, or AI scoring policies.

## When Not To Use

Do not use Strategy for one implementation, speculative future variants, or logic that is better expressed as data in DataConfig.

## Simpler Alternative

Use a normal method, local conditional, or data-driven table when variation is small and owned by one feature.

## Trade-offs

Strategy improves replacement and testing of real variation, but adds type count, indirection, registration, and contract maintenance.

## Unity Implications

Pure C# strategies are easiest to test. ScriptableObject strategies are useful for designer-authored policy only when runtime mutable state is not stored on the asset.

## Verification

Test each strategy against the same contract and include at least one consumer test proving selection routes to the intended implementation.
