# Kế hoạch cải thiện tiếp theo: skills, harness và bằng chứng sử dụng

Ngày kiểm tra: **29/10/2026, Asia/Bangkok**. Canonical: `toolkit.json`, **0.1.0-alpha.4**, alpha. HEAD: `507b3f3ee0a3869800dc1546af40d6b31ff4dd9a`.

**Khuyến nghị:** sửa khả năng harness báo pass sai trước; sau đó kiểm chứng chất lượng skill bằng tác vụ có artifact, giảm nội dung lặp và hoàn tất acceptance trên Unity/runtime mục tiêu. Toolkit đã có nhiều cơ chế cần thiết; ưu tiên tiếp theo là chứng minh các cơ chế đó giúp hoàn thành công việc.

Trạng thái: **audit + implementation plan**, chưa triển khai các thay đổi sản phẩm dưới đây. Lượt này chỉ thêm plan và [snapshot bằng chứng](../evidence/toolkit-audit-20261029.json). Working tree đã có thay đổi installer/CLI/verification/lessons và plan dashboard trước audit; kết quả kiểm tra áp dụng cho working tree đó, không đại diện nguyên trạng clean HEAD. Không đổi version/maturity, không chạy model hoặc code upstream, không kích hoạt hooks.

## 1. Phương pháp và giới hạn

- **Observed:** đọc source/artifact hiện tại; phân biệt với mô tả tính năng từ README upstream.
- **Executed:** chạy kiểm tra local hoặc tái hiện bằng fixture, có đầu vào và kết quả lưu lại.
- **Proposed:** backlog, tiêu chí nghiệm thu và mục tiêu định lượng bên dưới.
- **Unknown:** hiệu quả coding tổng quát, Unity/device acceptance và native runtime chưa có bằng chứng mới trong lượt này.

GitHub REST được đọc trực tiếp để lấy stars, default branch, trạng thái archive và full commit. Source upstream chỉ đọc tại commit đó; snapshot giữ URL và SHA-256 từng file. “Hot” trong tài liệu này nghĩa là repo có độ phổ biến tích lũy cao và liên quan về cơ chế; **không phải thứ hạng GitHub Trending hoặc tăng trưởng stars trong tuần**, vì chưa đo chuỗi thời gian.

Không có `Packages/manifest.json` hoặc `Packages/packages-lock.json` tại root toolkit. Không phát sinh Dreamy API claim mới; fixture Unity trong `tests/fixtures` không chứng minh package được hỗ trợ trong consumer thực tế.

Đây là vòng tiếp theo của [plan ECC/Superpowers](DREAMY_TOOLKIT_ECC_SUPERPOWERS_EVOLUTION_PLAN.md), đọc cùng [implementation report](../toolkit-evolution-implementation.md). Các hạng mục đã có code được ghi nhận lại bên dưới để tránh lập backlog trùng.

## 2. Baseline đã kiểm tra

