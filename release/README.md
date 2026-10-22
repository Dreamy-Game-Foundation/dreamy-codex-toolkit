# Release Artifacts

This directory is reserved for signed checksums, changelog excerpts, and release promotion notes.

No production release artifact has been produced yet.

CI sets DREAMY_ARTIFACTS_DIR and DREAMY_RUN_ID for isolated current-run evidence. Local commands default to this directory. Committed historical JSON files are reference artifacts; the pack gate requires a matching source fingerprint/version/run and the actual tarball hash. Generate pack evidence before release:check. No semantic or production readiness is implied by alpha package validation.
