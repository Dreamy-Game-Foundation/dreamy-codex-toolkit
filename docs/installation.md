# Installation & Uninstallation Guide

## ⚡ 1-Click Copy & Paste Installation

Open your terminal inside your Unity project directory and run:

```bash
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install
```

Or without global installation:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install
```

---

## 🚀 Installation Options

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

```bash
dreamy-kit
# or
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main
```

---

## 🗑️ Uninstallation & Global Purge

### Local Project Uninstall

To remove managed toolkit files from your current Unity project:

```bash
dreamy-kit uninstall
```

### Global User Profile Purge

To completely remove all Dreamy managed files from your global user profile (`~/.codex` / `%USERPROFILE%\.codex`):

```bash
dreamy-kit purge
```

---

## 🩺 Diagnostic Checks (`doctor`)

To check system and project health:

```bash
dreamy-kit doctor
```

Add `--json` for machine JSON output:

```bash
dreamy-kit doctor --json
```
