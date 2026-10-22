# Các bước cần chủ dự án thực hiện

Code, kiểm tra tự động và chuẩn bị dữ liệu do agent xử lý. Các bước dưới đây cần quyết định hoặc thao tác của bạn. Bộ hook/lesson/draft không gọi model. Bốn lượt retention và hai lượt native smoke được duyệt riêng đã dùng đủ; các đợt model tiếp theo cần plan và quyền mới.

## 1. Duyệt hook native — cần làm trước

Cập nhật ngày 22/10/2026: fixture đã được bạn duyệt đủ bốn hook, probe báo `trusted`, `complete`, không có lỗi hoặc hook ngoài. Đợt native được duyệt sau đó đã ghi nhận SessionStart completed trong 37 ms. Không cần duyệt lại cùng định nghĩa. Các lệnh dưới đây dành cho cài mới hoặc khi định nghĩa thay đổi.

Mở terminal ở thư mục repo `dreamy-codex-toolkit`. Nếu terminal chưa tìm thấy Node, dùng Node đang cài trên máy này:

```bash
export PATH="/home/tutrinh/.nvm/versions/node/v24.19.0/bin:$PATH"
node --version
codex --version
```

Fixture đã được agent chuẩn bị tại `.dreamy/native-consumer`; `.codex/` ở gốc repo không bị sửa quyền hoặc cài hook.

```bash
cd .dreamy/native-consumer
codex
```

Trong giao diện Codex, gõ `/hooks`. Xem và duyệt bốn nhóm thuộc `.codex/hooks.json` của fixture:

- `SessionStart`
- `PostToolUse`
- `PreCompact`
- `Interrupt`

Command phải trỏ tới Node và `.dreamy-codex/hooks-runtime/src/hooks/runner.mjs`, với `--root` là fixture. Command có marker hash runtime/policy để bản cập nhật được đưa lại vào review. Nếu Codex hỏi trust project, chỉ duyệt sau khi đã xem nguồn tương ứng.

