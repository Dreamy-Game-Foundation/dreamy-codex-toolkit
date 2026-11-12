# Plan skill: lần đầu build Android Unity/Dreamy qua GitLab CI/CD

Ngày nghiên cứu: 2026-11-12. Trạng thái: **PLAN hoàn tất; chưa triển khai skill**.

Đề xuất tạo skill điều phối `unity-android-first-build`, dùng `android-build-release` cho chẩn đoán Android và adapter Dreamy có điều kiện. Kết quả cần đạt khi triển khai sau này: từ brief/bảng key → báo cáo thiếu dữ liệu và ownership → preflight → thay đổi được review → CI có quyền thực thi rõ → artifact có bằng chứng nguồn gốc. Không mở rộng sang phát hành store đầy đủ.

Đợt này chỉ đọc source/Git/checkpoint/receipts và ba job GitLab có sẵn, viết plan và trích dẫn log đã lọc. Không tạo/cài/promote skill, sửa game, commit/push, chạy Unity/build/pipeline mới hoặc lấy transcript. Các phase bên dưới là công việc tương lai, không phải quyền thực thi đã được cấp.

## 1. Nguồn và cách đọc bằng chứng

Nhãn: **O — observed**: đọc trực tiếp source/diff/log; **I — inferred**: suy luận có điều kiện; **U — unknown**: chưa có nguồn đủ mạnh. “Receipt ghi pass” là quan sát về receipt; muốn dùng cho source hiện tại phải kiểm tra freshness, input fingerprint và đúng tầng verification.

Toolkit đang ở `17807b4` cộng working tree có thay đổi của người dùng. Project tham chiếu thực tế ở `../planet-bunker-tu-code`, HEAD `0c79f66a66ec316da32ef8640fc3abd22ffffe8d`, nhánh local `main`, cũng có staged/unstaged/untracked thay đổi. Không reset/stash/checkout hai working tree này.

| Mã | Nguồn đã đọc | Dùng để kết luận |
| --- | --- | --- |
| T1 | [AGENTS.md](../../AGENTS.md), [toolkit.json](../../toolkit.json), [workflow template](../../templates/dreamy-workflow.md) | Quyền, evidence, lessons, checkpoint, smallest check. `docs/agents/dreamy-workflow.md` không tồn tại ở toolkit; dùng template nguồn, không tự cài workflow. |
| T2 | [skill-creator](/home/tutrinh/.config/orca/codex-accounts/39df07fd-2eb8-4222-b44d-1d8da574dec1/home/skills/.system/skill-creator/SKILL.md), [authoring](../skill-authoring.md), [master plan](DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md) | Compact entrypoint, progressive references, ưu tiên owner sẵn có, behavioral evaluation. |
| T3 | [android-build-release](../../skills/platform/android-build-release/SKILL.md), reference `build-stage-triage.md`; `skills/dreamy/{dreamy-base,dreamy-template,dreamy-package-maintainer,dreamy-editor-tools}/SKILL.md`; `skills/systems/{system-ads,system-iap}/SKILL.md` | Ranh giới Android/Dreamy/ads/IAP; không biến orchestration thành chuyên gia mọi domain. Đã đối chiếu các skill Android/Dreamy cài ở `/home/tutrinh/.agents/skills/`. |
| T4 | [compatibility](../../compatibility/dreamy-packages.json), [third-party](../../compatibility/third-party.json), [receipt schema](../../schemas/verification-receipt.schema.json) | Registry không chứng nhận injected DreamySDK; Editor Tools record chỉ xác minh commit `e00ca5cf…`, ghi chưa có public headless/dry-run contract. |
| T5 | [skill index](../../skills/index.json), [mobile module](../../modules/mobile/module.json), [validator](../../scripts/validate-skills.mjs), `evals/catalog.json`, `docs/research/source-ledger.json` | Phạm vi cập nhật catalog/module/evals nếu triển khai; profile compact hỗ trợ entrypoint ≤5.000 bytes. |
| G1 | Project `AGENTS.md`, `docs/agents/dreamy-workflow.md`, `project-conventions.md`; [case plan](../../../planet-bunker-tu-code/docs/plans/2026-11-12-orbit-busters-build-config-plan.md) | Quy ước project; tài liệu có nhiều thời điểm, không lấy phần baseline làm hiện trạng cuối. |
| G2 | Project `Packages/manifest.json`, `packages-lock.json`, `ProjectSettings/ProjectVersion.txt`, `ProjectSettings.asset`, asmdefs | O: Unity `6000.4.12f1`; lock Core `ba844659…`, Editor Tools `c29e0c91…`, Purchasing `5.4.3`. Khác snapshot registry cần đối chiếu current package, không suy ra API hỗ trợ. Manifest/lock còn thay đổi staged. |
| G3 | `Assets/DreamySDK/Bridge/Scripts/SO/{BuildConfigSO,MediationConfigSO,SerializableData}.cs`, `Enums.cs`, `Editor/BuildConfigEditor.cs`, `BuildConfig.asset` | Schema/mapping/validator thật tại project. |
| G4 | `.gitlab-ci.yml`, `Assets/DreamySDK/Bridge/gitlab-ci.yml`, `Scripts/Editor/GitLabCICDInstall.cs` | Template là owner root CI, `[InitializeOnLoad]` gọi `File.Copy(..., true)`. |
| G5 | `DreamySDK.cs`, `DreamySDK.asmdef`, project Runtime/test/integration asmdefs, `DreamyAdsGateway.cs` | Facade rỗng, assembly identity, banner override. |
| H1 | `git show` đầy đủ diff/stat các commit `78de4a79`, `baf67d29`, `e1cb9edc`, `f5427eb4`, `0c79f66a` tại project | Thay đổi thực tế; tên commit không chứng minh lỗi hoặc thành công. |
| E1 | Project `.dreamy/evidence/orbit-build-config-{static,editor}-verification.json`, `banner-bottom-center-editor.json`; receipts `c68df7cd…`, `2b51afb1…` và log cùng tên | Static/Editor evidence lịch sử; `validate` là Linux project-inspect, không phải Android build. |
| E2 | Project checkpoints `061e45ab…` (sync-build-iap), `6bfece20…` (banner); case plan mục 10–12 | Next action vẫn yêu cầu injected CI; status complete của task không chứng minh mọi gate downstream. |
| C1 | [CI research evidence](../research/2026-11-12-android-first-build-ci-evidence.json), ba job bên dưới | Metadata và trích log gốc đã lọc; không lưu toàn bộ raw trace. |

