---
name: combat
description: Implement or review attack intent, hit windows, damage authority and idempotent death, including pooled attack cleanup and feedback ordering.
---

# Combat candidate

## Scope

Use for attack-to-damage flow or ownership across hit detection, health and death. Weapon tuning, rendering and cosmetic feedback alone do not justify rewriting combat authority. Preserve review-only constraints.

## Decisions

- Inspect existing attack, hit detection, health and pool owners before changing the flow. Verify manifest/lock and source for any package API used.
- Input/AI creates attack intent; the attack owner controls timing and active hit windows. Hit detection submits a damage request; the health owner applies the result.
- Define how a target is deduplicated within one attack. Repeated trigger/animation callbacks must not apply an unintended second hit or death.
- Close the hit window and clear transient targets on cancel, despawn and pool reuse. Old callbacks must not damage a new lifetime's target.
- Emit feedback after the authoritative result. Static tuning belongs in configuration, mutable saved progression in persistence and attack-session state in runtime ownership.
- Keep dependencies explicit for projectiles, hitboxes and pooled objects. Preserve serialized references and avoid Runtime references to Editor assemblies.

## Verification

Check duplicate hit, cancel-before-impact, damage after despawn, pool reset and death emitted once. Test authority separately from visual/audio reactions. Run relevant compile/lifecycle checks or record exact degraded evidence when Unity is unavailable.

## References

Read `references/combat-flow.md` when changing the boundary between attack, damage, health and feedback owners.
