# dreamy.project-package-boundary

## Invariant

Reusable cross-game code belongs in packages or shared modules; project-specific gameplay, content, scene glue, and UI belong under the project boundary such as `Assets/_Project`.

## Required

- Keep package runtime assemblies independent from project assemblies.
- Put game-specific rules/content/UI wiring in project code.
- Keep package APIs small, stable, and backed by compatibility evidence.
- Verify package dependencies through manifests/asmdefs before adding references.
- Keep Core small and foundation-level only.

## Forbidden

- `com.dreamy.core` depending on feature packages such as UI, shop, ads, or current project code.
- Runtime package referencing an Editor assembly.
- Package code referencing `Assets/_Project`.
- Moving behavior into a package only because it is reused once.
- Creating optional domain behavior inside Core by default.

## Decision Tree

Reusable across multiple games? Candidate package/shared module.

Encodes current game's rules, content, UI, or scene wiring? Project.

Requires another game-specific type? Project.

Would a package need dependency on current project? Reject package placement.

Foundation primitive used everywhere? Maybe Core, but Core must remain small.

Optional domain behavior? Separate package, not Core.

## Dreamy Override

Do not claim a Dreamy package API is supported unless compatibility data ties it to a verified commit.

## Verification

- Inspect manifest and asmdef references.
- Confirm dependency direction is package-to-package or project-to-package, never package-to-project.
- Review public API surface for accidental project concepts.
- Run toolkit/package validation when available.

## Related

`dreamy.package-direction`, `dreamy.version-compatibility`, `core.no-speculative-abstraction`.
