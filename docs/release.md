# Release

Release baseline:

- all shell validators pass;
- installer lifecycle preserves user bytes outside managed block;
- harness evidence JSON is valid;
- unresolved Dreamy package drift remains visible;
- Node/Unity runtime checks are marked not-run unless the toolchain exists.

Alpha release artifacts:

- npm tarball smoke from `npm run pack:smoke`;
- `release/eval-report.json`;
- `release/compatibility-drift-report.json`;
- `release/compatibility-drift-report.md`.
