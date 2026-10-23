# Báo cáo nghiệm thu toolkit bằng project riêng

Ngày chạy: **22/10/2026**, Linux, Node v24.19.0. Kết quả: **18 pass / 0 fail / 5 not-run**, **0 lượt gọi model phụ**. Trạng thái tổng thể: `partial`; nghiệm thu vận hành thực tế chưa được xác lập.

Tình trạng Extension cập nhật **23/10/2026** (tách biệt với fixture ngày 22):

| Phạm vi | Kết quả |
|---|---|
| SessionStart | Đã quan sát đúng phiên Extension; chưa chứng minh checkpoint replay |
| PostToolUse | Retest đạt với adapter opt-in, kích hoạt CLI queue vào thread gốc Extension; xem cập nhật cuối |
| Interrupt | Đã quan sát, checkpoint chuyển cancelled |
| PreCompact | Đã quan sát, checkpoint active và nextAction được giữ |
| Stop/strict, replay, chất lượng semantic, Unity Editor, rollout nhiều ngày | Chưa nghiệm thu |

## Project đã tạo

Project cục bộ:

```text
/run/media/tutrinh/NewData/dreamy-codex-toolkit/.dreamy/acceptance-labs/2026-10-22T10-43-54.550Z-bcd966/project
```

Đã cài toolkit alpha `0.1.0-alpha.3`, preset `unity-minimal` với 18 skills/10 agents, minimal hooks và ghi receipts. Có git riêng, không remote; không sửa Planet Bunker hoặc cấu hình global. Đây là fixture có cấu trúc Unity, khai báo version `6000.4.12f1`, không có gameplay/C# hay package Dreamy. Chưa mở Unity Editor.

Run nằm trong `.dreamy/` bị git ignore; evidence tóm tắt được lưu trong repository. Không chuyển nguyên lab thành tài sản game.

## Kết quả đã quan sát

| Nhóm | Kết quả và ý nghĩa |
|---|---|
| Cài đặt | Dry-run, migrate metadata v1/CRLF, update, uninstall và reinstall đều giữ file/config/skill người dùng do fixture tạo |
| Context | Inventory 18 skills: metadata 3.818 bytes, body 75.994 bytes; đây là kích thước inventory, không phải toàn bộ context được gửi model. Token chưa đo (`null`) |
| Hook runner | Checkpoint cùng session replay một lần; khác session/stale/cancelled không replay; PreCompact giữ tiến độ; Stop có giới hạn; strict trả deny shape đúng case |
| Lỗi shell | Lệnh thật exit 7 được chuyển thành observation qua event fixture; không lưu raw command; lệnh thành công không tạo lỗi |
| Red/green | Xóa lock của fixture khiến static project-inspect `degraded`, exit 2; khôi phục lock được `pass`, exit 0 |
| Tự học | Lesson dựa trên receipt xanh được `verified-local`; recall 1 mục/398 bytes, lặp lại hoặc query khác không trả thêm; sửa source/log làm mất eligibility |
| Skill | Có draft `lab-lock-recovery-skill`, chuẩn bị 5 case; thử promote bằng plan bị từ chối. Chưa đánh giá semantic/chưa promote |
| Rollout | Hai snapshot cùng ngày chỉ tính 1 ngày; không tự nâng trạng thái operational |
| Native probe | Đọc được runtime Codex CLI 0.163.0; project chưa trusted, `trust=not-discovered`, discovery incomplete. Không chạy model turn hoặc lifecycle thật |

**Các hook pass ở trên đều là gọi runner tường minh.** Chúng kiểm tra hợp đồng handler/installer, chưa chứng minh Extension phát event hoặc thực thi deny. L17 pass chỉ có nghĩa thu được chẩn đoán native chính xác, không có nghĩa native hooks hoạt động.

Source nền: `b5653e3e7ef33d4d935e5bee0e1ad4b67eba1d28`, working tree có thay đổi khi chạy. Evidence có hash harness, module và artifact để nhận diện đúng nội dung đã kiểm tra; không gán toàn bộ kết quả cho riêng commit nền.

