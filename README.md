# Dreamy Codex Toolkit

Codex toolkit for Dreamy Unity projects and packages.

This repository is being implemented wave-by-wave from [`DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md`](DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md).

## Current Status

W0-W10 baseline is implemented:

- `toolkit.json` is the toolkit manifest.
- `compatibility/dreamy-packages.json` records verified Dreamy package versions, commits, dependencies, capabilities, and drift.
- `docs/research/source-ledger.json` records inspected source repositories.
- `rules/index.json` catalogs the initial core, C#, and Unity safety rules.
- `skills/unity-*` contains the first Unity safety skill stubs.
- `skills/index.json` catalogs Dreamy, platform, production, gameplay, systems, and third-party skills.
- `src/cli` provides local `dreamy-kit` style validate/detect/install/doctor/uninstall/list commands.
- `harness/dreamy-harness` emits evidence JSON for validation and asmdef checks.
- `scripts/validate` validates the current artifacts with Bash and `jq`.
- `scripts/check-unity-safety` catches Runtime-to-Editor asmdef references in JSON fixtures.

## Commands

```bash
scripts/validate
tests/unit/w0-validation.sh
tests/unit/w2-unity-safety.sh
tests/unit/w4-installer-lifecycle.sh
tests/unit/w5-harness.sh
```

## Phase Order

The initial pass now covers W0-W10 at a practical baseline level. Remaining work is hardening: richer Unity Editor execution, real release artifacts, broader eval runner scoring, and upstream package drift resolution.
