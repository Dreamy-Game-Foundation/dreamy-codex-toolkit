# Harness

`harness/dreamy-harness` currently supports:

- `git-status`: emit status diagnostics as JSON.
- `git-diff`: emit diff diagnostics as JSON.
- `compile`, `console`, `test-editmode`, `test-playmode`: run Unity batchmode when `DREAMY_UNITY_PATH` is configured; otherwise emit degraded JSON.
- `project-inspect` / `validate-project`: emit a schema-valid capability profile with exact Unity revision, declared/resolved packages, render-pipeline evidence, asmdef graph, build scenes, capability evidence and source hashes. Missing manifest/version fails; missing lock degrades.
- `asmdef`: parse asmdef JSON/graph and reject direct Runtime-to-Editor assembly references.
- `package-check` / `validate-package`: validate project/package source completeness statically.
- `validate-addressables`: reports observed package state but remains degraded until Unity content validation exists.
- `build-android`, `build-ios`: run Unity only when both `DREAMY_UNITY_PATH` and a verified `DREAMY_UNITY_BUILD_METHOD` are configured.

Every operation emits compact JSON evidence by default with `schemaVersion`, `adapter`, `operation`, `status`, `summary`, `diagnostics`, `errors`, `artifacts`, and `exitCode`. Status is only `pass`, `fail`, or `degraded`. Degraded operations use a non-zero exit code and `degradedReason`; they must not be treated as success. Use `--full` or `DREAMY_HARNESS_FULL=1` to include large debug payloads such as the full project profile.

Example:

```bash
dreamy-kit harness git-status .
dreamy-kit harness project-inspect /path/to/unity-project
```

The direct Node entrypoint remains available for automation:

```bash
node harness/dreamy-harness project-inspect /path/to/unity-project
node harness/dreamy-harness project-inspect /path/to/unity-project --full
```

Unity operations require a configured Editor executable:

```powershell
$env:DREAMY_UNITY_PATH = "C:\Program Files\Unity\Hub\Editor\6000.0.1f1\Editor\Unity.exe"
dreamy-kit harness compile C:\path\to\project
dreamy-kit harness test-editmode C:\path\to\project
```

Unity logs and test XML are written to a unique temporary evidence directory and listed with SHA-256 checksums. The repository includes a pinned `6000.4.12f1` vertical-slice fixture. The local Editor attempt on 2026-08-15 was correctly classified `degraded` because Unity licensing was unavailable, so there is still no successful compile/test evidence and `compatibility/unity.json.tested` remains empty.
