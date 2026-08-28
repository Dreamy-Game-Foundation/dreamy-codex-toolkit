---
name: dreamy-package-maintainer
description: Maintain Dreamy package manifests, asmdefs, dependency direction, compatibility facts, release notes, tags, semver, and consumer validation.
---

# Dreamy Package Maintainer

## Purpose

Keep package contracts source-grounded and compatible across Dreamy consumers.

## When To Use

- The task changes, reviews, debugs, or plans behavior in this domain.
- Nearby code already implements this domain and the change can alter ownership, lifecycle, data, assets, platform behavior, or verification.
- A review/debugging/planning task needs this domain's decision model or failure modes.

## When Not To Use

- A narrower skill owns the concrete behavior more directly.
- The request is documentation-only and does not make domain, API, or verification claims.
- The project lacks the package or platform and the task is not about detection, fallback, or migration.

## Domain Model

Package manifest -> asmdef graph -> public API -> compatibility registry -> tests/consumer fixture -> changelog/tag.

## Required Inspection

- Project `AGENTS.md` when present, local instructions, nearby code owners, tests, and recent diffs.
- Unity projects: `Packages/manifest.json`, `Packages/packages-lock.json`, asmdefs, scenes/prefabs/assets relevant to this domain.
- Compatibility catalogs before Dreamy, Unity-package, or third-party API claims.
- Existing runtime owner, persistence owner, UI/presenter owner, asset owner, and lifecycle cleanup path.

## Decision Tree

- Manifest/asmdef/source wins over README.
- Drift stays explicit until verified commit closes it.
- Package cannot reference project code.
- Public API change needs semver/migration rationale.
- If the owner is unclear, stop at a plan/architecture decision before mutating code.

## Workflow

1. Inspect current owner and existing project convention.
2. Map static config, persistent state, runtime state, UI, service, asset, and lifecycle ownership where applicable.
3. Choose the smallest change that preserves architecture, serialization, and dependency direction.
4. Add or update focused tests/fixtures when behavior, migration, or lifecycle risk changes.
5. Run compile, console, targeted tests, harness/static validation, or record the exact unavailable gate.
6. Review diff for unrelated churn and unsupported API claims.

## Architecture Rules

- Keep Runtime assemblies free of Editor references.
- Keep DataConfig, Datasave, runtime state, UI, and service responsibilities separate.
- Resolve global services at roots/high-level owners; pass explicit dependencies to leaves.
- Preserve `.meta` GUIDs, serialized references, prefab overrides, and package dependency direction.
- Optimize only from measured evidence.

## Common Patterns

- Update source ledger and compatibility together.
- Separate observed facts from intended contracts.

## Anti-patterns

- Claim support without commit.
- Mass dependency upgrade to try a fix.
- Runtime assembly references Editor.

## Common Failure Modes

- Unsupported or drifted API claim.
- Hidden owner change between package, project, UI, runtime state, or persistence.
- Lifecycle leak through async work, events, tweens, pooled objects, Addressables handles, or scene transitions.
- Verification skipped without a precise degraded reason.

## Verification

- Compile/console/test result when Unity is available, otherwise degraded harness/static evidence with exact reason.
- Focused regression for duplicate calls, cancellation/destruction, save/load, migration, or platform branch when relevant.
- Diff review for serialization, `.meta`, asmdef/manifest, scene/prefab, and unrelated changes.

## Dreamy Integration

- Inspect Dreamy package compatibility before using package APIs.
- Keep observed facts, intended contracts, and unresolved hypotheses separate.
- Route project-specific glue to project code and reusable capability to package/shared ownership only when dependency direction is clean.

## Allowed Claims

Dreamy package APIs are allowed only when backed by `compatibility/dreamy-packages.json` and not listed as drift or unsupported.

## References

- Read project `AGENTS.md` and `rules/index.json` when present; for global installs, use the packaged skill/rule context and relevant compatibility catalog before making ownership or API claims.
- Use nearby project code and rule files as the reference source; add a skill-local reference only when repeated gotchas need more depth.
