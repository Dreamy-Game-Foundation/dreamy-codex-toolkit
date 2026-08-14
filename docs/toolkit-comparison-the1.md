# So sánh Dreamy Codex Toolkit với The1 Unity Claude Agents

## File này dùng để làm gì?

Đây là tài liệu trả lời trực tiếp ba câu hỏi:

1. The1 có điểm nào Dreamy nên học?
2. Dreamy đang làm tốt hơn ở đâu và phải giữ lại điều gì?
3. Cần bổ sung skill, agent, harness và eval nào, theo thứ tự nào?

Nguồn tham chiếu đã đọc: `C:\Users\trinh\the1-unity-claude-agents` tại commit `380eccebe9df7986e268a94a76ebe0dce9e202ab`. Thư mục `scripts/` untracked của repository tham chiếu không được dùng làm bằng chứng.

## Phạm vi đọc

- 35 agent prompt trong `agents/`.
- Ba orchestrator: tech lead, project analyst, team configurator.
- Nhóm core: code archaeology, review, QA, build, performance, tools, analytics, documentation.
- Nhóm chuyên môn: gameplay, physics, AI, animation, graphics, shader, technical art, data, audio, UI, localization, accessibility, networking, security, mobile, monetization, cloud, console, WebGL, XR và game design.
- `CLAUDE.md`, README, agent authoring guide, best practices và example workflows.

The1 không có hệ thống skill độc lập; phần lớn domain knowledge được nhúng trực tiếp trong agent Markdown.

## Kết luận ngắn

The1 mạnh về **độ sâu domain và hình dung team chuyên môn**. Dreamy mạnh về **khả năng cài đặt, modular context, source truth, safety và evidence contract**. Hướng đúng không phải copy 35 agent The1 sang Dreamy, mà là:

- lấy project-analysis, routing example, structured handoff và các domain gap từ The1;
- chuyển kiến thức tái sử dụng thành Dreamy skill/reference ngắn;
- giữ agent Dreamy nhỏ, chỉ đại diện cho mode of work;
- kiểm mọi API/code pattern bằng compatibility và executable fixture trước khi công bố.

## So sánh kiến trúc

| Mặt | The1 | Dreamy hiện tại | Quyết định |
|---|---|---|---|
| Knowledge placement | Nhúng trong 35 agent, nhiều file 700–2.400 dòng | 80 skill + reference, agent TOML ngắn | Giữ kiến trúc Dreamy; không biến agent thành encyclopedia |
| Project analysis | Analyst riêng, key-file checklist và output profile | Trước review chỉ detect manifest/lock Dreamy package | Đã thêm `unity-project-analysis` + `dreamy_project_analyst`; tiếp theo mở rộng CLI/harness |
| Orchestration | Tech lead + team configurator + routing tree | Plan/architect/developer/tester flow, doc còn ngắn | Bổ sung handoff contract, dependency/acceptance, không ép orchestrator cho mọi task |
| Specialist breadth | Rộng: XR, networking, security, accessibility, cloud, console, WebGL | Mạnh Dreamy/mobile/gameplay; thiếu một số domain | Thêm dưới dạng conditional skills trước, agent chỉ khi benchmark chứng minh cần |
| Domain depth | Nhiều implementation example | Nhiều skill chỉ có vài domain bullet | Làm sâu theo failure corpus, dùng references có nguồn |
| Safety | Có best-practice prose nhưng ít Unity serialization/GUID/ownership gate | Có Runtime/Editor, serialization, ownership, compatibility gate | Giữ Dreamy làm nền bắt buộc |
| Source/API truth | Nhiều claim Unity 6000.1 và code mẫu không gắn package/version test | Dreamy claim gắn verified commit/drift | Không copy API code nếu chưa có fixture |
| Harness/tests | Không có test/harness/eval trong repo | Có Node tests/static harness, Unity operations còn degraded | Dreamy tốt hơn về contract nhưng phải làm real Unity bridge |
| Distribution | Copy/symlink Claude agents | Installer/preset/module/update/uninstall | Giữ Dreamy; benchmark clean install và rollback |
| Context cost | README cảnh báo 10–80k token; prompt rất lớn | Preset/module/skill progressive disclosure | Giữ budgeted context, đo token trong benchmark |

## Những điểm nên học từ The1

### 1. Project analysis trước routing

The1 analyst đọc Unity version, GraphicsSettings, manifest/lock, EditorBuildSettings, asmdefs, render pipeline, input, UI, networking và asset organization trước khi đề xuất. Dreamy trước review chỉ phân loại `engine: unity` nếu có manifest và chỉ liệt kê `com.dreamy.*`.

Đã bổ sung ngay:

- `skills/unity-project-analysis/SKILL.md`;
- `skills/unity-project-analysis/references/capability-profile.md`;
- `agents/codex/dreamy-project-analyst.toml`;
- ba case `project-analysis-*` trong eval catalog.

Phần còn thiếu: CLI/harness phải emit profile này bằng máy thay vì chỉ dựa vào prompt.

### 2. Structured output và handoff

The1 tech lead luôn trả project analysis, proposed approach, task breakdown, dependencies, complexity và recommendations. Đây là cấu trúc hữu ích cho Dreamy plan/architect/developer/tester handoff.

Dreamy nên chuẩn hóa handoff tối thiểu:

```text
from / to / objective
project snapshot + evidence
owned files/assets
dependencies and blockers
acceptance commands
risks and forbidden mutations
artifact paths
```

Không copy `timeline` giả hoặc assign agent không tồn tại.

### 3. Concrete trigger examples

