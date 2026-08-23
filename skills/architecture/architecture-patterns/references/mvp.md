# MVP-like View + Presenter

## When To Use

Use MVP-like separation for non-trivial UI flows such as shop, upgrade, reward, mission, settings, or multi-step panels.

## When Not To Use

Do not force Presenter or View interfaces for tiny visual-only components or one-off local animations.

## Simpler Alternative

Keep simple rendering and local input in the MonoBehaviour when there is no domain orchestration or persistence.

## Trade-offs

MVP separates rendering from flow decisions, but can create boilerplate if the panel is small.

## Unity Implications

View owns serialized references, rendering, visual state, local animation, and input intent. Presenter or Controller owns flow, decision logic, domain orchestration, navigation requests, and save or economy interaction through proper owners.

## Verification

Test presenter decisions with fake or real domain collaborators, and verify view binding in an appropriate UI or integration test when layout or lifecycle matters.
