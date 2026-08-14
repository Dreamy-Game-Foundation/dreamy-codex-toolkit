# Đánh giá Dreamy Codex Toolkit

Ngày chụp trạng thái: 2026-08-15  
Phiên bản canonical: `0.1.0-alpha.2`  
Nguồn sự thật: `toolkit.json`

## File này dùng để làm gì?

Đây là review hiện trạng của chính Dreamy toolkit: component nào đã hoạt động, component nào chỉ mới có shape, lỗi/stale contract nào tìm thấy và release claim nào chưa được phép. Dùng file này để biết **đang ở đâu**; dùng completion plan để biết **sửa theo thứ tự nào**; dùng benchmark plan để biết **có thực sự tốt hơn hay không**.

So sánh chi tiết với `C:\Users\trinh\the1-unity-claude-agents` nằm trong `docs/toolkit-comparison-the1.md`.

## Kết luận

Toolkit đã là một **alpha có thể cài đặt và dogfood**, nhưng chưa có đủ bằng chứng để gọi là production-ready hoặc kết luận rằng nó làm agent viết Unity tốt hơn. Điểm mạnh nằm ở cấu trúc repository, installer có vòng đời cơ bản, compatibility ledger và các safety invariant. Điểm yếu quyết định nằm ở verification: Unity harness chưa chạy Unity thật và eval runner chưa chạy model hay chấm output.

Đánh giá readiness hiện tại: **49/100**. Đây là điểm về mức độ được chứng minh, không phải điểm chất lượng nội dung tuyệt đối.

| Hạng mục | Trọng số | Điểm | Bằng chứng chính |
|---|---:|---:|---|
| Canonical state và kiến trúc | 15 | 12 | `toolkit.json`, 9 module, 9 preset, schema/catalog tách rõ |
| Installer và phân phối | 15 | 11 | install/update/uninstall/global lifecycle test xanh; npm pack smoke xanh |
| Chất lượng rules/skills | 15 | 8 | 49 rule, 80 skill; coverage rộng nhưng chiều sâu không đồng đều |
| Agents và routing | 10 | 6 | 14 agent TOML sau bổ sung project analyst; chưa có benchmark task outcome thật |
| Harness và evidence | 15 | 3 | git/static adapter chạy; compile/test/build Unity luôn `degraded` |
| Evals và benchmark | 15 | 2 | 77 case có cấu trúc; runner không gọi model và tự đánh dấu toàn bộ pass |
| Compatibility | 10 | 4 | 9 package gắn commit; Unity target chưa được test, còn package drift |
| Release/docs/operations | 5 | 3 | release check và pack smoke có; roadmap phân mảnh, chưa có canary evidence |
| **Tổng** | **100** | **49** | **Alpha dùng thử được, production chưa được chứng minh** |

## Phạm vi đã đọc và kiểm tra

Audit bao phủ canonical manifest, package metadata, 9 module, 9 preset, 7 schema, 49 rule, 80 skill cùng reference, 14 agent TOML, CLI, installer scripts, harness, 77 eval case, compatibility registries, unit test, release artifact và toàn bộ nhóm tài liệu/roadmap trong repository.

Snapshot định lượng:

- 80/80 skill có index; 49/49 rule có index; 14/14 agent có `agentCoverage` entry sau bổ sung project analysis.
- Trước bổ sung, 79 skill dài 83–103 dòng, median 90 dòng; có 30 reference file nhưng chỉ 14/79 skill có reference riêng.
- 32 câu boilerplate dài xuất hiện trong ít nhất một nửa số skill; 71/79 skill cũ dùng cùng phần lớn routing/workflow/verification text.
- 49 rule có median chỉ 6 dòng; 10 rule P0 được mở rộng, phần còn lại chủ yếu là invariant ngắn.
- 77 eval case không có executable fixture và không có expected output hoàn chỉnh; tất cả chỉ có prompt, expectation ngắn và forbidden claims.
- 3 file Node test chứa 9 test case thực thi. Không có Unity project fixture chạy bằng Editor.

## Những gì đang tốt

### Source of truth và ownership rõ

