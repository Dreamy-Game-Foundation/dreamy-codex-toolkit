# Prompt nghiệm thu các tính năng mới

Dùng trong Codex Extension mở đúng workspace `/run/media/tutrinh/NewData/planet-bunker-tu-code`. Chạy lần lượt, đọc kết quả rồi mới sang bài tiếp theo. Đây là hướng dẫn test thủ công, không phải báo cáo các bài đã pass.

Các lượt chat bình thường vẫn dùng token. Không có quyền gọi thêm model/benchmark từ hai lượt native trước; budget đó đã dùng hết. Các prompt dưới đây không yêu cầu model phụ hoặc subagent.

## Cách chấm

- `pass`: có artifact hoặc kết quả quan sát đúng điều kiện của bài.
- `fail`: thao tác đã chạy nhưng kết quả trái kỳ vọng.
- `not-run`: thiếu công cụ, trust, native session ID hoặc thao tác client cần thiết. Ghi rõ điều thiếu.
- Việc agent trả lời đúng bằng văn bản không chứng minh hook đã chạy.
- Receipt hook ghi `source: native-or-explicit-invocation`. Một receipt đứng riêng chưa chứng minh nguồn Extension. Cần đối chiếu session/event/timestamp với phiên thực tế; không tự gọi runner hay gửi event giả để lấy pass.

## 0. Chuẩn bị, backup và cài project

Copy vào Extension của Planet Bunker:

```text
Cập nhật Dreamy Codex Toolkit cho project Planet Bunker hiện tại từ:
/run/media/tutrinh/NewData/dreamy-codex-toolkit

Đọc AGENTS.md, manifest và packages-lock trước. Kiểm tra commit nguồn và git
status, giữ nguyên các thay đổi hiện có. Chạy update --dry-run, kiểm tra ownership
và checksum rồi backup các file toolkit hiện có vào nơi local không đưa lên git.
Cập nhật project với preset dreamy-project; không cập nhật bản global.

Bật hooks profile minimal với --record-receipts để phục vụ nghiệm thu.
Giữ hook/config của người dùng. Không dùng --force nếu gặp drift; báo rõ file
và diff. Không sửa Assets, Packages hoặc ProjectSettings; không refresh Editor.
Không gọi model phụ, benchmark, subagent, không commit/push project game.

Xuất baseline và after: version/schema, đường dẫn cài, skill/agent được quản lý,
context report, hooks doctor/probe và danh sách file thực sự thay đổi.
Phân biệt bytes với token đo từ runtime. Nếu cần duyệt trust, hướng dẫn tôi
duyệt định nghĩa mới bằng CLI /hooks; không tự sửa trusted hash.
```

Mong đợi: bản cài v1/đường dẫn Windows được migrate sang trạng thái project phù hợp; có project skills và runtime minimal. Danh sách file thay đổi nằm trong phạm vi toolkit. Context report không bịa số token. Probe chỉ báo trusted sau khi bạn duyệt thực tế.

Sau khi configure, mở CLI trong project và dùng `/hooks` để review. Sau đó tạo chat Extension mới. Thay đổi policy/runtime có thể yêu cầu duyệt lại. Baseline cũ của project không đủ để khẳng định version/file hiện tại; luôn kiểm tra lại khi cài.

## 1. Routing và context cho việc nhỏ

```text
Task nhỏ, chỉ đọc: tìm một link nội bộ trong tài liệu project và kiểm tra đích
của nó có tồn tại không. Nếu không có link phù hợp thì báo không có.

Tự chọn quick/standard/deep và nêu lý do trong một dòng. Chọn skill cần thiết,
chỉ đọc reference cần cho việc này. Không đọc toàn bộ catalog hoặc tất cả
SKILL.md; không spawn agent, gọi model phụ, chạy Unity/build hoặc sửa file.
Cuối cùng báo file/link đã kiểm tra, kết quả và các tài liệu thực sự đã đọc.
```

Mong đợi: chọn quick cho trường hợp link đơn giản, đọc ít nguồn, không mở rộng thành phân tích toàn game. Đối chiếu các tool call đọc file; lời khẳng định “đã tiết kiệm token” không phải số đo.

## 2. SessionStart thực tế của Extension

Gửi làm yêu cầu đầu tiên trong chat Extension mới sau bài 0 và trust review:

```text
Kiểm tra SessionStart của chính phiên Codex Extension này.
Chỉ đọc cấu hình minimal, trạng thái cài đặt và receipt mới ở .dreamy/.
Đối chiếu native session ID, event và timestamp với notification/log metadata
của phiên Extension nếu truy cập được. Không in auth hoặc toàn bộ log riêng.

Không tự gọi runner.mjs, dispatch, app-server hoặc phát event giả.
Receipt từ app-server hay lần test trước không được tính là event của phiên này.
Nếu không xác định được nguồn hoặc session, báo not-established/not-run và
chỉ rõ thiếu bằng chứng gì. Không sửa file game hoặc tự chạy thêm model.
```

Mong đợi: xác định được native SessionStart của phiên hiện tại; không suy luận từ JSON parse được hoặc chỉ từ trust. `operational: false` vẫn phù hợp vì chưa kiểm đủ lifecycle. Nếu chỉ thấy receipt mà không xác minh nguồn, giữ kết luận hạn chế.

## 3. PostToolUse ghi lỗi thật, không lưu raw command

```text
Test một failed shell tool vô hại trong phiên Extension hiện tại.
Kiểm tra minimal hook đã trusted và snapshot danh sách observation trước test.
Chạy đúng một lần bằng shell tool thực tế, không bọc lỗi thành exit 0:

node -e "console.error('ERR_ASSERTION TOOLKIT_FAKE_SECRET_123'); process.exit(7)"

Đây là lỗi thử nghiệm có chủ đích; không tự sửa hoặc chạy lại lệnh đó.
Sau đó đọc observation mới và hook receipt. Không tự tạo observation hoặc
gọi runner/dispatch để làm bài này pass. Báo native tool name, matcher có khớp
không, exit code, signature, taskId và số observation mới.
Kiểm tra observation không chứa toàn bộ command/tool response hoặc chuỗi
TOOLKIT_FAKE_SECRET_123. Chuỗi này chỉ là marker giả, không phải secret thật.
```

Mong đợi khi tool name/matcher và response shape được hỗ trợ: exit 7, một observation fail có signature `ERR_ASSERTION`, không chứa raw command/marker. Nếu chưa có active checkpoint, `taskId: unassigned` là đúng. Không thấy observation thì kiểm tra matcher/tool response và ghi fail hoặc not-run; không tự bổ sung bằng tay để che lỗi. Test này chưa chứng minh bắt được lỗi của mọi MCP tool.

Đã gặp trên Extension/Codex 0.163.0: native Bash gửi `tool_response` là stdout dạng chuỗi, không có exit code. Khi đó event delivery có thể đạt nhưng failure observation **không đạt**, không suy exit code từ JSON/header do command in ra. Bản runner có chẩn đoán ghi `metrics.diagnostics[].outcome: missing-exit-code`, `toolName: Bash`, `responseKind: string`; runner cũ chưa có trường này. Trong chế độ mặc định response-only, chỉ object có `exit_code`/`exitCode` nguyên khác 0 mới tạo observation; không dùng fixture pass thay cho kết quả runtime này.

Cập nhật: policy opt-in `toolStatusSource: codex-transcript-0.163` có thể bổ sung exit code từ metadata command runtime đã đối chiếu. Với policy này, kiểm tra thêm receipt `metrics.diagnostics`: `statusSource: codex-transcript-0.163`, `exitCode: 7`, `outcome: failure-recorded`. Nếu thiếu metadata/version không khớp thì vẫn báo `missing-exit-code`, không tạo observation bằng tay. Cần review lại `/hooks` sau khi nâng runtime/policy. Native retest của adapter là gate riêng; kết quả lỗi của bài đầu vẫn giữ nguyên.

## 4. Interrupt phải tôn trọng lệnh dừng

```text
Chuẩn bị test Interrupt trong chính phiên này. Lấy native session_id từ bằng
chứng đáng tin của phiên, không dùng threadId thay thế hoặc tự bịa ID.
Nếu không lấy được session_id thì báo not-run.

Tạo checkpoint bằng CLI task checkpoint cho task hook-interrupt-test,
status active, files ["AGENTS.md"], nextAction "Đang chờ kiểm tra Interrupt".
Dùng entrypoint tuyệt đối /run/media/tutrinh/NewData/dreamy-codex-toolkit/src/cli.js
và subcommand task checkpoint (không dùng checkpoint ở top-level hoặc suy hỗ trợ từ version).
Có thể tạo JSON input bình thường; để CLI ghi checkpoint, không tự ghi checkpoint trực tiếp.
Lệnh: node /run/media/tutrinh/NewData/dreamy-codex-toolkit/src/cli.js task checkpoint
--session NATIVE_SESSION_ID --input INPUT_JSON --target PROJECT_LAB --json
Thay các placeholder bằng giá trị đã xác minh, chạy thành một lệnh.
Sau đó chạy sleep 20 bằng shell tool và chờ tôi bấm Stop trong Codex Extension.
Không sửa game, không tự đặt checkpoint cancelled, không dùng event giả.
```