| Thành phần | Sự thật quan sát/thực thi | Ý nghĩa |
|---|---|---|
| Catalog | 83 skills, 15 agent templates, 50 rules, 9 modules, 9 presets, 95 eval definitions | Độ phủ rộng; số lượng chưa đo chất lượng |
| Skills | 351.873 byte tổng `SKILL.md`; 2 skill dùng `compact-workflow`; 6 size advisories | Byte source, không phải token mỗi turn |
| Nội dung lặp | Năm đoạn dài phổ biến nhất, mỗi đoạn xuất hiện nguyên văn trong 69 skills | Cần chọn lọc quyết định riêng của domain |
| Eval mapping | 77/83 entries có `evalCases: []`; 6 skills có mapping tường minh | Thiếu truy vết trực tiếp ở index; không suy ra 77 skills hoàn toàn chưa được case nào đề cập |
| Validators | Legacy profile bắt nhiều heading cố định; frontmatter/package metadata đọc bằng regex | Có thể khuyến khích mẫu dài; chưa chứng minh tương thích parser chuẩn |
| Benchmark | `grade()` hiện chấm substring hoặc JSON fields | Đo phản hồi/quyết định có cấu trúc; chưa tự chứng minh patch đúng hoặc code chạy |
| Harness | JSON evidence, status pass/fail/degraded, batchmode, profile/asmdef/package checks | Nền tốt để mở rộng có giới hạn |
| Unity compatibility | `compatibility/unity.json.tested` là mảng rỗng | Chưa đủ cơ sở công bố phiên bản Unity đã tested |
| Evolution | Có hooks opt-in, checkpoint, lessons, receipt freshness, candidate evaluation/promotion | Không cần xây lại observer/memory/checkpoint |
| Native | Report cũ có một số event được quan sát; registry vẫn `not-established` cho acceptance tổng thể | Partial evidence không thành chứng nhận toàn runtime |
| Consumer workflow | Working tree có bundled CLI/entrypoint, doctor, receipt context và lesson explanation | Review và ổn định thay đổi đang có trước khi thêm lớp mới |
| Tests | `npm test`: **93 tests, 92 pass, 0 fail, 1 skip** trên Linux/Node 24.19.0 | Pass local; Windows-only PowerShell test chưa chạy ở lượt này |

Lần chạy `npm test` đầu bị sandbox chặn `spawnSync` với EPERM. Chạy lại ngoài sandbox với quyền tạo tiến trình con đã pass. Log đầy đủ và hash nằm trong snapshot; lỗi môi trường ban đầu không được tính thành lỗi source.

## 3. Các phát hiện cần xử lý

### F1 — P0: harness chấp nhận kết quả không chạy test

**Executed.** Trong `harness/dreamy-harness`, `testResultPassed` chỉ tìm `<test-run ... failed="0"`. Một executable giả trả exit 0 và XML sau làm `test-editmode` báo pass:

```xml
<test-run result="Skipped" total="0" passed="0" failed="0" skipped="0" />
```

Snapshot giữ script tái hiện, input XML và JSON output. Đây là **synthetic adapter probe**, không phải Unity Editor run. Nó chứng minh nhánh parser có thể chấp nhận đầu vào không đủ điều kiện, chưa chứng minh Unity luôn xuất đúng XML này khi thiếu test.

**Proposed:** parse XML có kiểm soát; kiểm tra root, result, counters, ít nhất một test thực thi và consistency. Zero tests/all-skipped trả non-pass kèm lý do. Nếu cần check cố ý không có test, caller phải khai báo scope riêng; không gọi đó là test suite pass. Bổ sung regression missing/malformed/truncated XML, failed suite, inconclusive/skipped, zero tests, nonzero exit, timeout và positive fixture. Không dùng regex `failed="0"` làm oracle duy nhất.

### F2 — P1: evaluator chưa đo kết quả làm việc đủ sâu

**Observed.** `scripts/benchmark.mjs:grade()` có thể xác nhận output chứa nội dung kỳ vọng hoặc JSON field khớp. Nó không tự mở patch, thực thi test hay kiểm tra serialized asset. Một mô tả sửa lỗi đúng vẫn khác một bản sửa lỗi chạy được.

**Proposed:** thêm grader dựa trên artifact cho một cohort nhỏ, giữ runner/provenance hiện tại. Trong workspace tạm: agent sửa task fixture; grader độc lập kiểm tra diff, test kết quả và invariant. Output/trace dùng để giải thích, không là oracle duy nhất. Ca nguy hiểm phải kiểm tra thay đổi thực tế, chẳng hạn Runtime import Editor, GUID bị mất, stale evidence được dùng lại.

### F3 — P1: skill dài vì phần chung, thiếu mapping trực tiếp

**Observed.** 69 skills lặp nhiều đoạn inspection/workflow/verification. Ví dụ `dreamy-core`, `dreamy-feature` và `combat` có domain decision khác nhau nhưng dùng nhiều phần chung. 77 entries chưa khai báo case trực tiếp tại index.