## Phần cần làm tiếp

### Cập nhật ngày 23/10/2026 — SessionStart Extension

Đã đối chiếu receipt với metadata runtime của session `01a166c7-ff52-7131-82db-f6337be71daf`: source `vscode`, đúng project lab, receipt SessionStart lúc `03:22:30.073Z`, sau metadata `03:22:29.558Z` khoảng 515 ms, handler không lỗi. Policy minimal và recordReceipts vẫn bật. Người chạy xác nhận không gọi runner/dispatch/app-server hoặc tạo event giả trong phiên thử.

Kết luận: **SessionStart đã được quan sát và đối chiếu với phiên Extension**. Receipt ghi source chung nên việc quy nguồn dựa trên đối chiếu metadata và quy trình đã báo cáo; riêng receipt không chứng minh được nguồn. `contextBytes: 0` không xác nhận replay checkpoint. PostToolUse, Interrupt, compact và Stop/strict thật vẫn chưa được nghiệm thu; không nâng operational acceptance. Giữ nguyên report ngày 22/10 như bằng chứng lịch sử, không đổi 5 mục not-run thành pass hàng loạt.

Xem [evidence cập nhật](evidence/toolkit-extension-sessionstart-20261023.json). Bước tiếp theo là bài PostToolUse dưới đây trong bộ prompt; chưa cần cài lại hoặc đổi policy.

### Cập nhật ngày 23/10/2026 — PostToolUse chạy nhưng không ghi lỗi

Người chạy báo đúng một lệnh exit 7, observation giữ nguyên 2 trước/sau; receipt tại lần thử `03:37:16.487Z` có 1 handler, không lỗi. Agent đối chiếu được tool result lúc `03:37:16.491Z` có exit 7. Receipt cùng session hiện lưu lần gọi sau lúc `03:38:02.350Z`; receipt được ghi đè theo session/event nên không gán timestamp mới cho lệnh thử trước đó.

Kết quả: **delivery đã được quan sát; acceptance ghi lỗi tự động thất bại**. Tool name Bash mới được suy từ cấu hình/source, receipt cũ không lưu tên trực tiếp. Không có observation mới để kết luận signature/taskId hoặc kiểm chứng redaction cho chính observation của lần thử.

