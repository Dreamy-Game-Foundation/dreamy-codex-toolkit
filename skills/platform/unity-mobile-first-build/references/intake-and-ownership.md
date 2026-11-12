# Intake, ownership and normalized preflight

## Discover before asking

Read AGENTS/workflow/conventions, brief, Git HEAD/branch/index/worktree, remote,
manifest/lock, ProjectVersion, PlayerSettings, Build Profiles, enabled scenes,
asmdefs, CI/template installer and build pre/postprocessors. Inspect current
package commits or compatibility records before API claims. A tag or package
manifest alone does not prove a drifting package cache or CI injection version.

Maintain a field ledger with `requirement` (required/optional/conditional),
`status` (discovered/supplied/missing/conflict/not-applicable), `sourceRef`,
`owner`, `sensitivity`, and `value` **or** a secret reference. Missing is a state,
not a default. Ask grouped questions only after discovery. For selected SDKs
missing keys, report the blocker and propose defer/disable as an explicit scope
choice; do not silently change the selection. Do independent work while blocked.

| Inputs | Requirement |
| --- | --- |
| Game name, platform, package/bundle ID, Unity version, app version, Android versionCode/iOS build number | Required |
| Repo URL/branch, CI provider, trigger, runner tags/executor/shell, Unity entrypoint and versioned source contract | Required for execution |
| Target modules/toolchain/license and private package/SDK access | Required for execution |
| APK/AAB/Xcode project/xcarchive/IPA, variant, backend/architectures, destination, retention, access and audience | Required; artifact format changes signing gates |
| Mediation/SDK selection, platform-specific keys/App IDs, ad units by provider/source/format/tier | Conditional on selected capability |
| Firebase client file, project/app identity and matching package/bundle ID | Conditional on Firebase/injection contract |
| App history, signing mode/identity, key/profile/cert source, alias/team, secret sources, fingerprints | Conditional on platform and requested output; see platform reference |
| IAP catalog, store/app, product ID/type/enabled, game references | Conditional on IAP |
| Store link, notes, Unity Cloud linkage | Optional unless build contract requires them |

## Field ownership, not a universal precedence rule

For each field record authored source → importer/generator → CI injection/build
preprocessor → effective build value → runtime override, with source/version for
each edge. Unknown precedence remains unknown; BuildConfig does not always win.

| Field | Owners and evidence to compare |
| --- | --- |
| Name, app ID, version, API/deployment target, backend/ABI | Brief, BuildConfig if consumed, PlayerSettings, profile, CLI/environment, final build method; inspect effective values and artifact metadata |
| SDK/key/ads | Brief, current schema, generated settings and injected SDK revision; inspect post-injection assembly graph/defines/target compile |
| Banner | Call site explicit argument, API default, config, backend semantics, runtime config; source then render/device evidence |
| Firebase | Platform client file, import contract, generated resources, dependency resolution, runtime initialization; separate gates |
| Signing | Existing identity owner, secret provisioning, PlayerSettings/BuildConfig, platform build/export script; inspect actual signer |
| IAP | SDK defaults/catalog, static game config/constants and store inventory for same app; persistent player ownership remains separate |
| CI root | Template/generator/InitializeOnLoad, includes, server CI config path and effective rules; edit authoritative owner only |
| Checkout and artifacts | Pipeline SHA versus actual build HEAD, full SDK/script pins, output publication/access and downloaded bytes |

Do not open/import Unity during read-only inspection without accounting for
InitializeOnLoad and import side effects. Later serialized mutations use supported
Unity APIs narrowly, preserving GUID/meta/fields/overrides; save, refresh, Console
and relevant tests after C# changes. Runtime must not reference Editor assemblies.

## Optional dependency-free checker

From the installed skill directory:

```sh
node scripts/preflight.mjs --input /absolute/path/snapshot.json --dry-run
```

It reads **one JSON file only**, at most 1 MiB, writes JSON to stdout, and never
opens Unity, reads referenced files, accesses environment secret values, launches
processes, networks, builds, edits, pushes or uploads. `--dry-run` is explicit
documentation of the same read-only behavior. References are opaque handles,
not commands. Do not supply raw keys/passwords/keystore bytes. Findings contain
fixed codes and schema paths, never input values. Unknown top-level fields and
secret-bearing property names are rejected; this is not a general secret scanner.

Exit 0: normalized static checks passed; 1: invalid/conflict; 2: missing/unproven;
64: usage/unreadable/oversized/malformed JSON. No exit code proves runner facts,
effective CI rules, compatibility, build success or permission. Snapshot assertions
must be independently sourced and fresh. It deliberately does not parse arbitrary
Unity YAML, CI YAML, build scripts or binary provisioning profiles.

### Snapshot schema v1

Plain values below are the normalization of the field ledger, not a replacement
for its provenance. Keep source references in `sources` (non-secret strings).
Omitted conditional sections are valid only when their capability is not selected.
Unknown optional observations are omitted, never guessed. All examples are
synthetic; replace `example.invalid` references with actual source handles.

