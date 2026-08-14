# Dreamy Codex Toolkit

[![Version](https://img.shields.io/badge/version-0.1.0--alpha.2-blue.svg)](toolkit.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node: >=20](https://img.shields.io/badge/node-%3E%3D20-green.svg)](package.json)

**Dreamy Codex Toolkit** is a standardized AI agent, skill, and configuration toolkit designed for development within the **Dreamy Unity Ecosystem**. It empowers AI assistants (such as OpenAI Codex, Claude, Antigravity) with structured domain knowledge, project inspection utilities, safety rules, and native agent templates to accelerate Unity game development and package maintenance.

`toolkit.json` serves as the canonical source of truth for versioning, maturity, presets, modules, rules, skills, and harness metadata.

Current readiness and next steps:

- [Toolkit assessment](docs/toolkit-assessment-2026-08-15.md)
- [Comparison with The1 Unity Claude Agents](docs/toolkit-comparison-the1.md)
- [Completion plan](docs/toolkit-completion-plan.md)
- [Benchmark plan](docs/toolkit-benchmark-plan.md)
- [Dogfood protocol](docs/dogfood-protocol.md)

The eval command validates catalog structure and deliberately emits no semantic pass score. The separate benchmark runner executes a configured agent command and stores treatment-level artifacts. Unity harness operations use local batchmode when `DREAMY_UNITY_PATH` is configured and otherwise report `degraded`; no tested Unity matrix is claimed yet.

---

## ⚡ 1-Click Copy & Paste Installation

Choose your installation scope below and run in your terminal:

### 🌐 Global System User Profile Installation (For All Projects on Machine)
*Installs Dreamy agents and skills globally into `~/.codex/` and `~/.agents/skills/`. No Unity manifest warning required.*

- **Via npm (Recommended)**:
  ```bash
  npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install --target global
  ```

- **Via 1-Line Script (macOS / Linux)**:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.sh | bash -s global
  ```

- **Via 1-Line Script (Windows PowerShell)**:
  ```powershell
  & ([scriptblock]::Create((iwr -useb https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.ps1))) -Target global
  ```

---

### 📁 Single Unity Project Installation (For Current Directory)
*Open terminal inside your specific Unity project folder and run:*

- **Via npm (Recommended)**:
  ```bash
  npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install
  ```

- **Via npx (No Global CLI Install)**:
  ```bash
  npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install
  ```

- **Via 1-Line Script (macOS / Linux)**:
  ```bash
  curl -fsSL https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.sh | bash
  ```

- **Via 1-Line Script (Windows PowerShell)**:
  ```powershell
  iwr -useb https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.ps1 | iex
  ```

---

## 📋 Table of Contents

- [⚡ 1-Click Copy & Paste Installation](#-1-click-copy--paste-installation)
- [✨ Key Features](#-key-features)
- [📦 Architecture & Concepts](#-architecture--concepts)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Installation Guide](#-installation-guide)
  - [1. Global User Profile Installation (`--target global`)](#1-global-user-profile-installation---target-global)
  - [2. Current Project Installation](#2-current-project-installation)
  - [3. Interactive Setup Wizard](#3-interactive-setup-wizard)
  - [4. Local Repository Clone (Development)](#4-local-repository-clone-development)
- [🗑️ Uninstallation & Global Purge](#️-uninstallation--global-purge)
  - [Local Project Uninstall](#local-project-uninstall)
  - [Global Toolkit Purge](#global-toolkit-purge)
- [⚙️ Configuration & Presets](#️-configuration--presets)
- [🛠️ CLI Reference (`dreamy-kit`)](#️-cli-reference-dreamy-kit)
- [🤖 Agents & Skills Ecosystem](#-agents--skills-ecosystem)
- [🔄 Maintenance & Diagnostics](#-maintenance--diagnostics)
- [🧪 Development & Testing](#-development--testing)

---

## ✨ Key Features

- **Professional Terminal Output**: Clean, human-readable CLI logs with emojis and status checks by default (use `--json` for machine JSON output).
- **Dual Target Scopes**: Install globally into your user profile (`~/.codex/`) for all projects or locally into a specific Unity project.
- **Default Current Directory (`.`)**: All project commands work in the current terminal directory without typing or modifying path arguments.
- **Non-Destructive Managed Block**: Modifies target `AGENTS.md` safely using SHA256 checksums and explicit delimiter markers.
- **Native Codex Agent Templates**: Installs specialized `.toml` agent prompts into `.codex/agents/`.
- **Modular Presets & Skill Discovery**: Automatically filters skills based on installed `com.dreamy.*` Unity packages.
- **Global Purge Capability**: Single command `dreamy-kit purge` to completely clean global user profile assets.

---

## 📦 Architecture & Concepts

```text
dreamy-codex-toolkit/
├── toolkit.json                  # Canonical toolkit manifest & source of truth
├── package.json                  # npm package definition (exports `dreamy-kit` bin)
├── agents/codex/*.toml           # Codex agent prompt definitions
├── compatibility/               # Unity & Dreamy package compatibility registries
├── docs/                         # Specifications and installation guides
├── harness/                      # Evidence collector and execution harness
├── modules/                      # Modular groupings of skills, rules, and agents
├── presets/                      # Target configuration bundles
├── rules/                        # Core architecture & safety rules catalog
├── schemas/                      # JSON Schema definitions
├── scripts/                      # 1-line installation scripts (sh, ps1, bat)
├── skills/                       # Domain skills
└── src/cli.js                    # Toolkit CLI entry point (`dreamy-kit`)
```

---

## ⚙️ Prerequisites

- **Node.js**: `v20.0.0` or newer
- **npm**: `v9.0.0` or newer
- **Git**: Installed and accessible in PATH

---

## 🚀 Installation Guide

### 1. Global User Profile Installation (`--target global`)

Installs Dreamy Codex agents into `~/.codex/agents/` and skills into `~/.agents/skills/`. This makes all agents and skills globally active for your AI coding assistant in every project.

```bash
# Via npm
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install --target global

# Via 1-line bash script (macOS/Linux)
curl -fsSL https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.sh | bash -s global
```

---

### 2. Current Project Installation

Installs Dreamy Codex agents and skills into the current Unity project directory (`./.codex/agents` and `./.agents/skills`), updating the local `AGENTS.md`.

```bash
# Via npm
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install

# Via npx
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install
```

---

### 3. Interactive Setup Wizard

Run `dreamy-kit` or `npx` with zero arguments to launch the interactive prompt:

```bash
dreamy-kit
```

---

### 4. Local Repository Clone (Development)

```bash
git clone https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit.git
cd dreamy-codex-toolkit
npm test
node src/cli.js install
```

---

## 🗑️ Uninstallation & Global Purge

### Local Project Uninstall

To remove managed Dreamy blocks and agents from the current Unity project folder:

```bash
dreamy-kit uninstall
```

---

### Global Toolkit Purge

To completely purge all Dreamy managed files from your global user profile (`~/.codex` and `~/.agents`):

```bash
dreamy-kit purge
```

---

## ⚙️ Configuration & Presets

### Presets Reference

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

## 🛠️ CLI Reference (`dreamy-kit`)

Commands default to the current directory unless `--target global` is specified. Output is clean, human-readable terminal text. Add `--json` for machine JSON output.

| Subcommand | Description | Key Options |
| :--- | :--- | :--- |
| `setup` / `init` | Interactive step-by-step setup wizard | *(None)* |
| `install` | Installs agents, skills, and `AGENTS.md` block | `--target PATH\|global`, `--preset NAME`, `--dry-run`, `--json` |
| `update` | Refreshes managed assets to latest version | `--target PATH\|global`, `--force`, `--backup`, `--dry-run`, `--json` |
| `uninstall` | Removes managed files from current project | `--target PATH\|global`, `--dry-run`, `--json` |
| **`purge`** | **Purges all global user profile assets (`~/.codex`)** | `--dry-run`, `--json` |
| `doctor` | Runs diagnostic health checks | `--target PATH\|global`, `--json` |
| `detect` | Inspects Unity engine & `com.dreamy.*` packages | `--target PATH`, `--json` |
| `validate` | Validates schemas, rules, and acceptance tests | *(None)* |
| `list` | Catalogs presets, modules, rules, and skills | *(None)* |
| `eval` | JSON-Schema validates the eval catalog without semantic pass claims | `--runner catalog` |

---

## 🤖 Agents & Skills Ecosystem

### Codex Agents

| Agent | Responsibility |
|---|---|
| `dreamy_project_analyst` | Read-only project capability profile and routing preflight |
| `dreamy_plan` | Repository-aware implementation plans |
| `dreamy_architect` | Ownership, dependency, data and lifecycle decisions |
| `dreamy_unity_developer` | Gameplay, UI wiring and Unity C# implementation |
| `dreamy_unity_editor` | Safe scene, prefab and Editor state mutation |
| `dreamy_debugger` | Evidence-driven root-cause diagnosis and fixes |
| `dreamy_tester` | Test-layer selection, fixtures and execution |
| `dreamy_code_reviewer` | Correctness, safety and regression review |
| `dreamy_performance_engineer` | Profile-driven CPU/GPU/memory/mobile optimization |
| `dreamy_build_engineer` | Unity, Android, iOS and CI build work |
| `dreamy_package_maintainer` | UPM manifests, asmdefs and compatibility truth |
| `dreamy_release_validator` | Release gates and evidence validation |
| `dreamy_docs_manager` | README, architecture, install and source-grounded docs |
| `dreamy_skill_author` | Skill and reference creation/maintenance |

---

## 🔄 Maintenance & Diagnostics

### Diagnostics (`doctor`)

```bash
dreamy-kit doctor
dreamy-kit doctor --target global
```

### Updating Managed Installs

```bash
dreamy-kit update
dreamy-kit update --target global
```

---

## 🧪 Development & Testing

Run developer tests inside the repository directory:

```bash
cd /path/to/dreamy-codex-toolkit
npm test
```

---

## 📄 License & Documentation

- **License**: MIT License - see [LICENSE](LICENSE).
- **Master Plan**: See [`docs/plans/DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md`](docs/plans/DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md).
- **Installation Doc**: See [`docs/installation.md`](docs/installation.md).