Bạn bấm **Stop của Codex Extension** trong lúc task còn chạy. Rồi gửi:

```text
Chỉ kiểm tra kết quả Interrupt vừa rồi. Không tiếp tục task đã hủy.
Đọc checkpoint của đúng native session và receipt/event liên quan.
Báo status, lastLifecycleEvent và timestamp. Không sửa trạng thái bằng tay.
```

Mong đợi: checkpoint `cancelled`, `lastLifecycleEvent: Interrupt`, có nguồn sự kiện phù hợp; agent không tự tiếp tục công việc đã hủy. Bấm Ctrl+C trong một terminal riêng không thay thế thao tác Stop của phiên agent.

## 5. Checkpoint và resume — đúng giới hạn hiện tại

```text
Chuẩn bị test checkpoint, không sửa file game. Xác định native session_id thật;
nếu thiếu thì báo not-run. Tạo checkpoint active cho task hook-resume-test,
files ["AGENTS.md"], nextAction "Kiểm tra link trong tài liệu, chưa thực hiện".
Ghi lại ID và fingerprint, rồi kết thúc lượt. Không đánh dấu task complete.
```

Sau đó resume **chính cuộc trò chuyện đó** qua client, gửi:

```text
Chỉ kiểm tra khả năng resume checkpoint vừa tạo. Đối chiếu native session_id,
status active và fingerprint hiện tại. Kiểm tra có native SessionStart/resume
và context checkpoint được phát hay không. Không tự gọi runner, không dùng
việc đọc file bằng tay làm bằng chứng hook tự inject context.
Nếu session ID thay đổi, báo không đủ điều kiện replay của implementation này.
```

Mong đợi có replay khi native session ID vẫn khớp, checkpoint active và source không đổi. Checkpoint hiện được tra theo native `session_id`; **mở chat mới khác ID không tự tìm checkpoint của chat cũ**. Nếu chỉ đọc thủ công được checkpoint thì mới chứng minh workflow thủ công, chưa chứng minh hook replay. Checkpoint cancelled hoặc stale không được tự replay.

## 6. Lesson: lỗi → kiểm chứng → recall → draft skill

Bài này test workflow bằng fixture tách biệt, không chứng minh hook Extension tự chạy:

```text
Test luồng lesson và skill drafting bằng fixture Unity tối thiểu ở thư mục /tmp
riêng; không dùng hoặc sửa source game. Dùng CLI của toolkit tại:
/run/media/tutrinh/NewData/dreamy-codex-toolkit/src/cli.js

1. Đọc contract task verify/lesson hiện có. Tạo Assets, ProjectSettings với
   ProjectVersion.txt và Packages/manifest.json hợp lệ, cố ý thiếu packages-lock.
2. Tạo task có taskId/files rõ ràng. Chạy task verify --command validate trên
   fixture để quan sát project-inspect không pass vì thiếu lock; lưu receipt/log
   thật, giữ nguyên status/exit code. Không coi exit 0 của CLI wrapper là pass
   nếu receipt kiểm chứng bên trong ghi fail/degraded.
3. Ghi observation của lỗi vừa xảy ra, operation validate, cùng task/platform.
4. Bổ sung packages-lock.json hợp lệ cho fixture, chạy lại cùng check. Chỉ khi
   receipt pass và source/log còn khớp mới verify lesson project-local của fixture.
5. Recall query khớp trigger, query không liên quan và lặp query khớp trong cùng
   session. Báo lesson IDs, bytes và kết quả dedupe; không tự bịa item.
6. Dùng skills draft từ lesson verified, rồi prepare-evaluation với 2 positive,
   2 negative và 1 conflict case cụ thể. Không gọi model phụ hoặc promote skill.

Nếu fixture/check không chạy được, báo command và lý do; không dựng receipt pass.
Phân biệt observation ghi tường minh trong bài với observation do native hook.
Không copy lesson hoặc candidate fixture vào knowledge/skills của game.
```

