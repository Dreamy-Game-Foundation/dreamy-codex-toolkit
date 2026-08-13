# Skill Authoring

Dreamy Codex Toolkit skills must be operational, source-grounded, and small enough to route reliably.

## Required Format

```markdown
---
name:
description:
---

# Skill Name

## Purpose
## When To Use
## When Not To Use
## Required Inspection
## Decision Tree
## Workflow
## Architecture Rules
## Common Failure Modes
## Verification
## Allowed Claims
## References
```

## Rules

- Descriptions must name concrete triggers.
- Dreamy API claims must be tied to `compatibility/dreamy-packages.json`.
- Generic Unity knowledge belongs in generic Unity skills; Dreamy skills add package-specific routing and overrides.
- Long examples belong in `references/` only when they are needed.
- Every P0/P1 skill should tell Codex what to inspect, decide, change, and verify.