**Proposed:** chọn 5 pilot `dreamy-core`, `dreamy-ui`, `dreamy-assets`, `unity-async`, `combat`. Mỗi pilot giữ decision riêng, lifecycle hazard và verification thật sự cần thiết; đẩy chi tiết có điều kiện sang references. Không buộc skill phải nạp một “shared skill” mới để hiểu invariant thiết yếu. Thêm mapping case có ý nghĩa, phân biệt coverage khai báo và observed outcome.

Không coi mục tiêu giảm byte là đủ: entrypoint ngắn hơn nhưng chọn nhầm skill hoặc bỏ cleanup thì không được rollout.

### F4 — P1/P2: bằng chứng Unity và runtime còn thiếu

**Observed.** Unity registry chưa có tested version; build Android/iOS cần executable và build method ngoài toolkit. `console` hiện đi qua batchmode operation, không đồng nghĩa đọc Console của Editor đang mở. Strict guard chỉ có phạm vi hẹp được tài liệu hóa.

**Proposed:** acceptance matrix ghi rõ batchmode/live Editor/static fixture/native event; mỗi ô có runtime version, source hash, result và exact limitation. Chạy một vertical slice Unity đã pin trước; chưa thêm nhiều Editor version khi một slice chưa có evidence thành công. Tool availability hoặc runner receipt đơn lẻ không được nâng thành native delivery acceptance.

### F5 — P2: tài liệu và lineage nghiên cứu cần đồng bộ

**Observed.** Canonical là alpha.4 nhưng phần đầu `docs/toolkit-evolution.md` vẫn ghi “still version alpha.3”. Source ledger root ghi thời điểm nghiên cứu tháng 8; plan tháng 10 có snapshot riêng. Đây là khác biệt cần giải thích, không tự sửa lịch sử thành số liệu mới.

**Proposed:** tách rõ lịch sử release với trạng thái hiện tại; liên kết snapshots mới từ ledger/index nghiên cứu; kiểm tra link và version statement tự động ở phần có nguồn canonical. Giữ artifact lịch sử nguyên bản. Dashboard tiếp tục theo [plan riêng](DREAMY_LOCAL_DASHBOARD_IMPLEMENTATION_PLAN.vi.md), chỉ tiêu thụ status/eligibility đã thống nhất.

## 4. So sánh upstream hiện tại

Stars tại snapshot REST ngày 29/10/2026; commit đầy đủ, commit date, default branch, license metadata và URL file nằm trong evidence JSON. Số stars không phải bằng chứng chất lượng hay mức tương thích Dreamy.

