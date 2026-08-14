# Kế hoạch hoàn thiện Dreamy Codex Toolkit

Tài liệu này biến các master plan/backlog lớn thành critical path có thể thực thi. `toolkit.json` vẫn là nguồn canonical cho version và maturity; tài liệu này mô tả thứ tự, owner và exit gate.

## File này dùng để làm gì?

Đây là implementation plan. Mỗi work package phải chỉ ra file sẽ thêm/sửa, dependency, test và evidence. Không dùng file này để tự tuyên bố maturity; sau khi work package pass mới cập nhật `toolkit.json`.

Đọc cùng:

- `docs/toolkit-assessment-2026-08-15.md`: findings hiện tại.
- `docs/toolkit-comparison-the1.md`: điểm học và điểm không sao chép từ The1.
- `docs/toolkit-benchmark-plan.md`: cách chứng minh improvement.

## North star

Toolkit chỉ được xem là tốt khi cùng một agent/model, trên cùng task corpus, tạo ra artifact đúng và an toàn hơn baseline một cách lặp lại được. Số lượng skill, dòng tài liệu hoặc catalog case không phải KPI.

## Trạng thái bổ sung sau review

| Work package | Trạng thái | Files |
|---|---|---|
| Project-analysis skill | Đã viết; canonical validation xanh | `skills/unity-project-analysis/**`, `skills/index.json`, `modules/foundation/module.json` |
| Project-analyst agent | Đã viết; acceptance validation xanh | `agents/codex/dreamy-project-analyst.toml`, `evals/catalog.json` |
| Agent contract drift | Đã sửa; acceptance validation xanh | `dreamy-release-validator.toml`, `dreamy-skill-author.toml` |
| Machine capability profile | Chưa làm | `src/cli.js`, `schemas/project-profile.schema.json`, `harness/dreamy-harness` |
| Semantic benchmark | Chưa làm | `benchmarks/**`, eval/report schemas, runner và graders |
| Real Unity harness | Chưa làm | Unity fixture + harness adapters |

## File-level work packages

### WP-A — Project profile từ máy

Mục tiêu: biến project-analysis từ prompt contract thành dữ liệu có thể kiểm tra.

Files:

- `schemas/project-profile.schema.json`: thêm repository snapshot, exact Unity revision, declared/resolved packages, render pipeline evidence, asmdefs, platform/build scenes, capabilities, drift và unknowns.
- `src/cli.js`: tách detector thành hàm testable; đọc ProjectVersion, manifest/lock, ProjectSettings và asmdefs mà không mutate.
- `harness/dreamy-harness`: `project-inspect` validate project root và emit schema-valid profile; missing required Unity files phải `fail` hoặc `degraded`, không `pass`.
- `tests/fixtures/unity/project-profile-*`: built-in, URP, manifest/lock drift, Runtime→Editor và incomplete project fixtures.
- `tests/unit/project-analysis.test.mjs`: golden output + negative tests.

Acceptance:

```bash
node src/cli.js detect --target tests/fixtures/unity/project-profile-urp --json
node harness/dreamy-harness project-inspect tests/fixtures/unity/project-profile-urp
npm test
```

### WP-B — Agent orchestration contract

Files:

- `docs/agent-orchestration.md`: preflight analyst, routing boundaries, handoff schema, integration review và stop conditions.
- `docs/architecture.md` và README: liệt kê đủ 14 agent, không chỉ 5 agent cũ.
- `scripts/validate-acceptance.mjs`: agent route/handoff references phải trỏ đến agent có thật.
- `evals/catalog.json`: positive/conflict/no-orchestrator routing cases.

Acceptance: xóa/tạo một route target giả trong fixture phải làm acceptance test fail.

### WP-C — Evidence honesty

Files:

- `src/cli.js`: đổi static eval thành `catalog-validation`, bỏ semantic `passed=all`.
- `schemas/eval-case.schema.json`: v2 task/fixture/assertion/grader contract.
- `schemas/evidence.schema.json`: provenance, artifact checksum, treatment/run id.
- `scripts/release-check.mjs`: reject static report khi release claim yêu cầu semantic evidence.
- `tests/unit/eval-runner.test.mjs`: false-pass, stale report, missing artifact và degraded aggregation.

