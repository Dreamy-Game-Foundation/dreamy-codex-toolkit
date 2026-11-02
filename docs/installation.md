# Installation and project workflow

Requires Node.js >=20 and npm. Install Node from https://nodejs.org/ and reopen
terminal/Editor so PATH is refreshed. Installed entrypoints also accept
`DREAMY_NODE_BINARY` (an executable path, not a command with flags). Shell wrappers
return exit 2 with remediation when Node is missing or too old.

## Install from this checkout

```bash
npm ci
node src/cli.js install --target "/path/to/new Unity project" --preset dreamy-project --hooks off --dry-run --json
node src/cli.js install --target "/path/to/new Unity project" --preset dreamy-project --hooks off
```

For an interactive target/preset/hooks chooser, run `node src/cli.js setup`.
Noninteractive `setup --target PROJECT --preset NAME --hooks PROFILE --json`
uses the same installer. `install` never prompts. Hooks default to **off** on a
new install. Repeated install/setup and update preserve the installed preset and
hook policy unless explicitly selected; updates preserve custom disabled handlers,
limits, receipt settings and status source. Shell installer accepts target, preset,
hooks as its three positional arguments; PowerShell uses `-Target`, `-Preset`,
`-Hooks`. `--hooks` accepts off, minimal, standard or strict.

When using a published checkout/version that contains these changes, npm/npx can
supply the source CLI too:

```bash
npx --yes github:Dreamy-Game-Foundation/dreamy-codex-toolkit#main install --target "/path/to/project" --hooks off
```

The command uses whatever source main contains at that time. Pin a reviewed tag
or commit for repeatable installations. Local uncommitted changes are available
only through the checkout commands above.

## What is installed

- `Tools/dreamy-kit` and `Tools/dreamy-kit.cmd`: stable project entrypoints. They
  target their own project even when invoked from another directory.
- `.dreamy-codex/cli-runtime/`: a snapshot of the distributed CLI, harness,
  schemas, catalogs, documentation and declared production dependency closure.
  It works without the source checkout, npx cache or a global CLI on PATH.
- `docs/agents/dreamy-workflow.md`: short workflow for recall, observed failures,
  verified lessons, checkpoints, harness statuses and specialist agents.
- A thin managed AGENTS.md block linking that workflow, selected skills and
  native agent definitions, ownership metadata and a project capability profile.
  Agent definitions are installed separately; no long agent list is injected.

Inside the installed project:

```bash
bash Tools/dreamy-kit doctor --json
bash Tools/dreamy-kit lessons list
bash Tools/dreamy-kit harness project-inspect
```

On Windows, use `Tools\dreamy-kit.cmd` in place of `bash Tools/dreamy-kit`.
See the installed workflow for `lessons record/verify/recall` and
`task checkpoint/verify`. Data is created on first use under `.dreamy/`, never
in AGENTS.md. Recall is lexical and local; a verified lesson with stale source or
receipts is excluded. This is supported memory/workflow, not autonomous training.
No background model calls, transcript adapter or automatic skill promotion is
activated by installation.

## Hooks and doctor

```bash
bash Tools/dreamy-kit hooks configure --profile minimal --dry-run --json
bash Tools/dreamy-kit hooks configure --profile minimal
bash Tools/dreamy-kit doctor --native --json
```

Configuration preserves foreign native entries. The default tool status source
is `response-only`; receipts default off. Review exact definitions in native
Codex `/hooks`. Updating the runtime/policy may change those definitions and need
review again. The installer never writes trusted hashes or bypasses review.

Doctor reports these independently:

| Field under capabilities | Meaning |
|---|---|
| cli | CLI process availability and a separate entrypointStatus; a global CLI can work while project-local entrypoints are missing |
| lessons / checkpoints | Local store read/write readiness; lesson counts/eligibility, checkpoint validity; data can be lazily initialized |
| staticHarness | Static inspection is available without Unity; availability is distinct from a particular check's result |
| unityExecution | Editor executable configured or missing; actual compile/test execution stays not-run until performed |
| hooks.configuration / profile | Managed config exists or is off/not-installed |
| hooks.discovery / trust | Not-probed normally; `--native` reads runtime discovery/trust with zero model calls |
| hooks.delivery | Native delivery not established by this diagnostic; local runner receipt counts have unattributed provenance |

`hooks smoke --native` is a separate native lifecycle check and may return
not-run if runtime defers SessionStart until a real user turn. No automatic turn
is sent. Native config/trust, runner receipts and fixture passes never imply full
operational acceptance. See [evolution guide](toolkit-evolution.md).

Unity compile/tests need `DREAMY_UNITY_PATH` or `UNITY_PATH` pointing to the Editor
executable; license, test assemblies and actual project compatibility still need
execution. Avoid batchmode against a project already open in Unity. Static
inspection pass does not prove Unity code/UI correctness. Missing infrastructure
is degraded/not-run with its reason, never pass.

## Update and uninstall

Update applies the distribution bundled with the CLI that you invoke; it does not
download newer source. Refresh your checkout/npm CLI first to upgrade versions:

```bash
node src/cli.js update --target "/path/to/project" --backup --dry-run --json
node src/cli.js update --target "/path/to/project" --backup
```

`bash Tools/dreamy-kit update` reapplies its local snapshot. This is useful for
reconciliation, not fetching a new release. Ownership checks reject collisions
with user-owned wrappers/workflows, edited managed files or drifted hook entries.
Preserve/relocate those edits before retrying; do not use force to hide drift.
New installs record hashes for agent/skill artifacts, plus a version-1
workflow-state.json for runtime/wrappers/guide. Existing install-state v1/v2 stays
compatible; upgrading establishes the new ownership hashes. User text outside
the AGENTS.md block and foreign config/agents/skills are retained.

```bash
bash Tools/dreamy-kit uninstall
```

Normal uninstall removes managed entrypoints/runtime/workflow, agents/skills,
hooks and managed AGENTS.md block. It **preserves** `.dreamy/knowledge/`, evidence,
checkpoints and promoted user-owned project skills. A second uninstall through
an external CLI is safe (the local wrapper has been removed). `--dry-run` previews
without mutation. Explicit purge/force remain recovery operations for broken legacy
installs; inspect ownership first. Normal global uninstall does not delete
unowned files merely because their names match toolkit names.

## Global install

```bash
node src/cli.js install --target global --preset dreamy-project --hooks off
node src/cli.js doctor --target global --json
```

Skills go under the user Agents home, agents/AGENTS.md under Codex home, and the
same runtime/Tools/workflow paths are installed **under Codex home**. Environment
overrides `DREAMY_CODEX_HOME` and `DREAMY_AGENTS_HOME` are supported. This does not
change PATH or require copying a toolkit.json into every project.

From a project cwd, `bash "$HOME/.codex/Tools/dreamy-kit" lessons list` uses that
project's local data. Use your configured Codex home path if customized. Global
lifecycle changes require `--target global` explicitly. To obtain the short
project-local entrypoint/workflow and project-owned native hooks, run project
install separately. Unity executable/license and project-specific test capability
also remain per-environment/project setup. Non-off `--hooks` on a global install
is rejected with the project configuration command; no global hooks are installed.

```bash
node src/cli.js uninstall --target global
```
