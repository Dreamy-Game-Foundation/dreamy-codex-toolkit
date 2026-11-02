# Checkpoint triển khai hardening ngày 29/10/2026

Theo [plan cải thiện](plans/DREAMY_TOOLKIT_NEXT_IMPROVEMENTS_20261029.vi.md), trên working tree alpha.4 có thay đổi consumer workflow từ trước. Version/maturity giữ nguyên; các kết quả dưới đây không chứng nhận production hoặc Unity compatibility.

## Kết quả đã kiểm chứng

- **A0:** thay regex chấp nhận `failed="0"` bằng parser XML `saxes`. Yêu cầu NUnit root/result/counters hợp lệ, số đếm khớp từng test case và có test thực thi. XML sai, bị cắt, thiếu file, 0 test, all-skipped, inconclusive và counter giả đều không pass. Có giới hạn kích thước/nesting và từ chối DOCTYPE. Licensing/timeout vẫn degraded.
- **A1, phạm vi local:** review luồng consumer install/doctor/verification/lessons sẵn có; suite bao phủ install/update/uninstall, ownership drift, retention, freshness và hooks config. Parser mới được đưa vào checker fingerprint, vì vậy đổi checker làm receipt cũ mất eligibility. Không coi local tests là bằng chứng CI Windows mới hoặc tính nguyên tử của toàn bộ chuỗi cài đặt khi máy bị ngắt đột ngột.
- **A2:** thêm `artifact-task` grader vào runner hiện có. Mỗi repetition có workspace riêng; verifier do manifest chỉ định chạy sau adapter. Giữ fixture/verifier/artifact/log hashes và changed paths. Trả lời đúng wording không bù được patch sai; missing artifact, timeout và dữ liệu kiểm chứng bị sửa không pass. Empty case/treatment selection hoặc 0 repetitions bị từ chối.
- **A3, chuẩn bị:** 5 compact candidates ngoài skill catalog, có reference đi kèm và inventory source hashes. Tổng entrypoint từ **23.554 xuống 9.178 byte, giảm 61,03%**. Đây là byte source, chưa đo token/quality. Chưa thay canonical skills hoặc kích hoạt candidate.
- **A4, chuẩn bị:** 20 forced-load decision probes, 10 development + 10 holdout, hai treatments và ba repetitions. Chỉ prepare development: 60 not-run slots. Artifact pilot riêng có 3 not-run slots. Không có model quality result hoặc automatic discovery evidence.
- **A7:** phân biệt version lịch sử/current trong evolution docs; liên kết audit mới từ source ledger, giữ nguyên snapshot cũ; cập nhật hướng dẫn harness/eval/skill authoring.

`npm test`: **125 tests, 124 pass, 0 fail, 1 skip** trên Linux/Node 24.19.0. Skip là PowerShell contract cần Windows. Parser/harness targeted suite 32/32; artifact/runner targeted suite ban đầu 10/10, rồi bổ sung empty-selection regression trong full suite. Log, hashes và kết quả tái hiện sau sửa nằm trong [implementation evidence](evidence/toolkit-hardening-20261029.json).

Regression dùng executable giả và XML synthetic, không chạy Editor thật. Ca audit cũ hiện trả `fail`/exit 1. Pure JavaScript subscription pilot xác nhận cơ chế grader; không chứng minh lifecycle C# hoặc API Dreamy.

## Cách chạy lại

```bash
npm test
node scripts/validate-compact-pilot.mjs
node scripts/benchmark.mjs --manifest benchmarks/manifests/compact-skill-pilot.json --split development --prepare
node scripts/benchmark.mjs --manifest benchmarks/manifests/artifact-pilot.json --prepare
```

Hai lệnh prepare trả exit 2/degraded vì chưa execute; đây là kết quả dự kiến. Mỗi lần chạy dùng output directory mới để tránh trộn evidence. Dùng `--split holdout` khi đã đóng băng candidate và kế hoạch đánh giá; không tune bằng kết quả holdout.

Packaging chạy riêng với `DREAMY_ARTIFACTS_DIR=artifacts/hardening-20261029 npm run pack:smoke`; kết quả source-bound nằm ở `artifacts/hardening-20261029/npm-pack-smoke.json`, ngoài distributable source để tránh tự làm stale fingerprint. Packaging không tự publish npm/GitHub hoặc ghi đè report release có sẵn.

## Phần chưa hoàn tất và bước tiếp theo

| Hạng mục | Trạng thái thực tế / điều kiện tiếp tục |
|---|---|
| A3 rollout | Drafts chưa được activate; cần A/B/rubric/artifact review trước thay skill catalog hoặc nới validator profile |
| A4 model A/B | Chưa chạy; cần runtime/model/settings và giới hạn lượt gọi/token do run owner chọn; runner authorization hiện có vẫn áp dụng |
| A5 Unity | Lệnh `node harness/dreamy-harness compile tests/fixtures/unity/vertical-slice` trả degraded/exit 2: chưa cấu hình `DREAMY_UNITY_PATH`. Cần Editor/license và compile/EditMode/PlayMode thật trước sửa `compatibility/unity.json.tested` |
| A6 native | Local CLI là `codex-cli 0.165.0`; adapter transcript tương thích cũ gắn riêng 0.163.0. Chưa chạy trial event, chưa cấp trust và chưa nâng acceptance |
| A8 dashboard | Giữ plan riêng; chưa triển khai viewer/scheduler trong đợt hardening này |
| CI/release | Chưa có run remote mới; không bump version/maturity và không publish |

Bước tiếp theo: chọn ngân sách A/B rồi chạy development cohort qua adapter được review, giữ holdout cho đánh giá sau cùng. Song song, cấu hình một Unity Editor/license cho vertical slice. Không để thiếu các điều kiện đó chặn những regression tests local đã có.

## Ownership và phạm vi diff

Các thay đổi installer/CLI/lessons/dashboard plan đã tồn tại trước lượt triển khai được giữ lại. Không commit hoặc reset chúng. Các bổ sung chính của đợt này nằm ở harness/parser/schema, artifact grader/fixtures/tests, compact draft cohort và tài liệu checkpoint. Canonical `skills/index.json`, `evals/catalog.json`, `toolkit.json` và Unity tested registry không được nâng trạng thái chỉ từ kết quả Node tests.