| Repo | Stars | Commit đọc | Quan sát giới hạn và quyết định áp dụng |
|---|---:|---|---|
| [Superpowers](https://github.com/obra/superpowers) | 307.573 | `2ce8aa15d05b` | Source `writing-skills` dùng baseline/pressure scenario và vòng sửa skill; `verification-before-completion` yêu cầu evidence mới. Học cách thử skill bằng hành vi; Dreamy đã có evidence freshness, bước tiếp theo là artifact task |
| [ECC](https://github.com/affaan-m/ECC) | 291.890 | `25278e7d7b6c` | Source có hook profile/disable controls và learning theo project. Dreamy đã có cơ chế tương ứng; ưu tiên đo usefulness/eligibility, chưa cần observer hoặc confidence score mới |
| [Spec Kit](https://github.com/github/spec-kit) | 143.714 | `99e047e9b48c` | README mô tả entrypoint riêng cho feature, bug và idea assessment, cùng preset/extension. Học task contract có scope và acceptance; không ép bug nhỏ đi qua toàn bộ quy trình feature |
| [GSD Core](https://github.com/open-gsd/gsd-core) | 10.976 | `ceef6898be2f` | README mô tả phase loop, persistent artifacts và fresh-context execution. Học artifact phục hồi công việc; không mặc định áp dụng multi-agent/waves vào mọi task |
| [Unity MCP](https://github.com/CoplayDev/unity-mcp) | 15.509 | `ed4e205d31a5` | README mô tả bridge điều khiển Editor và tools cho scene/script/test. Dùng làm ứng viên adapter sau khi inspect API/package thực tế; không xây một bridge cạnh tranh trong Dreamy |
| [Agent Skills](https://github.com/agentskills/agentskills) | 26.750 | `69ef37e9424c` | Specification mô tả frontmatter và progressive disclosure. Thêm kiểm tra format/interoperability, giảm phụ thuộc vào heading riêng của toolkit |
| [unity-claude-skills](https://github.com/Nice-Wolf-Studio/unity-claude-skills) | 40 | `a149d3e99542` | README có taxonomy Unity và mẫu WHEN/WRONG/RIGHT/GOTCHA. Học ví dụ lỗi phân biệt được, không sao chép lượng lớn tài liệu API |
| [everything-claude-unity](https://github.com/XeldarAlz/everything-claude-unity) | 25 | `bb28ccbd40b0` | README mô tả workflow Unity prototype/verification. Là peer đúng domain nhưng quy mô phổ biến nhỏ; dùng để đối chiếu UX và scenario, chưa có evidence run đối sánh |

Hai repo Unity cuối là peer trực tiếp từ source ledger cũ, **không gắn nhãn hot**. Chưa audit implementation của hai peer này trong lượt hiện tại; nhận xét giới hạn ở README đã pin.

[GSD cũ](https://github.com/gsd-build/get-shit-done) có 64.191 stars nhưng đã archive; [README tại snapshot](https://github.com/gsd-build/get-shit-done/blob/bdcaab2c752d9a33a1a1ca9acf3a3c81fb991815/README.md) chỉ sang `open-gsd/gsd-core`. Không cộng stars của hai repo hoặc dùng repo cũ làm nguồn active. GSD Core/Unity MCP được đọc ở default branch lần lượt `next`/`beta`; đó không mặc nhiên là bản stable.

**Định vị đề xuất:** Dreamy tập trung vào ownership/package compatibility/Unity verification và bằng chứng sửa lỗi. Các framework tổng quát cung cấp mẫu workflow; chưa có benchmark chung để kết luận Dreamy tốt hơn hoặc kém hơn về coding quality.

## 5. Backlog theo thứ tự thực hiện

Các owner dưới đây là vai trò chịu trách nhiệm khi triển khai, không phải lệnh tự spawn agent. Ước lượng cho một người làm tuần tự; có thể thay đổi sau review working tree.

| ID / ưu tiên | Phạm vi file và owner | Kết quả nghiệm thu | Phụ thuộc / công |
|---|---|---|---|
| A0 / P0 | Harness parser + `tests/unit/harness-contract.test.mjs`; developer/tester | Ca F1 non-pass; XML positive chạy test vẫn pass; counters/result/error classification có regression | Không cần Unity license; 0,5–1 ngày |
| A1 / P0 | Review thay đổi sẵn ở consumer install/doctor/verification/lessons; reviewer | Phân biệt file tracked/untracked; lifecycle retention/freshness và package smoke đúng; commit implementation tách khỏi plan | Giữ ownership hiện có; 1–2 ngày |
| A2 / P1 | `scripts/benchmark.mjs`, benchmark contracts/cases, isolated fixtures; tester | Grader đọc artifact/test; fail dù output nói đúng khi patch sai; missing artifact = not-run/fail theo nguyên nhân, không pass | Sau A0; 2–3 ngày |
| A3 / P1 | Skill validator, authoring docs, 5 pilot skills/references và index; skill author | Pilot compact + direct cases; links hợp lệ; bất biến domain được giữ; giữ profile cũ cho migration dần | Thiết kế case trước, A2 để đo; 2–3 ngày |
| A4 / P1 | Benchmark manifests và report; tester/reviewer | A/B baseline vs candidate cùng task/model/settings, 3 repetitions; retained artifacts, usage measured hoặc null | A2+A3; 1–2 ngày, model budget riêng |
| A5 / P1 | Unity fixture, harness evidence, `compatibility/unity.json`; editor/tester | Real compile/EditMode/PlayMode có test count, XML/log/source binding; chỉ update tested cho slice đạt | A0; 1–2 ngày khi có Editor/license |
| A6 / P2 | Hook native adapter/tests, acceptance report; MCP operator/tester | Session replay/compact/Interrupt/Stop và strict scope có actual event evidence; unsupported version = unknown/degraded | Runtime/trust sẵn; 1–2 ngày |
| A7 / P2 | Source ledger/docs/evolution/version text; docs manager | Phân biệt current/history; snapshot có ngày/full SHA; thiếu evidence không nâng maturity | Làm xen kẽ A1–A6; 0,5–1 ngày |
| A8 / P3 | Dashboard theo plan riêng; developer | Read-only projection dùng eligibility hiện có, stale/degraded rõ; không có scheduler/model call | Sau semantics A1+A2 ổn định; estimate theo plan dashboard |

Critical path: **A0 → A2 → A3/A4 → quyết định rollout skill**. A1 phải được review trước phát hành. A5/A6 có thể chờ external prerequisites; sự chờ này không cản parser/Node tests/skill cases. Tổng khoảng **9–16 ngày kỹ thuật** cho A0–A7, chưa tính thời gian chờ Unity/runtime/model budget và chưa gồm dashboard.

PR đầu tiên đề xuất: **“Reject empty/skipped Unity test runs in harness evidence”**, chỉ parser + regression + docs liên quan. Phần audit này chưa sửa code sản phẩm theo PR đó.

## 6. Thiết kế kiểm thử và tiêu chí rollout

### 6.1. Cohort nhỏ có giá trị

Đề xuất **20 tasks**: 5 pilot skills × 4 tình huống (positive, near-miss/negative, lỗi lifecycle, yêu cầu user xung đột với chỉ dẫn chung). Tách **10 development / 10 holdout** trước khi sửa skill. Dùng task variants để tránh ghi nhớ wording; không tune theo đáp án holdout.

Ví dụ artifact: async close hủy công việc đúng owner; UI đóng/mở không nhân đôi subscription; asset load/release cân bằng; service lookup nằm đúng root; pooled combat item reset và không phát damage sau despawn. API cụ thể chỉ được viết sau khi inspect manifest/lock/source fixture.

Hai treatment cần so: **baseline working tree đã đóng băng** và **candidate skill changes**; thêm no-toolkit control chỉ khi budget cho phép. Cùng model/settings/tools/runtime, cùng số repetition, ghi treatment order và clean fixture reset. Ba repetitions cho mỗi treatment/task là mức pilot, chưa đủ để tuyên bố ưu thế rộng.

Grading ưu tiên: executable test/result → invariant/diff checks → rubric reviewer cho phần định tính. Substring/JSON decision cases vẫn dùng được ở tầng routing, nhưng báo riêng khỏi coding success. Phân biệt **forced-load skill test** với **native discovery test**; ép nạp đúng skill không chứng minh runtime tự chọn đúng.

### 6.2. Gates dự kiến

| Gate | Điều kiện đề xuất |
|---|---|
| Safety | 0 critical regressions: GUID/serialization mất, Runtime→Editor, stale evidence thành pass, user cancel bị resume |
| Artifact quality | Candidate không giảm số task artifact pass trên holdout; báo numerator/denominator và từng failure |
| Routing | Không tăng near-miss activation; forbidden activation phân biệt với chọn nhiều skill thật sự cần |
| Context | Mục tiêu giảm ≥25% tổng byte entrypoint của 5 pilots; report token chỉ khi runtime đo được |
| Cost | Báo measured input/cached/output tokens, requests, elapsed time; chỉ rollout khi lợi ích chất lượng/cost có lý do cụ thể |
| Evidence | Source/treatment/fixture/grader hashes; log và artifact retained; stale/missing/infrastructure failure tách riêng |
| Release | `npm test` + relevant smoke/matrix; production benchmark vẫn theo `benchmarks/release-policy.json` hiện có |

Mục tiêu giảm byte là **hypothesis/target**, chưa phải kết quả. Không đổi production gate 95%/3 repetitions hoặc tự cấp release eligibility để làm pilot xanh. Model execution cần plan runtime/model/payload/budget rõ theo cơ chế authorization sẵn có; lượt audit này không chạy thêm model.

### 6.3. Acceptance matrix tối thiểu

| Lớp | Kiểm tra | Hiện trạng lượt này |
|---|---|---|
| Catalog/schema/context | `npm test` gồm `npm run validate` | Pass; 6 size advisories |
| Node regression | 93 tests | 92 pass, 1 Windows-only skip |
| Harness adversarial | Synthetic zero-test XML | Tái hiện false pass; cần A0 |
| Package/install | Smoke hiện có, chạy lại sau implementation ảnh hưởng packaging | Không chạy pack riêng trong lượt plan |
| Windows/Node 20/22 | CI matrix hiện có | Không có run mới được xác minh trong lượt này |
| Real Unity compile/tests | Pinned vertical slice | Chưa chạy; registry tested rỗng |
| Native hooks | Event/version/surface acceptance | Không chạy mới; dùng report cũ đúng phạm vi |
| Skill coding holdout | A/B task artifacts | Chưa chạy; A2–A4 là backlog |

## 7. Những việc nên hoãn

- Tăng số lượng skills/roles khi chưa có failure hoặc domain gap rõ.
- Vector memory, global lesson promotion, observer LLM thường trực hoặc daemon mới khi recall hiện tại chưa có usefulness benchmark.
- Auto-install upstream framework, tự tin tưởng hook hoặc copy implementation mà chưa xét license/provenance tại snapshot.
- Multi-agent scheduler và dashboard điều khiển task trước khi receipt semantics ổn định.
- Thêm nhiều Unity/build targets trước khi một vertical slice thực sự compile và chạy test thành công.

## 8. Checkpoint cho lượt triển khai tiếp theo

**Đã xong:** audit working tree; snapshot sau tinh gọn giữ metadata 9 repo và 11 source files đã pin; chạy `npm test`; tái hiện F1 bằng adapter giả; lưu snapshot và plan này. Các số lượng là phạm vi đọc, không có nghĩa audit toàn bộ upstream.

**Chưa làm:** sửa parser, thay skills/validator, model A/B, real Unity/native acceptance, phát hành hoặc nâng maturity. Bước kế tiếp là A0; đọc lại git status, source hash và phần thay đổi consumer chưa commit trước khi sửa.

Rollback triển khai: mỗi hạng mục một diff hẹp; candidate skills thử trong workspace tạm trước; giữ legacy profile trong migration. Không xóa lessons/checkpoints/user config khi rollback. Sau mỗi phase, lưu command/result và exact reason cho check không chạy, review diff/status và cập nhật implementation report đúng bằng chứng.

Nguồn truy vết: [audit snapshot](../evidence/toolkit-audit-20261029.json), [canonical registry](../../toolkit.json), [harness](../../harness/dreamy-harness), [skill validator](../../scripts/validate-skills.mjs), [benchmark runner](../../scripts/benchmark.mjs), [skill index](../../skills/index.json), [Unity compatibility](../../compatibility/unity.json). Snapshot chứa link full-commit cho từng upstream file và log kiểm tra đầy đủ.

Theo dõi triển khai sau audit: [checkpoint hardening 29/10](../toolkit-hardening-20261029.vi.md). Các nhận định và số liệu baseline ở trên giữ nguyên ý nghĩa lịch sử; checkpoint tách phần đã thực thi, draft chưa rollout và acceptance còn thiếu.