The1 frontmatter mô tả tình huống routing cụ thể. Dreamy description ngắn và rõ nhưng thiếu conflict examples như “UI + save + IAP”, “URP package present nhưng pipeline chưa active”, “task nhỏ không cần team”. Các example nên nằm trong eval routing corpus, không phình mọi agent TOML.

### 4. Domain checklists và integration points

The1 agent thường có:

- domain model/capability list;
- implementation patterns;
- performance/platform considerations;
- best practices;
- integration points với agent khác.

Dreamy nên chuyển cấu trúc này thành skill/reference, nhưng mỗi integration point phải trỏ tới skill/agent có thật và mỗi API claim phải có version/evidence.

### 5. Các domain còn thiếu

| Domain The1 có | Dreamy coverage | Bổ sung đề xuất |
|---|---|---|
| Project archaeology/analysis | Mới thêm P0 baseline | Hoàn thiện capability detector và snapshot diff |
| Multiplayer/networking | Không có skill chuyên biệt | `unity-multiplayer` P1, package-detected variants làm reference |
| Accessibility | Chưa có | `unity-accessibility` P1, UI/input/audio/localization integration |
| Security/threat modeling | Chỉ có secret/privacy và release rule | `unity-game-security` P1; không copy anti-cheat code mẫu |
| WebGL | Chưa có | `webgl-build-release` P2, chỉ khi target detected |
| Console | Chưa có | `console-release-readiness` P3, không chứa NDA SDK internals |
| XR/AR/VR | Chưa có | `unity-xr` router + AR/VR references P2 |
| Cloud/backend | Remote config/analytics system skill còn hẹp | `game-backend-integration` P2, provider-specific references |
| Technical art/import pipeline | Rendering skill có nhưng tool workflow mỏng | làm sâu `unity-material`, `unity-shader`, `unity-vfx`, `unity-editor-tooling` |
| Game design/balance | Gameplay systems thiên implementation | optional `game-design-systems` P2, tách khỏi code ownership |

## Những điểm không nên sao chép

### Agent explosion

The1 dùng 35 agent nhưng orchestrator/docs còn route tới nhiều agent không tồn tại trong repository, như `unity-vfx-artist`, `unity-lighting-artist`, `unity-mobile-graphics-optimizer`, `unity-backend-engineer`, `unity-networking-optimizer` và `unity-server-developer`. Dreamy phải validate mọi route target và ưu tiên skill specialization thay vì thêm agent cho mỗi domain.

### Prompt khổng lồ chứa code mẫu

Các agent accessibility, tools, AI, data, security vượt 1.000 dòng. Điều này tăng context cost, dễ stale và khó biết code đã compile hay chưa. Dreamy chỉ lấy decision model/gotcha; code mẫu phải chuyển thành versioned fixture/reference và có test.

### Claim/version không có compatibility gate

The1 tự nhận Unity 6000.1 knowledge, trong khi README đồng thời nói Unity 2022.3+. Nhiều mẫu phụ thuộc package/API nhưng không pin version. Dreamy không được nhập các claim đó vào `Allowed Claims` cho đến khi package manifest, docs chính thức hoặc fixture xác minh.

### Generic performance budgets

Các con số như draw call, memory, FPS được dùng như preset chung. Dreamy chỉ nên dùng budget do project/device profile cung cấp hoặc ghi rõ là starting hypothesis cần đo.

### Code mẫu có thể khuyến khích pattern sai

Một số sample tạo singleton/global manager, dùng `async void`, `FindObjectOfType`, manual network sync hoặc anti-cheat client-side. Chúng có giá trị minh họa domain nhưng không được dùng làm Dreamy production template nếu chưa qua code review, package version và test.

## Review Dreamy theo từng component

### Skills

Giữ: progressive disclosure, compatibility-aware claims, ownership/lifecycle gates.  
Sửa: giảm 32 dòng boilerplate lặp, thêm evidence/source và adversarial cases.  
Thêm trước: project analysis, multiplayer, accessibility, security.  
Không làm: copy mỗi The1 agent thành một skill 1.000 dòng.

### Agents

Giữ: 14 mode-of-work nhỏ sau bổ sung, sandbox/output rõ.  
Sửa: README/architecture phải liệt kê đúng, skill-author contract phải khớp validator, release-validator không được chứa trạng thái stale.  
Thêm: chỉ project analyst ở P0; domain specialist mới cần benchmark chứng minh routing/quality tăng.

### Harness

Giữ: `pass/fail/degraded` và non-zero degraded exit.  
Sửa P0: `project-inspect` phải fail/warn đúng, emit capability profile; compile/test/build phải có real adapter.  
Thêm: render pipeline, asmdef graph, test inventory, enabled scenes, package drift và reference integrity evidence.

### Evals/benchmark

Giữ: forbidden claims và safety categories.  
Sửa P0: static catalog không được tự báo semantic pass.  
Thêm: so sánh baseline, The1, Dreamy current và Dreamy improved trên cùng model/tools/fixtures.

### Docs/catalogs

Sửa ngay: stale agent list, old eval counts và history/status ambiguity.  
Giữ: `toolkit.json` là canonical maturity source.  
Thêm: comparison này và file-level execution board trong completion plan.

## Thứ tự áp dụng

1. Hoàn thành project profile machine contract và harness output.
2. Sửa evidence honesty của eval/release gate.
3. Chạy comparison pilot để xác định domain nào thực sự thiếu.
4. Làm sâu skill hiện có trước khi thêm agent.
5. Thêm multiplayer/accessibility/security skills kèm fixture.
6. Chỉ thêm WebGL/XR/cloud/console khi project detection hoặc benchmark corpus cần.

Kế hoạch file-by-file nằm trong `docs/toolkit-completion-plan.md`; thiết kế thí nghiệm nằm trong `docs/toolkit-benchmark-plan.md`.