`toolkit.json` thực sự làm điểm vào cho version, maturity, modules, presets, rules, skills, harness và eval catalog. Compatibility records tách observed, drift và unsupported contract, đồng thời gắn Dreamy package claim với commit cụ thể. Đây là nền móng đúng để chống API hallucination.

### Installer đã vượt mức prototype thuần túy

Unit test chứng minh được các đường đi project/global, selective package skill install, update, state migration v1→v2 và uninstall giữ lại phần text người dùng trong `AGENTS.md`. `npm pack` smoke cũng cài được tarball sinh ra.

### Safety vocabulary nhất quán

Các boundary quan trọng đã xuất hiện xuyên suốt rules, skills và agents: Runtime/Editor, DataConfig/Datasave/runtime state, package/project, ServiceLocator boundary, asset lifetime, serialization/GUID và degraded evidence.

### Breadth đủ để làm corpus dogfood

Coverage gồm Dreamy packages, Unity fundamentals/rendering, gameplay, systems, mobile, production và third-party. Catalog đủ rộng để đo routing và tìm ra skill nào thật sự hữu ích thay vì tiếp tục mở rộng theo cảm giác.

## Findings cần xử lý

### P0. Eval report đang biểu diễn sai mức bằng chứng

`src/cli.js` chỉ kiểm tra mỗi case có các field bắt buộc, sau đó tạo report với `passed = cases.length` và mọi score bằng `1`. `release/eval-report.json` vì vậy chỉ chứng minh catalog parse được, không chứng minh model route đúng, quyết định đúng hay tạo code đúng.

Hậu quả:

- `release:check` chấp nhận report tĩnh như quality gate.
- Con số 74/74 và 100% có thể làm người đọc hiểu nhầm đây là semantic benchmark.
- Không thể so sánh no-toolkit với full-toolkit hoặc phát hiện regression do skill thay đổi.

### P0. Harness chưa quan sát được Unity outcome

`compile`, `console`, EditMode, PlayMode, package check, Addressables và mobile build đều trả `degraded`. `project-inspect` vẫn trả `pass` ngay cả khi manifest/lock/version bị thiếu, chỉ ghi thiếu trong diagnostics. Static `asmdef` adapter dùng regex trên text/tên file, chưa phân tích graph thật.

### P0. Compatibility chưa có tested Unity matrix

`compatibility/unity.json` có `tested: []`; Unity 6000.4 LTS mới là intended contract. Ba Dreamy package record đang drift và global drift vẫn tồn tại. Vì vậy “hỗ trợ Unity 6” chỉ nên được hiểu là target dự kiến/manifest đã quan sát, không phải tested support.

### P1. Breadth lớn hơn chiều sâu

71 skill dùng chung phần lớn body; domain-specific content thường chỉ nằm ở một dòng domain model, vài decision bullet và hai anti-pattern. Điều này tạo routing vocabulary tốt nhưng chưa đủ để xử lý các case khó như migration, race/lifecycle, malformed serialization, multi-scene ownership, store transaction recovery hay performance investigation.

Ưu tiên nên là làm sâu các skill xuất hiện nhiều trong benchmark failure, không tăng số skill trước khi có dữ liệu.

### P1. Validation thiên về shape, chưa kiểm chứng semantics

Schema files hiện chỉ được kiểm tra có `$schema` và `title`; artifact không được validate đầy đủ bằng JSON Schema. Skill validator kiểm heading, độ dài và pattern; acceptance validator chỉ yêu cầu 10 rule chi tiết. Các check này hữu ích để chống stub nhưng không đo tính đúng, không phát hiện mâu thuẫn giữa skill/rule/catalog và không kiểm link Markdown tổng quát.

### P1. Release gate chưa phản ánh production readiness

`release:check` xanh khi đủ số eval case và có report file, ngay cả khi runner là static và Unity chưa được test. Pack smoke chứng minh package cài được, chưa chứng minh clean-machine CLI UX, wrapper đa nền tảng, rollback khi gián đoạn hoặc update conflict.

### P2. Tài liệu kế hoạch bị phân mảnh

