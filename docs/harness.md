# Harness

`harness/dreamy-harness` currently supports:

- `git-status`: emit status diagnostics as JSON.
- `git-diff`: emit diff diagnostics as JSON.
- `compile`, `console`, `test-editmode`, `test-playmode`: emit degraded JSON when Unity/MCP is unavailable.
- `project-inspect` / `validate-project`: statically report manifest, lock, and Unity version file presence.
- `asmdef`: run a static fixture-level Runtime/Editor/GUID safety check.
- `package-check` / `validate-package`, `validate-addressables`, `build-android`, `build-ios`: emit degraded JSON until real adapters are configured.

Every operation emits `schemaVersion`, `adapter`, `operation`, `status`, `diagnostics`, and `exitCode`. Degraded operations use a non-zero exit code and `degradedReason`; they must not be treated as success.
