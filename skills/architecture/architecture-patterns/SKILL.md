---
name: architecture-patterns
description: Choose Unity and Dreamy architecture patterns only when real ownership, variation, lifecycle, or dependency forces justify the added structure.
---

# Architecture Patterns

## Purpose

Use this skill to decide whether a known pattern helps a real design problem, and to reject patterns when a normal class or method is clearer.

## When To Use

Use for architecture, refactor, dependency structure, UI architecture, multiple implementations, state-machine design, event architecture, package boundaries, SDK abstraction, or pattern selection.

## When Not To Use

Do not load this skill for typo fixes, simple null guards, field renames, small visual tweaks, or bugs with an already evidenced local root cause.

## Decision Workflow

1. Identify the owner of state, behavior, lifecycle, persistence, publication, and transitions.
2. Map dependency direction and package/project boundaries.
3. Name what actually varies now.
4. Check whether a normal class, direct method call, or existing project convention is sufficient.
5. Choose a pattern only when the simpler option fails a current requirement.
6. State the complexity added and how behavior will be verified.

## Pattern Menu

Start with `references/pattern-selection.md`.

Use focused references only when the decision reaches that pattern:

- `references/strategy.md`
- `references/state.md`
- `references/observer-event-bus.md`
- `references/factory.md`
- `references/adapter.md`
- `references/facade.md`
- `references/mvp.md`
- `references/anti-patterns.md`

## Core Constraint

Pattern vocabulary is not evidence. A design is stronger when it preserves ownership and behavior with less machinery.