Ba file roadmap/spec ở root cộng với master plan chứa nhiều nghìn dòng và một phần phản ánh trạng thái cũ. Chúng hữu ích như history/backlog nhưng khó dùng làm execution board. Trạng thái thực thi phải tiếp tục nằm trong `toolkit.json` và artifact machine-readable.

## Contract drift cụ thể đã tìm thấy

- `agents/codex/dreamy-release-validator.toml` từng nói `update` chưa implement dù CLI và lifecycle test đã có; đã sửa thành gate theo scope.
- `agents/codex/dreamy-skill-author.toml` mô tả heading khác với `scripts/validate-skills.mjs`; đã đồng bộ.
- README và `docs/architecture.md` chỉ liệt kê 5 agent trong khi catalog thực tế có 14 sau bổ sung; nằm trong backlog docs ngay của completion plan.
- `docs/agent-orchestration.md` chưa có project snapshot/handoff/evidence contract; cần mở rộng theo comparison review.
- `detectProject()` chỉ đọc manifest/lock và Dreamy packages; chưa emit capability profile mà agent/skill mới yêu cầu.

## Bổ sung thực tế từ review này

- Thêm skill `unity-project-analysis` và capability-profile reference.
- Thêm read-only agent `dreamy_project_analyst`.
- Thêm ba project-analysis eval case và catalog entries.
- Sửa stale release-validator và skill-author contract.

Các bổ sung trên là vertical slice đầu tiên. Harness/CLI profile, semantic runner và domain skills tiếp theo vẫn phải thực hiện theo completion plan, không được coi là đã hoàn thiện.

## Cập nhật triển khai sau assessment

Các finding P0 có thể xử lý thuần repository đã được triển khai:

- eval catalog dùng JSON Schema thật và không còn sinh pass rate/score giả;
- release check khóa report theo SHA-256 + case count và công khai `productionReadiness: blocked` khi semantic benchmark/Unity matrix chưa có;
- project profile machine-readable đọc Unity revision, manifest/lock, render pipeline evidence, asmdef graph, build scenes, capabilities và source hashes;
- harness có local Unity batchmode adapter, artifact checksum và negative outcome đúng; khi thiếu Editor vẫn `degraded`;
- benchmark command adapter, K0/K1/K2/K3 manifest, isolated trial artifacts và deterministic pilot grader đã có test.

Điểm 49/100 ở đầu tài liệu vẫn là snapshot trước triển khai và chưa được nâng, vì chưa có Unity 6000.4 run, corpus 24 task hoặc kết quả so sánh K0–K3. Skill/domain expansion tiếp tục bị chặn có chủ đích cho tới khi benchmark failure chỉ ra cohort cần làm sâu.

## Quyết định maturity

| Nhãn | Quyết định | Điều kiện |
|---|---|---|
| Cài thử nội bộ | Có | Dùng project tạm, giữ backup, đọc degraded evidence |
| Dogfood trên project thật | Có điều kiện | Task không phá hủy; reviewer kiểm diff; compile/test Unity chạy ngoài harness nếu cần |
| Canary cho team | Chưa | Cần semantic benchmark và một Unity vertical slice xanh |
| Production default | Không | Cần compatibility matrix, real harness, safety benchmark, rollback/canary evidence |
| Công bố “toolkit cải thiện chất lượng” | Không | Chỉ sau benchmark đối chứng theo `docs/toolkit-benchmark-plan.md` |

## Tài liệu điều hành

- `docs/toolkit-completion-plan.md`: thứ tự hoàn thiện và exit gate.
- `docs/toolkit-benchmark-plan.md`: thiết kế thí nghiệm để đo chất lượng thực.
- `docs/toolkit-comparison-the1.md`: ma trận học hỏi và domain gap so với The1.
- `docs/dogfood-protocol.md`: quy trình thu evidence từ task thật.

Các mega-plan cũ nên được giữ làm lịch sử/nguồn yêu cầu cho đến khi từng item được map sang execution issue. Không dùng checkbox cũ làm bằng chứng trạng thái hiện tại.
