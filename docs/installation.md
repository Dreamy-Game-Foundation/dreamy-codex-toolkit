# Installation

Local commands:

```bash
src/cli validate
src/cli detect --target /path/to/unity-project
src/cli install --target /path/to/unity-project --preset dreamy-project
src/cli doctor --target /path/to/unity-project
src/cli uninstall --target /path/to/unity-project
```

The installer writes only `AGENTS.md` managed block and `.dreamy-codex/` state/profile files in the target.
