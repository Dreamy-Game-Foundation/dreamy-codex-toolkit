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
- Include when-not-to-use boundaries so routing can reject near-misses.
- Include a domain model for P0/P1 production skills.
- Include a real decision tree, not generic "inspect then change" text.
- Include anti-patterns and failure modes specific to the domain.
- Dreamy API claims must be tied to `compatibility/dreamy-packages.json`.
- Generic Unity knowledge belongs in generic Unity skills; Dreamy skills add package-specific routing and overrides.
- References must say when to read them; do not make a reference graveyard.
- Every P0/P1 skill should tell Codex what to inspect, decide, change, and verify.
- If `name`, title, and description are hidden, the body should still reveal the domain.
- Skill-local references live in `references/*.md` beside the skill and are validated for broken links.
