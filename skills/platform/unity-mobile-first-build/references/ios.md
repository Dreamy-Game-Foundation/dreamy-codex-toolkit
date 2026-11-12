# iOS first-build gates

First choose the intended output: Unity Xcode project export, Xcode archive, or
signed exported IPA. An unsigned Xcode project export does not need a distribution
identity and is not an installable IPA. Check the chosen Unity version's iOS
module, scripting backend, target architecture and minimum deployment target.

## Runner and generated project

Require a macOS/Xcode runner for archive/export. Verify selected Xcode/SDK version,
command-line developer directory, license/first-launch readiness, Unity license,
executor/shell and access to private dependencies. Inspect postprocessors,
frameworks, generated workspace/project, Podfile/lock and installed CocoaPods/Ruby
when Pods are required. Do not run `pod update` or upgrade every SDK to hide a
resolution error. Unity export, Pod resolution, native compile/link, archive and
IPA export are separate stages. Build against the reviewed project/SDK/script SHA.

## Firebase and keys

Use the iOS app's `GoogleService-Info.plist`; inspect `PROJECT_ID`, `GOOGLE_APP_ID`
and `BUNDLE_ID` against the effective target bundle ID, following SDK import and
Xcode resource-copy contracts. Typically it belongs under Unity `Assets` with a
stable `.meta`. Android JSON/key rows are not interchangeable with iOS config.
File presence, Unity import, Xcode target inclusion and runtime init remain
separate checks. Never substitute a service-account private credential.

## Signing and capabilities

For signed output record app history, bundle ID, team ID, manual/automatic signing,
certificate identity/fingerprint with its private key available in the runner
keychain, profile UUID/type/expiry, allowed app identifier/team/entitlements and
export method. Inspect all signed targets/extensions, not just Unity's main
target. Account for registered devices when the chosen distribution method needs
them. Preserve an existing app's team/identity; do not create/revoke certificates,
register devices or enable automatic provisioning changes without authorization.

For automatic signing inspect effective resolved signing assets and account access;
do not treat a checkbox or `-allowProvisioningUpdates` as authority to mutate an
Apple account. For manual signing confirm profile and certificate compatibility.
Protect P12 passwords, private keys, keychain passwords and any App Store Connect
API private key. Prefer existing secret provisioning with a scoped temporary
keychain, minimum access and cleanup; never wipe unrelated runner keychains.
No App Store Connect credentials are required just to export an unsigned project.

Compare effective Xcode settings, generated Info.plist, entitlements, embedded
profile, certificate and ExportOptions contract. Include capability/privacy/usage
description requirements actually triggered by the selected SDKs (e.g. ATT if
used); do not turn this into an unsolicited full store launch checklist. Keep
Runtime free of UnityEditor.iOS.Xcode/Editor dependencies.

## Handoff and diagnosis

Record source/SDK/script/toolchain revisions and output type. For xcarchive/IPA
inspect bundle ID, CFBundleShortVersionString, CFBundleVersion, platform/ABI,
actual signature/team/entitlements/profile and expiry. Use macOS `codesign`,
`security cms` and plist inspection where available, without dumping private
credentials. Archive success alone does not prove IPA export success. A signed
IPA may still be unusable on an unlisted device or wrong provisioning method.
Record a downloadable file/checksum or a deterministic archive manifest; device
install/startup is separate. Do not automatically upload to TestFlight/App Store.

Triage Git/auth → runner/shell → license/toolchain → packages → injection/C# →
Firebase/Pods → native compile/link → signing/profile/capabilities → archive →
export/artifact → device. Capture the first causal Xcode/Pod/Unity diagnostic and
smallest matching verification. Stop for missing account rights, signing assets,
external source contract or repeated failures without new evidence.

## Sources

- [Firebase Unity setup](https://firebase.google.com/docs/unity/setup/).
- [Apple archive and distribution](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).
- [Apple distribution to registered devices](https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices).
- [Apple export options](https://help.apple.com/xcode/mac/current/en.lproj/dev23ea8b877.html).

Confirm version-specific Xcode/export options against the installed toolchain;
these sources do not establish a successful iOS build in this toolkit.