Acceptance: catalog 100% valid nhưng không có model output phải báo `validated`, không báo semantic `pass`.

### WP-D — Real Unity harness

Files:

- `harness/adapters/` hoặc một module tương đương: compile, Console, EditMode, PlayMode, package validate, build.
- `tests/fixtures/unity/vertical-slice/`: project Unity 6000.4 pin revision/package lock.
- `schemas/evidence.schema.json`: Unity process exit, result file, completion marker và artifact hash.
- `docs/harness.md`: configuration, timeout, degraded reason, cleanup.

Acceptance: deliberately broken compile/test/serialized reference fixture phải fail; clean fixture phải pass trên cùng Editor revision.

### WP-E — Skill depth cohort 1

Files ưu tiên:

- `skills/dreamy/dreamy-core/**`
- `skills/dreamy/dreamy-dataconfig/**`
- `skills/dreamy/dreamy-datasave/**`
- `skills/dreamy/dreamy-assets/**`
- `skills/dreamy/dreamy-ui/**`
- `skills/unity-serialization/**`
- `skills/unity-scene-prefab/**`
- `skills/unity-async/**`
- `skills/unity-testing/**`

Cho mỗi skill: thêm positive, negative, conflict case; đưa phần chung sang rule; thêm reference nguồn/fixture; chạy A/B trước-sau. Không merge nếu chỉ tăng số dòng.

### WP-F — Domain gaps học từ The1

Thêm theo thứ tự và chỉ khi package/project detection kích hoạt:

1. `skills/unity-multiplayer/` + network authority/lifecycle reference.
2. `skills/unity-accessibility/` + UI/input/audio/localization checklist.
3. `skills/unity-game-security/` + threat model, trust boundary, privacy; không copy client anti-cheat code.
4. `skills/platform/webgl-build-release/`.
5. `skills/unity-xr/` với AR/VR references.
6. `skills/game-backend-integration/` và provider-specific compatibility.
7. Console skill chỉ chứa public/non-NDA readiness guidance.

Mỗi skill mới cần index, module/preset routing, at least three eval cases, fixture và source/compatibility boundary. Không thêm agent tương ứng mặc định.

## Nguyên tắc thực thi

1. Sửa evidence honesty trước khi thêm capability.
2. Một claim “pass” phải gắn với output/model run hoặc artifact thực; catalog validation phải mang nhãn `structure-only`.
3. Mỗi phase có machine artifact, test và rollback path.
4. Chỉ làm sâu skill khi benchmark, dogfood hoặc incident chỉ ra failure mode.
5. Không đánh dấu Unity/package version là supported khi chưa có executable fixture tại commit tương ứng.

## Critical path

```text
Evidence honesty
    -> Semantic benchmark runner
        -> Real Unity vertical slice
            -> Compatibility matrix
                -> Canary projects
                    -> Production gate
```

Installer hardening và skill deepening có thể chạy sau khi benchmark contract được khóa, nhưng không được chặn ba gate đầu bằng việc mở rộng catalog.

## Phase 0 — Đóng baseline và ownership

Mục tiêu: mọi người cùng dùng một snapshot và một định nghĩa pass.

Deliverables:

- Gắn assessment, completion plan và benchmark plan từ README.
- Ghi rõ root mega-plans là history/spec source, không phải status board.
- Tạo benchmark run manifest gồm toolkit commit, model/version, reasoning setting, Unity version, fixture commit, seed, OS và timestamps.
- Chọn owner: Toolkit Lead, Benchmark Owner, Unity Harness Owner, Compatibility Owner và Release Owner.

Exit gate:

- Không còn tài liệu nào gọi static all-cases eval là model pass.
- Mỗi work item P0 có owner, artifact path và acceptance command.

## Phase 1 — Evidence honesty

Ưu tiên: P0  
Owner gợi ý: `dreamy_release_validator` + `dreamy_tester`

