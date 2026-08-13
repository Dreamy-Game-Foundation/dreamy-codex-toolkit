# Installation

Run commands from the toolkit repository root.

## Requirements

- Node.js 20 or newer
- npm

## Validate The Toolkit

```bash
npm test
```

For a smaller validation pass:

```bash
node src/cli.js validate
```

## Inspect A Unity Project

```bash
node src/cli.js detect --target /path/to/unity-project --json
```

`detect` reads `Packages/manifest.json` when present and reports Dreamy packages whose names start with `com.dreamy.`.

## Install

```bash
node src/cli.js install --target /path/to/unity-project --preset dreamy-project
```

Available presets:

- `core`
- `unity-minimal`
- `dreamy-project`
- `dreamy-package`

The installer writes only:

- the Dreamy managed block in `AGENTS.md`
- Dreamy Codex agent templates in `.codex/agents`
- a Dreamy managed agent block in `.codex/config.toml`
- `.dreamy-codex/project-profile.json`
- `.dreamy-codex/install-state.json`

It refuses to install over an existing Dreamy managed block.

Preview without writing:

```bash
node src/cli.js install --target /path/to/unity-project --preset dreamy-project --dry-run
```

## Install From GitHub

These paths match the upstream Oh My Game Kit style and install from `https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit`.

Install the CLI globally from a GitHub tarball:

```bash
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz
dreamy-kit --help
dreamy-kit validate
dreamy-kit install --target /path/to/unity-project --preset dreamy-project
```

Run once with `npx`:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main validate
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target /path/to/unity-project --preset dreamy-project
```

Install into the current user's Codex home:

```bash
dreamy-kit install --target global --preset dreamy-project
```

On Windows this resolves to:

```text
C:\Users\<you>\.codex\
```

Global install writes:

- `.codex/AGENTS.md`
- `.codex/config.toml`
- `.codex/agents/dreamy-*.toml`
- `.codex/skills/<dreamy-skill>/SKILL.md`
- `.codex/.dreamy-codex/install-state.json`

Pin a release tag after releases exist:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#v0.1.0 doctor --target /path/to/unity-project
```

Clone for development:

```bash
git clone https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit.git
cd dreamy-codex-toolkit
npm test
node src/cli.js install --target /path/to/unity-project --preset dreamy-project
```

If a GitHub Packages release is added later, use the same pattern as Oh My Game Kit:

```bash
npm config set @dreamy-game-foundation:registry https://npm.pkg.github.com
npx --yes @dreamy-game-foundation/dreamy-codex-toolkit validate
```

## Doctor

```bash
node src/cli.js doctor --target /path/to/unity-project --json
```

`doctor` validates the local toolkit artifacts and emits the detected project profile with `doctor.status`.

## Uninstall

```bash
node src/cli.js uninstall --target /path/to/unity-project
```

Uninstall removes only the owned Dreamy managed block from `AGENTS.md`. It refuses to remove anything when:

- `.dreamy-codex/install-state.json` is missing
- Dreamy managed block markers are malformed
- the current `AGENTS.md` checksum differs from the checksum recorded during install

It also removes Dreamy-owned agent files recorded in `.dreamy-codex/install-state.json` and removes the managed Dreamy agent block from `.codex/config.toml`.

Preview without writing:

```bash
node src/cli.js uninstall --target /path/to/unity-project --dry-run
```

For global uninstall:

```bash
dreamy-kit uninstall --target global
```

## List Toolkit Contents

```bash
node src/cli.js list
```

This prints presets, modules, rules, and skills from `toolkit.json`.

## Update Status

```bash
node src/cli.js update
```

`update` currently reports `not-implemented` because this alpha baseline does not yet define a released upgrade path.
