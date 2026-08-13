# Dreamy Codex Toolkit

Codex toolkit for Dreamy Unity projects and packages.

This repository is being implemented wave-by-wave from [`DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md`](DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md).

## Source Docs

- The prompt master plan file is the original build prompt.
- [`DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md`](DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md) is the implementation plan and wave checklist.
- [`docs/installation.md`](docs/installation.md) has the detailed local install, doctor, and uninstall flow.

## Current Status

W0-W10 baseline is implemented:

- `toolkit.json` is the toolkit manifest.
- `compatibility/dreamy-packages.json` records verified Dreamy package versions, commits, dependencies, capabilities, and drift.
- `docs/research/source-ledger.json` records inspected source repositories.
- `rules/index.json` catalogs the initial core, C#, and Unity safety rules.
- `skills/unity-*` contains the first Unity safety skill stubs.
- `skills/index.json` catalogs Dreamy, platform, production, gameplay, systems, and third-party skills.
- `agents/codex/*.toml` provides Dreamy Codex agent templates for implementation, package maintenance, release validation, docs, and skill authoring.
- `src/cli` provides local `dreamy-kit` style validate/detect/install/doctor/uninstall/list commands.
- `harness/dreamy-harness` emits evidence JSON for validation and asmdef checks.
- `scripts/validate` validates the current artifacts with Bash and `jq`.
- `scripts/check-unity-safety` catches Runtime-to-Editor asmdef references in JSON fixtures.

## Why Agents And Skills Are Short

This toolkit is still an alpha baseline. Some `skills/*/SKILL.md` files are routing and safety contracts, while the Dreamy core workflow skills are being expanded into detailed task guides. They tell Codex when to activate a capability, what files to inspect, what claims are allowed, and what verification is required.

Dreamy package API guidance should only become longer after it is tied to verified commits in `compatibility/dreamy-packages.json` and observed sources in `docs/research/source-ledger.json`. That keeps the toolkit from inventing unsupported APIs.

The installer now writes a managed block into the target project's `AGENTS.md`, copies Dreamy agent templates into `.codex/agents`, and registers them in `.codex/config.toml`.

Installed agents:

- `dreamy_unity_developer`
- `dreamy_package_maintainer`
- `dreamy_release_validator`
- `dreamy_docs_manager`
- `dreamy_skill_author`

## Install Locally

Requirements:

- Node.js 20 or newer
- npm

Run from this repository:

```bash
npm test
node src/cli.js detect --target /path/to/unity-project --json
node src/cli.js install --target /path/to/unity-project --preset dreamy-project
node src/cli.js doctor --target /path/to/unity-project --json
```

Available presets:

- `core`
- `unity-minimal`
- `dreamy-project`
- `dreamy-package`

The installer only writes:

- a Dreamy managed block in the target `AGENTS.md`
- Dreamy agent templates in `.codex/agents`
- a Dreamy managed agent block in `.codex/config.toml`
- `.dreamy-codex/project-profile.json`
- `.dreamy-codex/install-state.json`

It refuses duplicate managed blocks and records checksums so uninstall can avoid removing user-owned text.

## Install From GitHub

Users can install or run directly from `https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit`.

Global npm install from a GitHub tarball:

```bash
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz
dreamy-kit validate
dreamy-kit install --target /path/to/unity-project --preset dreamy-project
```

One-off `npx` run:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target /path/to/unity-project --preset dreamy-project
```

After a release tag exists, prefer pinning the tag:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#v0.1.0 install --target /path/to/unity-project --preset dreamy-project
```

Clone for local development:

```bash
git clone https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit.git
cd dreamy-codex-toolkit
npm test
node src/cli.js install --target /path/to/unity-project --preset dreamy-project
```

## Uninstall

Run:

```bash
dreamy-kit uninstall --target /path/to/unity-project
```

Uninstall removes only the managed Dreamy block that this toolkit owns. It refuses to proceed if `.dreamy-codex/install-state.json` is missing, the markers are malformed, or `AGENTS.md` changed after install.

It also removes Dreamy-owned `.codex/agents/dreamy-*.toml` files recorded during install and removes the Dreamy managed agent block from `.codex/config.toml`.

Use a dry run when you only want to inspect intent:

```bash
dreamy-kit install --target /path/to/unity-project --preset dreamy-project --dry-run
dreamy-kit uninstall --target /path/to/unity-project --dry-run
```

## Commands

```bash
npm test
node src/cli.js validate
node src/cli.js list
node src/cli.js update
```

## Phase Order

The initial pass now covers W0-W10 at a practical baseline level. Remaining work is hardening: richer Unity Editor execution, real release artifacts, broader eval runner scoring, and upstream package drift resolution.

`src/cli update` currently returns `not-implemented`; there is no released upgrade path in this local baseline yet.
