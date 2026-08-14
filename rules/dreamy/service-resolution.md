# dreamy.service-resolution

## Invariant

Resolve services at roots or high-level owners, then pass explicit dependencies downward.

## Required

- Use ServiceLocator only at `GameInstaller`, bootstrap, cross-scene composition roots, feature roots, high-level presenters, or high-level controllers where the existing Dreamy architecture already does so.
- Resolve once at the owner boundary, then pass dependencies through `Initialize(...)`, constructor-like setup, serialized wiring, or factory spawn context.
- Keep service registration timing and lifetime explicit.
- Tests should be able to provide fakes without relying on global mutable state when practical.

## Forbidden

- ServiceLocator lookup from UI list items, projectiles, VFX objects, pooled currency items, small leaf MonoBehaviours, or animation event receivers.
- Lookup inside `Start()`/`Update()` of tiny objects as the default dependency pattern.
- Hidden global lookups that make pooling, tests, or scene reuse depend on startup order.

## Decision Tree

Cross-scene service? Register/resolve at app composition root.

Feature-wide dependency? Resolve at feature root or presenter/controller.

Spawned or pooled leaf? Pass dependency at spawn/init and reset on despawn if mutable.

Existing project already uses a root bridge? Keep it if replacing it would exceed task scope.

## Dreamy Override

Dreamy ServiceLocator is allowed when verified by compatibility data and used at existing composition boundaries. Unsupported or drifted API claims must be marked as assumptions or blockers.

## Verification

- Search changed code for new `ServiceLocator.Get` calls.
- Confirm each lookup sits at an allowed owner.
- Confirm leaf components receive dependencies explicitly.
- Compile/test or state why Unity verification could not run.

## Related

`dreamy.composition-root`, `dreamy.project-package-boundary`, `dreamy.ui-boundary`.
