# Dreamy Codex Toolkit

[![Version](https://img.shields.io/badge/version-0.1.0--alpha.2-blue.svg)](toolkit.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node: >=20](https://img.shields.io/badge/node-%3E%3D20-green.svg)](package.json)

**Dreamy Codex Toolkit** is a standardized AI agent, skill, and configuration toolkit designed for development within the **Dreamy Unity Ecosystem**. It empowers AI assistants (such as OpenAI Codex, Claude, Antigravity) with structured domain knowledge, project inspection utilities, safety rules, and native agent templates to accelerate Unity game development and package maintenance.

`toolkit.json` serves as the canonical source of truth for versioning, maturity, presets, modules, rules, skills, and harness metadata.

---

## 📋 Table of Contents

- [✨ Key Features](#-key-features)
- [📦 Architecture & Concepts](#-architecture--concepts)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Installation Guide](#-installation-guide)
  - [Option 1: One-Off Execution via `npx` (Recommended)](#option-1-one-off-execution-via-npx-recommended)
  - [Option 2: Global CLI Installation (`dreamy-kit`)](#option-2-global-cli-installation-dreamy-kit)
  - [Option 3: Local Repository Clone (Development)](#option-3-local-repository-clone-development)
  - [Global User Target Installation](#global-user-target-installation)
- [⚙️ Configuration & Presets](#️-configuration--presets)
  - [Available Presets](#available-presets)
  - [Environment Variables](#environment-variables)
  - [Installed Files & State Tracking](#installed-files--state-tracking)
- [🛠️ CLI Reference (`dreamy-kit`)](#️-cli-reference-dreamy-kit)
- [🤖 Agents & Skills Ecosystem](#-agents--skills-ecosystem)
  - [Codex Agents](#codex-agents)
  - [Skills Architecture](#skills-architecture)
- [🔄 Maintenance & Lifecycle](#-maintenance--lifecycle)
  - [Project Diagnostics (`doctor`)](#project-diagnostics-doctor)
  - [Updating Managed Installs](#updating-managed-installs)
  - [Clean Uninstallation](#clean-uninstallation)
- [🧪 Development & Testing](#-development--testing)
- [📄 License & Documentation](#-license--documentation)

---

## ✨ Key Features

- **Non-Destructive Managed Block**: Modifies target `AGENTS.md` safely using SHA256 checksums and explicit delimiter markers. Never overwrites user-authored rules.
- **Native Codex Agent Templates**: Installs specialized `.toml` agent prompts into `.codex/agents/` for seamless activation.
- **Modular Presets & Skill Discovery**: Select preset bundles (`dreamy-project`, `dreamy-package`, `unity-full`, etc.) that automatically filter skills based on installed `com.dreamy.*` Unity packages.
- **Architectural & Safety Gates**: Enforces strict C# and Unity practices, such as preventing Runtime-to-Editor assembly definition references (`asmdef`).
- **Package Drift & Compatibility Tracking**: Maintains verified compatibility records in `compatibility/dreamy-packages.json`.
- **Degraded-State Harness & Diagnostics**: Emits machine-readable JSON evidence and diagnostic checks (`doctor`) even when Unity is offline or headlessly executing.

---

## 📦 Architecture & Concepts

The toolkit follows a strictly managed, modular design:

```text
dreamy-codex-toolkit/
├── toolkit.json                  # Canonical toolkit manifest & source of truth
├── package.json                  # npm package definition (exports `dreamy-kit` bin)
├── agents/codex/*.toml           # Codex agent prompt definitions
├── compatibility/               # Unity & Dreamy package compatibility registries
├── docs/                         # Specifications, implementation plans, and installation guides
├── harness/                      # Evidence collector and degraded execution harness
├── modules/                      # Modular groupings of skills, rules, and agents
├── presets/                      # Target configuration bundles (core, dreamy-project, etc.)
├── rules/                        # Core architecture & safety rules catalog
├── schemas/                      # JSON Schema definitions for manifests, profiles, and state
├── skills/                       # Domain skills (Dreamy core, Unity gameplay, rendering, etc.)
├── src/cli.js                    # Toolkit CLI entry point (`dreamy-kit`)
└── templates/                    # Managed AGENTS.md templates
```

---

## ⚙️ Prerequisites

- **Node.js**: `v20.0.0` or newer
- **npm**: `v9.0.0` or newer
- **Git**: Installed and accessible in PATH
- **Unity**: 2022.3 LTS or newer (Optional for local CLI usage; required for live Unity harness execution)

---

## 🚀 Installation Guide

### Option 0: ⚡ 1-Click / Interactive Wizard for Beginners (Recommended)

If you are new or want an effortless setup:

#### 1. Interactive Step-by-Step Terminal Wizard:
Run a single command in your terminal inside your Unity project folder:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main
```
This launches an interactive wizard that automatically detects your Unity project, scans installed `com.dreamy.*` packages, and guides you step-by-step!

#### 2. Quick 1-Line Script (Automated):

- **macOS / Linux**:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.sh | bash
  ```

- **Windows (PowerShell)**:
  ```powershell
  iwr -useb https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.ps1 | iex
  ```

- **Windows (Double-Click)**:
  Download and double-click [`scripts/install.bat`](scripts/install.bat).

---

### Option 1: Standard Execution via `npx`

Run directly from GitHub against your target Unity project:

```bash
# 1. Detect project configuration and installed com.dreamy.* packages
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main detect --target /path/to/unity-project

# 2. Install the default dreamy-project preset
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target /path/to/unity-project --preset dreamy-project

# 3. Verify installation health
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main doctor --target /path/to/unity-project
```

*To pin a specific release version:*
```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#v0.1.0 install --target /path/to/unity-project --preset dreamy-project
```

---

### Option 2: Global CLI Installation (`dreamy-kit`)

Install the `dreamy-kit` executable globally on your system:

```bash
# Install globally via GitHub tarball
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz

# Test executable availability
dreamy-kit --help

# Install into a Unity project
dreamy-kit install --target /path/to/unity-project --preset dreamy-project
```

---

### Option 3: Local Repository Clone (Development)

Clone the repository to contribute or test locally:

```bash
# 1. Clone the repository
git clone https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit.git
cd dreamy-codex-toolkit

# 2. Run validation and unit tests
npm test

# 3. Execute installation on a project using local source
node src/cli.js install --target /path/to/unity-project --preset dreamy-project
```

---

### Global User Target Installation

To make Dreamy agents and skills available globally for **all projects** under your user profile:

```bash
dreamy-kit install --target global --preset dreamy-project
```

This writes managed assets to your global Codex environment:
- **Windows**: `C:\Users\<User>\.codex\` and `C:\Users\<User>\.agents\skills\`
- **Linux / macOS**: `~/.codex/` and `~/.agents/skills/`

---

## ⚙️ Configuration & Presets

### Available Presets

Pass `--preset <name>` during `install` or `update` to choose your desired setup:

| Preset Name | Target Use Case | Included Capabilities |
| :--- | :--- | :--- |
| `core` | Base minimum | Essential foundation rules & core CLI modules |
| `unity-minimal` | Simple Unity project | Essential C# safety rules & basic Unity skills |
| `unity-production` | Commercial Unity project | Advanced Unity optimization, UI, safety & asset rules |
| `unity-full` | Complete Unity setup | Full suite of Unity systems, rendering, gameplay & mobile |
| **`dreamy-project`** *(Default)* | Standard Dreamy game | Auto-detects `com.dreamy.*` packages and installs relevant skills |
| `dreamy-production` | Enterprise Dreamy game | Full Dreamy project setup with strict safety & release gates |
| `dreamy-package` | Dreamy UPM package | Tailored for package maintainers, asmdef & API compatibility |
| `dreamy-template` | Boilerplate template | Base configuration for authoring project starters |
| `dreamy-full` | Comprehensive | Installs **all** available skills, agents, rules & modules |

---

### Environment Variables

Override default target directories by setting the following environment variables:

| Environment Variable | Description | Default Path |
| :--- | :--- | :--- |
| `DREAMY_CODEX_HOME` | Directory for Codex configuration & agent templates | `~/.codex` (`%USERPROFILE%\.codex` on Windows) |
| `DREAMY_AGENTS_HOME` | Directory for shared skill packages | `~/.agents` (`%USERPROFILE%\.agents` on Windows) |

Example usage:
```bash
export DREAMY_CODEX_HOME="/custom/path/to/.codex"
export DREAMY_AGENTS_HOME="/custom/path/to/.agents"
dreamy-kit install --target global
```

---

### Installed Files & State Tracking

When installed into a target project (`/path/to/unity-project`), the toolkit writes **only** the following paths:

```text
unity-project/
├── AGENTS.md                            # Appends managed block delimited by DREAMY-CODEX markers
├── .agents/
│   └── skills/                          # Installed Dreamy skills (e.g. dreamy-core, dreamy-ui)
├── .codex/
│   └── agents/                          # Installed Codex agent definitions (dreamy-*.toml)
└── .dreamy-codex/
    ├── project-profile.json             # Detected packages and project metadata snapshot
    └── install-state.json               # State registry & SHA256 checksums for safe update/uninstall
```

---

## 🛠️ CLI Reference (`dreamy-kit`)

The CLI entry point `dreamy-kit` (or `node src/cli.js`) provides the following subcommands:

```text
dreamy-kit <command> [options]
```

### Commands Summary

| Subcommand | Description | Key Options |
| :--- | :--- | :--- |
| `detect` | Inspects target path, identifies Unity engine & `com.dreamy.*` packages | `--target PATH`, `--json` |
| `install` | Installs agents, skills, and `AGENTS.md` managed block | `--target PATH\|global`, `--preset NAME`, `--dry-run` |
| `update` | Refreshes managed assets and updates toolkit version | `--target PATH\|global`, `--preset NAME`, `--force`, `--backup`, `--dry-run` |
| `uninstall` | Safely removes managed block and installed toolkit files | `--target PATH\|global`, `--dry-run` |
| `doctor` | Runs diagnostic health checks on workspace & dependencies | `--target PATH`, `--json` |
| `validate` | Validates schemas, rules, skill manifests, and acceptance tests | *(None)* |
| `list` | Lists all registered presets, modules, rules, and skills in JSON | *(None)* |
| `eval` | Executes deterministic evaluation harness and outputs report | `--runner static` |

---

## 🤖 Agents & Skills Ecosystem

### Codex Agents

The toolkit installs five specialized Codex agent roles defined in `.codex/agents/`:

1. 🎮 **`dreamy_unity_developer`** (`dreamy-unity-developer.toml`)
   - Focus: Feature implementation, gameplay C# scripting, and Unity component assembly.
2. 📦 **`dreamy_package_maintainer`** (`dreamy-package-maintainer.toml`)
   - Focus: Unity Package Manager (UPM) structure, asmdef configuration, versioning, and API compatibility.
3. 🛡️ **`dreamy_release_validator`** (`dreamy-release-validator.toml`)
   - Focus: Pre-release verification, safety gate validation, and harness log evaluation.
4. 📝 **`dreamy_docs_manager`** (`dreamy-docs-manager.toml`)
   - Focus: Maintaining `README.md`, `CHANGELOG.md`, API references, and architecture docs.
5. 🛠️ **`dreamy_skill_author`** (`dreamy-skill-author.toml`)
   - Focus: Designing, expanding, and validating Dreamy domain skills.

---

### Skills Architecture

Skills provide modular, structured instruction sets for agents. They reside under `skills/` and are categorized as follows:

- **Dreamy Core Skills**: `dreamy-core`, `dreamy-dataconfig`, `dreamy-datasave`, `dreamy-assets`, `dreamy-ui`, `dreamy-audio`, `dreamy-feedback`, `dreamy-localization`, `dreamy-editor-tools`.
- **Unity Engine Skills**: `unity-csharp-safety`, `unity-asmdef-architecture`, `unity-performance-optimization`, `unity-ui-toolkit`, `unity-addressables`, `unity-input-system`.
- **Production & Gameplay**: `production-safety`, `gameplay-architecture`, `game-systems`.

---

## 🔄 Maintenance & Lifecycle

### Project Diagnostics (`doctor`)

Run `doctor` to inspect system readiness, file integrity, and package compatibility:

```bash
dreamy-kit doctor --target /path/to/unity-project
```

Example JSON output overview:
```json
{
  "status": "ok",
  "checks": [
    { "id": "node", "severity": "INFO", "message": "Node v20.11.0" },
    { "id": "project-agents", "severity": "INFO", "message": "/path/to/unity-project/.codex/agents" },
    { "id": "dreamy-com.dreamy.core", "severity": "INFO", "message": "1.2.0 compatible" }
  ],
  "capabilities": {
    "unity": true,
    "harness": { "git": "ok", "unity": "degraded" }
  }
}
```

---

### Updating Managed Installs

To update installed agents and skills to the latest toolkit version:

```bash
# Preview update changes
dreamy-kit update --target /path/to/unity-project --dry-run

# Execute update
dreamy-kit update --target /path/to/unity-project
```

*Handling Modified Managed Files:*
If `AGENTS.md` was manually altered inside the managed block, `update` will halt to prevent accidental data loss. Use `--force` and `--backup` to override:

```bash
dreamy-kit update --target /path/to/unity-project --force --backup
```

---

### Clean Uninstallation

`uninstall` removes only the managed block from `AGENTS.md` and the files recorded in `.dreamy-codex/install-state.json`. It will refuse to run if checksum drift indicates unmanaged modifications:

```bash
# Preview uninstallation
dreamy-kit uninstall --target /path/to/unity-project --dry-run

# Perform uninstallation
dreamy-kit uninstall --target /path/to/unity-project
```

---

## 🧪 Development & Testing

Run full validation and unit testing suite locally:

```bash
# Run schema validation, skill check, acceptance tests, and unit tests
npm test

# Run unit tests only
npm run test:node

# Run artifact validation only
npm run validate

# Run evaluation harness
npm run eval:deterministic
```

---

## 📄 License & Documentation

- **License**: MIT License - see [LICENSE](LICENSE) for details.
- **Master Plan**: See [`docs/plans/DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md`](docs/plans/DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md) for roadmap details.
- **Detailed Install Doc**: See [`docs/installation.md`](docs/installation.md).
