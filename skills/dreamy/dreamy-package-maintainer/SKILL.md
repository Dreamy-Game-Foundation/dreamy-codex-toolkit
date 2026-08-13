---
name: dreamy-package-maintainer
description: Maintain Dreamy package manifests, asmdefs, API compatibility, tests, release notes, and tags.
---

# Dreamy Package Maintainer

## When To Use

- Updating Dreamy package manifests, asmdefs, release notes, tags, or compatibility data.
- Verifying a package API before another skill relies on it.
- Resolving drift in Dreamy or third-party dependencies.

## Read First

- package `package.json`
- package asmdefs
- package tests
- public Runtime and Editor API surface
- `docs/research/source-ledger.json`
- `compatibility/dreamy-packages.json`
- `compatibility/third-party.json`

## Workflow

1. Record the inspected repository, commit, version, Unity version, dependencies, and package role.
2. Separate observed facts, intended contracts, drift, and unsupported contracts.
3. Update source ledger and compatibility records together.
4. Run package tests when available and toolkit validation afterward.
5. Keep release notes explicit about breaking changes and dependency requirements.

## Release Blockers

- Missing verified commit.
- Package version, tag, asmdef, or manifest dependency drift.
- Runtime assembly referencing Editor assembly.
- Public API claim without source evidence.
- Unsupported headless API documented as supported.

## Output

Report verified commit, files inspected, drift changed, tests run, and remaining unresolved hypotheses.
