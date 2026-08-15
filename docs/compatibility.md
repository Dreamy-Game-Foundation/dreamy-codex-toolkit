# Compatibility

Dreamy package compatibility is recorded in `compatibility/dreamy-packages.json`.

Rules:

- Commit is the final identity for current API claims.
- Drift stays visible until resolved upstream or marked unsupported.
- Unknown `com.dreamy.*` packages should not activate package-specific APIs.
- Stable releases allow only statuses listed in `policy.stableReleaseAllowedStatuses`.
- `drift`, `known-drift`, `unsupported`, and `globalDrift` entries are production blockers until resolved by fresh evidence or explicitly scoped out.
- `observed` means source/package metadata was inspected; it is not the same as Unity matrix `tested` evidence.

Commands:

- `npm run compatibility:fetch` writes a committed-registry evidence snapshot and source hashes. It does not claim a live upstream refresh.
- `npm run compatibility:validate` checks registry integrity.
- `npm run compatibility:report` renders JSON/Markdown drift reports with `reportGeneratedAt` separate from `evidenceRetrievedAt`.
- `npm run compatibility:refresh` runs fetch, validate, and report in sequence.
