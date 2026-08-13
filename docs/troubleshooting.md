# Troubleshooting

## Target Does Not Exist

`dreamy-kit install --target /path/to/project` requires a real directory. Use `--target global` for user-level install.

## Skills Not Discovered

Project skills are installed to `.agents/skills`. User skills are installed to `$HOME/.agents/skills` or `DREAMY_AGENTS_HOME/skills` during tests.

## Agent Files

Project agents are installed to `.codex/agents`. User agents are installed to `$HOME/.codex/agents` or `DREAMY_CODEX_HOME/agents`.

## Update Refuses Drift

Update and uninstall refuse to touch a managed `AGENTS.md` block when its checksum differs from install state. Review the file, then rerun with `--force` only when you accept the risk.
