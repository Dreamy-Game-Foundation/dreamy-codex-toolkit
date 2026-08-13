<!-- DREAMY-CODEX:START schema=1 -->
## Dreamy Codex Toolkit

Use `toolkit.json` as the canonical version, status, maturity, module, preset, skill, and harness source.

Safety gates:

- Inspect `Packages/manifest.json` and `Packages/packages-lock.json` before making Dreamy API claims.
- Keep Runtime assemblies free of Editor references.
- Run the smallest available validation command before claiming done.

Installed Codex agents:

- `dreamy_unity_developer`: feature and Unity C# implementation.
- `dreamy_package_maintainer`: package manifest, asmdef, compatibility, and release maintenance.
- `dreamy_release_validator`: release-readiness checks.
- `dreamy_docs_manager`: README/docs updates.
- `dreamy_skill_author`: Dreamy skill creation and expansion.
<!-- DREAMY-CODEX:END -->
