# Dreamy Codex Toolkit — Master Architecture & Implementation Plan

> Trạng thái: Architecture Source of Truth đề xuất  
> Ngày chốt nghiên cứu: 2026-08-13 (Asia/Bangkok)  
> Repository đích: `Dreamy-Game-Foundation/dreamy-codex-toolkit`  
> Phạm vi: kiến trúc và kế hoạch triển khai; **chưa triển khai toolkit**.

## Quy ước bằng chứng

| Nhãn | Ý nghĩa |
|---|---|
| **[VC] Verified-current** | Đã đối chiếu trực tiếp với file/code trong clone nghiên cứu tại commit ghi ở Section B. |
| **[REC] Recommended** | Quyết định kiến trúc cho toolkit tương lai; chưa phải API hay hành vi hiện hữu. |
| **[UNS] Unsupported** | Không tìm thấy bằng chứng trong source hiện tại; không được để agent giả định hoặc gọi như API có thật. |
| **[DRIFT] Discrepancy** | README, manifest, tag, code hoặc template không đồng nhất; phải cảnh báo/khóa bằng gate. |

Các URL đặt gần nhận định là nguồn upstream để truy vết; kết luận Dreamy-specific ưu tiên code/manifest tại commit đã clone, không ưu tiên README khi có xung đột.

---

## SECTION A — Executive Summary

Dreamy Codex Toolkit là lớp hướng dẫn, định tuyến và kiểm chứng dùng chung để Codex làm việc an toàn trên Unity 6/mobile và hệ sinh thái `com.dreamy.*`. Toolkit không phải runtime framework, không thay thế Unity packages và không áp đặt kiến trúc mới lên game. Nó hợp thành bảy tầng:

```text
Industry engineering invariants
  -> C# invariants
  -> Unity invariants
  -> Game/mobile production knowledge
  -> Dreamy architecture overrides
  -> Project profile + local instructions
  -> Execute -> prove with harness
```

Vấn đề nó giải quyết: tri thức hiện phân tán giữa package source, README, template và thói quen studio; Codex dễ đặt data sai owner, đảo dependency, phá serialized reference, bypass loader, hoặc báo “done” khi chưa compile/test. Toolkit biến những quyết định đó thành rule bắt buộc, skill mở theo nhu cầu, role thực thi, và bằng chứng máy đọc được.

Khác biệt chính:

- So với [Oh My Game Kit](https://github.com/tranvietanh0/oh-my-game-kit): học trực tiếp kiến trúc module/preset, skill ngắn + reference, managed block, state/doctor/validator và cài global/project; nhưng Dreamy thêm package compatibility matrix, manifest drift gates, project profile, Dreamy ownership evals và Unity Editor harness có evidence contract.
- So với [Everything Claude Unity](https://github.com/XeldarAlz/everything-claude-unity): mượn độ phủ Unity, serialization/scene guards và verify-first; không sao chép slash-command/hook lifecycle đặc thù Claude, không mặc định hàng chục agent/hook vào Codex context.
- So với [Unity Claude Skills](https://github.com/Nice-Wolf-Studio/unity-claude-skills): mượn taxonomy domain và progressive disclosure; bổ sung production workflows, mobile/store, Dreamy integration, safety, installer, eval và version compatibility.

Ba nguyên tắc quyết định:

1. **Industry first, Dreamy override only where verified.** ServiceLocator là lựa chọn hiện tại, không phải chân lý phổ quát.
2. **Context is selected, not dumped.** Global chỉ chứa core workflow/safety; Unity, Dreamy và package skills là project-local và detector-driven.
3. **No evidence, no done.** Mọi mutation phải kết thúc bằng evidence phù hợp: compile/console/test/build/validator/diff.

### P0 stop-the-line trước khi tin tưởng automation

**[VC/DRIFT]** Bản clone hiện cho thấy: graph `ui -> assets -> core`, `ui -> core`, `feedback -> core`; các package datasave/dataconfig/audio/localization/editor-tools không khai báo dependency Dreamy khác. Đồng thời DataConfig dùng UniTask trong code/README nhưng manifest thiếu UniTask; UI dùng TMP tùy chọn trong code nhưng manifest thiếu TMP; template đang pin Core `1.1.1` trong khi Assets/UI/Feedback yêu cầu `1.1.2`; tag Git, `package.json` và ví dụ README có chỗ lệch; chưa có CI thống nhất trên 9 repo; Editor Tools mới là UI Editor, chưa có headless/dry-run/test contract. Đây là **P0 compatibility/harness gates**, không được che bằng skill prompt.

---

## SECTION B — Repository Research

### B1. Research baseline

| Repository | Commit inspected | What it does well | Borrow | Do not copy | Codex adaptation |
|---|---|---|---|---|---|
| [Everything Claude Unity](https://github.com/XeldarAlz/everything-claude-unity) | `bb28ccb`, 2026-04-24, v1.5.0 | Rules tách architecture/C#/performance/serialization; 20 agents, 30 commands; hooks chặn `.meta`, scene, ProjectSettings và ép validation; templates/tests/benchmarks rõ | Safety intent, Unity domain breadth, compile-console-test loop, benchmark mindset | Claude settings/hook matchers, slash commands, auto-learning/session machinery, agent proliferation | Chuyển invariant sang rules + harness gates; entry point thành skills/CLI; dùng Codex approval/sandbox và AGENTS managed block |
| [Unity Claude Skills](https://github.com/Nice-Wolf-Studio/unity-claude-skills) | `fefd114`, 2026-07-29 | 32 skill domain, `SKILL.md` route rõ, reference một tầng; phủ foundations, lifecycle, async, animation, UI, physics, graphics, editor, data, testing | Taxonomy, concise route description, references theo task | Không coi code snippet là API guaranteed; không load mọi skill; không kéo XR/ECS/multiplayer vào default | Chuẩn hóa metadata tối thiểu Codex, compatibility tags trong manifest toolkit, preset/detector chọn skill |
| [Oh My Game Kit](https://github.com/tranvietanh0/oh-my-game-kit) | `ec2cf78`, 2026-06-01; `kit.json` 0.2.3 | Codex-native; module dependency resolution; global/project presets; atomic state; managed blocks; validation schema; namespace; CI/smoke tests | Gần như trực tiếp: module manifest, preset resolver, state hashes, non-destructive install/update/uninstall, doctor, concise skills | Không mang Cocos/DOTS/finance/maintainer vào Dreamy mặc định; không đồng nhất module count với chất lượng | Prefix `dreamy-`; thêm package detector, profile, evidence schema, compatibility policy, dry-run và migration |
| [Dreamy template project](https://github.com/Dreamy-Game-Foundation/dreamy-template-project/tree/0af776c9925ba3c2a9b84fdad7360277605606d5) | `0af776c9925ba3c2a9b84fdad7360277605606d5`, inspect trực tiếp manifest/lock, `_Project`, scenes, bootstrap code, asmdef, Addressables và ProjectSettings | Composition root `BootstrapScene`/`GameInstaller`/`GameInit`/`SceneLoader`→`MainScene`; `Assets/_Project` owns game glue | Roles/startup order, package integration and validator fixtures | Không copy demo code hoặc coi current template quirks là universal API | Detector records exact commit/package graph; skill inspect source/version before mutation |

**Giới hạn nghiên cứu:** template đã được inspect ở commit immutable trên, nhưng chưa chạy trong Unity Editor nên compile/build/PlayMode là **chưa được thực thi**, không phải source chưa xác minh. Method/signature chỉ được skill sử dụng sau khi detector xác nhận consumer vẫn ở compatible commit/range; project mới hơn phải re-inspect.

Snapshot reproducibility: source ledger ghi full SHA, UTC retrieval time, remote URL, `git ls-tree -r --name-only <sha>`, SHA-256 của các file evidence và extraction command/version. Các SHA package đầy đủ dùng làm baseline: Core `6e2d50d0ee6243c472fccd4cce08a7db9cb154b4`, Assets `72d8386068d7f6875a17057f4eb0b24b0ff8c81b`, UI `dbfec0cf95733c4b8193676b45b5b15c53eba2c4`, DataConfig `6d199250c544ff7a42414c44fb560217b734af8b`, Datasave `9fa6bd21812004b0b2d64a6119ee0514399366b8`, Editor Tools `e00ca5cfdf8886fa1c84dd98d76ee8e983d4e7dd`, Audio `da1e07c9170a556dc3ccf2e73e412fb02d592200`, Localization `4a71c6fa3f4ee56c699368103e7920c9476816e0`, Feedback `a39f7c45e99c445be5b9baba6052ed75b4c6c093`.

### B2. Lessons from reference implementation details

- **[VC]** Everything Claude Unity dùng pre/post hooks để block scene/meta/ProjectSettings và cảnh báo serialization. Ý định đúng; cơ chế phải map sang Codex rules, approvals và wrapper harness, vì Claude hook schema không phải Codex API.
- **[VC]** Oh My Game Kit `src/cli.js` ghi JSON atomic, kiểm path containment, resolve dependency cycle, hash managed files và giữ nội dung ngoài sentinel. Đây là baseline installer đáng học trực tiếp.
- **[VC]** Oh My Game Kit giới hạn skill frontmatter ở `name` và `description`; Dreamy giữ frontmatter Codex-compatible tối thiểu, còn metadata mở rộng đặt trong `toolkit.json`/module manifests để tránh bịa schema Codex.
- **[VC]** Unity Claude Skills chứng minh phân nhóm domain tốt hơn một “unity-all” khổng lồ, nhưng nhiều nội dung tự nhận theo Unity 6.3; mỗi reference Dreamy phải có `verifiedAgainst` và link docs chính thức, không tái xuất bản claim chưa test.

### B3. Dreamy repository inventory

| Package | Version manifest | Trách nhiệm/API quan sát | Dreamy deps thật | Tests/state | Status |
|---|---:|---|---|---|---|
| [`com.dreamy.core`](https://github.com/Dreamy-Game-Foundation/com.dreamy.core) | 1.1.2 | `ServiceLocator`, `MyEventBus<T>`, `StateMachine`, singleton variants, `AppLifecycle`, `AppTickService`, `DreamyLog`, extensions | none | Runtime tests | **[VC]** foundation nhỏ, dependency-free |
| [`com.dreamy.assets`](https://github.com/Dreamy-Game-Foundation/com.dreamy.assets) | 0.1.1 | `AssetLoader`, Addressables + Resources, typed cache, shared in-flight request, explicit unload | core 1.1.2 | sample; no test assembly observed | **[VC]** lifecycle owned by caller |
| [`com.dreamy.ui`](https://github.com/Dreamy-Game-Foundation/com.dreamy.ui) | 0.1.1 | `UIPanel`, `PanelManager`, `UILayerRoot`, Screen/Popup/Overlay, cache, transition, tabs/tween/safe-area | assets 0.1.1, core 1.1.2 | sample; no tests observed | **[VC/DRIFT]** TMP used conditionally but absent manifest |
| [`com.dreamy.feedback`](https://github.com/Dreamy-Game-Foundation/com.dreamy.feedback) | 0.1.0 | independent VFX/haptic/floating text/icon fly/screen/camera/sequence services; optional registry helper | core 1.1.2 | validators/sample; no tests observed | **[VC]** UniTask; no DOTween/Addressables |
| [`com.dreamy.dataconfig`](https://github.com/Dreamy-Game-Foundation/com.dreamy.dataconfig) | 0.2.0 | typed read-only JSON tables; local/remote/composite sources; editor validate | none declared | prior tests removed; editor validation | **[VC/DRIFT]** source/README uses UniTask, manifest does not declare it |
| [`com.dreamy.datasave`](https://github.com/Dreamy-Game-Foundation/com.dreamy.datasave) | 0.2.0 | versioned envelope, atomic write, backup restore, migrations/codecs | none | Runtime tests | **[VC]** AES+HMAC available; XOR only obfuscation |
| [`com.dreamy.audio`](https://github.com/Dreamy-Game-Foundation/com.dreamy.audio) | 0.1.0 | typed `AudioKey`, catalog/library/profile, mixer bus, pool, bootstrap/service, triggers | none | EditMode + PlayMode tests | **[VC]** standalone runtime |
| [`com.dreamy.localization`](https://github.com/Dreamy-Game-Foundation/com.dreamy.localization) | 0.1.0 | CSV-first tooling over Unity Localization, typed key, locale store, TMP/UGUI bindings | none | EditMode plus empty PlayMode asmdef observed | **[VC]** foundation/incomplete roadmap |
| [`com.dreamy.editor-tools`](https://github.com/Dreamy-Game-Foundation/com.dreamy.editor-tools) | 0.2.1 | scene/build/package/data windows, hotkeys, script templates | none | no tests observed | **[VC/DRIFT]** Editor GUI only; no supported batch API/dry-run |

**[VC/DRIFT] Version discrepancies:** Core README examples still show `v1.1.0`; Assets README shows Core `v2.0.0` và Assets `v0.1.0` trong khi manifests là 1.1.2/0.1.1; template report pins Core 1.1.1; tags và package versions chưa được cross-repo gate. Code/manifest hiện tại thắng README, nhưng installer không được tự “sửa” dependency; doctor phải nêu exact remediation.

---

## SECTION C — Dreamy Architecture Analysis

### C1. Package dependency map (manifest-derived)

```text
com.dreamy.ui ───────> com.dreamy.assets ───────> com.dreamy.core
       └────────────────────────────────────────> com.dreamy.core
com.dreamy.feedback ────────────────────────────> com.dreamy.core

com.dreamy.dataconfig   (independent Dreamy package)
com.dreamy.datasave     (independent Dreamy package)
com.dreamy.audio        (independent Dreamy package)
com.dreamy.localization (independent Dreamy package)
com.dreamy.editor-tools (Editor-only, independent)
```

“Independent” chỉ có nghĩa không khai báo dependency `com.dreamy.*`, không có nghĩa không phụ thuộc Unity/third-party. Validator dùng `package.json` + asmdef làm source, không suy dependency từ README.

### C2. Ownership boundaries

| Concern | Owner | Allowed | Rejected |
|---|---|---|---|
| Reusable primitive cần nhiều package/game | package hẹp; Core chỉ nếu truly foundational | interface + tested primitive | game-specific shop/ads/connectivity trong Core |
| Game-specific feature/composition | `Assets/_Project` | installers, concrete panels, content/config, SDK wiring | đẩy feature game vào package chung để “reuse someday” |
| Composition root | `BootstrapScene` + `GameInstaller` **[VC at template commit]** | instantiate/register Datasave→Pool→DataConfig, choose adapters, own startup order | leaf object tự pull toàn bộ globals |
| Startup/scene flow | `GameInit`/`SceneLoader`/`MainScene` **[VC at template commit]** | wait installer state; load MainScene with explicit progress/failure path | assume same signatures on incompatible consumer version |
| Static design/balance | DataConfig | level/enemy/shop price/reward tables, read-only runtime | coins/inventory/progress |
| Persistent player state | Datasave | coins, inventory, progress, settings, tutorial state | static balance tables |
| Ephemeral runtime state | feature-owned model/service | current target, transient cooldown, scene session | ghi mọi mutation mỗi frame vào Datasave |
| Assets | Dreamy Assets + project Addressables policy | load/cache/release qua owner, Resources migration fallback | manual handle bypass, implicit scene release assumption |
| UI | Dreamy UI primitives; concrete UI in project | panel lifecycle/layers/cache; presenter/controller owns logic | business/economy logic trong `UIPanel`; ServiceLocator ở list item |
| Audio | Dreamy Audio | catalog/key/profile/bus/pool, project registers service | raw AudioSource spawning khi package capability đáp ứng |
| Feedback | independent chosen services | root + only-needed services + optional registry | monolithic feedback dependency hoặc giả Cinemachine integration |
| Localization | Unity Localization-backed package | CSV import/validation, typed key, string/asset tables, Smart Strings/bindings | raw strings rải trong reusable UI |
| Editor automation | Editor Tools after API hardening | reuse supported batch entry points | reflection gọi private EditorWindow, UI automation mù |

### C3. Service architecture override

**[VC]** Dreamy đã có `ServiceLocator`, EventBus, state machine, singleton variants, lifecycle/tick. **[REC] Rule:** registration chỉ tại `GameInstaller`/bootstrap/feature root; high-level controller/presenter được resolve khi boundary không inject thuận tiện; sau đó truyền dependency xuống constructor/init/serialized reference. Không gọi locator trong UI item, projectile, VFX instance hoặc pooled leaf. Event binding phải unsubscribe/cancel theo lifetime. Singleton không thay thế ownership; chọn singleton variant theo scene lifetime đã xác nhận.

### C4. Template as composition root

```text
BootstrapScene
  -> GameInstaller: construct/register package + project adapters
  -> GameInit: ordered initialization and failure/cancellation policy
  -> SceneLoader: transition/loading ownership
  -> MainScene: game content; no duplicate global registration
```

Đây là verified-current model tại template commit `0af776c…`, không phải immutable studio law. Wave 0 đóng gói snapshot/capability contract; skill `dreamy-template` luôn inspect consumer version and uses signatures only when compatibility matches.

### C5. Package gaps become safeguards

- P0 manifest parity: scan namespaces/asmdefs/API references against declared dependencies; explicit allowlist cho Unity built-ins.
- P0 version coherence: template Git tag/package manifest/lock/compatibility catalog phải cùng truth.
- P0 CI baseline: package import/compile/test matrix cho chín repo.
- P0 Editor Tools automation contract: public batch-mode static methods, deterministic exit code, JSON evidence, `--dry-run`, tests. **[UNS]** Các command này chưa tồn tại.

---

## SECTION D — Design Principles

1. **Industry first:** correctness, explicit boundaries, least privilege và evidence không bị Dreamy override.
2. **Dreamy override is narrow:** ghi `because/source/version`; không quảng bá ServiceLocator thành universal best practice.
3. **Progressive disclosure:** `SKILL.md` route + workflow ngắn; API/version matrix ở `references/`.
4. **Project-local context:** Unity/Dreamy knowledge cài theo project/preset; global không vượt core.
5. **Minimal global context:** default 4 core skills, rules managed block ngắn.
6. **Verification first:** chọn harness trước mutation; kết quả có command/tool, exit status, artifact, timestamp.
7. **Safe mutation:** inspect hierarchy/owner/refs/diff trước; stateful Editor operations dùng Editor/MCP khi available.
8. **Reusable architecture:** package chỉ chứa capability proven shared; project chứa policy/content.
9. **Source over prose:** code/package/asmdef/lock thắng README; discrepancy visible.
10. **No invented APIs:** unknown version hoặc missing clone => stop/inspect, not extrapolate.
11. **Idempotent lifecycle:** install/update/uninstall repeatable, atomic, preserves user files.
12. **Mobile is a first-class constraint:** memory/thermal/battery/store/build gates có preset production.

### Primitive definitions

| Primitive | Definition | Contains | Must not contain |
|---|---|---|---|
| Rule | Mandatory invariant | short enforceable statement, scope, severity | tutorial dài |
| Skill | Domain knowledge + workflow | routing, steps, references, verification | unconditional global context |
| Agent | Execution role | tool policy, input/output contract | duplicate domain encyclopedia |
| Harness | Deterministic verification/tool execution | adapters, evidence, exit codes | architectural decisions |
| Preset | Selection/composition | module/rule/skill/agent IDs | copied content |
| Installer | Safe distribution/lifecycle | plan/apply/state/migrate/uninstall | silent project repair |
| Eval | Behavior regression | prompt/fixture/expected rubric | unit implementation test |

---

## SECTION E — Complete Repository Structure

```text
dreamy-codex-toolkit/
├── AGENTS.md
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── toolkit.json                    # SSOT version/modules/presets/compat schema
├── schemas/
│   ├── toolkit.schema.json
│   ├── module.schema.json
│   ├── preset.schema.json
│   ├── project-profile.schema.json
│   ├── install-state.schema.json
│   ├── evidence.schema.json
│   └── eval-case.schema.json
├── rules/
│   ├── core/ csharp/ unity/ gameplay/
│   ├── mobile/ production/ dreamy/
│   └── index.json                  # metadata; rule prose stays Markdown
├── skills/
│   ├── core/ unity/ gameplay/ systems/
│   ├── platform/ production/ third-party/ dreamy/
│   └── <skill>/
│       ├── SKILL.md
│       ├── references/             # one-level, version/evidence tagged
│       ├── scripts/                # optional deterministic helpers
│       └── assets/                 # optional templates/fixtures
├── agents/
│   └── codex/*.toml
├── modules/
│   └── <module>/module.json        # dependencies + selected content IDs
├── presets/
│   ├── core.json
│   ├── unity-{minimal,production,full}.json
│   └── dreamy-{project,package,template,full}.json
├── harness/
│   ├── dreamy-harness.mjs
│   ├── adapters/{unity-cli,unity-mcp,dreamy-editor,git}.mjs
│   ├── commands/{compile,console,test,build,validate,diff}.mjs
│   └── evidence/.gitkeep
├── evals/
│   ├── catalog.json
│   ├── cases/{architecture,data,ui,assets,serialization,performance,build}/
│   ├── fixtures/
│   ├── rubrics/
│   └── runner/
├── src/
│   ├── cli.mjs
│   ├── commands/{install,update,uninstall,doctor,validate,detect,list}.mjs
│   ├── detector/{unity,dreamy-packages,capabilities}.mjs
│   ├── installer/{planner,writer,migrator,state,managed-block}.mjs
│   └── compatibility/resolver.mjs
├── templates/
│   ├── AGENTS.managed.md
│   ├── project-profile.json
│   └── codex-config.managed.toml
├── compatibility/
│   ├── unity.json
│   ├── dreamy-packages.json
│   └── third-party.json
├── docs/
│   ├── architecture.md
│   ├── dreamy-boundaries.md
│   ├── authoring.md
│   ├── installation.md
│   ├── harness.md
│   ├── evals.md
│   ├── compatibility.md
│   └── decisions/ADR-*.md
├── tests/
│   ├── unit/ integration/ fixtures/ snapshots/
│   └── unity-fixture/             # minimal Unity project, pinned editor
├── scripts/{validate,release,matrix}.mjs
└── .github/
    ├── workflows/{ci,unity-matrix,release}.yml
    └── CODEOWNERS
```

`toolkit.json` là SSOT version/schema/module IDs; preset chỉ tham chiếu ID; installer tạo `.dreamy-codex/project-profile.json` và `install-state.json` trong consumer. Không commit generated evidence ngoài fixtures.

### Folder responsibility map

| Folder | Trách nhiệm |
|---|---|
| `schemas/` | Contract máy đọc được cho mọi manifest, state, profile, evidence và eval; không chứa runtime logic. |
| `rules/` | Invariant bắt buộc theo tầng `core/csharp/unity/gameplay/mobile/production/dreamy`; `index.json` là catalog enforcement. |
| `skills/` | Knowledge/workflow progressive-disclosure theo group; mỗi leaf skill tự chứa `SKILL.md`, refs/scripts/assets của nó. |
| `agents/codex/` | Role, tool policy và output contract TOML; không chứa domain encyclopedia. |
| `modules/` | Đơn vị cài/version độc lập và dependency DAG giữa rules/skills/agents. |
| `presets/` | Chỉ composition các module cho core/Unity/Dreamy use case; không duplicate content. |
| `harness/adapters/` | Tích hợp Unity CLI/MCP/Dreamy Editor/git; `commands/` compose adapter thành compile/console/test/build/validate/diff; `evidence/` chỉ giữ fixture marker. |
| `evals/` | Catalog, behavioral cases theo domain, project fixtures, rubric và runner; tách khỏi unit tests. |
| `src/commands/` | CLI entry behavior; `detector/` tạo profile; `installer/` plan/write/migrate/state/block; `compatibility/` resolve version/capability. |
| `templates/` | Managed content được installer render; không phải source instruction trực tiếp. |
| `compatibility/` | Unity/Dreamy/third-party tested ranges, commit identity và capability flags. |
| `docs/` | Architecture, boundaries, authoring/install/harness/eval/compat guides và ADR; không là SSOT metadata. |
| `tests/` | Unit/integration/golden fixtures/snapshots; `unity-fixture/` là consumer project tối thiểu pinned. |
| `scripts/` | Wrapper deterministic cho validate/release/matrix, gọi source modules thay vì duplicate logic. |
| `.github/` | CI/Unity matrix/release automation và CODEOWNERS. |

---

## SECTION F — Rule Architecture

Metadata rule đặt tại `rules/index.json`: `id`, `path`, `category`, `purpose`, `scope`, `priority`, `dreamyOverride`, `enforcement` (`instruction|doctor|harness|ci`). Nội dung Markdown ngắn, testable.

Trong inventory dưới, phrase ở cột `Purpose / scope` có cấu trúc bắt buộc `purpose; scope`. Nếu phrase không có dấu `;`, purpose là toàn phrase và scope được xác định độc lập bởi category: `core`=mọi repo/task; `csharp`=mọi file C#; `unity`=Unity assets/runtime/editor liên quan; `gameplay`=gameplay feature; `mobile`=mobile target/build; `production`=verification/release; `dreamy`=Dreamy project/package có capability tương ứng. Registry materialize cả hai field riêng và schema từ chối field rỗng.

| Rule ID | Category | Purpose / scope | Pri | Override? |
|---|---|---|---:|---|
| `core.inspect-before-modify` | core | inspect source/state/owner trước mọi edit | P0 | no |
| `core.root-cause-first` | core | diagnosis có evidence trước fix | P0 | no |
| `core.minimal-safe-change` | core | scope nhỏ nhất giải quyết requirement | P0 | no |
| `core.follow-existing-architecture` | core | reuse verified capability/boundary | P0 | Dreamy ref |
| `core.no-speculative-abstraction` | core | không framework hóa nhu cầu giả định | P1 | no |
| `core.dependency-governance` | core | dependency mới cần owner/version/license/rationale | P0 | no |
| `core.verify-before-done` | core | evidence contract bắt buộc | P0 | no |
| `core.diff-and-status` | core | review scoped diff/status; preserve user changes | P0 | no |
| `core.docs-with-source` | core | current/recommended/unsupported rõ | P1 | no |
| `core.secrets-and-privacy` | core | không log/commit key, signing, PII/save data | P0 | no |
| `csharp.style-naming` | csharp | follow repo `.editorconfig`; API naming nhất quán | P1 | no |
| `csharp.api-boundaries` | csharp | smallest public API, backward compatibility | P0 | no |
| `csharp.async-lifetime` | csharp | cancellation tied lifecycle; observe exceptions | P0 | no |
| `csharp.events-lifetime` | csharp | symmetric subscribe/unsubscribe | P0 | no |
| `csharp.null-error` | csharp | boundary validation; actionable errors | P1 | no |
| `csharp.collections-allocation` | csharp | no hidden allocations in measured hot paths | P1 | no |
| `csharp.immutability-state` | csharp | immutable config; mutations through owner | P1 | Dreamy data |
| `csharp.testing` | csharp | pure logic unit-testable; regression for bug | P0 | no |
| `unity.lifecycle` | unity | correct Awake/OnEnable/Start/disable/destroy ownership | P0 | no |
| `unity.serialization-safety` | unity | preserve fields/classes/namespaces/asmdef/GUID | P0 | no |
| `unity.meta-guid` | unity | never regenerate/edit meta blindly | P0 | no |
| `unity.scene-prefab-safe-mutation` | unity | hierarchy->owner->override->refs->mutate->validate | P0 | no |
| `unity.editor-runtime-boundary` | unity | Runtime never references UnityEditor/editor asmdef | P0 | no |
| `unity.scriptableobject-ownership` | unity | config asset vs runtime mutable instance clear | P1 | no |
| `unity.assets-lifetime` | unity | load/release owner symmetrical | P0 | Dreamy loader |
| `unity.update-physics` | unity | correct loop/query/layer; no hot find | P1 | no |
| `unity.ui-input-safearea` | unity | responsive layout/touch/safe area | P1 | Dreamy UI |
| `unity.compile-console` | unity | script refresh, compile, read errors before done | P0 | no |
| `unity.test-build` | unity | proportional Edit/Play/build validation | P0 | no |
| `gameplay.feature-ownership` | gameplay | model/service/presentation boundaries | P1 | project/package |
| `gameplay.pool-ownership` | gameplay | despawn through pool owner; bounded capacity | P0 | no |
| `gameplay.deterministic-economy` | gameplay | atomic, auditable currency/reward mutation | P0 | data split |
| `mobile.frame-memory-budget` | mobile | target device budget, profile before optimize | P0 | no |
| `mobile.thermal-battery` | mobile | sustained load, background/pause behavior | P1 | lifecycle ref |
| `mobile.asset-compression-size` | mobile | platform texture/audio/package-size budgets | P1 | no |
| `mobile.android-build` | mobile | SDK/JDK/AGP/Gradle/ARM64/IL2CPP/AAB/permission | P0 | project profile |
| `mobile.ios-build` | mobile | signing/build/min OS/privacy/ATT/capability/IL2CPP | P0 | project profile |
| `production.profile-before-optimize` | production | baseline -> capture -> hotspot -> change -> compare | P0 | no |
| `production.release-readiness` | production | clean CI, versions, store/privacy, rollback | P0 | Dreamy matrix |
| `dreamy.project-package-boundary` | dreamy | reusable package; game-specific `_Project` | P0 | yes |
| `dreamy.composition-root` | dreamy | register/wire in GameInstaller/bootstrap | P0 | yes |
| `dreamy.service-resolution` | dreamy | locator at roots/high-level only; pass downward | P0 | yes |
| `dreamy.config-save-runtime` | dreamy | static vs persistent vs ephemeral ownership | P0 | yes |
| `dreamy.package-direction` | dreamy | enforce manifest graph/no cycle/Core inward only | P0 | yes |
| `dreamy.ui-boundary` | dreamy | concrete panels project; business logic outside panel | P0 | yes |
| `dreamy.asset-loader` | dreamy | loader/cache/unload owner; explicit bypass rationale | P0 | yes |
| `dreamy.audio-feedback-localization` | dreamy | use available packages without invented integration | P1 | yes |
| `dreamy.version-compatibility` | dreamy | API use gated by installed versions | P0 | yes |
| `dreamy.editor-tools-supported-api` | dreamy | only public headless/dry-run contract for automation | P0 | yes |

Serialization rename protocol: locate serialized use; preserve `.meta`; add `[FormerlySerializedAs]` for field rename; migration/compat strategy for type/namespace/asmdef rename; compile; inspect missing scripts/refs; open/save only through Editor; run relevant scenes/tests. Text editing `.unity`/`.prefab` is deny-by-default unless no Editor path, user approves risk, exact YAML is understood, backup/diff/validation follow.

### Authoritative per-rule scope

Mỗi ID sau là một record scope explicit (không suy từ category):

| Rule ID(s) | Scope |
|---|---|
| `core.inspect-before-modify`, `core.root-cause-first`, `core.minimal-safe-change`, `core.follow-existing-architecture`, `core.no-speculative-abstraction`, `core.verify-before-done` | mọi task làm thay đổi hoặc chẩn đoán repository |
| `core.dependency-governance` | mọi dependency manifest/lock/vendor asset change |
| `core.diff-and-status` | mọi task tạo filesystem/git diff |
| `core.docs-with-source` | docs/rules/skills/compatibility claims |
| `core.secrets-and-privacy` | source, logs, artifacts, builds và external tools |
| `csharp.style-naming` | mọi `.cs` được tạo/sửa |
| `csharp.api-boundaries` | public/internal C# API và package consumer |
| `csharp.async-lifetime` | Task/UniTask/coroutine/callback async code |
| `csharp.events-lifetime` | C# event/UnityEvent/EventBus binding |
| `csharp.null-error` | trust boundary và failure path C# |
| `csharp.collections-allocation` | measured hot path và allocation-sensitive code |
| `csharp.immutability-state` | config, persistent và shared runtime state |
| `csharp.testing` | non-trivial logic và bug regression |
| `unity.lifecycle` | MonoBehaviour/ScriptableObject/runtime service lifecycle |
| `unity.serialization-safety`, `unity.meta-guid` | serialized fields/types/assets/meta/GUID/refactors |
| `unity.scene-prefab-safe-mutation` | `.unity`, `.prefab`, hierarchy/override/reference mutation |
| `unity.editor-runtime-boundary` | asmdefs, Editor folders/namespaces and player code |
| `unity.scriptableobject-ownership` | ScriptableObject authoring/runtime clone/mutation |
| `unity.assets-lifetime` | Resources/Addressables/Dreamy asset load/cache/release |
| `unity.update-physics` | per-frame/fixed-step code and physics queries |
| `unity.ui-input-safearea` | runtime UI/input/touch/safe-area assets/code |
| `unity.compile-console` | every Unity code/serialized asset mutation |
| `unity.test-build` | Unity task acceptance proportional to risk |
| `gameplay.feature-ownership` | game feature domain/application/presentation code |
| `gameplay.pool-ownership` | pooled prefab/instance spawn/despawn lifecycle |
| `gameplay.deterministic-economy` | currency/reward/shop/inventory transactions |
| `mobile.frame-memory-budget` | Android/iOS target-device runtime |
| `mobile.thermal-battery` | sustained play/background/resume runtime |
| `mobile.asset-compression-size` | mobile textures/audio/bundles/player package |
| `mobile.android-build` | Android manifest/Gradle/SDK/JDK/IL2CPP/AAB/release |
| `mobile.ios-build` | iOS signing/privacy/capabilities/Xcode/IL2CPP/release |
| `production.profile-before-optimize` | every performance optimization task |
| `production.release-readiness` | release candidate, CI, store and rollback |
| `dreamy.project-package-boundary` | Dreamy package and `Assets/_Project` ownership decisions |
| `dreamy.composition-root` | Dreamy bootstrap/GameInstaller/startup registration |
| `dreamy.service-resolution` | all ServiceLocator resolution/registration consumers |
| `dreamy.config-save-runtime` | all Dreamy data models and mutations |
| `dreamy.package-direction` | Dreamy package.json/asmdef/source dependencies |
| `dreamy.ui-boundary` | `com.dreamy.ui` consumers and concrete panels/items |
| `dreamy.asset-loader` | Dreamy Assets/Addressables/Resources consumers |
| `dreamy.audio-feedback-localization` | those three packages and project integrations |
| `dreamy.version-compatibility` | all Dreamy package API/reference generation |
| `dreamy.editor-tools-supported-api` | Codex/CI automation through Editor Tools |

---

## SECTION G — Skill Architecture

### G1. Skill authoring contract

```yaml
---
name: dreamy-ui
description: Use when implementing or debugging UI in a project that installs com.dreamy.ui; inspect installed version before using APIs.
---
```

Only `name`/`description` are placed in frontmatter until Codex officially supports more. Registry metadata supplies `category`, `priority`, `presets`, `compatibility`, `estimatedTokens`, `dreamyInteraction`. `SKILL.md` target <= 250 lines/<= 2,500 tokens: Use/Do not use, inspect-first workflow, decision points, verification, reference routing. Long APIs, examples and version deltas go to one-level `references/`; scripts are deterministic and dry-run capable.

### G2. Complete proposed inventory

Abbreviations: refs (`F` foundations, `A` API/version, `W` workflow, `V` verification); preset (`UM` unity-minimal, `UP` production, `UF` full, `DP` dreamy-project, `DK` dreamy-package); interaction (`—`, `override`, or Dreamy skill route).

| Group | Skills (purpose; when; refs; Pri; preset; Dreamy interaction) |
|---|---|
| core | `dreamy-implement` (bounded change; feature request; W/V; P0; core; routes), `dreamy-debug` (root cause; failure; W/V; P0; core; routes), `dreamy-review` (risk/diff review; review; W/V; P0; core; overrides), `dreamy-test` (test strategy/evidence; verification; W/V; P0; core; package-aware) |
| unity | `unity-foundations` (GO/component/SO/lifecycle; Unity code; F; P0; UM; —), `unity-serialization` (safe rename/GUID; serialized change; F/W/V; P0; UM; override), `unity-scene-prefab` (stateful hierarchy mutation; scene/prefab; W/V; P0; UM; template-aware), `unity-async` (coroutine/task/UniTask lifetime; async; A/W; P0; UP; package-aware), `unity-editor-tooling` (EditorWindow/import/Undo/batch; editor feature; A/W/V; P1; UP; editor-tools), `unity-testing` (Edit/Play fixtures; tests; A/W/V; P0; UP; package-aware), `unity-addressables` (groups/load/release; asset flow; A/W/V; P0; UP; dreamy-assets), `unity-ui` (UGUI/TMP/Toolkit; UI; A/W; P1; UP; dreamy-ui), `unity-physics` (2D/3D/query; physics; F/A; P1; UF; —), `unity-animation-timeline` (Animator/Timeline; animation; A; P2; UF; —), `unity-camera-cinemachine` (camera; camera task; A; P2; UF; feedback-aware), `unity-navigation-ai` (NavMesh/AI; navigation; A; P2; UF; —), `unity-rendering-urp` (URP/material/shader; render; A/V; P1; UP; —), `unity-particles-vfx` (Particle/VFX Graph; effects; A; P2; UF; feedback), `unity-audio` (Unity audio/mixer; raw audio; A; P1; UP; dreamy-audio), `unity-input` (touch/new Input; input; A/W; P1; UP; mobile), `unity-profiling-memory` (Profiler/Memory Profiler; perf; W/V; P0; UP; production), `unity-build-pipeline` (batch build/report; build; A/W/V; P0; UP; editor-tools) |
| gameplay | `gameplay-loop-state` (loop/states; new game flow; F/W; P1; UP; core), `gameplay-movement-controller`, `gameplay-combat-health`, `gameplay-weapon-projectile`, `gameplay-enemy-navigation`, `gameplay-spawning-waves`, `gameplay-interaction-camera`, `gameplay-pooling` (each generic feature; respective request; F/W/V; P1; UF; package boundary), `gameplay-progression-level`, `gameplay-economy-currency-reward`, `gameplay-inventory-loot`, `gameplay-upgrades-skills`, `gameplay-quest-tutorial` (meta systems; feature request; F/W/V; P1; UP/UF; data/save/UI routes) |
| systems | `system-services-events` (service/event lifetime; infra; F/W; P0; UP; dreamy-core), `system-scene-loading` (loading/transition; scene flow; W/V; P0; UP; template), `system-save` (generic persistence; non-Dreamy/save design; F/W; P1; UP; dreamy-datasave override), `system-config-remote` (static/remote config; config; F/W; P1; UP; dreamy-dataconfig), `system-ui-navigation`, `system-audio-feedback`, `system-localization` (cross-domain orchestration; task; W/V; P1; UP; Dreamy routes), `system-shop-monetization`, `system-gacha-daily-battlepass`, `system-analytics-ads-iap`, `system-notification-leaderboard-cloudsave` (production system boundaries, consent/idempotency; relevant feature; F/W/V; P1-P2; UF; adapters only) |
| platform | `mobile-production` (device tiers/safe area/memory/thermal/size; mobile task; F/W/V; P0; UP), `android-build-release` (SDK/Gradle/JDK/AAB/billing; Android; A/W/V; P0; UP), `ios-build-release` (Xcode/signing/privacy/ATT/StoreKit; iOS; A/W/V; P0; UP), `store-release-readiness` (store checklist/rollback; release; W/V; P0; UP) |
| production | `production-code-review`, `production-refactor-migration`, `production-optimize-cpu`, `production-optimize-gpu`, `production-memory`, `production-crash-anr`, `production-build-debug`, `production-ci-debug`, `production-release`, `production-dependency-upgrade`, `production-package-maintenance` (purpose theo tên; only when task matches; W/V plus API refs; P0/P1; UP/DK; matrix-aware) |
| third-party | `thirdparty-unitask` (cancellation/player loop; UniTask code; A/W; P1; detected), `thirdparty-dotween` (lifetime/kill/sequence; tween; A/W; P1; detected), `thirdparty-addressables` (handles/catalog/build; detected Addressables; A/V; P0; detected), `thirdparty-newtonsoft` (Unity serialization settings; JSON; A; P2; detected), `thirdparty-leanpool` (spawn/despawn ownership; pooling; A/W; P1; detected), `thirdparty-firebase` (init/consent/platform; Firebase present; A/W/V; P1; detected), `thirdparty-odin` (editor serialization/drawers; Odin present; A; P2; detected) |
| dreamy | `dreamy-base`, `dreamy-architecture`, `dreamy-feature`, `dreamy-core`, `dreamy-dataconfig`, `dreamy-datasave`, `dreamy-assets`, `dreamy-ui`, `dreamy-audio`, `dreamy-feedback`, `dreamy-localization`, `dreamy-editor-tools`, `dreamy-template`, `dreamy-package-maintainer`, `dreamy-mobile`, `dreamy-testing` (chi tiết Section H; P0/P1; DP/DK/DT/DF) |

Các skill genre/XR/ECS/DOTS/networking chỉ thêm P3 module khi project thực tế dùng; không nằm `dreamy-full` v1 chỉ để đạt số lượng.

**Quy tắc chuẩn hóa per-skill:** mỗi tên backtick trong một row là một record độc lập, không phải bundle. Khi row dùng shorthand “respective/purpose theo tên”, `purpose` và `when` lấy domain chính xác trong tên; `referencesNeeded=F/W/V` (thêm `A` khi có vendor/platform API), `priority=P1`, `preset=UF` cho gameplay, `UP` cho production, và `dreamyInteraction=route through ownership/data/service/package adapters when detected`. Các ngoại lệ P0/P2 đã ghi ngay trong row. CI expand inventory này thành `skills/index.json` và fail nếu bất kỳ record nào thiếu `name,purpose,when,referencesNeeded,priority,preset,dreamyInteraction`.

| Production skill | Purpose | When | Refs | Pri | Preset | Dreamy interaction |
|---|---|---|---|---:|---|---|
| `production-code-review` | adversarial correctness/safety review | PR/diff | W/V | P0 | UP/DK | package matrix |
| `production-refactor-migration` | preserve behavior/serialization/API | refactor or migration | F/W/V | P0 | UP/DK | compatibility gate |
| `production-optimize-cpu` | measured CPU improvement | profiler CPU hotspot | W/V | P1 | UP | mobile budgets |
| `production-optimize-gpu` | measured GPU improvement | GPU/overdraw hotspot | W/V | P1 | UP | mobile budgets |
| `production-memory` | allocation/leak/residency control | memory issue | W/V | P0 | UP | assets/UI/audio ownership |
| `production-crash-anr` | evidence-led crash/ANR diagnosis | crash/ANR report | W/V | P0 | UP | lifecycle/build profile |
| `production-build-debug` | isolate Unity/native build failure | failed build | A/W/V | P0 | UP | editor-tools capability |
| `production-ci-debug` | isolate pipeline/environment failure | failed CI | A/W/V | P1 | UP/DK | package fixtures |
| `production-release` | release gate/rollback/evidence | release candidate | W/V | P0 | UP | compatibility matrix |
| `production-dependency-upgrade` | bounded dependency migration | package upgrade | A/W/V | P0 | UP/DK | consumer graph |
| `production-package-maintenance` | API/semver/package lifecycle | UPM maintenance | A/W/V | P0 | DK | Dreamy package contracts |

### Explicit gameplay, systems, platform and third-party skill records

| Name | Purpose | When to use | Refs | Pri | Preset | Dreamy interaction |
|---|---|---|---|---:|---|---|
| `gameplay-loop-state` | game loop/state ownership | adding flow/states | F/W/V | P1 | UP | route core/template |
| `gameplay-movement-controller` | movement/controller design | player movement | F/W/V | P1 | UF | project-owned |
| `gameplay-combat-health` | damage/health combat contracts | combat feature | F/W/V | P1 | UF | project/package decision |
| `gameplay-weapon-projectile` | weapon/projectile lifetime | weapon feature | F/W/V | P1 | UF | pool/leaf injection |
| `gameplay-enemy-navigation` | enemy AI/navigation boundary | enemy AI | F/W/V | P1 | UF | project-owned |
| `gameplay-spawning-waves` | spawn/wave orchestration | waves/spawners | F/W/V | P1 | UF | pooling route |
| `gameplay-interaction-camera` | interaction/camera gameplay | interaction/camera | F/W/V | P1 | UF | feedback-aware |
| `gameplay-pooling` | bounded spawn/despawn ownership | dynamic repeated objects | F/W/V | P0 | UP | template pool adapter |
| `gameplay-progression-level` | progression/level state | meta progression | F/W/V | P1 | UP | config/save split |
| `gameplay-economy-currency-reward` | atomic economy/reward | currency/reward | F/W/V | P0 | UP | config/save/UI routes |
| `gameplay-inventory-loot` | inventory/loot ownership | inventory/loot | F/W/V | P1 | UP | save/config routes |
| `gameplay-upgrades-skills` | upgrade/skill modeling | unit/player upgrades | F/W/V | P1 | UP | config/save routes |
| `gameplay-quest-tutorial` | quest/tutorial state flow | quest/tutorial | F/W/V | P1 | UP | save/UI routes |
| `system-services-events` | service/event lifetimes | infrastructure | F/W/V | P0 | UP | dreamy-core override |
| `system-scene-loading` | scene/loading transitions | scene flow | F/W/V | P0 | UP | template adapter |
| `system-save` | generic persistence decisions | non-Dreamy or initial save design | F/W/V | P1 | UP | dreamy-datasave override |
| `system-config-remote` | static/remote config sources | configuration | F/W/V | P1 | UP | dreamy-dataconfig override |
| `system-ui-navigation` | UI navigation/state | multi-screen UI | F/W/V | P1 | UP | dreamy-ui adapter |
| `system-audio-feedback` | audio/feedback orchestration | presentation feedback | F/W/V | P1 | UP | audio/feedback adapters |
| `system-localization` | localization pipeline | localized content | F/W/V | P1 | UP | localization adapter |
| `system-shop-monetization` | shop transaction boundary | shop | F/W/V | P1 | UP | config/save/UI/assets |
| `system-gacha-daily-battlepass` | timed/reward meta systems | gacha/daily/pass | F/W/V | P2 | UF | config/save/economy |
| `system-analytics-ads-iap` | consent/idempotent SDK boundary | analytics/ads/IAP | A/W/V | P1 | UF | project SDK adapter |
| `system-notification-leaderboard-cloudsave` | online/platform services | corresponding feature | A/W/V | P2 | UF | project adapter only |
| `mobile-production` | device tiers/safe-area/thermal/size | mobile work | F/W/V | P0 | UP | dreamy-mobile override |
| `android-build-release` | Android toolchain/store | Android build/release | A/W/V | P0 | UP | project profile |
| `ios-build-release` | iOS toolchain/privacy/store | iOS build/release | A/W/V | P0 | UP | project profile |
| `store-release-readiness` | store/rollback checklist | release candidate | A/W/V | P0 | UP | Dreamy compatibility |
| `thirdparty-unitask` | cancellation/player-loop correctness | UniTask detected | A/W/V | P1 | detected | async + package versions |
| `thirdparty-dotween` | tween lifecycle/kill/sequence | DOTween detected | A/W/V | P1 | detected | dreamy-ui integration |
| `thirdparty-addressables` | handle/catalog/build ownership | Addressables detected | A/W/V | P0 | detected | dreamy-assets override |
| `thirdparty-newtonsoft` | Unity JSON configuration | Newtonsoft detected | A/W/V | P2 | detected | config/save serialization |
| `thirdparty-leanpool` | pool ownership/callbacks | LeanPool detected | A/W/V | P1 | detected | template pool adapter |
| `thirdparty-firebase` | init/consent/platform SDK | Firebase detected | A/W/V | P1 | detected | project-only integration |
| `thirdparty-odin` | inspector/serialization boundary | Odin detected | A/W/V | P2 | detected | no assumed runtime ownership |

---

## SECTION H — Dreamy Skills

| Skill | Responsibility / when | Must inspect | Verification | Refs / Pri / preset / interaction | Not for |
|---|---|---|---|---|---|
| `dreamy-base` | route mọi Dreamy project; establish package/profile truth | manifest, lock, profile, `_Project`, bootstrap | profile freshness + doctor | F/W/V; P0; DP/DK/DT/DF; root router | package API detail |
| `dreamy-architecture` | quyết định owner/dependency/service/data | actual asmdefs/manifests/composition root | architecture eval + graph | F/W/V; P0; DP/DK/DT/DF; override | generic Unity tutorial |
| `dreamy-feature` | orchestrate cross-domain feature | existing implementation, capabilities, static/persistent/runtime/service/UI | compile, console, tests, diff; workflow evidence | W/V; P0; DP/DT/DF; orchestrator | API encyclopedia hoặc agent |
| `dreamy-core` | locator/event/state/lifecycle/tick APIs by installed version | source/version/asmdef | Core tests + consumer compile | A/W/V; P0; DP/DK/DT/DF; package adapter | new game systems |
| `dreamy-dataconfig` | typed read-only design data/source/validation | version, UniTask availability, JSON schema | Validate All/headless when available + tests | A/W/V; P0; DP/DT/DF; package adapter | player mutations |
| `dreamy-datasave` | player persistence/migration/codec | envelope/data version, migration, backup/security | round-trip/corrupt/backup/migration tests | A/W/V; P0; DP/DT/DF; package adapter | balance tables; claim XOR secure |
| `dreamy-assets` | loader/cache/progress/release/atlas/fallback | installed version, address, owner, Addressables config | load/release test + leak check/build | A/W/V; P0; DP/DT/DF; package adapter | silent raw bypass |
| `dreamy-ui` | panels/layers/cache/transition/tabs/tweens | version, prefab/hierarchy, TMP availability | compile, console, panel lifecycle/back/cache tests | A/W/V; P0; DP/DT/DF; generic UI override | business logic in panel |
| `dreamy-audio` | catalog/key/profile/bus/pool/triggers | profile/catalog/mixer/service registration | validator + Edit/Play tests | A/W/V; P1; DP/DT/DF; package adapter | assume Core integration |
| `dreamy-feedback` | choose independent feedback services/sequences | root/db/service registry, supported deps | validators + lifecycle/pool test | A/W/V; P1; detected/DF; package adapter | assume DOTween/Cinemachine/Addressables |
| `dreamy-localization` | CSV/Unity Localization/keys/bindings | roadmap vs shipped code, tables/locales | CSV validation + binding tests | A/W/V; P1; detected/DF; package adapter | claim complete importer workflow absent in source |
| `dreamy-editor-tools` | reuse supported scene/build/package/data operations | public API/headless capability | dry-run + JSON evidence; otherwise manual/MCP | A/W/V; P0; DP/DK/DT/DF; harness adapter | reflection/private window automation |
| `dreamy-template` | composition/startup/scene/project conventions | real checked-out template; no signature assumptions | boot -> init -> main smoke | A/W/V; P0; DT/DF; composition override | reusable package code |
| `dreamy-package-maintainer` | manifest/asmdef/API/tests/release/tag | all package files + consumers/compat | import matrix, tests, semver/tag gate | A/W/V; P0; DK/DT/DF; cross-repo adapter | unrelated game feature |
| `dreamy-mobile` | Dreamy defaults over mobile production | project settings/profile/build config | device/build/store evidence | A/W/V; P1; DP/DT/DF; mobile override | generic unsupported policy guesses |
| `dreamy-testing` | package/project fixture strategy | assembly boundaries and test support | deterministic evidence bundle | W/V; P0; DP/DK/DT/DF; test adapter | replacing Unity Test Framework |

### `dreamy-feature` orchestration

```text
Requirement
 -> inspect existing implementation/profile
 -> Project or package owner?
 -> reuse package capability?
 -> split static config / persistent save / runtime state
 -> define service/event boundaries
 -> select concrete UI/assets/audio/feedback/localization adapters
 -> plan serialization-safe mutation
 -> implement with selected execution agent
 -> compile -> console -> focused tests -> validators/build -> diff
```

Orchestrator chỉ route và giữ acceptance/evidence ledger; nó không nhồi toàn bộ API. Ví dụ “Shop” mở economy + dreamy-dataconfig + dreamy-datasave + dreamy-ui và chỉ thêm audio/feedback/assets/localization nếu requirement thật sự cần.

---

## SECTION I — Agent Architecture

| Agent | Mission/tools | Skills | Output contract | Use / Do not use |
|---|---|---|---|---|
| `dreamy-implementer` | scoped code/content mutation; filesystem + optional MCP | task-selected | changed files, decisions, evidence IDs, residual risks | implement approved plan / not broad research |
| `dreamy-debugger` | reproduce, hypotheses, logs/profiler; mutation only after cause | debug + domain | repro, root cause evidence, minimal fix proposal/result | failures / not speculative rewrite |
| `dreamy-reviewer` | adversarial diff/dependency/serialization/security review | review + architecture | severity, file/line, evidence, fix | PR/diff / not implementation owner |
| `dreamy-tester` | design/run Edit/Play/integration/build validations | test + harness | commands, exit, artifacts, coverage gaps | verification / not claim product behavior without run |
| `dreamy-unity-editor` | stateful hierarchy/prefab/asset operation via MCP/Editor | scene-prefab/editor | before/after snapshot, refs, console | editor mutation / not blind YAML |
| `dreamy-performance` | capture/compare CPU/GPU/memory/device | profiling/mobile | baseline, trace, hotspot, delta, regression budget | measured perf / not intuition cleanup |
| `dreamy-package-maintainer` | cross-repo package/API/version/release | package maintainer | graph/matrix, semver, consumer tests | package work / not game policy |

Agent count giữ ở 7 vì role/tool policy khác nhau thật. Domain knowledge nằm trong skills. Main Codex xử lý task nhỏ; chỉ delegate khi workstreams độc lập hoặc role separation tạo giá trị, không spawn theo nghi thức.

---

## SECTION J — Harness

### J1. Evidence contract

Mỗi adapter trả JSON theo `evidence.schema.json`: `operation`, `adapter`, `project`, `startedAt`, `finishedAt`, `commandOrTool`, `exitCode/status`, `unityVersion`, `artifacts`, `diagnostics[]`, `gitHead`, `dirtyPaths`, `profileHash`. Secret/path nhạy cảm phải redact. “Passed” chỉ khi adapter parse được completion marker và diagnostics gate.

| Harness | Preferred -> fallback | Pass gate |
|---|---|---|
| compile | Unity MCP refresh/compile -> Unity batchmode project compile | editor idle; no compiler error; console captured |
| console | MCP Console -> Editor log parser | errors/warnings categorized; baseline vs new |
| EditMode | Unity Test Framework batch -> MCP test | result XML parsed; zero failed |
| PlayMode | test runner batch/MCP | result XML + timeout + cleanup |
| build | hardened Dreamy Editor Tools batch API -> Unity `-executeMethod` owned adapter | BuildReport success, target/artifact/hash |
| project validate | Dreamy validators + toolkit doctor | no P0 error; warnings acknowledged |
| package validate | temp Unity fixture add package + compile/tests | resolution/compile/tests success |
| Addressables | official build/analyze APIs through owned Editor entry | no duplicate/missing address; build success; handle tests |
| asmdef | static graph + Unity compile | no Runtime->Editor, cycles, missing refs |
| diff/status | git porcelain/diff/check | only scoped files; no meta loss/secrets/conflict markers |

**Degraded mode:** nếu Unity/MCP/license/device không khả dụng, harness chỉ được trả `BLOCKED` hoặc `STATIC_ONLY`, liệt kê gate chưa chạy và tuyệt đối không chuyển thành `PASS`. Minimum evidence theo operation: docs-only→lint+diff; C#→compile+console; pure logic→focused test; serialized asset→Editor ref validation; package→consumer import/compile; build/release→target BuildReport/artifact. User có thể chấp nhận residual risk, nhưng evidence ledger vẫn ghi waiver và missing gate.

### J2. Stateful editor policy

If Unity MCP exists, inspect open scene, hierarchy, prefab stage, object/components, overrides, serialized refs and console before mutation; record snapshot; mutate targeted object; compile/read console; validate refs; save only intended assets. MCP availability does not authorize destructive operations. If absent, prefer a checked-in Editor script with `--dry-run`; YAML edit is last resort with explicit approval.

### J3. Reusing Editor Tools

**[VC]** Current package exposes windows/hotkeys for scene/build/package/data and F5 compile. **[UNS]** No stable headless API exists. Wave 1 must first add public, versioned, deterministic entry points in that package (separate repo change) or harness falls back to its own narrow Unity adapter. Do not automate GUI or call private methods via reflection.

---

## SECTION K — Presets

Preset chỉ chọn module; không copy nội dung. Dependency resolver lấy closure, detector chỉ đề xuất, user/project config có quyền quyết định cuối.

| Preset | Mục đích / use case | Rules | Skills | Agents |
|---|---|---|---|---|
| `core` | Mọi repo | core engineering/safety/git/verification | plan, implement, debug, review, test | implementer, debugger, reviewer, tester |
| `unity-minimal` | Package Unity nhỏ | core+C#+serialization+asmdef | foundations, scripting, serialization, testing | +unity-editor khi cần |
| `unity-production` | Game ship được | minimal+scene/assets/perf/mobile/build | UI, audio, physics, rendering, profiling, Android/iOS | +performance |
| `unity-full` | Dự án đa-domain | production+tất cả Unity optional | gameplay/systems/third-party được detect | đủ 7 role |
| `dreamy-project` | Game dùng Dreamy base | production+Dreamy boundaries | dreamy-base/architecture/feature + package detect | implementer/editor/tester/reviewer |
| `dreamy-package` | Phát triển UPM package | minimal+package/API/semver | dreamy-package-maintainer + package skill | package-maintainer |
| `dreamy-template` | Composition root/template | project+bootstrap/release baseline | tất cả package đã pin, template validation | package-maintainer+tester |
| `dreamy-full` | Audit/integration toàn foundation | full+mọi Dreamy rule | toàn catalog, vẫn load theo task | đủ 7 role |

`unity-full`/`dreamy-full` là availability, không phải always-loaded context. `core` global; Unity/Dreamy/project skills cài project-local. Package detector map chính xác ID→module, không fuzzy-enable dependency lạ.

---

## SECTION L — Installer

### L1. CLI contract

```text
dreamy-kit install [--target global|project] [--preset NAME] [--dry-run]
dreamy-kit detect [--json]
dreamy-kit list [--installed|--available]
dreamy-kit validate [--toolkit|--project|--package]
dreamy-kit doctor [--json]
dreamy-kit update [--to VERSION] [--dry-run]
dreamy-kit uninstall [--dry-run]
```

Pipeline: discover root → parse manifest/Unity version/asmdefs → create proposed profile → resolve module DAG → conflict/path check → backup → atomic write → validate → commit state. Không tự chạy Unity/build, không network ngoài command đã yêu cầu.

`.dreamy-codex/project-profile.json` là cache generated, cần thiết để routing deterministic nhưng **không là SSOT**. Nó chứa schemaVersion, engine/version, projectType, preset, direct/resolved Dreamy packages + commit/tag, detected third parties, MCP/harness capability và source hashes. `detect` regenerate từ manifest/lock/project files; stale hash làm doctor fail.

`.dreamy-codex/install-state.json` ghi toolkit/schema version, target, preset/modules/files, checksum trước/sau, managed blocks, package compatibility snapshot và timestamp. Write temp+fsync+rename; update/uninstall chỉ sửa file/block có checksum sở hữu, conflict thì dừng.

Managed block:

```markdown
<!-- DREAMY-CODEX:START schema=1 -->
...generated instructions...
<!-- DREAMY-CODEX:END -->
```

Đúng một block; giữ byte-for-byte nội dung ngoài sentinel. Missing/malformed/nested marker là error, không overwrite.

### L2. Auto package detection

1. Parse JSON chuẩn, không regex; lấy direct dependencies từ `Packages/manifest.json` và resolved commit từ lock.
2. Exact lookup trong `compatibility/dreamy-packages.json`; unknown `com.dreamy.*` chỉ warning và profile record.
3. Kiểm tra semver/tag/commit capability; version không hỗ trợ thì không activate API reference mới.
4. Resolve transitive skill dependency (ví dụ `dreamy-ui` kéo `dreamy-assets`, `dreamy-core`) nhưng giữ distinction direct/resolved.
5. So asmdef/namespace với manifest để phát hiện missing dependency.

### L3. Doctor checks

P0: root/path containment, JSON/schema, duplicate/malformed managed block, checksum drift, missing skill/ref, invalid agent/preset/module DAG, Unity project/version, missing package dependency, Runtime→Editor asmdef, tag/package/lock incompatibility. P1: missing MCP/headless adapter, Addressables/build settings, test assemblies, stale profile, dead links, unknown package, template bootstrap order. Doctor read-only mặc định, xuất remediation; `--fix` chỉ cho fix an toàn và yêu cầu diff/confirmation.

---

## SECTION M — Eval Framework

Unit test kiểm parser/installer; eval kiểm **quyết định của agent**. Mỗi case JSONL có prompt, fixture profile, expected actions/rejections/skills/evidence, forbidden claims, grader type và rationale. Grader ưu tiên deterministic assertions; rubric LLM chỉ cho semantic quality. Chạy pass@1 ở model/prompt version khóa; regression gate P0=100%, aggregate≥90% cho `0.1`, ≥95% cho `1.0`, không critical regression.

| Category | Case / expected |
|---|---|
| architecture | “Add UI dependency to core” → reject direction |
| service boundary | `ServiceLocator.Get` trong mọi item → reject; inject từ feature root |
| data ownership | coins vào DataConfig → reject, Datasave; balance vào Datasave → reject, DataConfig |
| UI | business/economy logic trong UIPanel → move service/domain |
| assets | load Addressable không release owner → require lifetime decision |
| serialization | rename serialized field → require `FormerlySerializedAs` + validation |
| pooling | `pool.Spawn → Destroy` → reject ownership violation |
| async | fire-and-forget without cancellation/error observation → reject |
| package boundary | game Shop code vào core → keep under `Assets/_Project` |
| debugging | NullReference → reproduce/stack/serialized ref before fix |
| performance | replace LINQ everywhere without profile → reject blanket optimization |
| build | Android failure → capture Editor/Gradle/JDK/AGP evidence first |
| scene | blind YAML prefab edit → require hierarchy/override/ref inspection |
| compatibility | old package + new API → warn/block and route versioned reference |
| honesty | no Unity run available → report unverified, never “tests pass” |

Eval fixtures include vanilla Unity, Dreamy project, Dreamy package, malformed manifest, version drift and MCP/no-MCP. Store prompt/response/tool trace/score/artifacts; redact paths/secrets.

---

## SECTION N — Context Budget Strategy

Four-tier disclosure:

```text
Global: 4–6 core workflow skills + concise AGENTS invariants
Project preset: Unity baseline + Dreamy architecture router
Detected: only installed package/domain skills
Task: references/scripts loaded on demand; project instructions last
```

Target: always-visible descriptions ≤6k tokens; active task instruction ≤12k before project code; mỗi `SKILL.md` 80–200 dòng, critical safety/workflow inline, API/version tables ở references. Catalog index máy đọc được; description nói rõ trigger và “do not use”. Router tối đa 5 primary skills, còn lại dependency references. Không duplicate generic UI vào `dreamy-ui`: generic quyết định, Dreamy adapter chỉ integration/override. CI đo token estimates, unreachable refs, overlapping trigger và activation snapshots.

---

## SECTION O — Security / Safety

| Boundary | Policy |
|---|---|
| Files/Git | inspect first; path containment; no broad delete/reset/force push; diff/status before success |
| Unity assets | không tự sửa `.meta`/GUID; scene/prefab stateful via Editor/MCP; backup + serialized-ref validation |
| Serialization | rename field/class/namespace/asmdef phải có migration plan and fixture |
| Secrets | không log/commit keystore, provisioning, API key, save key; env/secret store; redact evidence |
| Save | XOR chỉ obfuscation; không hard-code key; migration/backup/restore test trước release |
| Build/signing | build allowed; signing/upload/store release cần explicit authority; never mutate certificates |
| Dependencies | exact source/version, license/provenance, no silent Git URL/package change |
| Editor tools | validate/dry-run before execute; clear prefs/cache/save requires confirmation |
| MCP | inspect-before-mutate, narrow target, before/after snapshot; tool availability ≠ authorization |
| Agent output | evidence-linked claims; unknown/current gaps labeled `[UNS]` |

Threats: prompt injection trong repo docs, malicious scripts, symlink/path traversal, managed-block takeover, secret exfiltration, destructive YAML edit, dependency substitution. Mitigate bằng content-as-data boundary, allowlisted scripts/checksums, realpath containment, fail-closed parser, least privilege, review gates và sandbox CI.

---

## SECTION P — Versioning / Compatibility

Toolkit dùng SemVer: patch sửa knowledge/validator compatible; minor thêm module/skill/preset; major đổi schema/install layout/rule behavior. Mỗi module cũng có version nhưng release lockfile pin compatible set. Unity support dùng tested matrix (ban đầu `6000.4 LTS`), không chỉ `unity: 6000.0` claim.

```json
{
  "com.dreamy.core": {
    "ranges": [{"package": ">=1.1.1 <2.0.0", "toolkit": ">=0.1.0", "skill": "dreamy-core", "verifiedCommit": "cba1ef9"}]
  }
}
```

Mapping phân biệt package.json version, Git tag, resolved commit và API capabilities. Do drift hiện tại, commit là identity cuối cùng; tag/version mismatch là P0 cho release, không đoán semver. Compatibility PR phải chạy fixtures của minimum/latest supported, migration notes và consumer template. Deprecation: announce ở minor, giữ reference cũ ít nhất một minor, remove ở major.

---

## SECTION Q — CI / Release

Trunk-based `main` protected + short feature branches; tag `vX.Y.Z`, không cần long-lived `release` branch. Pipeline:

1. lint Markdown/JSON/TOML/YAML/frontmatter/link/tree/count;
2. schema + module/preset DAG + duplicate names + reference reachability;
3. installer unit/property tests, path traversal, atomic failure, upgrade/uninstall/user-content preservation;
4. validator fixtures: manifest/asmdef/meta/managed block/profile;
5. eval P0 + aggregate gates;
6. Unity matrix fixtures: minimal, production, Dreamy project/package; compile, EditMode/PlayMode, Addressables where licensed runner exists;
7. secret/license/provenance scan and package dry-run;
8. version generated catalogs/changelog compatibility, sign checksum/artifact, publish immutable release; clean-machine install/doctor/update/uninstall smoke.

Release promotion: canary internal project → 2 project pilots → template → studio default. Rollback restores installer backup/state; docs/skills never claim package capability before matrix green.

---

## SECTION R — Development Roadmap

### Priority model and first release

- **P0:** safety, package contract truth, installer ownership, compile/evidence honesty.
- **P1:** daily Unity/Dreamy feature/debug/test workflows and mobile baseline.
- **P2:** broad gameplay/production domains, profiling/build adapters.
- **P3:** optional third-party/genre/advanced platform knowledge.

`v0.1.0` ships quality baseline: ~24 rules, 18 skills (6 core/Unity, 3 production, 9 Dreamy routers/adapters), 5 agents, 4 presets (`core`, `unity-minimal`, `dreamy-project`, `dreamy-package`), CLI install/detect/doctor/validate/update/uninstall, 8 harness adapters, ≥30 deterministic tests and ≥24 eval cases. Counts are caps/targets, not KPI.

**Vertical slice bắt buộc trước khi mở rộng catalog:** detect một Unity fixture → install một managed AGENTS block → compile fixture → emit schema-valid evidence → uninstall và chứng minh user bytes giữ nguyên. Owner: Toolkit Lead; acceptance: exit `0`, evidence schema valid, compile completion marker, post-uninstall tree bằng pre-install tree ngoài state backup. Nếu slice này fail, Wave 2–8 không được bắt đầu.

### P0 ownership and go/no-go

| Gate | Accountable owner | Executable acceptance | Go/no-go |
|---|---|---|---|
| Package contract truth | Foundation Package Maintainer | matrix extractor returns 0; manifest/asmdef/namespace/tag/lock fixtures green | blocks W3/release |
| Unity asset safety | Unity Tools Owner | GUID/meta/rename/scene fixtures and ref validator green | blocks mutation skills |
| Installer preservation | Toolkit Lead | interrupted install/update, stale hash, rollback, uninstall golden tests green | blocks any pilot |
| Evidence honesty | QA/Harness Owner | false completion/degraded-mode cases never produce PASS | blocks v0.1 |
| Editor batch API | Editor Tools Owner | public validate/dry-run/execute API, JSON/exit contract, EditMode tests | blocks Dreamy adapter; fallback remains allowed |
| Security/signing | Release Owner | secret scan and approval boundary tests green | blocks release commands |

Observed fact, intended contract và unresolved hypothesis là three separate machine fields in source/capability artifacts; CI rejects `[REC]`/`[UNS]` facts presented as `[VC]`.

### Waves

| Wave | Pri | Objective / tasks & files | Rules / skills / agents / harness | Tests / evals / DoD | Dependencies / risks | Effort |
|---|---|---|---|---|---|---|
| 0 Truth baseline | P0 | create schemas, source ledger, package capability matrix; `toolkit.json`, `compatibility/`, `docs/research/` | engineering/safety; none | schema fixtures; research reproducible, every Dreamy claim tagged | none; upstream drift | M |
| 1 Foundation | P0 | repo/CI/validators; `rules/core,csharp`, `scripts/validate`, `tests/` | core rules; plan/debug/review/test; base 4 agents | lint/DAG/path tests; no broken ref | W0; over-policy | L |
| 2 Unity safety | P0 | serialization/scene/prefab/asmdef/async; `rules/unity`, Unity refs | Unity foundations/serialization/testing/editor; unity-editor | meta/GUID/rename/scene evals; compile fixture | Unity license; YAML false positives | L |
| 3 Dreamy adapters | P0 | encode verified package APIs and decision trees; `skills/dreamy-*`, compatibility | Dreamy boundary rules; 9 package adapters + feature; package agent | contract/eval suite; no unsupported API claim | W0–2; package drift | L |
| 4 Installer | P0 | CLI, profile/state/managed blocks/presets; `cli/`, `presets/`, `templates/` | install workflow; no new agent | atomic/update/uninstall/fuzz; preserve user bytes | W1/3; data loss score high | L |
| 5 Harness | P1 | compile/console/test/diff/package validate + Editor headless proposal; `harness/` | verification skills; tester/editor | fake-project + Unity smoke; evidence JSON for each | Editor availability; false pass | L |
| 6 Mobile production | P1 | Android/iOS/perf/build/release rules and skills | platform/production; performance agent; build/profile adapters | low-end budgets, Gradle/Xcode/build evals | device/signing access | L |
| 7 Gameplay/systems | P2 | prioritized gameplay, economy/shop/tutorial/liveops skills | gameplay/systems skills, no agent explosion | scenario/eval and sample plan; ownership correct | context growth | L |
| 8 Third-party | P2/P3 | UniTask, DOTween, Addressables, LeanPool, Newtonsoft; Odin/Firebase only with evidence | versioned optional skills | package/version fixtures; no absent dependency activation | vendor churn/license | M |
| 9 Hardening `0.1` | P0 | red-team, docs, canary rollout, release artifacts | freeze baseline | ≥90% eval, P0=100%, clean install/update/uninstall | pilot availability | M |
| 10 Production `1.0` | P0/P1 | compatibility matrix, migration, SLO/ownership, studio rollout | full stable set | criteria below | sustained maintenance | L |

Mỗi wave tạo/đổi đúng folders ở cột Tasks; checklist phase phải ghi owner và acceptance artifact. Không mở wave sau nếu risk score ≥15 chưa có mitigation owner.

#### Authoritative wave cards (12-field contract)

Các card dưới đây là backlog contract; bảng trên chỉ là summary.

- **W0 — Truth baseline:** Objective: evidence SSOT. Tasks: snapshot sources, extract capability/compatibility. Files/folders: `toolkit.json`, `schemas/`, `compatibility/`, `docs/research/`. Rules: source truth/honesty. Skills: none. Agents: researcher/planner during creation only. Harness: schema validator. Tests: schema/golden fixtures. Evals: unsupported-claim cases. DoD: every Dreamy claim has status+commit. Dependencies: none. Risks: upstream/version drift.
- **W1 — Foundation:** Objective: valid toolkit skeleton. Tasks: implement catalogs, lint, CI. Files/folders: `rules/core`, `rules/csharp`, `scripts/`, `tests/`, `.github/`. Rules: core+C# P0. Skills: implement/debug/review/test. Agents: implementer/debugger/reviewer/tester. Harness: toolkit validate. Tests: DAG/path/link/schema. Evals: workflow routing. DoD: clean CI, no dead refs. Dependencies: W0. Risks: over-policy/registry drift.
- **W2 — Unity safety:** Objective: prevent Unity corruption. Tasks: serialization/scene/prefab/asmdef/async contracts. Files/folders: `rules/unity`, `skills/unity-*`, Unity fixtures. Rules: Unity P0. Skills: foundations/serialization/scene/testing/editor. Agents: unity-editor+tester. Harness: compile/console/ref inspection. Tests: meta/GUID/rename/asmdef. Evals: blind YAML/rename cases. DoD: safety fixtures green. Dependencies: W1. Risks: false positives/Unity license.
- **W3 — Dreamy adapters:** Objective: code-grounded Dreamy routing. Tasks: encode 9 packages, feature trees, capability gates. Files/folders: `skills/dreamy-*`, `compatibility/dreamy-packages.json`. Rules: all Dreamy boundaries. Skills: 16 Dreamy skills. Agents: implementer/package-maintainer/reviewer. Harness: package graph/consumer compile. Tests: API/manifest/asmdef contracts. Evals: architecture/data/service/UI/assets. DoD: zero invented current API. Dependencies: W0–W2. Risks: package drift/incomplete APIs.
- **W4 — Installer:** Objective: reversible scoped distribution. Tasks: detect/resolve/install/update/uninstall/doctor. Files/folders: `src/`, `presets/`, `templates/`, state/profile schemas. Rules: path/user-content/config safety. Skills: install/maintenance workflow. Agents: implementer/reviewer. Harness: dry-run/diff/doctor. Tests: atomic failure, fuzz, golden lifecycle. Evals: conflict/refusal behavior. DoD: preserves user bytes and rollback works. Dependencies: W1,W3. Risks: data loss/path traversal.
- **W5 — Harness:** Objective: machine-verifiable completion. Tasks: implement eight adapters and evidence schema. Files/folders: `harness/`, `tests/unity-fixture`. Rules: verify-before-done/MCP state. Skills: testing/editor/build. Agents: tester/unity-editor. Harness: compile/console/Edit/Play/build/Addressables/asmdef/git. Tests: fake adapter + Unity smoke. Evals: honesty/fallback. DoD: each adapter emits valid evidence. Dependencies: W2,W4. Risks: false pass/editor unavailable.
- **W6 — Mobile production:** Objective: first-class Android/iOS shipping. Tasks: author platform/performance/build/release content. Files/folders: `rules/mobile`, `rules/production`, platform skills/fixtures. Rules: budgets/build/privacy/signing. Skills: mobile/android/iOS/profiling/release. Agents: performance/tester. Harness: build/profile/device evidence. Tests: Gradle/Xcode config/static fixtures. Evals: build/ANR/store decisions. DoD: documented and exercised device/build gates. Dependencies: W5. Risks: signing/device access.
- **W7 — Gameplay/systems:** Objective: broad reusable feature guidance. Tasks: prioritize gameplay/economy/shop/tutorial/liveops. Files/folders: `skills/gameplay`, `skills/systems`. Rules: ownership/pooling/economy. Skills: catalog in G2. Agents: implementer/reviewer. Harness: compile/tests/diff. Tests: scaffold/domain fixtures. Evals: ownership/cross-domain routing. DoD: representative workflow passes without global overload. Dependencies: W3,W5. Risks: context growth/speculative breadth.
- **W8 — Third-party:** Objective: versioned integration knowledge. Tasks: add only detected common vendors. Files/folders: `skills/third-party`, `compatibility/third-party.json`. Rules: dependency/provenance/lifetime. Skills: UniTask/DOTween/Addressables/LeanPool/Newtonsoft; conditional Odin/Firebase. Agents: package-maintainer. Harness: package resolution/compile. Tests: min/latest vendor fixtures. Evals: absent/old-version routing. DoD: no skill activates for absent dependency. Dependencies: W4,W5. Risks: vendor churn/license.
- **W9 — Hardening 0.1:** Objective: safe canary. Tasks: red-team/docs/pilot/release. Files/folders: docs, release config/artifacts. Rules: full P0 freeze. Skills: v0.1 set. Agents: reviewer/tester/package-maintainer. Harness: full lifecycle/matrix. Tests: all static/installer/Unity smoke. Evals: P0 100%, aggregate ≥90%. DoD: canary install/update/uninstall clean. Dependencies: W0–W8 required subset. Risks: pilot availability/regression.
- **W10 — Production 1.0:** Objective: studio production readiness. Tasks: expand matrix, migrations, SLO/ownership/rollout. Files/folders: compatibility, docs, changelog, signed release. Rules: stable full set. Skills: stable v1 catalog. Agents: all seven with owners. Harness: complete Unity/mobile/release matrix. Tests: minimum/latest and rollback. Evals: P0 100%, aggregate ≥95%. DoD: v1 criteria below all met. Dependencies: W9 + sustained package CI. Risks: maintenance capacity/ecosystem drift.

### Risk Assessment

| Risk | L | I | Score | Mitigation trước phase |
|---|---:|---:|---:|---|
| Installer overwrite user content | 4 | 5 | 20 | atomic writes, checksum ownership, golden tests |
| Scene/prefab/GUID corruption | 4 | 5 | 20 | Editor-first, block blind edit, ref validator |
| Package tag/version drift | 5 | 4 | 20 | commit capability matrix, release contract gate |
| False “tests passed” | 4 | 5 | 20 | evidence schema/completion markers |
| Runtime→Editor dependency | 3 | 5 | 15 | asmdef graph P0 gate |
| Missing package dependencies | 4 | 4 | 16 | manifest/asmdef/using cross-check |
| Secret/signing leakage | 3 | 5 | 15 | redaction/scan/least privilege |
| Stale API knowledge | 4 | 4 | 16 | verified commit + freshness CI |
| Context explosion/misrouting | 4 | 4 | 16 | preset/detection/token budgets/evals |
| Destructive Editor command | 3 | 5 | 15 | validate/dry-run/confirm allowlist |
| Addressables leak | 4 | 4 | 16 | ownership contract + PlayMode tests |
| Async/event lifecycle leak | 4 | 4 | 16 | cancellation/unsubscribe rules/tests |
| Mobile regression unseen on desktop | 4 | 4 | 16 | device tier budgets/profiling gates |
| Overfitting template quirks | 3 | 4 | 12 | generic→Dreamy override layering |
| Agent/tool contract drift | 3 | 4 | 12 | Codex capability checks + smoke eval |
| Unlicensed/proprietary fixture | 2 | 5 | 10 | provenance registry, no binary copy |
| CI Unity cost/flakiness | 4 | 3 | 12 | split static/Unity tiers, retry only infra |
| Eval grader nondeterminism | 3 | 3 | 9 | deterministic assertions + pinned rubric |

### Timeline

| Milestone | Waves | Effort | Exit |
|---|---|---:|---|
| Architecture truth | 0–1 | 2–3 weeks | schemas/CI/research gates |
| Safe Dreamy alpha | 2–5 | 4–6 weeks | `v0.1.0` canary |
| Production breadth | 6–8 | 3–5 weeks | mobile/gameplay/vendor coverage |
| Hardening | 9 | 1–2 weeks | internal beta |
| Production release | 10 | 2–3 weeks | `v1.0.0` |
| Total | critical path 0→1→2→3→4→5→9→10 | 12–19 weeks | team capacity dependent |

### v1.0 Definition of Done

- Routing: P0 eval 100%, aggregate ≥95%, false Dreamy package API claim = 0.
- Install: clean/global/project/update/uninstall/rollback matrix 100%; user-owned bytes preserved; no path traversal.
- Compatibility: tested Unity LTS matrix and every supported Dreamy commit/range; no unresolved P0 drift.
- Unity: serialization/scene/prefab/asmdef safety gates; compile + Edit/Play + package fixture evidence.
- Mobile: Android/iOS build validation, low-end CPU/GPU/GC/memory/battery/thermal budgets documented and exercised.
- Verification: all success claims carry machine artifact; MCP/no-MCP fallbacks tested.
- Operations: owner, release/rollback/SLO, security response, changelog/migration and docs complete.

### Decision trees

**Project vs package:** reusable across ≥2 games with stable policy-free API? → package; otherwise `Assets/_Project`. Depends on game content/SDK policy? → project. Adding to core? only primitive needed by multiple packages and games.

**Data:** authored/read-only/balance and remote override? → DataConfig. Player-specific and survives sessions? → Datasave. Derived/ephemeral/session state? → runtime memory; persist only source-of-truth fields.

**UI:** reusable panel/layer/tween primitive? → `com.dreamy.ui`; concrete screen/prefab/business flow → project. UIPanel presents/forwards intent; service/domain owns economy. Leaf receives dependencies/data; feature root may resolve.

**Assets:** shared loader need → Dreamy AssetLoader; caller declares lifetime/release. Addressable dynamic/remote → Addressables; small bootstrap legacy only → Resources fallback. Instance lifecycle (Destroy/pool) is separate from asset handle lifecycle.

**Service resolution:** create/register at GameInstaller/bootstrap/feature root. Presenter/high controller may resolve if boundary documented. UI item/projectile/VFX/pool leaf → explicit injection. Global lifecycle? unregister/dispose on owned teardown.

**Performance:** reproduce on target device → capture baseline/profile → rank hotspot → set budget → smallest measured change → same-scene/device comparison → keep only significant improvement. No profile → diagnostic instrumentation, not speculative rewrite.

**Bug fixing:** reproduce → capture log/stack/state → inspect caller/owner/lifecycle → test hypotheses → root cause → minimal fix → regression test → compile/console/diff. Cannot reproduce → state uncertainty, never random guard spam.

### Example workflows

| Workflow | Rules applied | Skills invoked | Agent | Harness | Verification |
|---|---|---|---|---|---|
| Add Shop | project/package, data split, service/UI/assets, economy atomicity | `dreamy-feature`, `system-shop-monetization`, `gameplay-economy-currency-reward`, `dreamy-dataconfig`, `dreamy-datasave`, `dreamy-ui`, `dreamy-assets` | implementer | compile, config/save/UI/Addressables adapters | compile clean; config valid; transaction/save/UI tests pass; scoped diff |
| Add Unit Upgrade | config/save/runtime split, deterministic economy, UI boundary | `dreamy-feature`, `gameplay-upgrades-skills`, `gameplay-economy-currency-reward`, `dreamy-dataconfig`, `dreamy-datasave`, `dreamy-ui` | implementer | compile, focused tests, save harness | formula tests, save roundtrip/migration, UI PlayMode pass |
| Fix NullReference in UI | root-cause-first, serialization/ref safety, minimal fix | `dreamy-debug`, `dreamy-ui`, `unity-scene-prefab` | debugger | console, prefab/component inspect, compile/test | repro removed, regression green, refs intact |
| Add reusable foundation service | project/package/core boundary, public API/compatibility | `dreamy-architecture`, `dreamy-package-maintainer`, `production-package-maintenance` | package-maintainer | package/consumer fixtures, API diff | package compile/tests, consumer green, semver rationale |
| Modify prefab/scene | serialization, meta/GUID, inspect-before-mutate | `unity-scene-prefab`, `unity-serialization` | unity-editor | MCP/Editor hierarchy/override/ref adapter, compile/console | before/after snapshot, no missing refs, scoped asset diff |
| Optimize mobile stutter | profile-before-optimize, frame/memory/thermal budget | `mobile-production`, `unity-profiling-memory`, `production-optimize-cpu`, `production-memory` | performance | device profiler/memory/frame capture | same-device baseline vs delta meets stated budget |
| Fix Android build | Android build/security/dependency/root-cause | `android-build-release`, `production-build-debug`, `dreamy-debug` | debugger | Unity build, Gradle/JDK/AGP logs, dependency tree | clean AAB smoke, exact tool versions and exit evidence |
| Upgrade Dreamy package | version compatibility, package direction, migration safety | `dreamy-package-maintainer`, `production-dependency-upgrade`, affected `dreamy-*` adapter | package-maintainer | detector dry-run, consumer compile/test matrix | min/latest consumers green, migration/changelog/rollback validated |

## Implementation Checklist

- [ ] Repository initialization: ownership, license, branch protection and `toolkit.json`.
- [ ] Freeze research snapshots and source/capability ledger.
- [ ] Resolve P0 Dreamy tag/version/dependency/runtime→Editor discrepancies upstream or mark unsupported.
- [ ] Add schemas for toolkit/modules/presets/profile/state/evidence/evals.
- [ ] Implement core/C#/Unity/Dreamy rule hierarchy and validators.
- [ ] Author concise core and Unity safety skills with reachable references.
- [ ] Author verified Dreamy architecture/package skills and `dreamy-feature` router.
- [ ] Add agent TOML contracts for implementer/debugger/reviewer/tester/editor; later performance/package roles.
- [ ] Implement presets and exact manifest/lock/asmdef detector.
- [ ] Implement atomic installer, managed AGENTS block, state, update, rollback and uninstall.
- [ ] Implement read-only doctor and toolkit/project/package validation.
- [ ] Implement compile, console, EditMode, PlayMode, build, Addressables, asmdef and git evidence adapters.
- [ ] Expose or request safe headless Dreamy Editor Tools APIs with dry-run/validate/execute separation.
- [ ] Build deterministic unit/integration/installer fixtures and initial architecture eval catalog.
- [ ] Add Android/iOS/mobile performance/build/release rules and skills.
- [ ] Add prioritized gameplay/systems skills; keep optional third-party skills version-gated.
- [ ] Run security red-team, context/routing benchmarks and clean-machine install lifecycle.
- [ ] Release `v0.1.0` to canary projects; collect false-route/failure telemetry without secrets.
- [ ] Expand tested Unity/Dreamy compatibility matrix and publish migrations.
- [ ] Meet routing, eval, installer, Unity/mobile verification, docs and operational gates.
- [ ] v1.0 internal production release: tag `v1.0.0` and roll out.
