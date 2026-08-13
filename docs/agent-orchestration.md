# Agent Orchestration

Use the smallest role set that can verify the task.

## Flows

- Feature: dreamy_unity_developer -> dreamy_tester.
- Bug: dreamy_debugger -> dreamy_unity_developer -> dreamy_tester.
- Review: dreamy_code_reviewer; add dreamy_tester only when validation is needed.
- Performance: dreamy_performance_engineer -> dreamy_unity_developer -> dreamy_tester.
- Android/iOS build: dreamy_build_engineer; add dreamy_debugger only for failures.

## Sandbox

- Reviewer: read-only.
- Debugger: read-first, write only when assigned a fix.
- Developer/tester/build/editor: workspace-write for assigned repo work.
- Docs manager: docs-focused writes.
- Performance: measure first, then change only with evidence.

Avoid multi-agent work for tiny local edits such as renames, formatting, or single-file docs.