Deliverables:

- Đổi runner hiện tại thành `catalog-validation`; report dùng `validatedCases`, không dùng `passed` hay semantic score.
- Semantic run thiếu model output phải là `not-run` hoặc `degraded`, không được là `ok`.
- `release:check` từ chối semantic quality claim khi chỉ có static report.
- Validate artifact thật bằng JSON Schema, bao gồm enum status và required evidence fields.
- `project-inspect` fail/warn theo contract khi bắt buộc manifest/lock/version bị thiếu.

Tests bắt buộc:

- Static catalog không thể sinh semantic pass rate.
- Missing/corrupt/stale report làm release gate fail.
- Degraded Unity operation không thể được aggregate thành pass.
- Schema-invalid evidence bị từ chối.

Exit gate:

- Mọi con số pass rate trong `release/` truy được về từng case output hoặc artifact.
- Negative tests chứng minh false pass bị chặn.

## Phase 2 — Benchmark runner tối thiểu

Ưu tiên: P0  
Owner gợi ý: Benchmark Owner + `dreamy_tester`

Deliverables:

- Case schema v2 có task type, fixture, setup command, allowed tools, timeout, expected artifact, deterministic grader, safety assertions và cleanup.
- Runner tạo worktree/temp copy riêng cho từng trial, lưu prompt/output/tool trace/diff/test result và không chứa secret.
- Hai treatment đầu tiên: `baseline` (không toolkit) và `full-toolkit`.
- Resume theo run id; không ghi đè trial cũ; report phân biệt infra failure với agent failure.
- Pilot corpus tối thiểu 24 task theo `docs/toolkit-benchmark-plan.md`.

Exit gate:

- Có thể chạy lại cùng manifest và nhận cùng grading outcome cho deterministic fixtures.
- Mỗi failure mở được prompt, diff, command output và rubric result.
- Human reviewer không biết treatment khi chấm phần subjective.

## Phase 3 — Unity vertical slice thật

Ưu tiên: P0  
Owner gợi ý: `dreamy_unity_editor` + Unity Harness Owner

Fixture tối thiểu:

- Một Unity 6000.4 LTS project nhỏ, pin package/lock và commit.
- Runtime + Editor asmdef, EditMode + PlayMode tests.
- Scene/prefab có serialized reference và `.meta` fixture.
- Một Dreamy package consumer path đã xác minh.

Harness operations cần chạy thật:

- project inspect, refresh/compile, console capture;
- EditMode, PlayMode;
- asmdef Runtime→Editor graph;
- scene/prefab missing-reference check;
- package validation;
- git diff/status evidence.

Exit gate:

- Một task đi trọn detect → install → agent change → compile → tests → evidence → uninstall.
- Completion marker chỉ xuất hiện sau Unity process exit 0 và result XML/JSON parse thành công.
- Deliberately broken fixture tạo fail, không tạo degraded/pass.

## Phase 4 — Installer và release hardening

Ưu tiên: P1  
Owner gợi ý: `dreamy_package_maintainer` + Release Owner

Deliverables:

- Test path traversal, symlink/junction, interrupted write, stale checksum, modified managed file, partial install và rollback.
- Clean-machine matrix cho npm/npx/PowerShell/bash trên OS được hỗ trợ.
- Pack smoke kiểm command thực sau install, không chỉ cài package.
- Release artifact chứa version, checksum, compatibility snapshot, benchmark summary và rollback instructions.

Exit gate:

- User-owned bytes giữ nguyên qua install/update/uninstall và failure injection.
- Không có broad delete ngoài resolved target.
- Canary rollback được diễn tập từ artifact phát hành.

## Phase 5 — Compatibility truth

Ưu tiên: P1  
Owner gợi ý: Compatibility Owner + `dreamy_package_maintainer`

Deliverables:

- Tách `observed`, `tested`, `supported` thành field/matrix rõ ràng.
- Resolve hoặc explicit-unsupported các drift của UI, DataConfig, Editor Tools và global version/tag/lock.
- Consumer fixture pin Dreamy verified commit; min/target version test nếu tuyên bố range.
- Freshness check cảnh báo khi source ledger commit hoặc upstream package thay đổi.

