# Installation & Uninstallation Guide

## ⚡ 1-Click Copy & Paste Installation

### 🌐 Global System User Profile Installation (For All Projects)
*Installs Dreamy agents and skills globally into `~/.codex/` and `~/.agents/skills/`. No Unity manifest warning required.*

```bash
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install --target global
```

Or via 1-line script:
- **macOS / Linux**: `curl -fsSL https://raw.githubusercontent.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/main/scripts/install.sh | bash -s global`

---

### 📁 Single Unity Project Installation (For Current Directory)
*Open terminal inside your specific Unity project folder and run:*

```bash
npm install --global https://github.com/Dreamy-Game-Foundation/dreamy-codex-toolkit/archive/refs/heads/main.tar.gz && dreamy-kit install
```

Or without global CLI installation:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install
```

---

## 🗑️ Uninstallation & Global Purge

### Local Project Uninstall

To remove managed toolkit files from your current Unity project:

```bash
dreamy-kit uninstall
```

If a broken alpha install left Dreamy markers without state, review `AGENTS.md` and then run:

```bash
dreamy-kit uninstall --force
```

### Global User Profile Purge

To completely remove all Dreamy managed files from your global user profile (`~/.codex` plus toolkit skills in `~/.agents`):

```bash
dreamy-kit purge
```

---

## 🩺 Diagnostic Checks (`doctor`)

To check system health globally:

```bash
dreamy-kit doctor --target global
```

To check current project health:

```bash
dreamy-kit doctor
```
