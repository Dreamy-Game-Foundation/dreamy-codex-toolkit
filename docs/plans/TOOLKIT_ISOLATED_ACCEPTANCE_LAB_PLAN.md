# Kế hoạch nghiệm thu toolkit trong project riêng

Ngày: 2026-10-22. Owner: operator chạy `scripts/toolkit-acceptance-lab.mjs`.

## Mục tiêu và phạm vi

Tạo consumer độc lập để kiểm tra phần mới mà không sửa Planet Bunker, cấu hình global hoặc dữ liệu game. Dùng Unity-shaped fixture có `Assets/`, manifest, lock và ProjectVersion; không xem đây là game có thể chơi hoặc bằng chứng Unity compile pass.

Chạy installer/CLI thật, verification thật và bản runner được installer chép vào consumer. Event fixture gửi qua stdin phải được nhận diện là explicit invocation. Không dùng receipt fixture để kết luận Codex Extension phát lifecycle event.

Không gọi model phụ, không reset budget các benchmark đã dùng, không tự duyệt trust hoặc promote skill. Probe native chỉ đọc discovery/configuration.

## Khởi tạo và tái lập

```bash
node scripts/toolkit-acceptance-lab.mjs --native-probe
# Hoặc chọn đường dẫn mới, chưa tồn tại:
node scripts/toolkit-acceptance-lab.mjs --output /tmp/dreamy-lab-new
```

Node >=20 và git phải có trong PATH. `--native-probe` cần Codex runtime cục bộ; không cần nó cho bộ test fixture. Runner từ chối output đã tồn tại để giữ bằng chứng cũ. Không dùng đường dẫn game đang làm làm output.

Mỗi run có `project/`, `artifacts/`, `PLAN.md`, `report.json`, `REPORT.vi.md` và `MANUAL-EXTENSION.vi.md`. Project có git riêng, không remote. Fixture mô phỏng metadata Windows v1, CRLF và file người dùng để kiểm chứng migrate/preserve. Các dữ liệu này do lab tạo, không sao chép từ game.

## Ma trận và điều kiện đạt

| ID | Kiểm tra | Điều kiện đạt |
|---|---|---|
| L01 | Update metadata cũ | Dry-run không sửa; update v2 đúng target, giữ nội dung người dùng |
| L02 | Context inventory | Chọn skill đã cài, có số byte; không bịa token đo được |
| L03 | Minimal hooks | Merge cấu hình, giữ hook người dùng, doctor không lỗi |
| L04 | SessionStart fixture | Replay cùng session một lần; khác session không replay |
| L05 | PostToolUse fixture | Lệnh exit 7 tạo observation đúng task; không lưu raw command; exit 0 không tạo lỗi |
| L06 | Checkpoint stale | File đổi làm checkpoint không đủ điều kiện replay |
| L07 | Interrupt fixture | Task cancelled, không tự tiếp tục |
| L08 | PreCompact fixture | Giữ nextAction và tăng compact epoch |
| L09 | Standard Stop fixture | Chặn tiếp tục tối đa một lần, không reset sau compact, bỏ qua cancelled |
| L10 | Strict fixture | Trả deny shape cho direct DeleteFile .meta; chưa chứng minh runtime chặn patch |
| L11 | Red/green thật | Thiếu lock: static inspect degraded/exit 2; phục hồi lock: pass/exit 0 |
| L12 | Lesson và recall | Chỉ dùng receipt còn hiệu lực; đúng phạm vi, bounded bytes, dedupe |
| L13 | Skill draft | Tạo draft và 5 case; plan không đủ quyền promote |
| L14 | Evidence stale | Sửa source/log làm lesson mất eligibility; khôi phục byte trả lại eligibility |
| L15 | Uninstall | Xóa phần managed; giữ file/config/skill và dữ liệu người dùng |
| L16 | Reinstall | Consumer sẵn minimal hooks, receipts bật, doctor không ERROR |
| L17 | Native probe tùy chọn | Thu được chẩn đoán thật; trust/delivery chưa được xác nhận vẫn ghi đúng trạng thái |
| L18 | Rollout snapshot | Hai snapshot cùng ngày chỉ tính một ngày; không tự chứng nhận vận hành |

L01–L16/L18 cần pass. L17 có thể not-run khi không yêu cầu native probe. Bất kỳ fail nào làm lệnh kết thúc exit 1; exit 0 với status partial chỉ xác nhận phần đã chạy đạt.

## Gate còn cần nghiệm thu thực tế

1. **N01 — Extension:** mở project riêng, review trust/hook, tạo chat mới; đối chiếu session, event và timestamp từ nguồn runtime. Loại bỏ ID `explicit-fixture-*`. Receipt đơn lẻ chưa đủ chứng minh nguồn.
2. **N02 — Lifecycle:** thử tool failure, Interrupt, compact và policy Stop/strict trong runtime thật. Thay policy cần review hash lại; không giả phát event để tính pass.
3. **N03 — Semantic:** review 2 positive, 2 negative, 1 conflict; cần artifact hành vi thật và budget riêng trước khi gọi model phụ. Không dùng plan thay report.
4. **N04 — Unity:** khi có Editor/version phù hợp, kiểm tra compile, Console và test phù hợp. Fixture hiện tại không kiểm tra API Dreamy, gameplay, Android/iOS hoặc thiết bị.
5. **N05 — Rollout:** thu task/latency/lỗi/rollback theo ngày sử dụng thật, nhiều consumer khi cần. Snapshot cùng ngày không thay cho một tuần sử dụng.

## Báo cáo và review

Ghi status, expected/observed, command/exit code, receipt và hash artifact. Ghi source commit, dirty flag, hash harness và các module liên quan để không gán kết quả cho commit khác. Không đưa auth, secret hoặc dữ liệu game vào evidence. Báo cáo công khai giữ tóm tắt và hash; raw logs nằm trong lab cục bộ.

Chạy unit test lab và `npm test` trước khi kết luận hoàn tất phần triển khai. Review git diff/status, giữ thay đổi ngoài phạm vi. Không merge PR, publish package hoặc nâng trạng thái stable chỉ dựa trên fixture.