Đây là quy trình trust của Codex; toolkit không tự ghi trusted hash. Xem [tài liệu Hooks chính thức](https://learn.chatgpt.com/docs/hooks).

Thoát phiên CLI, quay về gốc repo và kiểm tra:

```bash
cd ../..
node src/cli.js hooks probe --target .dreamy/native-consumer --json
node src/cli.js hooks smoke --target .dreamy/native-consumer --native --json
```

Kết quả mong đợi:

- Probe: `trust: trusted`, `discovery: complete`, `errors: []`.
- Trên Codex 0.163.0, smoke không gọi model nên có thể báo `status: not-run`, `events.SessionStart: not-observed`, `modelCalls: 0`, exit code 2: runtime chờ lượt người dùng đầu tiên mới xử lý SessionStart. Đây không phải lỗi trust và không cần duyệt lại hook.
- Nếu runtime phát event ngay khi mở thread, smoke chỉ báo pass khi thực sự nhận SessionStart completed.
- `operational: false` vẫn đúng: chưa có bằng chứng đủ các lifecycle. Tool/Stop/compact/interrupt cần phiên sử dụng thực tế riêng.

Bạn có thể trả lời **“đã duyệt hooks”** để agent kiểm tra tiếp. Nếu vẫn lỗi, gửi JSON của hai lệnh trên; không cần gửi auth/config tài khoản. Khi runtime/policy thay đổi qua configure/update, Codex cần review lại định nghĩa mới.

## 2. Kết quả native smoke và các đợt bổ sung

**Đợt đầu đã chạy đủ 2/2 lượt**, model `gpt-6.1-sol`, reasoning `low`. B1 tắt hook; B2 đã nhận SessionStart completed, 37 ms. Cả hai không có tool call ngoài ý muốn. Tổng dùng 13.836 input + 79 output = **13.915 token**; mỗi lượt có 6.918 input token.

Grader giữ nguyên kết quả **0 pass / 2 fail**: cả hai chọn mode quick và nói rõ không chạy observer, nhưng trả lời bằng câu đầy đủ thay vì chuỗi `none`. Prompt cũ chưa quy định nhãn này; prompt đã được làm rõ cho các đợt tương lai. Không sửa điểm cũ hoặc chạy lại model. Xem [bằng chứng được lưu](evidence/native-smoke-pair-20261022.json).

Plan cũ ở `.dreamy/benchmarks/native-smoke-review/` đã hết budget; kết quả ở `.dreamy/benchmarks/native-smoke-run-01/`. Không chạy lại lệnh cũ, đổi cờ hoặc xóa ledger. SessionStart đã có bằng chứng thực tế; chưa cần tiêu thêm token chỉ để chạy lại cùng smoke. Nếu cần đợt khác, tạo output mới, review payload mới và duyệt budget riêng. Các lệnh dưới đây mô tả cách chuẩn bị/thực thi một đợt, không cấp quyền chạy thêm.

Đợt đầu được thu nhỏ còn **hai model turn**: cùng task `quick-docs`, B1 tắt hooks và B2 bật minimal hooks. Đây là phép thử khả năng chạy và đo overhead, chưa phải benchmark chất lượng lập trình hoặc đủ repetitions để kết luận thống kê.

Agent chuẩn bị payload bằng lệnh không gọi model:

```bash
node scripts/prepare-native-benchmark.mjs \
  --manifest benchmarks/manifests/native-smoke.json \
  --case quick-docs \
  --project .dreamy/native-consumer \
  --model gpt-6.1-sol \
  --max-turns 2 \
  --output .dreamy/benchmarks/native-smoke-review-next
```

Mỗi lần chuẩn bị cần một output directory mới. Nếu thư mục ví dụ đã tồn tại, đọc bản đã tạo hoặc chọn tên mới, thay vì xóa bằng chứng cũ.

Bạn xem:

- `.dreamy/benchmarks/native-smoke-review-next/authorization-plan.json`: model, project, số turn, danh sách trial; mặc định `approved: false`.
- `B1/quick-docs/1/prompt.md` và `B2/quick-docs/1/prompt.md`: đúng nội dung sẽ gửi.
- Hai file `reviewed-additions.json`: snapshot bổ sung. B1/B2 không gửi lesson hoặc skill candidate; B2 có hash cấu hình/runtime hook để kiểm tra drift.

Đích gửi của đợt ví dụ là model `gpt-6.1-sol` qua tài khoản Codex hiện tại, reasoning `low`. Chỉ đánh dấu approved và thực thi sau khi bạn review và cho phép đúng plan mới. Câu chấp thuận cho hai lượt đã chạy không áp dụng lại. Nếu không muốn tiêu token, để nguyên `approved: false`; probe và chuẩn bị payload vẫn dùng được.

Để tự chạy sau khi đã review và đặt `approved: true` cho đúng plan:

```bash
DREAMY_EVOLUTION_EXECUTABLE='' \
DREAMY_EVOLUTION_EXECUTE=1 \
DREAMY_EVOLUTION_PLAN="$PWD/.dreamy/benchmarks/native-smoke-review-next/authorization-plan.json" \
npm run benchmark -- \
  --manifest benchmarks/manifests/native-smoke.json \
  --case quick-docs \
  --output .dreamy/benchmarks/native-smoke-run-next
```

Giới hạn 2 turn không phải trần cứng token hoặc tiền. Runtime vẫn có context cố định. Ledger ghi nhận lượt đã thử trước khi gửi; lỗi sau đó vẫn tiêu hao lượt. Không xóa ledger để retry: xem nguyên nhân và duyệt một đợt mới khi cần. Payload/context/lesson/skill/hook snapshot thay đổi sẽ làm plan cũ bị từ chối.

Adapter kiểm tra trust trước khi chạy; SessionStart phải completed trong lượt đã được duyệt thì kết quả B2 trở lên mới được chấp nhận. Nếu không nhận event hoặc hook failed, trial fail và lượt đã thử vẫn được tính vào budget. Receipt ghi actual runtime/model, usage khi có, các native event thật và hash payload. B3 thêm recall từ lesson còn hiệu lực; B4 yêu cầu candidate đã được promote với report/artifact còn nguyên. B4 hiện đưa nội dung skill đã review vào context, chưa kiểm tra discovery/routing tự động.

## 3. Nghiệm thu Unity — chuẩn bị Editor khi muốn tiếp tục

Agent đã kiểm tra tĩnh consumer đang kết nối và lưu profile riêng ở `.dreamy/consumer-readiness/project-inspect.json`. Static profile pass không chứng minh compile, EditMode, PlayMode hoặc Android build pass. Dữ liệu riêng của project không được đưa vào PR.

Trước khi chạy nghiệm thu Editor:

1. Dừng Play Mode và chờ hết transition/compile/import.
2. Lưu hoặc xác định rõ các scene/prefab đang sửa; giữ các thay đổi chưa commit của bạn.
3. Xác nhận dùng project đang mở làm consumer nghiệm thu và target Android hiện tại, hoặc chỉ rõ project/target khác.
4. Với kiểm tra build/device, chọn thiết bị và phạm vi smoke test. Cung cấp quyền dùng signing/SDK chỉ khi đúng bước build cần chúng; không gửi secret vào chat.

Sau đó agent có thể đọc Console, chọn test hẹp và ghi receipt thực tế. Không tự cập nhật package hoặc nâng trạng thái compatibility chỉ dựa vào việc package tồn tại. Các registry còn drift cần đối chiếu đúng source commit và kiểm chứng API/test trước khi đánh dấu hỗ trợ.

## 4. Skill tự học và rollout

Lỗi hợp đồng đầu ra của đợt native vừa chạy đã được ghi thành lesson `benchmark-output-label-contract`, trạng thái candidate. Prompt mới chưa được đánh giá bằng model nên lesson này chưa verified và không được dùng để tự promote skill.

Candidate thực tế đã được chuẩn bị ở `.dreamy/knowledge/skill-candidates/project-ci-recovery/SKILL.md`, từ lesson `ci-portable-npm-invocation`. Agent đã tái hiện lỗi `npm.cmd ENOENT`, chạy validate/unit/pack thành công, tạo draft và kiểm tra cấu trúc skill. Năm case cụ thể nằm ở `.dreamy/knowledge/project-ci-recovery-cases.json`; evaluation plan đã có trong thư mục candidate. Chưa chạy đánh giá hành vi hoặc promote. Đây là bản nháp để review; khi đưa vào toolkit dùng chung, ưu tiên cập nhật owner CI/debugger hiện có.

Agent có thể tạo nội dung candidate từ lesson đã xác minh, không yêu cầu bạn viết SKILL.md:

```bash
node src/cli.js skills draft LESSON_ID --name project-failure-recovery --target /path/to/project
node src/cli.js skills prepare-evaluation project-failure-recovery --input behavior-cases.json --target /path/to/project
```

File case dùng `{ "cases": [...] }`; mỗi case có `id`, `kind` (`positive`, `negative`, `conflict`), `prompt`, `expectedBehavior`. Cần tối thiểu 2 positive, 2 negative và 1 conflict. Agent soạn các case cụ thể theo lỗi thật và review trước khi xin budget thực thi. Plan được chuẩn bị không phải report pass và không thể dùng để promote.

Candidate ở `.dreamy/knowledge/skill-candidates/`, không được discovery tự động. Promotion vẫn là lệnh tường minh với report hành vi đúng hash và các artifact thật. Không có daemon tự gọi model hoặc tự đẩy code. Nếu workflow đã có owner, ưu tiên sửa owner đó thay vì tạo skill trùng.

Khi đã qua các gate native/semantic cần thiết, sử dụng opt-in trong công việc thật. Mỗi ngày có thể lưu snapshot không gọi model:

```bash
node src/cli.js rollout snapshot --target /path/to/project --json
```

Snapshot lưu vào `.dreamy/rollout/`: trust/config status, lỗi phát hiện và số lesson còn hiệu lực. Nhiều lần trong một ngày UTC vẫn chỉ tính một ngày quan sát. Runtime/policy thay đổi tạo cohort mới. Snapshot không tự chứng nhận đã sử dụng thật một tuần; cần kèm kết quả task, latency, lỗi và các lần rollback thực tế. Sau workspace đầu tiên ổn định, chọn thêm consumer để kiểm tra phạm vi dùng chung.

PR vẫn ở trạng thái draft cho đến khi review/phạm vi merge được quyết định. Các gate stable/production được theo dõi riêng; không cần giả lập rằng chúng đã đạt để dùng bản alpha opt-in.