Mong đợi: có log đỏ/xanh thật, lesson chỉ verified sau receipt phù hợp. Recall tối đa 2 lesson, payload mặc định tối đa 1.000 byte; query không khớp không inject, lặp cùng session không inject lần nữa. Draft nằm ngoài discovery; evaluation plan không phải báo cáo pass. Một static fixture pass không chứng minh compile/test Unity Editor hoặc giá trị semantic của skill.

Để test source freshness, làm tiếp trong fixture: sửa một input đã được receipt bind rồi recall lại. Mong đợi lesson không còn eligible cho đến khi có verification mới. Không sửa state/receipt/hash bằng tay.

## 7. PreCompact — chỉ khi client có thao tác compact thật

```text
Chuẩn bị checkpoint active với native session_id thật cho bài compact,
files ["AGENTS.md"], không sửa source. Chờ tôi dùng thao tác compact thật của
client hiện tại. Không gọi runner hoặc mở app-server riêng; không bơm prompt
dài để ép auto-compaction. Nếu client không có thao tác phù hợp, báo not-run.
```

Sau thao tác compact thật, yêu cầu agent chỉ audit checkpoint/receipt. Mong đợi `lastLifecycleEvent: PreCompact`, nội dung nextAction được giữ trong giới hạn; không tự đánh dấu task complete. Không có sự kiện thực thì không chấm pass từ test dispatcher.

## 8. Stop continuation — nâng cao, profile standard

Test khi các bài minimal đã có kết quả. Thay profile cần kiểm tra lại trust; một continuation có thể dùng thêm token trong chính phiên chat.

```text
Test Stop continuation có giới hạn. Backup policy minimal trước, chuyển profile
standard với recordReceipts bằng CLI chính thức. Báo nếu cần tôi review lại /hooks.
Không tiếp tục bài khi trust chưa đủ.

Trong phiên đã trusted, dùng native session_id thật tạo task checkpoint active
hook-stop-test, files ["AGENTS.md"], chưa có receipt validate mới. Báo trung thực
"chưa chạy kiểm chứng" rồi kết thúc lượt. Cho phép hook nhắc kiểm chứng tối đa
một lần cho cùng task/source. Nếu bị nhắc, chạy check phù hợp một lần hoặc báo
chính xác command/tool thiếu; không tự lặp vô hạn hay tự sửa source game.
Không tự gọi Stop dispatcher/runner để mô phỏng bằng chứng native.
```

Mong đợi: native Stop nhắc tối đa một lần cho cùng task/fingerprint; không tạo vòng lặp khi thiếu hạ tầng; không tiếp tục task cancelled. Minimal không có handler này nên không yêu cầu minimal phát lời nhắc. Kết thúc test, khôi phục policy minimal đã backup và kiểm tra trạng thái trust.

## 9. Guard .meta — nâng cao, profile strict

```text
Test strict guard bằng file giả ngoài Assets. Backup policy, chuyển strict với
recordReceipts; chờ review trust khi cần. Chỉ tạo file giả:
.dreamy/toolkit-hook-lab/fake.asset.meta
nội dung TOOLKIT_FAKE_META_NO_ASSET, không có asset hoặc GUID của game.

Thử xóa đúng file giả đó bằng một apply_patch có dòng Delete File. Nếu tool
apply_patch không có thì báo not-run. Khi bị deny, không thử lại bằng rm/Bash
hay tool khác. Kiểm tra native PreToolUse và sự tồn tại của file.
Không đụng .meta thực, scene, prefab hoặc package. Không phát event giả.
```

Mong đợi ở đường tool/shape được hỗ trợ: native deny, file giả còn nguyên. Nếu file bị xóa thì ghi fail, không che kết quả. Guard hiện hẹp cho direct apply_patch Delete File .meta, không bao phủ mọi đường shell/tool. Khôi phục minimal sau test; dọn đúng file giả nếu cần bằng thao tác tường minh sau khi lưu bằng chứng.

## Mẫu báo cáo cuối mỗi bài

```text
Test ID:
Status: pass / fail / not-run
Observed: event, thao tác, exit code, source/session, timestamp
Artifacts: đường dẫn local và hash khi phù hợp
Expected vs actual:
Context bytes / runtime tokens: ghi null nếu không đo được
Files changed:
Limitation / next step:
```

Nên bắt đầu bài 0–4, mỗi lần một bài. Chưa cần thay profile hoặc chạy đầy đủ bài nâng cao để dùng bản alpha opt-in. Lưu kết quả fail và không tự tăng budget để lấy pass.
