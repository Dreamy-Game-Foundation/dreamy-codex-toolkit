---
name: dreamy-core
description: Wire or review Dreamy Core services, events and state transitions at composition roots, including subscription lifetime and cleanup.
requires.packages: ["com.dreamy.core"]
---

# Dreamy Core candidate

## Scope

Use for service registration/resolution, cross-feature events, app lifecycle or mutually exclusive states. A local direct call or formatting-only edit does not require adding a service/event/state abstraction. Honor review-only requests without mutation.

## Decisions

- Inspect manifest/lock and verified package source before naming APIs. Compatibility catalog entries are version-bound evidence, not proof for a different installed revision.
- Resolve services at composition/feature roots, presenters or existing high-level owners. Supply explicit dependencies to leaf UI, projectiles, VFX and pooled objects.
- Keep local owner-child communication direct. Choose an event for independently owned subscribers; define who subscribes, unsubscribes and survives scene changes.
- Keep entry/exit cleanup symmetric. Use states for incompatible modes and transitions with guards; do not replace a simple flag with a framework without a real need.
- Preserve Runtime/Editor boundaries and serialized references. Static configuration, saved player state and runtime session state retain their existing owners.

## Verification

Check duplicate registration, subscription re-entry and state exit cleanup. Run the smallest relevant compile/test check; report unavailable Unity execution as degraded with its exact reason. A source inspection is not runtime evidence.

## References

Read `references/service-locator.md` for registration/resolution; `references/event-bus.md` for notifications; `references/state-machine.md` for transitions. Read `references/app-lifecycle.md` or `references/tick-service.md` only when the task changes those lifetimes.
