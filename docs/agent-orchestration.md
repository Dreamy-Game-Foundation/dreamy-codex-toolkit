# Agent Orchestration

Use the smallest role set that can verify the task.

## Preflight

Use `dreamy_project_analyst` when the repository is unfamiliar or the task depends on Unity version, render pipeline, packages, asmdefs, platform, build, or multiple domains. Reuse its profile only at the same commit and when manifest/lock/ProjectSettings/asmdefs have not changed.

Skip the analyst for a tiny local task whose owner and verification path are already known.

## Flows

- Feature: dreamy_unity_developer -> dreamy_tester.
- Bug: dreamy_debugger -> dreamy_unity_developer -> dreamy_tester.
- Review: dreamy_code_reviewer; add dreamy_tester only when validation is needed.
- Performance: dreamy_performance_engineer -> dreamy_unity_developer -> dreamy_tester.
- Android/iOS build: dreamy_build_engineer; add dreamy_debugger only for failures.

## Handoff Contract

Every multi-role handoff contains:

```text
From / to:
Objective and non-goals:
Project snapshot and evidence paths:
Owned files/assets:
Dependencies and blockers:
Required skills:
Forbidden mutations:
Acceptance commands/artifacts:
Residual risks:
```

The receiving role must re-read changed source/state instead of trusting stale summaries. A handoff target must exist in `agents/codex/`; never route to a role named only in examples or external toolkits.

## Integration Gate

The final owning role verifies cross-domain behavior after specialist work. Individual specialist success does not prove the integrated feature. For a feature, the developer owns integration; the tester owns evidence; the reviewer independently reports release risk when required.

## Sandbox

- Reviewer: read-only.
- Debugger: read-first, write only when assigned a fix.
- Developer/tester/build/editor: workspace-write for assigned repo work.
- Docs manager: docs-focused writes.
- Performance: measure first, then change only with evidence.

Avoid multi-agent work for tiny local edits such as renames, formatting, or single-file docs.
