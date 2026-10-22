# Toolkit CI triage

Use for failed toolkit GitHub Actions, npm tests, installer or packaging checks. Use Unity/platform diagnosis for player builds instead. This extends the existing debugger role; no additional always-loaded skill is needed.

Identify exact run, head SHA, matrix OS/Node, failed step and raw error. Cancellation is not the original failure. Compare the command executed with the platform and files present before changing source.

For test discovery failures, verify the runner actually enumerates tests; a zero-test exit is not a passing suite. Shell wildcard behavior differs across platforms and Node versions. `scripts/test-unit.mjs` passes sorted absolute files without a shell.

For packaging failures, distinguish npm executable resolution, pack output, isolated dependency installation and packed CLI validation. `scripts/pack-smoke.mjs` uses npm's JavaScript entrypoint through the current Node executable. Do not generalize this into invoking every command with cmd.exe.

For release failures, inspect version, source fingerprint, run identity and artifact hashes. A tracked release report or fresh timestamp does not prove this run tested this source. Create current-run evidence before checking release readiness. Keep alpha packaging separate from semantic/Unity production readiness.

Reproduce each platform's failure independently, make a focused correction and verify the original trigger. On infrastructure failure preserve exact command/reason. Once resolved, record a project lesson with failure + resolution evidence; do not turn a single OS quirk into a global rule.
