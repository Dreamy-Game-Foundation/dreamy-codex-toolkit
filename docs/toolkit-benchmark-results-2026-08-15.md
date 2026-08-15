# Kết quả benchmark Dreamy Codex Toolkit - 2026-08-15

## Kết luận

**Benchmark plumbing: PASS. So sánh chất lượng K0-K3: INCONCLUSIVE. Release claim: NO-GO.**

Runner, Codex adapter, structured grader, artifact hashing và self-test đã chạy được. Tuy nhiên Codex host hiện tại vẫn tự nạp skill toàn cục từ `C:\Users\trinh\.agents\skills` vào treatment K0, kể cả khi dùng home tạm, `--ignore-user-config`, tắt các feature liên quan và cấu hình `skills.config` để disable từng skill. Vì K0 không còn là baseline "không toolkit", các điểm K0-K3 quan sát được không được dùng để tuyên bố Dreamy hoặc The1 tốt hơn.

Không có winner hợp lệ trong lần chạy này.

## Snapshot

| Trường | Giá trị |
|---|---|
| Dreamy source commit | `9f2efd3b212adf1757452ccae5e89b60f4308381` |
| The1 source commit | `380eccebe9df7986e268a94a76ebe0dce9e202ab` |
| Manifest | `benchmarks/manifests/codex-pilot.json` |
| Manifest SHA-256 | `188a73ef904b2fc0ff28c07c3d142980f0bde17c6e9a198fd32864302877ec84` |
| Codex CLI | `0.147.0` |
| Model | `gpt-5.6-sol` |
| Reasoning | `medium` |
| Repetitions | `1` |
| Pilot cases | `3` structured negative/safety micro-evals |
| Release eligible | `false` |

Các quality run được thực hiện trên worktree dirty vì adapter, manifest và grader đang được phát triển trong cùng phiên. Đây là development evidence, không phải release evidence.

## Kết quả được chấp nhận

### Runner self-test

Run [`2026-08-15T03-54-20-588Z-61c7f829`](../benchmarks/runs/2026-08-15T03-54-20-588Z-61c7f829/report.json) hoàn thành `3/3` bằng synthetic adapter.

Kết quả này chỉ xác nhận:

- manifest được đọc và treatment/case được tạo đúng;
- JSON field grader chấm đúng ba contract;
- output, source provenance, hash và report được lưu;
- self-test không bị nhầm thành quality hoặc release evidence.

### Replay contamination detector

Detector mới được kiểm tra trực tiếp trên trace của run [`2026-08-15T03-54-29-340Z-188a73ef`](../benchmarks/runs/2026-08-15T03-54-29-340Z-188a73ef/K0/runtime-editor-boundary/1/codex-events.jsonl). Trace chứa lệnh đọc:

`C:\Users\trinh\.agents\skills\unity-foundations\SKILL.md`

Replay trong phiên này xác nhận detector nhận ra đường dẫn trên trace thực tế; unit test giữ lại cùng dạng JSONL nhiều lớp escape. Từ các run tiếp theo, adapter ghi `adapter-status.json`; runner chuyển trial bị contamination thành `not-run` và toàn run thành `degraded`, thay vì ghi nhận một `pass` sai điều kiện thí nghiệm.

## Quality runs đã thực hiện nhưng bị loại

| Run | Treatment | Điểm quan sát | Quyết định | Lý do |
|---|---:|---:|---|---|
| [`03-22-24`](../benchmarks/runs/2026-08-15T03-22-24-963Z-188a73ef/report.json) | K0 | 1/3 | Loại | Keyword grader tạo false negative cho câu trả lời đúng nghĩa. Dùng để calibration grader. |
| [`03-27-11`](../benchmarks/runs/2026-08-15T03-27-11-991Z-188a73ef/report.json) | K0 | 3/3 | Loại | Nạp skill/rule toàn cục; K0 không còn là baseline sạch. |
| [`03-29-42`](../benchmarks/runs/2026-08-15T03-29-42-655Z-188a73ef/report.json) | K1 The1 | 3/3 | Loại | Cùng contamination; không cô lập được chỉ The1 source. |
| [`03-30-25`](../benchmarks/runs/2026-08-15T03-30-25-577Z-188a73ef/report.json) | K2 Dreamy rules + agents | 3/3 | Loại | Cùng contamination. |
| [`03-31-16`](../benchmarks/runs/2026-08-15T03-31-16-705Z-188a73ef/report.json) | K3 Dreamy + skills | 3/3 | Loại | Cùng contamination và ceiling `3/3`. |
| [`03-37-26`](../benchmarks/runs/2026-08-15T03-37-26-021Z-188a73ef/report.json) | K0 | 0/3 | Loại | Infra failure do ổ C gần đầy trong thử nghiệm isolation. |
| [`03-41-20`](../benchmarks/runs/2026-08-15T03-41-20-830Z-188a73ef/report.json) | K0 | 2/3 | Loại | Một false negative do forbidden substring `fully verified` xuất hiện trong câu phủ định; đồng thời vẫn bị contamination. |
| [`03-45-38`](../benchmarks/runs/2026-08-15T03-45-38-838Z-188a73ef/report.json) | K0, 1 case | 1/1 | Loại | Tắt feature vẫn không ngăn host nạp skill toàn cục. |
| [`03-50-15`](../benchmarks/runs/2026-08-15T03-50-15-115Z-188a73ef/report.json) | K0, 1 case | 1/1 | Loại | Disable từng skill bằng `skills.config` vẫn không cô lập được host. |
| [`03-54-29`](../benchmarks/runs/2026-08-15T03-54-29-340Z-188a73ef/report.json) | K0, 1 case | 1/1 | Loại | Canary cuối xác nhận lại skill toàn cục trong command trace. |

