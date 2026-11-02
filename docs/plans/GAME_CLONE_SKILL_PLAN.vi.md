# Kế hoạch skill Game Clone cho Dreamy Codex Toolkit

Trạng thái: đã triển khai skill experimental và cài vào Codex; pilot game thật chưa chạy. Cập nhật: 2026-11-01.

Tạo một điểm vào `$game-clone` cho workflow nghiên cứu, bóc asset và tái hiện game Unity bằng REA cùng AssetRipper. Skill điều phối các bước đã có trong toolkit, chuyển bằng chứng thành code và asset được tích hợp thật, rồi kiểm tra chức năng và độ giống. Skill, reference, catalog, module, eval và kiểm thử cài đặt đã triển khai theo kế hoạch dưới đây. Cài công cụ phân tích, xử lý APK và xây game là task sử dụng skill, chưa thực hiện trong lần authoring này.

Checkpoint triển khai: P0–P3 và P5 hoàn tất; P4 deferred vì chưa có artifact được chọn. Baseline trước thay đổi pass 80 test; sau thay đổi pass 81 test, catalog có 86 skill và 136 eval specification hợp lệ. Không chạy semantic agent evaluation hay khẳng định clone game thật. Xem [receipt kiểm chứng](../evidence/game-clone-skill-validation.json) và [hướng dẫn sử dụng](../game-clone.vi.md). Bước tiếp theo khi có APK/XAPK: intake có hash, pilot AssetRipper rồi REA cho câu hỏi gameplay cụ thể.

## 1. Hiện trạng đã kiểm tra

- Repo: `D:/Game/dreamy-codex-toolkit`, HEAD `507b3f3ee0a3869800dc1546af40d6b31ff4dd9a`; worktree có thay đổi chưa commit.
- `toolkit.json`: `0.1.0-alpha.4`, trạng thái `alpha`; trỏ tới `skills/index.json`, module, preset, compatibility và eval catalog.
- Đã có `skills/gameplay/game-asset-extraction/`: kiểm kê và giải nén, hướng dẫn AssetRipper, helper UnityPy, giải mã level, receipt và catalog từng asset.
- Đã có `skills/gameplay/game-vibe-workflow/`: brief, exact-clone, tái sử dụng Dreamy, tích hợp asset, REA theo chế độ và kiểm tra fidelity.
- Hai skill trên đang xuất hiện trong các thay đổi chưa commit. Phải phát triển tiếp trên nội dung hiện tại, giữ helper và dữ liệu người dùng; không reset hay tạo bản sao cạnh tranh.
- Module `unity-core` đã liệt kê hai skill; preset `dreamy-project` và `dreamy-production` đều chứa module này.
- Hướng dẫn REA hiện có phân biệt Mono, metadata IL2CPP, native analysis và APK Java; hướng dẫn AssetRipper ghi nhận exporter có thể xóa đích đã tồn tại.

## 2. Quyết định thiết kế

Thêm `game-clone` dạng `compact-workflow`, dưới 5.000 byte cho entrypoint. Điểm khác biệt là hợp đồng xuyên suốt giữa game tham chiếu, kết quả extraction, phân tích logic, tích hợp và đối chiếu. Giữ hai skill hiện tại làm chủ phần extraction và workflow phát triển chung.

| Thành phần | Trách nhiệm |
|---|---|
| `game-clone` | Phạm vi clone, thứ tự công việc, liên kết bằng chứng, tiêu chí hoàn tất và resume |
| `game-asset-extraction` | Intake, export, tính toàn vẹn, catalog asset và báo lỗi |
| `game-vibe-workflow` | Brief, triển khai vào project, reuse Dreamy và kiểm tra toàn bộ luồng |
| REA | Trả lời câu hỏi về artifact/code/hành vi với bằng chứng và giới hạn |
| AssetRipper | Xuất cấu trúc asset Unity vào workspace riêng để đánh giá và chọn nội dung tích hợp |