Exit gate:

- `compatibility/unity.json.tested` không rỗng và mọi entry trỏ đến run artifact.
- Không có unsupported API claim trong semantic benchmark.
- Release không quảng cáo version ngoài tested matrix.

## Phase 6 — Làm sâu knowledge theo failure data

Ưu tiên: P1  
Owner gợi ý: `dreamy_skill_author` + domain owner

Quy trình cho mỗi skill:

1. Chọn skill từ top benchmark/dogfood failure, không chọn theo độ nổi tiếng.
2. Viết 3–5 case adversarial trước.
3. Bổ sung decision tree, concrete inspection, lifecycle/ownership failure và reference nguồn.
4. Chạy lại baseline/full treatment.
5. Giữ thay đổi chỉ khi quality tăng và không làm routing/context cost xấu đi đáng kể.

Nhóm ưu tiên ban đầu:

- `dreamy-core`, `dreamy-dataconfig`, `dreamy-datasave`, `dreamy-assets`, `dreamy-ui`;
- `unity-serialization`, `unity-scene-prefab`, `unity-async`, `unity-testing`;
- `system-iap`, `system-shop`, `gameplay-loop`, `combat`;
- Android/iOS release và Addressables lifetime.

Exit gate:

- Skill có ít nhất một positive, negative và conflict case.
- Domain improvement đạt gate benchmark; boilerplate giảm hoặc được chuyển sang shared rule thay vì lặp vô nghĩa.

## Phase 7 — Canary và production gate

Ưu tiên: P1/P2  
Owner gợi ý: Release Owner + `dreamy_release_validator`

Canary:

- Hai project đại diện: một game project và một UPM/package consumer.
- Chạy task thật trong 2–4 tuần, ghi failure taxonomy nhưng không thu source/secret ngoài phạm vi cho phép.
- Mỗi incident map về runner, skill/rule, harness, compatibility hoặc installer.

Production exit gate:

- Benchmark release gate trong `docs/toolkit-benchmark-plan.md` đạt.
- P0 safety case pass 100%; false-success rate 0%; unsupported Dreamy API claim 0.
- Tested Unity/Dreamy matrix và real harness xanh.
- Canary không có data-loss/serialization/GUID incident chưa xử lý.
- Rollback drill và release artifact hoàn chỉnh.

## Backlog không nằm trên critical path

- Thêm genre-specific skills.
- Thêm agent mới khi role hiện có chưa được benchmark.
- Mở rộng vendor integration chưa xuất hiện trong consumer project.
- Dashboard đẹp, telemetry server hoặc model-as-judge phức tạp trước deterministic runner.
- Tối ưu token/context khi chưa có baseline đo quality/cost.

## Execution board tối thiểu

| ID | Deliverable | Dependency | Evidence |
|---|---|---|---|
| EH-01 | Static eval không còn semantic pass | Phase 0 | negative unit tests + report schema |
| EH-02 | Release gate phân biệt catalog/semantic | EH-01 | failing stale/static fixtures |
| BM-01 | Case schema v2 + deterministic grader | EH-01 | schema tests + golden case |
| BM-02 | Baseline/full runner | BM-01 | 24-task pilot artifact |
| UH-01 | Unity 6000.4 fixture | EH-02 | pinned fixture manifest |
| UH-02 | compile/console/Edit/Play adapters | UH-01 | real Unity result artifact |
| UH-03 | serialization/asmdef negative fixtures | UH-02 | deliberate-failure evidence |
| CP-01 | Tested compatibility entry | UH-03 | matrix row linked to run |
| KN-01 | First failure-driven skill cohort | BM-02, UH-03 | before/after benchmark |
| RC-01 | Two-project canary | CP-01, KN-01 | dogfood ledger + rollback drill |

Mỗi ID chỉ được đóng khi evidence file tồn tại và command tái tạo được kết quả. Checklist trong tài liệu không thay thế issue tracker hoặc canonical maturity state.
