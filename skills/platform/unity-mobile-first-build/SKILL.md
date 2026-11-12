---
name: unity-mobile-first-build
description: Prepare or resume a first Unity Android or iOS build through GitLab CI/CD, from a brief or SDK key table through configuration preflight, authorized execution and artifact handoff. Supports Dreamy bridges when detected; route isolated platform errors and store publication to their narrower skills.
---

# Unity Mobile First Build

## Scope

Own the brief → configuration → CI → artifact evidence chain for Android or iOS.
Use existing Android/iOS build specialists for platform diagnosis when available;
the platform references below also work without those skills installed.
Dreamy is optional. This workflow does not authorize store publication.

## Decisions

1. Read project instructions, Git status, manifest/lock, build profiles, asmdefs,
   build scripts and CI generators before proposing changes. Preserve user work,
   serialized references and Runtime/Editor boundaries. Recall matching lessons;
   checkpoint work that spans turns using the project's available workflow.
2. Read [intake](references/intake-and-ownership.md). Discover existing values
   before asking only for unresolved required/conditional fields. Keep observed,
   inferred and unknown separate. Never turn sample keys into supplied inputs.
3. Load only the target platform: [Android](references/android.md) or
   [iOS](references/ios.md). For a detected Dreamy bridge also read
   [mapping](references/dreamy-buildconfig.md), inspecting its current schema and
   injected SDK version. Local facade compilation is not backend verification.
4. Run the optional read-only checker on a **normalized, secret-free snapshot**:
   `node scripts/preflight.mjs --input /path/to/snapshot.json --dry-run`.
   Read the script contract in intake first. It neither discovers project state
   nor proves that supplied assertions are true. Resolve its findings against
   sources; never use its pass as permission or build readiness.
5. Before execution read [CI and evidence](references/gitlab-and-evidence.md).
   Audit external scripts for checkout, secret handling, signing and post-build
   Git/upload actions. Missing source/versioned contract or actions beyond scope
   block execution. Keep plan-only requests plan-only; commit/push/build/secret
   provisioning require authorization covering their actual effects. Never
   force-push or delete remote tags to obtain a build.

## Verification

Report configuration, target compile after SDK injection, push, pipeline creation,
runner assignment, Unity/platform build, artifact and device checks separately.
Bind evidence to game SHA, SDK/build-script revisions, target and host platform.
Handoff a retrievable artifact with checksum, identity, version, variant and
signing evidence; a green job or network-copy message is insufficient.

On failure collect the first causal diagnostic and redacted context, test the
smallest hypothesis at its own layer, and stop when rights/source/secrets are
missing or retries add no evidence. Agree a bounded retry budget before running
CI. Do not mass-upgrade packages. Verify lessons only with fresh matching
supported receipts; retain unknown gates instead of relabeling static checks.

## References

- [Intake and ownership](references/intake-and-ownership.md): input contract,
  source precedence, preflight usage and limits.
- [GitLab and evidence](references/gitlab-and-evidence.md): execution gates,
  triage, stopping conditions and handoff.
- [Android](references/android.md): Firebase, runner, keystore and APK/AAB.
- [iOS](references/ios.md): Firebase, macOS/Xcode, signing and archive/export.
- [Dreamy BuildConfig](references/dreamy-buildconfig.md): load only for a
  detected matching bridge/schema; not a universal package API contract.