Source Codex tag `rust-v0.163.0`, `codex-rs/core/src/tools/context.rs`, cho thấy `ExecCommandToolOutput::post_tool_use_response` trả stdout dạng chuỗi không kèm status; test upstream cũng kỳ vọng chuỗi. Handler cũ chỉ đọc số nguyên ở object `exit_code`/`exitCode`. Đây là lời giải thích có căn cứ source; input hook chính xác của lần thử không được capture. [Tài liệu chính thức](https://learn.chatgpt.com/docs/hooks) mô tả `tool_response` là JSON output tùy tool, không đảm bảo mọi tool có exit code.

Đã bổ sung diagnostic tối thiểu vào source runner và regression test: response thiếu status ghi `missing-exit-code`; chuỗi JSON/header do command in ra không được coi là bằng chứng exit code. Object có exit code nguyên vẫn được hỗ trợ. Không lưu raw stdout, command hoặc marker. **Thay đổi này cải thiện chẩn đoán, chưa khắc phục khả năng tự ghi lỗi Bash khi runtime không cung cấp status.**

Giữ nguyên runtime lab đang trusted để tiếp tục thử Interrupt; chưa cài đè source mới vào lab, chưa có native retest. Muốn dùng diagnostic mới cần configure lại hooks và review định nghĩa mới trong `/hooks`; không sửa trusted hash. Evidence: [PostToolUse follow-up](evidence/toolkit-extension-posttooluse-20261023.json).

Kiểm chứng bản sửa diagnostic: `npm test` có 75 test, **74 pass / 0 fail / 1 Windows-only skip**. Unit test cover statusless stdout, JSON/header giả, invalid status, structured failure/success; integration lab kiểm tra receipt của installed runner không chứa marker và không tạo observation giả. Đây là kiểm chứng source/fixture, chưa thay đổi kết quả native failure capture ở trên.

### Chuẩn bị Interrupt — lần đầu not-run

Agent trong Extension dừng trước sleep vì thử `dreamy-kit checkpoint --help`. Entry point trong repository có `task checkpoint`, đã kiểm chứng tạo checkpoint thành công bằng CLI ở thư mục tạm độc lập. Version alpha.3 của executable trên PATH chưa đủ chứng minh nội dung giống checkout; chưa xác minh executable người chạy đã dùng. Prompt được sửa để dùng entrypoint tuyệt đối và đúng subcommand. Chỉ chuẩn bị input `interrupt-checkpoint.input.json` cạnh lab; chưa tạo active checkpoint cho native session, chưa phát Interrupt hoặc sửa cancelled. Native Interrupt giữ trạng thái **not-run** đến khi người dùng thử thực tế.

### Cập nhật ngày 23/10/2026 — Interrupt đã quan sát

Sau khi dùng đúng CLI, người chạy thực hiện bài Stop/Interrupt và báo không sửa trạng thái. Agent đọc lại hai artifact: task `hook-interrupt-test` là `cancelled`, `lastLifecycleEvent: Interrupt`, updatedAt `03:59:29.069Z`; receipt đúng session Extension `01a166c7-ff52-7131-82db-f6337be71daf` ghi Interrupt lúc `03:59:29.070Z`, 1 handler, không lỗi. Tên file checkpoint khớp key được hash từ session ID.

Kết luận: **đạt phạm vi Interrupt delivery và chuyển active checkpoint sang cancelled**, dựa trên artifact đối chiếu và quy trình người chạy báo cáo. Không tự nâng nghiệm thu resume, PreCompact, policy Stop/strict hoặc operational acceptance. Giữ checkpoint cancelled làm bằng chứng; bài PreCompact tiếp theo cần task mới, không tự tiếp tục task đã hủy. Xem [evidence Interrupt](evidence/toolkit-extension-interrupt-20261023.json).

### Cập nhật ngày 23/10/2026 — PreCompact đã quan sát

Người chạy thực hiện compact thật trong Extension. Agent đối chiếu artifact: receipt PreCompact đúng session `01a166c7-ff52-7131-82db-f6337be71daf`, observedAt `04:03:46.826Z`, 1 handler, errors rỗng. Checkpoint `hook-compact-test` vẫn active, lastLifecycleEvent PreCompact, updatedAt `04:03:46.825Z`, nextAction `Kiểm tra tài liệu lab sau compact` giữ nguyên. Bản lưu checkpoint Interrupt vẫn cancelled; SHA-256 khớp `0b614e8cacc40e05b248920c5663d574145351511dcf17b46fec803ea2ecf5f0`.

Kết luận: **đạt phạm vi PreCompact delivery và bảo toàn checkpoint/nextAction**. Đọc checkpoint sau compact chưa chứng minh hook tự inject/replay vào context. Fixture khác session không được tính; bản runtime đang trusted vẫn là bản chưa có diagnostic PostToolUse mới. Không nâng operational acceptance hoặc sửa report fixture ngày 22. Xem [evidence PreCompact](evidence/toolkit-extension-precompact-20261023.json).

### Sửa PostToolUse — adapter đã cài, chờ native retest

Đã thêm policy opt-in `toolStatusSource: codex-transcript-0.163`. Adapter đối chiếu metadata `CommandExecution` của runtime với session, turn, tool-use ID, cwd và version; đọc tối đa 64 KiB đầu + 128 KiB cuối transcript cục bộ, không scan toàn bộ lịch sử. Chỉ record có exit code nguyên, hoàn tất trong 5 phút và khớp duy nhất mới được dùng. Response stdout không được parse thành status. Default response-only không đọc log; version/metadata không phù hợp thì bỏ qua có diagnostic. [Tài liệu OpenAI](https://learn.chatgpt.com/docs/hooks) lưu ý transcript format không phải interface ổn định, vì vậy adapter được khóa ở 0.163.0 và không bật mặc định.

Đã kiểm tra fixtures failure/success/dedupe, raw-output privacy, mismatch/stale/spoof/path/symlink/byte cap và runner được installer chép vào consumer. Đã đọc thử metadata của một command thật cũ ở timestamp gốc, lấy được exit 0 trong giới hạn 196.608 bytes; đây là kiểm tra hồi cứu read-only, không phải native retest và không ghi observation.

Lab hiện đã được configure minimal + receipts + adapter opt-in. Bản sao trước đổi ở `posttooluse-status-upgrade-20261023/before/` cạnh project; checkpoint hiện tại giữ nguyên byte. Cấu hình mới trả `requires-native-review`; chưa tự trust, chạy thêm model phụ hoặc phát event. Bạn cần review bốn định nghĩa minimal mới trong `/hooks`, mở chat Extension mới ở lab rồi chạy bài PostToolUse một lần. Kỳ vọng receipt `statusSource: codex-transcript-0.163`, `exitCode: 7`, một observation mới và không có marker/raw command. Nếu metadata chưa sẵn ở thời điểm hook chạy, giữ failure capture là chưa đạt để chẩn đoán tiếp, không bù observation thủ công.

Validation của adapter: `npm test` **78 test: 77 pass, 0 fail, 1 Windows-only skip** trên Linux. `hooks doctor` của lab không có lỗi, native trust vẫn chờ review. [Evidence sẵn sàng retest](evidence/toolkit-posttooluse-adapter-20261023.json) ghi source hash, policy và trạng thái checkpoint; không coi readiness là kết quả native pass.

### Native retest PostToolUse — agent thực hiện hộ, đạt

Theo yêu cầu thực hiện hộ của người dùng, agent mở CLI native tại lab, review/trust bốn định nghĩa hiện tại qua giao diện `/hooks`. Native probe xác nhận trust trusted, discovery complete, không có foreign trusted hooks hoặc lỗi. Không dùng bypass hay sửa hash trust bằng tay.

Agent đưa đúng một user turn bằng `codex queue` vào thread `01a166c7-ff52-7131-82db-f6337be71daf`, là thread có metadata gốc `source: vscode`. Đây là **native runtime test được kích hoạt qua CLI queue**, không mô tả thành thao tác người dùng bấm trong Extension. Lượt chạy từ `04:21:53.265Z` đến `04:22:32.518Z` ngày 23/10; lệnh thử exit 7 chạy đúng một lần. Các lệnh còn lại chỉ đọc evidence.

Kết quả đối chiếu độc lập:

- Observation từ **2 lên 3**, đúng một file mới, hai file cũ giữ nguyên hash.
- Event ID của observation khớp command hoàn tất exit 7: `exec-5812d6f8-0120-4c6c-8ced-8e9f6a7fa4b1`.
- Receipt lỗi lúc `04:22:01.985Z`: `statusSource: codex-transcript-0.163`, `exitCode: 7`, `outcome: failure-recorded`, 1 handler, không lỗi; handler mất khoảng 135,5 ms ở lần này.
- Signature `ERR_ASSERTION`, taskId `hook-compact-test` theo checkpoint đang active. Observation không lưu marker/raw command, hai cờ raw capture false.
- Các lệnh audit thành công sau đó ghi đè receipt hiện tại bằng status success. Snapshot lỗi được trích đúng JSON mà lệnh audit native đã đọc từ receipt trước khi ghi đè; evidence ghi nguồn và hash audit output, không giả tạo một receipt đang hoạt động.

Đầu lượt agent con đọc nhầm `.dreamy/observations` nên báo baseline 0; baseline operator đã chụp trước queue tại đúng `.dreamy/knowledge/observations` là 2, được dùng để tính delta. Agent đã tìm đúng kho và sửa báo cáo cuối. Không chạy lại lệnh lỗi để sửa sai baseline.

Lượt agent thông thường này có **6 model request được runtime đo**, input tổng 182.972 token (178.048 cached), output 2.315; không gọi thêm model/subagent phụ và không dùng lại ledger benchmark cũ. Không gọi đây là test zero-model. Chi phí token của lượt audit không phải chi phí của hook; hook adapter chạy Node cục bộ.

Kết luận: **native failure observation đạt trong phạm vi thử nghiệm này với adapter opt-in**. Các hạn chế version/transcript/bounded window còn áp dụng; chưa xác nhận retry/recovery trên mọi shell/tool, UI-click trial sau nâng cấp, standard/strict, Unity hoặc rollout nhiều ngày. Xem [evidence retest](evidence/toolkit-native-posttooluse-retest-20261023.json). Người dùng không cần chạy lại bài này.

1. **Minimal đã nghiệm thu trong phạm vi đã mô tả.** Trust đã được review và PostToolUse retest đã đạt; không yêu cầu người dùng lặp lại các bước này. Nếu muốn mở lại lab để tiếp tục:

   ```bash
   code -n '/run/media/tutrinh/NewData/dreamy-codex-toolkit/.dreamy/acceptance-labs/2026-10-22T10-43-54.550Z-bcd966/project'
   ```

2. **Replay:** SessionStart delivery và đọc checkpoint không chứng minh tự inject checkpoint. Bài resume/replay vẫn cần bằng chứng context từ runtime thật.
3. **Stop/strict thật:** chưa nghiệm thu. PreCompact đã đạt; không yêu cầu compact lại. Đổi policy cần review cấu hình/hook lại; deny shape chưa thay cho một patch bị runtime chặn.
4. **Chất lượng skill/model:** review 5 case rồi chọn budget riêng nếu muốn chạy đánh giá hành vi. Không tự sử dụng lại các lượt model đã duyệt cho benchmark cũ.
5. **Unity và rollout:** compile/Console/test trong Editor phù hợp và dùng nhiều ngày khi cần nghiệm thu phạm vi đó. Lab hiện tại chưa chứng minh gameplay, API Dreamy, mobile build hay hiệu quả dùng thực tế.

## Tái lập và bằng chứng

Kiểm tra triển khai sau khi thêm lab: `npm test` có **74 test: 73 pass, 0 fail, 1 Windows-only skip** trên Linux. `npm run pack:smoke` đạt; CLI trong gói thực hiện validate, context và hook fixture thành công. `git diff --check` không có lỗi whitespace. Chưa chạy lại GitHub CI cho các thay đổi cục bộ của lượt này.

```bash
node scripts/toolkit-acceptance-lab.mjs --native-probe
node --test tests/unit/acceptance-lab.test.mjs
npm test
```

Lệnh đầu tạo run mới, không ghi đè lab cũ. Dùng Node >=20 và git trong PATH. Nếu chưa có runtime Codex, bỏ `--native-probe`; phần discovery sẽ ghi not-run.

- [Kế hoạch và tiêu chí](plans/TOOLKIT_ISOLATED_ACCEPTANCE_LAB_PLAN.md)
- [Evidence có hash](evidence/toolkit-acceptance-lab-20261022.json)
- [Script dựng và chạy lab](../scripts/toolkit-acceptance-lab.mjs)
- [Test bảo vệ harness](../tests/unit/acceptance-lab.test.mjs)
- [Prompt thử từng tính năng](toolkit-evolution-test-prompts.vi.md)

Raw report, command, log và receipt ở thư mục run cục bộ: `report.json`, `REPORT.vi.md`, `artifacts/`. Chỉ evidence tóm tắt được theo dõi bằng git; không có auth/secret hoặc dữ liệu game được sao chép vào report.
