# Dreamy Codex Toolkit

[![Version](https://img.shields.io/badge/version-0.1.0--alpha.2-blue.svg)](toolkit.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node: >=20](https://img.shields.io/badge/node-%3E%3D20-green.svg)](package.json)

**Dreamy Codex Toolkit** is a standardized AI agent, skill, and configuration toolkit designed for development within the **Dreamy Unity Ecosystem**. It empowers AI assistants (such as OpenAI Codex, Claude, Antigravity) with structured domain knowledge, project inspection utilities, safety rules, and native agent templates to accelerate Unity game development and package maintenance.

`toolkit.json` serves as the canonical source of truth for versioning, maturity, presets, modules, rules, skills, and harness metadata.

---

## ⚡ 1-Click Copy & Paste Installation

Open your terminal **inside your Unity project folder** and copy-paste one of the single blocks below:

### Global CLI Installation (Recommended)
```bash
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install
```

### Direct `npx` (No Global Install)
```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install
```

---

## 📋 Table of Contents

- [⚡ 1-Click Copy & Paste Installation](#-1-click-copy--paste-installation)
- [✨ Key Features](#-key-features)
- [📦 Architecture & Concepts](#-architecture--concepts)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Installation Guide](#-installation-guide)
  - [1. 1-Line Script Installers](#1-1-line-script-installers)
  - [2. Interactive Setup Wizard](#2-interactive-setup-wizard)
  - [3. Local Repository Clone (Development)](#3-local-repository-clone-development)
  - [4. Global Target Installation](#4-global-target-installation)
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
- **Default Current Directory (`.`)**: All commands work in the current terminal directory without typing or modifying path arguments.
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

*(Note: All commands default to the current terminal directory. You do NOT need to specify `--target` unless targeting another folder).*

### 1. 1-Line Script Installers

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

### 2. Interactive Setup Wizard

Run `dreamy-kit` or `npx` with zero arguments inside your Unity project folder to launch the interactive prompt:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main
```

---

### 3. Local Repository Clone (Development)

```bash
git clone https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit.git
cd dreamy-codex-toolkit
npm test
node src/cli.js install
```

---

### 4. Global Target Installation

To install Dreamy agents and skills into your global user profile (`~/.codex` / `%USERPROFILE%\.codex`):

```bash
dreamy-kit install --target global
```

---

## 🗑️ Uninstallation & Global Purge

*(This section is dedicated exclusively to removing or purging installed toolkit files).*

### Local Project Uninstall

To remove managed Dreamy blocks and agents from the current Unity project folder:

```bash
dreamy-kit uninstall
```
*Or via npx:*
```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main uninstall
```

---

### Global Toolkit Purge

To completely purge all Dreamy managed files from your global user profile (`~/.codex` and `~/.agents`):

```bash
dreamy-kit purge
```
*Or via npx:*
```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main purge
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

Commands default to the current directory. Output is clean, human-readable terminal text. Add `--json` for machine JSON output.

| Subcommand | Description | Key Options |
| :--- | :--- | :--- |
| `setup` / `init` | Interactive step-by-step setup wizard | *(None)* |
| `install` | Installs agents, skills, and `AGENTS.md` block | `--preset NAME`, `--dry-run`, `--json` |
| `update` | Refreshes managed assets to latest version | `--force`, `--backup`, `--dry-run`, `--json` |
| `uninstall` | Removes managed files from current project | `--dry-run`, `--json` |
| **`purge`** | **Purges all global user profile assets (`~/.codex`)** | `--dry-run`, `--json` |
| `doctor` | Runs diagnostic health checks | `--json` |
| `detect` | Inspects Unity engine & `com.dreamy.*` packages | `--json` |
| `validate` | Validates schemas, rules, and acceptance tests | *(None)* |
| `list` | Catalogs presets, modules, rules, and skills | *(None)* |

---

## 🤖 Agents & Skills Ecosystem

### Codex Agents

1. 🎮 **`dreamy_unity_developer`**: Gameplay, C# scripting, component assembly.
2. 📦 **`dreamy_package_maintainer`**: UPM structure, asmdefs, compatibility.
3. 🛡️ **`dreamy_release_validator`**: Pre-release checks and evidence logs.
4. 📝 **`dreamy_docs_manager`**: Maintenance of READMEs, CHANGELOGs, and docs.
5. 🛠️ **`dreamy_skill_author`**: Skill design and expansion.

---

## 🔄 Maintenance & Diagnostics

### Project Diagnostics (`doctor`)

```bash
dreamy-kit doctor
```

### Updating Managed Installs

```bash
dreamy-kit update
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