Run report của các canary trước khi detector được thêm vẫn ghi `complete/pass`. Quyết định loại ở file này dựa trên raw trace, là bằng chứng chi tiết hơn. Không sửa ngược artifact gốc.

## Bảng so sánh bắt buộc

| Category | K0 | K1 The1 | K2 Dreamy current | K3 Dreamy improved | K4 + harness | Winner/confidence |
|---|---:|---:|---:|---:|---:|---|
| Project analysis | N/A | N/A | N/A | N/A | Chưa chạy | Inconclusive |
| Architecture/routing | N/A | N/A | N/A | N/A | Chưa chạy | Inconclusive |
| Implementation | Chưa có fixture | Chưa có fixture | Chưa có fixture | Chưa có fixture | Chưa chạy | Inconclusive |
| Debugging | Chưa có fixture | Chưa có fixture | Chưa có fixture | Chưa có fixture | Chưa chạy | Inconclusive |
| Unity safety | 3/3 quan sát, bị loại | 3/3 quan sát, bị loại | 3/3 quan sát, bị loại | 3/3 quan sát, bị loại | Chưa chạy | Không có winner |
| Dreamy package truth | Chưa chạy | N/A | Chưa chạy | Chưa chạy | Chưa chạy | Inconclusive |
| Efficiency | Không so sánh được | Không so sánh được | Không so sánh được | Không so sánh được | Chưa chạy | Inconclusive |

Không tính delta, confidence interval hoặc context efficiency vì chỉ có ba micro-case, một repetition và baseline bị contamination. Các quality run đầu chưa thu được token metadata đáng tin cậy; các canary sau có token data nhưng không so sánh được giữa treatment.

## Thay đổi benchmark đã hoàn thành

- Thêm real Codex exec adapter với model/reasoning pin, temp workspace, auth-only isolated home, read-only sandbox và JSONL trace.
- Thêm manifest K0-K3 và source bundle riêng theo case cho The1, Dreamy rules/agents và Dreamy skills.
- Thay keyword-only grader bằng exact structured JSON field grader cho ba pilot case.
- Ghi duration, token usage khi trace cung cấp, output/events hash và source provenance.
- Thêm lọc `--case` để chạy canary nhỏ.
- Loại false-positive forbidden substring ở case thiếu `packages-lock.json`; exact status/decision là contract quyết định.
- Thêm adapter status contract để giữ nguyên bằng chứng `not-run` do infra/isolation.
- Thêm contamination detector và unit test trên Codex JSONL trace thực tế.

Theo [Codex configuration reference](https://developers.openai.com/codex/config-reference/), `skills.config` chỉ hỗ trợ enable/disable theo từng đường dẫn skill. [Codex CLI reference](https://developers.openai.com/codex/cli/reference/) mô tả `--ignore-user-config` là bỏ `$CODEX_HOME/config.toml`, không phải chế độ tắt mọi host-provided instruction. Kết quả canary cho thấy hai cơ chế này chưa đủ để tạo K0 sạch trong môi trường đang dùng.

## Gate status

| Gate | Trạng thái | Evidence |
|---|---|---|
| Runner reproducible | PASS cho self-test | Synthetic run 3/3; unit tests green. |
| Artifact traceability | PASS cho các run đã tạo | Prompt/output/events/report và SHA-256 được lưu. |
| Deterministic structured grading | PASS cho ba micro-case | Exact JSON field contract; grader replay ổn định. |
| Clean K0 baseline | FAIL | Host đọc global skill trong raw JSONL trace. |
| Pilot corpus >= 20/24 runnable | FAIL | Mới có 3 micro-case, chưa có end-to-end fixture. |
| Comparative quality claim | FAIL | Baseline contamination, n=1, ceiling effect. |
| Canary improvement >= 10 points | NOT RUN | Không có paired valid trials. |
| Production release gate | NOT RUN | Manifest `releaseEligible=false`; worktree dirty; chưa có K4/Unity fixture. |

## Task tiếp theo theo thứ tự chặn

1. Tạo execution lane không nhận host-injected skills, ưu tiên direct API/SDK adapter hoặc Codex runtime có cờ disable toàn bộ skill được kiểm chứng bằng trace canary.
2. Chạy lại một K0 canary. Chỉ tiếp tục khi trace không đọc `.agents/skills`, `.codex/skills`, project `AGENTS.md` hoặc source ngoài manifest.
3. Freeze một clean Dreamy commit chứa benchmark harness và ghi The1 source hash trực tiếp vào report provenance.
4. Nâng corpus từ 3 lên 24 task: routing, repository fixture, Unity static fixture và Unity 6000.4 end-to-end fixture.
5. Chạy paired K0-K3 với 5 repetitions cho micro-eval, 3 repetitions cho end-to-end; randomize treatment order.
6. Thêm K4 real harness, deterministic Unity graders, blind maintainability review và bootstrap 95% confidence interval.
7. Chỉ publish release report khi mọi P0 safety gate đạt, baseline sạch và `releaseEligible=true` trên clean commit.

Lần benchmark hiện tại đã làm đúng nhiệm vụ quan trọng nhất của harness: từ chối tạo một quality claim khi điều kiện so sánh không công bằng.
