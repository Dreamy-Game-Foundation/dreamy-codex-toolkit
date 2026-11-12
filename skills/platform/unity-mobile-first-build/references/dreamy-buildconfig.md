# Conditional Dreamy bridge adapter

Detect actual schema/types/enums and inspected revision first; this file is a
mapping procedure, not certification of a Dreamy package or SDK API. Manifest/
lock and the compatibility registry may cover foundation packages but not an
injected proprietary backend. Record facade and injected module full revisions.

For a bridge whose inspected types match `BuildConfigSO.config.android/ios`, map
only fields actually present: `game_name`, `package_name`, `game_version`,
`unity_version`, `sdks`, `ad_units`, `max_sdk_key`, `google_app_id`,
`bytebrew_game_id`, `bytebrew_sdk_key`; Android may have `key_store_info` and API
levels. iOS may have `target_ios_version`. Confirm semantics with the consumer
build method: do not invent versionCode, team or output fields; do not assume
`game_version` splits on `_` without the build parser contract.

| Input | Mapping decision |
| --- | --- |
| MAX SDK key | SDK initialization field, never an ad-unit ID |
| MAX ad-unit ID | Active ad unit with Applovin source and explicit format |
| AdMob App ID | App configuration (`~`), not ad-unit configuration (`/`) |
| AdMob unit + High/Medium/All tier | Separate source/type pairs using current enum names; never hard-code enum ordinals |
| ByteBrew Game ID / SDK Key | Two platform-aware fields, not MAX/AdMob keys |
| Firebase project/app | Read client file identity; never Unity Cloud ID, AdMob App ID or service-account credential |
| Banner position | Compare caller argument, default API, asset and backend semantics |

Do not add missing/placeholder units, excluded Auto Bidding rows, duplicate
source/type pairs or unknown-format icon rows. MREC/App Open IDs do not authorize
new placements. Do not copy Android keys/settings to iOS or choose mediation
priority from the label “active”; preserve approved priority or ask.

A local bridge can have empty facade methods; local compile is not injected SDK
proof. Inspect post-injection assembly identities/references, GUID/platform/
defines, package resolution and target compile. Keep Runtime free of Editor and
preserve `.meta` GUIDs when an authorized rename is actually needed.

Inspect validator side effects before using it as preflight: validators may set
Unity version, null lists, write resources, call SDK helpers or validate both
platforms. Do not automate private reflection overloads as a supported public
contract. Prefer pure snapshot checks, or a verified public dry-run API. Scope
Android/iOS independently; unrelated platform failure is not permission to fake
its keys. Keep mutation in supported serialization/editor APIs.

Check whether an InitializeOnLoad installer copies a bridge CI template to the
root file. Edit the generator/source owner, not an output that will be overwritten.
Do not assume either a runner-specific batch/shell path, production environment,
disabled TLS verification or committed keystore is a reusable default.