Các đường dẫn G/H/E là trong project tham chiếu; lịch sử bất biến tra bằng `git -C ../planet-bunker-tu-code show <sha>:<path>`. C1 lưu URL, SHA, job/pipeline ID, dòng log, hash stdout trace và giới hạn thu thập. Không đưa key thực vào plan/skill/fixture. `lessons recall` ở toolkit với session runtime hiện tại trả danh sách rỗng; không có lesson được áp dụng hoặc nâng trạng thái verified.

## 2. Bảng tổng hợp case

| Vấn đề | Bằng chứng | Sửa đổi quan sát được | Trạng thái xác minh | Bài học tái sử dụng |
| --- | --- | --- | --- | --- |
| Identity/ads mẫu, SDK thiếu key | G1/G3, diff `78de4a79`, E1 | Đổi identity, 20 ad units theo source/type/tier, lọc SDK thiếu key; thêm Firebase client config tại root ở thời điểm này | O: static/Editor lịch sử đạt; MAX account chưa xác nhận; không phải proof backend | Chỉ điền dữ liệu có nguồn; SDK thiếu key phải là blocker hoặc đề xuất giảm scope, không tự tuyên bố tích hợp. Không hard-code 20 entry cho game khác. |
| CI compile fail | [job 17954012450](https://gitlab.com/trinhtuu.05/orbit-busters-tu-code/-/jobs/17954012450), SHA `78de4a79`, C1 dòng 289–300 | `baf67d29` đổi `DreamySDK.Runtime` → `DreamySDK` và references, giữ meta khi rename | O: job chỉ ghi `Scripts have compiler errors.`; thiếu log Unity chi tiết/CSxxxx. I: assembly correction có thể liên quan; U: chưa xác lập root cause cụ thể | Kiểm tra assembly graph sau injection. Không dựng lại lỗi CS từ tên commit; lấy Unity log thực được script chỉ đường. |
| IAP catalog lệch game | Diff `e1cb9edc`: SDK RemoteConfigDataDefine, offerConfigs, NoAds constant và tests; E2 | Đồng bộ 9 product IDs theo catalog/giá của case | O: diff; U: chưa có receipt đúng focused tests/store products để chứng minh store đồng bộ | Join SDK catalog ↔ game config/constants ↔ store theo stable IDs/type. Không áp đặt cách đặt ID theo giá cho game khác. |
| Banner có nhiều owner, version lệch | Diff `f5427eb4`, G3/G5, E1 | BuildConfig version đổi; call site truyền BottomCenter; một entry iOS đổi vị trí | O: call site hiện truyền BottomCenter. Receipt nói defaults BottomCenter nhưng source hiện là NotDefined; không dùng receipt xác nhận defaults hiện tại | Kiểm tra call site, default API, asset và backend semantics. Khoanh phạm vi Android; không sao chép thay đổi iOS ngoài brief. |
| Firebase ở root chưa được SDK tìm thấy; signing file thiếu | [job 17954839140](https://gitlab.com/trinhtuu.05/orbit-busters-tu-code/-/jobs/17954839140), SHA `f5427eb4`, C1 dòng 345–346, 475–489 | `0c79f66a` chuyển JSON vào Assets, thêm `.meta`/keystore, bật custom signing và alias trong PlayerSettings | O: log có lỗi không tìm config, mismatch bundle và `keystore file not found`. JSON hiện đúng package; thông báo mismatch không chứng minh nội dung JSON sai package | File tồn tại local/root ≠ Unity import ≠ tồn tại runner. Kiểm tra clean checkout, nguồn secrets, import contract; không mặc định commit keystore. |
| Build đã chạy được nhưng artifact chưa bàn giao được | [job 17955149208](https://gitlab.com/trinhtuu.05/orbit-busters-tu-code/-/jobs/17955149208), SHA `0c79f66a`, C1 | Log sinh `google-services.xml`; hai `Build result: Succeeded`; bước copy tới network share | O: Unity báo thành công và job success; API artifacts chỉ có trace, không có archive APK/AAB. U: file cụ thể, package/version/cert/checksum, quyền tải và device startup | Có bằng chứng build thành công ở log lịch sử; chưa có bằng chứng artifact đúng hoặc có thể bàn giao. Không lấy size BuildReport làm size APK/AAB. |
| Job xanh che lỗi tác dụng phụ Git | C1 job cuối dòng 2319–2336 | Script thử xóa remote tag và `push --tags --force … release_android`; đều exit 128, job vẫn success | O: lệnh và exit code trong log; U: source/version/nhánh logic script | Audit entrypoint cả build lẫn post-build. Không chạy script có force-push/tag deletion ngoài quyền; exit propagation cần acceptance riêng. |
| Root CI có thể bị ghi đè; rule giới hạn trigger | G4 | Template và root hiện cùng rule push `build_android`, tag `windows`, gọi batch ngoài repo | O: source; C1 xác nhận runner dùng shell `pwsh`; U: cấu hình runner/license hiện tại | Sửa đúng owner template nếu được phép. Push/MR/manual không tương đương. Không bắt đổi tên thư mục local theo repo. |

Đã tìm log gốc liên quan yêu cầu “Chuyển build_android và tìm lỗi build” bằng bounded GitLab API: project `84489324`, pipelines `3057264170`, `3057413268`, `3057467311`. Không tìm/đọc session transcript nên **không xác nhận tiêu đề chat gắn chính xác job nào**. Log compiler chi tiết nằm ở runner path được trace chỉ ra, chưa lấy được. Source `build.bat`, `build_pipeline.py`, injected build method và full SDK commit/version chưa có trong repo này; log có short SDK HEAD `d431b7d20`, chưa đủ contract tái lập. Các lỗi Firebase/signing và trạng thái build ở bảng trên có log thật, không suy từ commit.

## 3. Chọn skill và ranh giới trách nhiệm

**I — đề xuất skill điều phối mới**, vì thiếu một workflow nối intake, mapping, generated CI owner, injection, quyền chạy và artifact handoff. Đây là workflow tái sử dụng khác với triage Android; nhồi hết vào Android specialist sẽ kéo GitLab/Dreamy key mapping vào mọi yêu cầu Gradle/signing. T2 ưu tiên mở rộng owner cũ nhưng cho phép skill mới khi thiếu workflow riêng; T3/T5 cho thấy khoảng trống này.

- `unity-android-first-build`: giữ intake, missing/conflict ledger, configuration ownership, gate trạng thái và handoff; áp dụng Unity thường, chỉ tải Dreamy adapter khi phát hiện schema/bridge tương ứng.
- `android-build-release`: giữ toolchain/Gradle/manifest/R8/signing diagnosis; chỉ thêm một routing link ngắn tới workflow mới khi triển khai, không nhân bản triage.
- Dreamy base/package-maintainer/template: package pin, compatibility, assembly identity và project glue. Dreamy Editor Tools chỉ dùng API public đã xác nhận; không biến reflection vào private validator của case thành contract chung.
- Ads/IAP skills: giữ policy/runtime/transaction ownership; workflow mới chỉ kiểm tra mapping và sự khớp cấu hình. Không tự thêm placement, thay reward policy hoặc đổi product ID của app đã phát hành.
- Store release readiness chỉ được gọi khi yêu cầu vượt sang phát hành; lần đầu build không yêu cầu toàn bộ store checklist.

Trigger dự kiến: “chuẩn bị/lần đầu build Android Unity qua GitLab từ brief hoặc bảng cấu hình”, hoặc resume lỗi trong workflow đó. Near misses: lỗi Gradle độc lập → Android skill; chỉ điền ad IDs → mapping hẹp; release store → release skill; CI web app → không kích hoạt. Tên SDK/provider/runner/path của case không thành default.

## 4. Cấu trúc file dự kiến — chưa tạo

```text
skills/platform/unity-android-first-build/
  SKILL.md                         compact: Scope / Decisions / Verification / References
  references/intake-and-ownership.md
  references/gitlab-execution-and-evidence.md
  references/dreamy-buildconfig.md  chỉ tải khi bridge/schema có mặt
  scripts/preflight.mjs             sau khi chứng minh lợi ích bằng fixtures
  scripts/validate-mapping.mjs      kiểm tra deterministic bảng → schema snapshot
tests/fixtures/android-first-build/ synthetic projects, inputs, traces, artifact metadata
tests/unit/android-first-build.test.mjs
benchmarks/cases/android-first-build*.json
```

Không cần assets/README/agent riêng. `SKILL.md` mục tiêu 300–800 tokens, cap 5.000 bytes theo T5; refs chỉ chứa chi tiết làm thay đổi quyết định. Input/output JSON Schema đặt cùng script nếu script cần contract máy đọc, không bắt thêm schema global trước khi có consumer. Không tạo bộ script build/push.

Khi được triển khai mới cập nhật `skills/index.json` (compact profile, owner build engineer/release validator, evidence yêu cầu), `modules/mobile/module.json`, eval/benchmark catalog và source ledger; kiểm tra preset nào include module để tránh phân phối ngoài ý định. UI metadata chỉ thêm nếu installer cần. Không sửa `toolkit.json` phase/maturity để tuyên bố toàn toolkit đã đạt production.

## 5. Schema đầu vào

Đây là **intended contract**, không phải schema BuildConfig có sẵn. Mỗi field bọc bằng `InputValue<T>`: `{value hoặc valueRef, requirement, status, sourceRef, owner, sensitivity}`. `requirement = required | optional | conditional`; `status = supplied | discovered | missing | conflict | not-applicable`. **Missing là trạng thái độc lập**, không phải giá trị mặc định. Secrets chỉ có `valueRef`, không có raw value. `sourceRef` có file+field hoặc brief row, version/hash và thời điểm; tránh URI chứa token. `null` không được chuyển thành placeholder.

| Nhóm / field đề xuất | Mức | Điều kiện và validation |
| --- | --- | --- |
| `game.name`, `platform`, `applicationId` | Required | Platform Android; package từ owner đã xác nhận; không lấy từ Firebase project ID. |
| `unity.version`, `app.versionName`, `app.versionCode` | Required | Đối chiếu ProjectVersion/PlayerSettings/CI. BuildConfig `game_version` phải được adapter giải thích bằng build script, không mặc định split `_`. |
| `repo.url`, `repo.branch`, `ci.provider`, `ci.entrypoint` | Required | Provider GitLab trong scope; URL chuẩn sau rename; entrypoint phải có source hoặc versioned contract. |
| `ci.runner.tags`, `executor`, `shell`, `toolchain`, `licenseSourceRef`, `dependencyAccessRefs` | Required để chạy | Cần runner/secret owner xác nhận nếu không đọc được; PATH/JDK/SDK/NDK/Gradle và Unity Android module khớp phiên bản. Không coi tag windows là proof shell. |
| `ci.trigger`, `ci.environment`, `variables[].{name,type,scope,protected,sourceRef}` | Required để chạy | Đối chiếu rules/workflow/effective config; environment không mặc định production. Không đọc/in giá trị secrets. |
| `mediation`, `sdks[].{name,enabled,version,keys}` | Conditional | Khi monetization/analytics được chọn. Mỗi SDK có key requirements theo source thực tế; selected+missing là blocker. |
| `adUnits[].{provider,source,type,tier,idRef,position,adaptive,inScope,originRow}` | Conditional | Theo format đã yêu cầu; map enum từ source, uniqueness theo source/type hoặc key contract thật. Không ép tier cho provider không có tier. |
| `firebase.{enabled,clientFileRef,projectId,androidAppId,packageName}` | Conditional | Khi Firebase được chọn/built-in theo injection contract; đọc client matching package, không đoán client đầu tiên. |
| `signing.{appHistory,mode,keystoreSourceRef,runnerPath,alias,passwordRefs,expectedFingerprint,keyRole}` | Required để ký/handoff | App mới hay đã phát hành; debug/custom/upload theo brief. Alias+password refs+keystore conditional theo mode; expected fingerprint required với identity hiện hữu, đối chiếu mới khi owner xác nhận. |
| `iap.{enabled,catalogRef,store,applicationId,products}` | Conditional | Có IAP thì join IDs/type/enabled giữa SDK/game/store; giá là dữ liệu phụ, không tự sinh product IDs. |
| `output.{format,variant,architectures,backend,destination,retention,access,audience,requiredChecks}` | Required | APK/AAB, development/release/profile cụ thể, IL2CPP/ARM theo project/brief; artifact name/checksum/metadata; không tự chọn store release. |
| Store URL, ghi chú, Unity Cloud linkage | Optional / Conditional | Unity Cloud chỉ required khi build contract dùng; không suy ra từ Firebase/AdMob. |

Quy trình hỏi: đọc brief và repo/CI metadata được phép → lập discovered/missing/conflict → hỏi gộp đúng các required/conditional còn thiếu. Không hỏi lại dữ liệu đã có; không lấy key mẫu làm key thật. Nếu selected SDK thiếu key: dừng readiness của SDK đó; chỉ đề xuất disable/defer có ghi scope, không tự âm thầm thay lựa chọn. Phần độc lập có thể tiếp tục lập plan.

## 6. Ownership và thứ tự override

Không định nghĩa một precedence chung bằng phỏng đoán. Lập graph từng field: authored owner → importer/generator → CI injection/build preprocessing → effective build value → runtime override. Mỗi cạnh phải có source/contract; cạnh chưa biết làm gate tương ứng degraded.

| Cấu hình | Authored owner / đối chiếu | Override cần chứng minh | Gate |
| --- | --- | --- | --- |
| Name/package/version/API/backend/architecture | BuildConfig nếu script tiêu thụ; PlayerSettings và Build Profiles là đối chiếu | Build method, profile, command-line, environment và preprocessor cuối cùng | Log/snapshot effective PlayerSettings trước BuildPlayer + metadata artifact; không giả BuildConfig luôn thắng. |
| SDK selection/key/ads | Brief → BuildConfig schema adapter | Injected module/version, generated mediation settings, runtime Remote Config | Inventory sau injection; compile Android; SDK startup khi thuộc acceptance. |
| Banner | Game gateway/call site, API default, ad unit config | Tham số tường minh/NotDefined/backend/runtime override | Source + render/device evidence; precedence runtime chưa có source thì U. |
| Firebase | Client JSON app đúng, import location | SDK import/resolver sinh XML/Gradle resources | File+meta → import output → dependency build → device init là các gate riêng. |
| Signing | Owner identity + CI secret source | BuildConfig `key_store_info`, PlayerSettings custom signing, build script | File/path/alias runner; actual signer fingerprint; không dump object chứa password. |
| IAP | Static catalog/game definitions/store inventory | SDK defaults/Remote Config nếu có | IDs/type cùng app/store; player ownership ở Datasave, không biến catalog thành save. |
| Root CI | Template và installer hoặc server CI config path | InitializeOnLoad/includes/project settings | So sánh template/root, xác định generator trước sửa; đọc effective rules. |
| Repo checkout/SDK pin/artifact | CI metadata + external script contract | Script có thể fetch/reset branch tip, tiêm SDK từ branch và copy share | Pipeline SHA phải khớp actual HEAD trước build; SDK full SHA và script version; artifact checksum. |

## 7. Preflight và mapping

Preflight mặc định read-only; không mở Unity/import project trong mode này vì InitializeOnLoad có thể ghi root CI. Script nhận snapshot JSON/paths, không invoke CLI Git/Unity/Gradle để mutate; `--dry-run` chỉ in proposed mapping, không save asset. Exit phân biệt ready, invalid, incomplete/unsupported; unknown không được exit pass readiness. Output có findings, severity, evidence, blocker owner và missing gates; hash thông thường không chứa raw secrets/keystore bytes.

1. Ghi Git HEAD/branch/index/worktree và phạm vi file; bảo toàn mọi thay đổi. Đọc AGENTS/workflow/conventions, manifest/lock, compatibility, package cache/source tại đúng commit. Inspect asmdef names/GUID refs/platform/defines, Editor references và Build Profiles/scenes/build scripts/pre/post hooks.
2. Xác định local facade và SDK backend CI tiêm. Case G5 có method rỗng nên compile local không chứng minh ads/SDK thật. Yêu cầu inventory sau tiêm: names/GUIDs/references/version/defines/platform; kiểm tra dependency resolution và compile lại đúng target. Không rename/regenerate GUID chỉ để làm checker xanh.
3. Adapter đọc field/enum hiện hữu. Case hiện map vào `config.android.game_name/package_name/unity_version/game_version/sdks/ad_units/max_sdk_key/google_app_id/bytebrew_game_id/bytebrew_sdk_key/key_store_info`; schema **không có** field versionCode/output format riêng đã chứng minh. Không bịa field; tìm build owner cho dữ liệu chưa có chỗ chứa.
4. MAX SDK key khác MAX ad unit ID. AdMob App ID (`~`) khác ad unit ID (`/`); format chỉ là sanity check, không chứng minh ownership/tài khoản. ByteBrew cần đúng Game ID và SDK Key, không lấy key MAX/Google thay. Map provider/source/format/tier từ enum hiện tại: case High/Medium/All là ba source khác nhau, không gộp. Không hard-code ordinal enum cho project/version khác.
5. Reject entry rỗng/placeholder, duplicate source/type, tier sai, excluded Auto Bidding IDs; lưu excluded chỉ bằng provenance nếu cần. Không reject mọi chuỗi thiếu độ dài phỏng đoán cho MAX; verify theo SDK contract/account owner. SDK thiếu key phải được báo trước CI.
6. Trace banner từ call site → default → config → backend override; không chỉ kiểm tra asset. AOA/MREC có ID không cấp quyền thêm placement/gameplay. Firebase project ID, Unity Cloud ID, AdMob App ID là các namespace riêng.
7. Validator hiện tại G3 có side effects: cập nhật unity_version, sửa list, gọi helper ByteBrew và có nhánh ghi Play Games resources; nút validate bao gồm iOS/cross-platform. Không gọi private overload qua reflection làm generic read-only preflight. Dùng pure checks/snapshot Android hoặc API public đã xác nhận; báo unsupported nếu không có.

## 8. Firebase và signing

Firebase: đọc `project_info.project_id`, `mobilesdk_app_id` và mọi `client_info.android_client_info.package_name`; chọn client theo package dự kiến. Case file hiện ở `Assets/google-services.json`, có `.meta`, không còn root file; project/package khớp theo đọc trực tiếp. Contract import này cũng phù hợp [Firebase Unity setup](https://firebase.google.com/docs/unity/setup/). Kiểm tra GUID/meta và generated `FirebaseApp.androidlib/.../google-services.xml` khi SDK version tương ứng dùng đường đó; không hard-code output cho mọi version. C1 đã có generated-output evidence, chưa có device Firebase initialization evidence. Client config không phải service-account credential; không thay JSON service account vào client path hay `service_account_key`.

Signing: xác định app history trước chọn mode. App hiện hữu giữ identity owner chỉ định; app mới cũng không tự sinh key khi chưa được giao. Kiểm tra file đã track/LFS/submodule/secure provisioning ra sao trên clean checkout, path resolution và runner service-account ACL; xác nhận alias có PrivateKeyEntry và cert fingerprint qua tool không in mật khẩu. Đối chiếu BuildConfig ↔ PlayerSettings ↔ build method; inspect APK signer thực tế hoặc AAB signing certificate. [Android signing](https://developer.android.com/studio/publish/app-signing) phân biệt upload key và app signing key: cert bản cài từ Play có thể khác cert upload, không gộp hai vai trò. Với app mới fingerprint tạo mới phải được owner ghi nhận trước coi là expected.

Cấp secrets theo hệ hiện hữu: CI file variable/secure file store/secret manager hoặc runner provisioning đã có, scope đúng branch/environment, protected đúng quyền, ACL tạm và cleanup. File variable chứa đường dẫn file tạm, không tự coi nội dung là đường dẫn. Keystore binary cần cơ chế cấp phát phù hợp; base64 chỉ là encoding. Dùng masked/hidden khi GitLab hỗ trợ/đáp ứng constraint; masking không bảo vệ trước script độc hại. Không dump env/BuildConfig/password/command line chứa secret, bật debug trace, lưu keystore/private key vào artifact hay skill. Tham chiếu [GitLab CI variables](https://docs.gitlab.com/ci/variables/). Case commit keystore là O về lịch sử, không phải policy đề xuất.

## 9. GitLab execution contract — chỉ áp dụng khi đã được cho phép chạy

- Đọc remote canonical hiện tại sau rename; local folder name không cần đổi. Kiểm tra URL host/path/redirect/access mà không in embedded credential. Repo case hiện không còn remote cũ; test case “URL cũ” là hành vi dự phòng.
- Đọc effective CI config (root + includes/workflow/rules + project CI config path). G4 chỉ cho push branch `build_android`; manual dòng comment không phải trigger được bật. Phân biệt tạo pipeline và thêm job theo [GitLab rules](https://docs.gitlab.com/ci/jobs/job_rules/).
- Kiểm tra tag runner, executor/shell và biến truyền batch/PowerShell, quoting paths có space; Android module/JDK/SDK/NDK/Gradle/license; quyền private packages/Git LFS/submodules/SDK/artifact share. Không coi runner online ở thời điểm tra cứu là proof mọi dependency còn hoạt động.
- Xác nhận source hoặc versioned contract của batch/shell/Python/C# entrypoint ngoài repo: inputs, cwd, checkout SHA, SDK pin, mutations, exit propagation, output names/location/retention và logs. C1 chỉ chứng minh đã gọi `Dreamy.AutoBuild.BuildAndroid`; không cấp contract tái lập.
- G4 dùng `GIT_SSL_NO_VERIFY=true`, environment production, runner/path cố định. Đây là cấu hình case cần review theo hệ thống, không sao thành default. Audit script side effects trước bất kỳ build nào: C1 có reset/clean runner workspace, commit/tag deletion/force-push. Cần owner cung cấp hoặc sửa mode chỉ-build trong đợt được phép; chưa có safe contract thì gate chạy CI bị chặn.
- Sau khi được phép thay đổi: review diff/file list → commit đúng phạm vi → tạo/chuyển build branch trong workspace sạch/isolated phù hợp → tích hợp thay đổi theo chiến lược Git hiện hữu → normal push upstream cụ thể. Không force-push, không reset working tree người dùng; không tự push release/tag. Readiness không phải quyền push; quyền push một branch không mở rộng sang mọi script post-build.
- Sau push: ghi SHA → pipeline ID/source/ref/SHA → job ID/runner/status → actual checked-out SHA trước build → SDK/script versions → Unity result → artifact acquisition/verification. Script fetch branch tip có race: pipeline SHA đúng chưa đủ, phải pin/check actual HEAD. Không retry mù khi job không xuất hiện; inspect rules/protected refs/server config.
- Handoff artifact qua GitLab archive hoặc kho khác được chỉ định. Root case chưa khai báo `artifacts:`; share-copy log chưa chứng minh file tải được. Theo [GitLab artifacts](https://docs.gitlab.com/ci/jobs/job_artifacts/), khai báo/cơ chế upload/download phải có contract riêng. Gói bàn giao gồm URL/path có quyền truy cập, tên/format/size/SHA256, package/versionName/versionCode, variant/ABI, signer fingerprint/key role, game+SDK+build-script revisions, pipeline/job link và gate chưa chạy. Không đưa URL có token vào report.

## 10. Tìm lỗi build và điều kiện dừng

Mỗi incident: `{stage, firstMeaningfulError, sanitizedContext, gameSha, pipelineId, jobId, targetPlatform, sdkRevision, scriptRevision, toolchain, observed, hypotheses, smallestChange, verification, stopReason}`. Không gộp build target Android với host runner Windows/Linux trong receipt. Ghi command chính xác và lý do nếu không thể chạy.

| Tầng | Bằng chứng ưu tiên / phép kiểm nhỏ nhất |
| --- | --- |
| Git/auth | Remote URL, exit code, ref/SHA và permission scope; xác nhận quyền read/dependency trước sửa Unity. |
| Runner/shell | Job pending/tag/protected runner; executor/shell và lỗi cú pháp; kiểm tra contract quoting/cwd. |
| Unity license/toolchain | License/module detection và Unity/SDK/NDK/JDK versions; lỗi activation/launch thực tế. |
| Package resolution | First package/auth/version conflict, manifest+lock tại SHA; không mass-upgrade. |
| SDK injection/assembly compile | Inventory sau tiêm + compiler diagnostic đầu tiên có file/line; Unity log thật thay generic “compiler errors”. |
| Firebase/dependency resolution | Client identity/location/import output; EDM/resolver/generated Gradle lỗi đầu; không suy JSON sai từ lỗi file thiếu. |
| Gradle/manifest/R8 | First causal Gradle exception/merged manifest/dependency graph/keep rule, theo Android triage. |
| Signing | Effective signing mode, file existence/ACL runner, alias/key-entry và fingerprint; che secrets. |
| Packaging/artifact | Build result/exit propagation, file existence, upload/copy result và metadata/checksum. |
| Device startup | Install/launch/logcat đúng artifact và cert/version, SDK init nếu scope; build xanh không thay smoke test. |

Mỗi lần sửa một nguyên nhân nhỏ có bằng chứng, kiểm chứng tầng đó rồi mới tiến tiếp. Không sửa nhiều tầng/mass-upgrade/xóa cache rộng để thử vận may. Đề xuất retry budget trước chạy: một lượt baseline và tối đa hai lượt có thay đổi/giả thuyết mới trong phạm vi quyền; đây là budget có thể điều chỉnh theo người dùng, không phải số lần build bắt buộc. Dừng sớm khi thiếu source/secret/quyền/identity, side effects vượt quyền, hoặc lỗi lặp không thêm bằng chứng; escalate tới owner tương ứng với log đã che và yêu cầu cụ thể, không gửi tin cho người khác nếu chưa được chỉ dẫn. Lỗi transient chỉ retry có căn cứ trong budget.

Lesson chỉ record observed failure; candidate có applicability và exclusions. Verified yêu cầu successful receipt mới khớp failure/task/command/platform/source/checker. T4 schema hiện chỉ nhận `validate|unit|pack|unity`; **không relabel CI Android thành validate/unity** để qua gate lessons. Khi triển khai cần quyết định adapter/receipt CI có fingerprint phù hợp, hoặc giữ CI evidence ngoài lesson verified cho đến khi contract được hỗ trợ.

## 11. Verification matrix và behavioral tests

| Gate | Bằng chứng acceptance khi triển khai | Hiện trạng đợt nghiên cứu |
| --- | --- | --- |
| V0 Plan/source hygiene | Nguồn theo kết luận, O/I/U, không raw secrets, không sửa game; diff/status | Có plan và C1; kiểm tra cuối ghi ở kết quả bàn giao. |
| V1 Intake/mapping static | Synthetic inputs → đúng findings/missing/conflict; không side effects | Chưa có skill/scripts; E1 chỉ là case lịch sử. |
| V2 Ownership/import/injection | Effective snapshot, template ownership, SDK/asmdef inventory đúng revision | Có source/trace case; thiếu safe script contract/full pins hiện tại. |
| V3 Editor/Android compile | Refresh/Console + target compile sau injection đúng source; focused tests nếu C# thay | Receipt banner lịch sử, source defaults không khớp; chưa fresh verify. |
| V4 CI execution | Được phép, job đúng SHA, exit propagation, zero forbidden side effects | Ba job lịch sử đọc được; script side effects là gate thiếu. Không chạy mới. |
| V5 Artifact | Tải/đọc được file, checksum, package/version/cert/variant đúng brief | Chỉ share-copy log; chưa verify APK/AAB. |
| V6 Device | Install/startup và SDK init/smoke đã định nghĩa, log đúng artifact | Chưa chạy cho artifact CI này. |
| V7 Skill behavior/distribution | Positive/negative/conflict evaluations và npm test; install smoke sau quyền | Chỉ plan; không cài/promote trong đợt này. |

Behavioral test fixtures tương lai phải dùng tên/key tổng hợp, thay provider/enum/path giữa project để bắt hard-code. Chạy task thật trong sandbox với artifacts đầu vào, quan sát quyết định và filesystem/process/network side effects; không chỉ grep wording/frontmatter.

| Tình huống | Hành vi cần quan sát |
| --- | --- |
| Selected SDK thiếu key / có placeholder | Báo missing đúng SDK; không mượn key SDK khác, không báo integrated; đề xuất defer có scope. |
| Firebase sai package hoặc ở root sai contract | Phân biệt mismatch nội dung với missing import; chặn gate phù hợp; không sửa package tùy tiện. |
| Keystore local có nhưng clean runner không có | Phát hiện thiếu provisioning/tracking/path; không tự sinh/commit key. |
| Alias hoặc certificate sai | Chặn signing; đối chiếu expected upload/app-signing role; không thay identity. |
| Facade/injected assembly name khác | Local compile pass không đủ; yêu cầu/kiểm tra injected graph, giữ meta GUID. |
| CI root bị InitializeOnLoad đè | Chỉ ra template/installer owner; read-only test không mở Editor hoặc sửa root vô ích. |
| Remote URL cũ sau rename | Báo drift URL; không bắt đổi local folder, không tự push. |
| Push thành công nhưng rules không tạo job | Báo push riêng; phân tích source/ref/rules; không chạy lặp/claim CI success. |
| Job xanh nhưng không artifact hoặc metadata sai | Handoff fail/degraded; check package/cert/version từ file, không dựa filename/log success. |
| Banner call site override khác BuildConfig | Nêu conflict và runtime precedence cần source; không coi asset là effective value. |
| IAP catalog sai game/store | Join IDs/type/app/store; flag mismatch; không rewrite product ID đã phát hành. |
| Script build có force-push/tag deletion | Gate execution blocked trước chạy; không coi permission build là permission side effects. |
| Receipt cũ defaults khác source / generic compile fail | Báo stale/unknown; không dựng diagnostic, không verify lesson bằng project-inspect. |

Thêm positive case project Unity không Dreamy để chứng minh optional adapter; negative case chỉ lỗi Gradle để chứng minh routing; conflict case user chỉ cho plan dù skill có execution steps, phải không build/push. Không tạo tests cho mọi data edit nhỏ có thể đối chiếu trực tiếp. Fixture checks và behavioral evaluation là hai loại bằng chứng khác nhau.

## 12. Phase, dependency và acceptance criteria

| Phase tương lai | Phụ thuộc | Deliverable / acceptance criteria |
| --- | --- | --- |
| P1 Chốt contract | Plan này + quyết định triển khai | Confirm name/scope, source owners, generic intake và output; không có dữ liệu Orbit được nhúng. Blockers execution không ngăn viết draft generic. |
| P2 Draft compact + references | P1 | Entry ngắn đúng trigger/near-miss, O/I/U và quyền; reuse Android triage; adapter Dreamy source-grounded, không API private. |
| P3 Pure preflight/mapping | P2 + synthetic snapshots/schema | Read-only/dry-run chạy được; deterministic report; đủ fixtures ở V1, unsupported→incomplete; zero build/push/secret dump. Chỉ làm script nếu kiểm tra lặp và measurable benefit hơn checklist. |
| P4 Behavioral evaluation | P2/P3 | Positive/negative/conflict và case table được quan sát bằng artifact thật; không cho grader intended answer. Nếu dùng evaluator agent cần quyền delegation riêng; plan này không spawn. |
| P5 Toolkit integration | P4 đạt + cho phép phân phối | Catalog/module/source ledger cập nhật tối thiểu, references resolve, quick_validate và `npm test` pass; context budget/installer preservation được kiểm tra. Tạo/cài/promote là các bước riêng cần scope cho phép sau này. |
| P6 Pilot CI | P5 + script/source/secrets/runner/identity/artifact contract + cho phép chạy | Audit safe build-only mode, pin SHA/SDK/script, bounded pipeline; V2–V5 đạt. Không dùng script force-push lịch sử như default. |
| P7 Handoff | P6; V6 nếu brief yêu cầu | Receipt bundle và artifact tải được/metadata đúng; nêu rõ smoke còn thiếu; lesson verified chỉ khi adapter/evidence matching được hỗ trợ. Không phát hành store. |

Không đánh dấu phase triển khai complete khi chỉ xong docs. Trước khi complete mỗi phase thực sự thay toolkit chạy `npm test` theo AGENTS; chỉ broad rerun khi source thay hoặc failure mới. Nếu test không chạy phải ghi lệnh và lý do. Kiểm tra quick_validate/frontmatter không thay behavioral eval.

## 13. Quy tắc bảo vệ và câu hỏi còn chặn

Secrets: dùng references, redaction trước lưu, không raw trace có credentials, không fingerprint private key bằng cách dump nội dung. Certificate public fingerprint được ghi khi cần; không dùng hash bí mật có entropy thấp làm telemetry. Không copy key/password/keystore thực vào skill, fixture, plan hoặc benchmark. Access token/API read quyền hiện có chỉ dùng lấy đúng ba job; không liệt kê biến bí mật.

Serialized data: giữ `.meta`/GUID/script refs, serialized field names/asmdef dependency direction; Runtime không reference Editor. Khi tương lai được sửa asset dùng Unity SerializedObject/public editor support, inspect–mutate hẹp–save–refresh–Console–verify; không blind edit scene/prefab YAML. Static DataConfig khác persistent Datasave; reusable checks thuộc toolkit/shared module, game glue ở `Assets/_Project`.

Quyền: activation skill không cấp quyền commit/push/build/trigger, sửa CI secrets hay tạo signing identity. Không reset/clean game working tree; runner disposable cleanup cũng phải thuộc contract. Không force-push/tag deletion; build script chứa các hành động đó phải được xử lý trước, không chỉ nhắc “agent không tự gõ force-push”. Không cài hooks, thu transcript, gọi model nền hoặc tự promote.

**Không có câu hỏi chặn hoàn thành plan này.** Các unknown sau chặn pilot hoặc claim mạnh hơn, cần ưu tiên nguồn có sẵn trước hỏi người dùng/owner:

1. Source/version contract của `build.bat`, `build_pipeline.py`, `Dreamy.AutoBuild.BuildAndroid` và full injected SDK SHA? Có mode build-only tránh commit/tag/force-push, pin actual checkout và propagate mọi exit code không?
2. Có thể lấy Unity editor log chi tiết của job compile fail và mapping injected asmdefs tại SHA đó không? Chưa đủ bằng chứng quy nguyên nhân compile cho assembly rename.
3. Artifact network share có file APK/AAB nào, quyền lấy, retention và checksum/metadata/certificate? Chưa đủ bằng chứng handoff artifact hoặc device startup.
4. Với project được pilot: app mới/đã phát hành, expected signing identity/key role, nguồn secrets runner, selected SDK keys/ownership và catalog store còn thiếu gì? Không cần hỏi/gửi password trong chat; không hỏi lại Firebase/package/remote đã kiểm được của case.
5. Owner nào cung cấp runner/license/dependency access và effective CI project settings? Quyền thực thi pilot/branch/environment/artifact target đến đâu? Đây là thông tin cho đợt sau, không phải yêu cầu xác nhận để kết thúc plan.

Kiểm chứng đợt plan: `npm test` exit 0, validate/catalog/acceptance/context checks đạt; 147 tests, 146 pass, 0 fail, 1 skipped. Đây là test toolkit hiện tại, không phải behavioral test của skill chưa tồn tại. JSON C1 parse được, ba job gắn đúng SHA/status, mọi local link trong plan resolve được. Đã rà nội dung hai file mới, `git diff --check` và status; giữ nguyên các thay đổi có sẵn. Không chạy quick_validate vì chưa tạo skill; không chạy Unity compile/build/device hoặc pipeline mới vì scope chỉ nghiên cứu. Gate artifact/device và safe external-script contract vẫn chưa đạt.
