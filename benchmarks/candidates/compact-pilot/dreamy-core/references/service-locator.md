# Service Locator

Allowed at composition roots, feature roots, presenters, and high-level controllers. Resolve once, then pass dependencies down. Avoid leaf lookups from UI list items, projectiles, VFX, pooled objects, and animation event receivers. Verify by searching new `ServiceLocator.Get` calls and confirming each one sits at an owner boundary.