```json
{
  "schemaVersion": 1,
  "platform": "Android",
  "game": {"name":"Example", "applicationId":"com.example.demo", "unityVersion":"6000.0.1f1", "version":"1.0.0", "buildNumber":"1"},
  "repo": {"url":"https://gitlab.example.invalid/team/demo.git", "remoteUrl":"https://gitlab.example.invalid/team/demo.git", "branch":"ci-build", "sha":"1111111111111111111111111111111111111111"},
  "ci": {"provider":"gitlab", "source":"push", "ruleSource":"push", "ruleBranch":"ci-build", "rulesReviewed":true, "templateOwned":false, "ownerKnown":true, "runnerTags":["android"], "executor":"shell", "shell":"pwsh", "unityVersion":"6000.0.1f1", "toolchainRef":"inventory:android", "licenseAvailable":true, "dependencyAccess":true, "entrypointRef":"source:build-script", "entrypointVersion":"revision:one", "sideEffectsReviewed":true, "forbiddenGitEffects":false, "pinsGameSha":true, "propagatesExitCodes":true},
  "output": {"format":"apk", "variant":"development", "destinationRef":"artifact:download", "retention":"7 days", "audience":"internal", "backend":"IL2CPP", "architectures":["ARM64"]},
  "signing": {"mode":"debug", "appHistory":"new"},
  "sdks": [],
  "sources": ["brief:approved", "repo:inspected"]
}
```

Required common fields are shown above; `sdks:[]` explicitly records no selected
SDKs rather than guessing from an omitted inventory. `remoteUrl` may be omitted until remote
inspection; missing produces incomplete. `ruleSource/ruleBranch` is an intentionally
limited normalized representation of a single reviewed matching rule, **not** a
GitLab rules interpreter. Use literal `"any"` only when reviewed effective rules
really allow any source/ref; complex rules must first be evaluated by the owner.
`templateOwned:true` requires `rootMatchesTemplate:true`.

Optional conditional structures:

- `sdks[]`: `{name, enabled, requiredKeys:[names], keyRefs:{name:opaqueRef}}`.
  Supply `requiredKeys` even when empty after source review; omitted requirements
  are unknown. Known MAX/Applovin, AdMob/GoogleAd, ByteBrew and SolarSDK requirements
  are also checked. Reference presence is not account/key ownership verification.
- `adUnits[]`: `{provider, source, type, tier?, id, excluded?, position?, adaptive?}`.
  IDs are client configuration, but output never echoes them. Source/type enum
  names must be matched to current source by the agent. The checker knows only
  MAX/Applovin and AdMob/GoogleAd conventions, and reports others unsupported.
  Excluded input rows must not enter this **active** list.
- `firebase`: `{enabled, projectId, appId, applicationId, path, importPath,
  metaPresent, imported?}`. These are inspected client metadata, not credentials.
  `importPath` comes from the SDK contract. Imported true remains an assertion.
- Android custom `signing`: `{mode:"custom", appHistory:"new"|"existing",
  fileRef, runnerAvailable, alias, aliasExists, passwordRef, aliasPasswordRef,
  expectedFingerprint, observedFingerprint}`. SHA-256 certificate fingerprints
  accept 64 hex digits with optional colons. Debug signing is only for a new app
  and a development APK, not a release/AAB or an existing app identity.
- iOS signed output `signing`: `{mode:"manual"|"automatic", appHistory,
  teamId, certificateRef, privateKeyAvailable, profileRef, profileApplicationId,
  profileTeamId, certificateMatchesProfile, profileValid, exportMethod,
  entitlementsMatch, expectedFingerprint, observedFingerprint}`; iOS project
  export alone uses `{mode:"unsigned-export", appHistory}`. Wildcard provisioning
  matching needs explicit human verification; the checker conservatively accepts
  exact app ID or `teamId.applicationId` only. For automatic signing, use an
  effective resolved profile snapshot, not an account password. Add `ci.macos`,
  `ci.xcodeVersion`, `ci.podsRequired`, and conditional `ci.podsVersion`.
- `assemblies`: `{facadeName, injectedName, runtimeReferencesEditor}` after
  inventory. This checks an identified SDK replacement identity only, not every
  valid assembly graph. Omit if there is no injection; verify full graph separately.
- `banner`: `{configuredPosition, callsitePosition, effectivePosition?}` only if
  banner integration is in scope. `NotDefined` defers to backend/source semantics.
- `iap`: `{enabled, applicationId, store, catalogIds:[ids], gameIds:[ids],
  storeIds:[ids]}`. Compare IDs required by the game, allowing extra store products;
  source review must also compare types, enable flags, grants and runtime config.
- `artifact`: inspected `{exists, retrievable, packageId, version, buildNumber,
  format, fingerprint?, sha256}`. The checker compares these assertions but does
  not read artifact bytes or verify a signature. Missing actual artifact is normal
  pre-build; artifact/device gates stay unverified regardless of static status.

`sources` and every input reference must point to allowed source material without
URL userinfo/query credentials. Never feed a full BuildConfig object containing
password fields; normalize only safe fields listed here.
