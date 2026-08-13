# W0 Research Baseline

The W0 baseline separates three kinds of statements:

- `observed`: read from the checked-out source or package manifest.
- `drift`: observed, but inconsistent with another observed source.
- `unsupportedContracts`: not verified in current source and therefore unavailable to automation.

Primary machine-readable files:

- `source-ledger.json`: inspected repositories and commits.
- `../../compatibility/dreamy-packages.json`: Dreamy package capability and drift matrix.

Unity compile, PlayMode, and build validation have not been executed in W0.