Nguồn upstream: [REA](https://github.com/morluto/rea) và [AssetRipper](https://github.com/AssetRipper/AssetRipper). Khi thực thi phải ghi commit/release và binary/package hash thực tế. Các tên tool, flag và endpoint trong tài liệu cũ chỉ là hợp đồng đã quan sát, cần đối chiếu với phiên bản đang chạy.

Không vendor toàn bộ hai repo, không thêm chúng vào dependency runtime của game. Không sao chép lại upstream skill REA vào một skill Dreamy cùng tên. Dùng hướng dẫn upstream đã cài khi phù hợp; thiếu hướng dẫn hoặc tool thì đọc nguồn chính thức và báo khả năng thực tế.

## 3. Phạm vi sử dụng

Kích hoạt khi người dùng yêu cầu clone/tái hiện game, đặc biệt kết hợp bóc asset và phân tích logic. Nhận game/package cụ thể, project đích và phạm vi mong muốn từ ngữ cảnh. Không tự chọn APK của game khác. Link store đủ cho nghiên cứu công khai, chưa đủ cho extraction hoặc binary analysis.

- Chỉ lập plan: xuất brief, ma trận phạm vi và kế hoạch; không chạy extraction hay sửa gameplay.
- Chỉ đục asset: chuyển cho `game-asset-extraction`.
- Có đầy đủ source: đọc code và test trước; REA chỉ chạy nếu còn câu hỏi cần artifact phát hành.
- Clone toàn bộ: lập danh sách màn hình, trạng thái, gameplay, nội dung và dịch vụ; pilot không thay thế phạm vi toàn game.
- Slice hoặc prototype: hoàn tất đúng slice đã yêu cầu, không tự mở rộng thành toàn bộ sản phẩm.

Chọn REA `off/auto/required` theo yêu cầu. Nếu người dùng yêu cầu dùng cả REA và AssetRipper, đặt yêu cầu bằng chứng cho cả hai trong task contract. Thiếu một công cụ thì ghi bước tương ứng là blocked/not-run; tiếp tục phần độc lập nhưng không tuyên bố yêu cầu đó đã đạt. Quyết định `off` sau đó của người dùng được ưu tiên.

## 4. Workflow dự kiến

1. **Chốt danh tính và phạm vi.** Ghi tên/package ID, phiên bản, SHA-256 artifact, project đích, nguồn tham chiếu, phạm vi màn hình/chức năng, thao tác static/runtime và đầu ra cần giao. Tách việc dùng asset để tham chiếu với việc đưa asset vào bản phát hành theo phạm vi người dùng đã chọn.
2. **Kiểm tra khả năng công cụ.** Reuse tool đang có; kiểm tra phiên bản và schema/CLI thật. Tách CLI, MCP, provider, Node và Unity Editor thành trạng thái riêng. Thiếu cấu hình chỉ xử lý đúng điểm thiếu; cài skill không chứng minh MCP hay native provider hoạt động.
3. **Kiểm kê nguồn.** Dùng helper extraction hiện có; nhận diện split APK/asset packs, Unity data, sidecar, bundles, Mono/IL2CPP từ bytes và layout. Giữ nguyên nguồn, lưu hash và coverage. Dữ liệu chưa có hoặc chưa tải không tính là đã export.
4. **Pilot AssetRipper.** Chọn đích mới ngoài source/project đích, xác minh absolute path trước export. Kiểm tra log và một nhóm texture/material/mesh/prefab/scene đại diện. Giữ lỗi stream, shader và dummy script. Sau pilot mới mở rộng theo phạm vi.
5. **Điều tra REA.** Viết câu hỏi thay đổi quyết định triển khai, như rule di chuyển hoặc điều kiện thắng. Mono dùng managed route; IL2CPP bắt đầu với metadata và native binary cùng nguồn khi cần. JADX chỉ phù hợp phần Java/Kotlin, không đại diện logic Unity native. Lưu Evidence, coverage, provider và unknowns; metadata không phải mã C# gameplay đã khôi phục.
6. **Hợp đồng triển khai.** Mỗi hành vi có input/state, kết quả, thời gian/tham số, bằng chứng, độ chắc chắn và acceptance scenario. Mỗi asset dùng lại có source object ID → file export → imported GUID/path → prefab/component → màn hình hoặc gameplay sử dụng.
7. **Tích hợp Dreamy.** Kiểm tra manifest/lock và compatibility/source của project đích. Reuse installer, panel, save, config, audio, feedback theo capability đã xác minh. Config tĩnh, save lâu dài và runtime state có owner riêng; gameplay nằm trong project. Giữ Runtime không phụ thuộc Editor và bảo toàn GUID/reference.
8. **Đối chiếu và giao.** Dùng cùng trạng thái gameplay, aspect ratio và phiên bản tham chiếu cho các capture. Kiểm tra chức năng, hiển thị, cảm giác điều khiển và player build riêng. Hoàn tất screen/state graph trong phạm vi, lưu việc còn thiếu và điểm resume. Chỉ dừng process do task sở hữu bằng PID đã xác minh.

## 5. File cần thêm hoặc cập nhật khi triển khai

| File | Thay đổi dự kiến |
|---|---|
| `skills/gameplay/game-clone/SKILL.md` | Trigger, routing, workflow, giới hạn tuyên bố và tiêu chí kết thúc |
| `skills/gameplay/game-clone/agents/openai.yaml` | Tên hiển thị, mô tả ngắn và prompt mặc định; giữ auto discovery |
| `skills/gameplay/game-clone/references/clone-contract.md` | Danh tính bản gốc, phạm vi màn hình/chức năng, hành vi và truy vết asset |
| `skills/gameplay/game-clone/references/toolchain.md` | Ghép REA với AssetRipper, version pinning, lỗi và resume; liên kết hướng dẫn hiện có |
| `skills/gameplay/game-clone/references/verification.md` | Extraction/import/compile/play/fidelity/build là các kết quả riêng |
| `skills/index.json` | Đăng ký `game-clone`, category gameplay, compact-workflow, maturity experimental, owner, evidence và eval IDs |
| `modules/unity-core/module.json` | Thêm thư mục skill để đi cùng hai dependency skill trong các preset hiện có |
| `skills/gameplay/game-vibe-workflow/SKILL.md` | Thêm routing sang workflow clone khi phù hợp, giữ route original game |
| `docs/research/source-ledger.json` | Bổ sung nguồn upstream đã pin, reuse record cũ khi cùng nguồn |
| `evals/catalog.json` | Thêm tình huống routing, hai tool, giới hạn dữ liệu và fidelity |
| `tests/unit/installer-lifecycle.test.mjs` | Kiểm tra install/update/uninstall skill và reference qua module hiện có |
| `docs/game-clone.vi.md`, `README.md`, `CHANGELOG.md` | Hướng dẫn dùng, trạng thái experimental và giới hạn đã kiểm chứng |

Chưa cần thêm helper mới: reuse helper extraction/catalog hiện có. Chỉ thêm adapter/script khi pilot cho thấy cần tự động hóa lặp lại và có thể kiểm thử contract thật. Không thêm binary, APK, tài sản game hay output REA vào toolkit.

Không tự bump version, maturity hay phase trong `toolkit.json` chỉ vì thêm plan hoặc skill. Nếu thay đổi schema/harness/module mới trong lúc thực thi, cập nhật canonical registry theo cấu trúc thật của repo.

## 6. Thứ tự triển khai và đầu ra

| Mốc | Việc cần làm | Điều kiện qua mốc |
|---|---|---|
| P0 | Đối chiếu hai skill đang phát triển, upstream và capability hiện có | Chốt ranh giới, nguồn pin và các gap; không ghi đè thay đổi khác |
| P1 | Viết entrypoint, ba reference và UI metadata | Trigger rõ; toàn bộ reference tồn tại; không lặp manual extraction/REA |
| P2 | Nối index/module, routing và docs | Skill được phân phối cùng hai skill phụ thuộc; cài/update giữ file người dùng |
| P3 | Thêm eval và kiểm tra tự động | Positive/negative/conflict cases đầy đủ; validation và test pass |
| P4 | Pilot toolchain trên artifact được chọn | Có output AssetRipper được xem mẫu và REA Evidence cho câu hỏi cụ thể, hoặc trạng thái blocked có nguyên nhân |
| P5 | Cài/cập nhật skill qua installer toolkit hiện có | Skill và reference đến đúng Codex destination; không đụng skill REA độc lập hay tự đăng ký MCP |

P4 có thể dùng Block Out khi có artifact cụ thể. Hiện chưa có APK/XAPK được chọn trong task; không lấy việc thiếu APK làm lý do trì hoãn P0–P3. Smoke test toolchain không đồng nghĩa đã clone xong game.

## 7. Ma trận kiểm thử

| Tình huống | Kết quả cần quan sát |
|---|---|
| Yêu cầu clone Unity bằng cả hai repo và cung cấp APK | Tạo hợp đồng, chọn extraction và câu hỏi REA; theo dõi cả hai kết quả |
| Chỉ có link store, yêu cầu lập plan | Nghiên cứu và lập plan; hỏi đúng artifact còn thiếu trước extraction |
| Chỉ đục sprite từ XAPK | Route extraction, không dựng gameplay |
| Source đầy đủ và REA auto | Đọc source/test, không bắt buộc setup REA |
| Người dùng chuyển REA off | Không discovery/setup/analysis REA |
| REA required nhưng thiếu provider hoặc Node phù hợp | Giữ gap rõ, tiếp tục phần asset độc lập, không báo REA pass |
| AssetRipper export có dummy script/shader | Báo khôi phục asset và gap code/rendering; không tuyên bố game chạy lại |
| Đích export trùng input hoặc đã có nội dung | Chọn đích mới trước khi gọi exporter |
| Clone toàn game nhưng mới hoàn tất một level | Ghi pilot hoàn tất; các màn/chức năng khác còn mở |
| Retry sau timeout hoặc output partial | Kiểm tra PID/output/receipt trước, không chạy lại toàn bộ hoặc xóa kết quả |

Kiểm tra hành vi phải dựa vào output và artifact quan sát được. Eval catalog chỉ mô tả kỳ vọng; keyword match và test cấu trúc chưa chứng minh agent làm đúng mọi tình huống.

Lệnh cần chạy khi triển khai:

```powershell
node scripts/validate-skills.mjs
python C:/Users/trinh/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/gameplay/game-clone
npm test
git diff --check
```

Chạy trong repo toolkit; đường dẫn validator Python phải được resolve theo môi trường thực tế nếu không phải máy hiện tại. Bổ sung smoke install/update/uninstall trong destination tạm bằng test lifecycle hiện có. Khi thêm script thì chạy fixture thành công, partial và lỗi đích; khi có game integration thì compile/Console/PlayMode/build theo phần thay đổi. Ghi lỗi có sẵn từ baseline riêng với lỗi mới.

## 8. Tiêu chí hoàn tất skill

- Một điểm vào `$game-clone` được toolkit phân phối, gọi được workflow hai repo và reuse đúng hai skill đã có.
- Reference có thể dùng sau khi cài; không dựa vào đường dẫn developer hoặc reference không được đóng gói.
- Truy vết được artifact, asset, hành vi và kết quả tích hợp; không đánh đồng file count, metadata, compile và gameplay fidelity.
- Validation, test lifecycle và `npm test` pass; pilot thật được đánh dấu đúng phạm vi hoặc deferred có nguyên nhân cụ thể.
- Docs có prompt cho plan-only, clone slice và clone toàn bộ; không mặc định cài tool hay đổi cấu hình khi skill được kích hoạt.
- Toàn bộ thay đổi người dùng có trước vẫn được giữ. Skill vẫn experimental cho đến khi có bằng chứng sử dụng tương ứng.

Prompt mục tiêu:

```text
Use $game-clone để clone game Unity từ APK/XAPK tôi cung cấp vào project Dreamy này.
Dùng AssetRipper để khôi phục asset và REA để xác minh các rule gameplay còn thiếu.
Trước hết lập phạm vi màn hình/chức năng và plan; chỉ bắt đầu thực thi khi task yêu cầu.
Giữ nguồn, xuất ra workspace riêng, lập catalog từng asset và liên kết Evidence hành vi.
Không đánh dấu hoàn tất nếu mới có export hoặc playable pilot.
```
