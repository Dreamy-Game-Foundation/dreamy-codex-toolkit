# Android first-build gates

Inspect current Unity Android module, project version, manifest/lock, API levels,
Build Profile, scenes, scripting backend/ABI, bundled versus external JDK/SDK/NDK/
Gradle and runner executor/shell. Trace the actual BuildPlayer/preprocessor owner;
Unity version string in a data asset does not pick the runner's installed Editor.
Use the Android build specialist for Gradle/manifest/R8 diagnosis when available.

## Firebase

For the selected Android variant read `project_info.project_id`, matching
`client_info.android_client_info.package_name` and `mobilesdk_app_id`; do not
select the first JSON client blindly. Follow the installed SDK/import contract
(typically `Assets/google-services.json` in Unity). Preserve `.meta`; inspect
generated resources/resolver output when that SDK version requires them.
Client config in Git, Unity import, generated Gradle/resources and Firebase init
on device are distinct gates. “Bundle ID mismatch” alongside missing config
does not alone prove the file's package content is wrong.

## Signing

Determine new versus existing app, debug/custom signing, expected identity and
upload versus app signing key. Existing apps keep their designated key. Do not
create, rotate or replace keys without an explicit request. An internal debug
APK is a deliberate output choice, not a workaround for a missing release key.

Check clean-checkout/runner file availability, relative/absolute path resolution,
alias/private-key entry, access for the runner account and password references.
Compare BuildConfig, PlayerSettings, build method and effective Gradle signing.
Use CI file/secure storage or existing runner provisioning as appropriate; a
keystore committed in one game is not a default. Avoid secrets on command lines,
logs, snapshots or artifact archives. Review protected/environment variable scopes.

Confirm certificate SHA-256 using secure tool input and compare actual APK signer
or signed AAB certificate with the intended key role. Play app signing and upload
certificates can differ. Record this distinction for later device/API checks.

## Artifact

Require APK/AAB choice, development/release variant, applicationId, versionName,
versionCode, backend/architectures and output contract. Inspect downloaded bytes:
`apkanalyzer`/`aapt` for APK metadata and `apksigner verify --print-certs` for APK
signers when installed; AAB needs bundle-aware metadata validation and JAR
signature verification with the appropriate installed tools. AAB is not installed
directly as an APK; use the authorized bundle/device workflow if smoke testing.
Capture exact commands, versions, checksum and missing tools; do not invent passes.

## Sources

- [Firebase Unity setup](https://firebase.google.com/docs/unity/setup/): config
  location and platform registration; check against installed SDK version.
- [Android app signing](https://developer.android.com/studio/publish/app-signing):
  signing identity and upload/app signing key roles.
- [apksigner](https://developer.android.com/tools/apksigner): APK verification.

These sources describe platform contracts, not proof of a consumer build.
