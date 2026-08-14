# DREAMY CODEX TOOLKIT — GAP ANALYSIS & IMPLEMENTATION SPEC

> Mục tiêu của tài liệu này: biến trạng thái hiện tại của `dreamy-codex-toolkit` từ một toolkit có **taxonomy tốt nhưng nhiều rule/skill/agent còn mỏng** thành một toolkit production-grade, đủ rõ để một model nhỏ hơn vẫn có thể triển khai đúng mà không phải tự suy diễn kiến trúc.
>
> Tài liệu này **không yêu cầu tăng số lượng skill bằng mọi giá**. Ưu tiên chính là tăng **độ sâu, tính chuyên biệt, khả năng định tuyến, khả năng kiểm chứng và tính an toàn** của các thành phần đang có.
>
> Reference chính:
> - `tranvietanh0/oh-my-game-kit`
> - `XeldarAlz/everything-claude-unity`
> - `Nice-Wolf-Studio/unity-claude-skills`
> - `Dreamy-Game-Foundation/dreamy-template-project`
> - Các package trong `Dreamy-Game-Foundation`

---

# 0. TRIẾT LÝ CỐT LÕI

## 0.1. Không chọn giữa “ngắn” và “đầy đủ”

Kiến trúc mục tiêu:

```text
FULL REPOSITORY KNOWLEDGE
        ↓
SHORT ROUTING METADATA
        ↓
MEDIUM OPERATIONAL SKILL
        ↓
DEEP REFERENCES ON DEMAND
        ↓
HARNESS / TEST / EVAL
```

Nguyên tắc:

```text
AGENTS.md          = ngắn, chỉ invariant luôn đúng
rules/             = atomic nhưng đầy đủ
agents/*.toml      = role-specific, operational
skills/*/SKILL.md  = concise nhưng đủ để thực hiện task
references/*.md    = kiến thức sâu, API, pattern, gotcha, example
evals/             = kiểm tra hành vi của agent/skill
harness/           = kiểm tra project thật
```

Không đưa toàn bộ kiến thức vào `AGENTS.md`.

Không để `SKILL.md` chỉ là một template chung rồi thay title.

Không để `references/` thành nghĩa địa tài liệu không bao giờ được skill dẫn tới.

---

# 1. VẤN ĐỀ HIỆN TẠI CẦN SỬA

## 1.1. Rule taxonomy tốt nhưng rule body quá ngắn

Nhiều rule hiện mới đạt mức:

```text
invariant = đúng
chi tiết = thiếu
exception = thiếu
verification = thiếu
decision tree = thiếu
```

Ví dụ rule kiểu:

```text
Use DataConfig for static config.
Use Datasave for persistent state.
```

là đúng nhưng chưa đủ cho model nhỏ.

Model cần biết thêm:

```text
DataConfig:
- unit stat
- level definition
- shop offer definition
- upgrade cost
- reward table
- static tuning
- localization metadata

Datasave:
- coins
- gems
- inventory
- owned unit
- unit level
- claim state
- settings
- progression

Runtime-only:
- current HP
- current combat target
- temporary buff
- current match score
- cooldown đang chạy trong trận
```

## 1.2. Agent specialization chưa đồng đều

Một số agent tốt:

- package maintainer
- main developer/orchestrator

Một số agent còn quá generic:

- debugger
- code reviewer
- tester
- unity editor
- performance
- build

Vấn đề:

```text
role name khác
description khác
nhưng workflow body gần giống nhau
```

Mỗi agent phải có một “cách suy nghĩ bắt buộc” riêng.

## 1.3. Nhiều skill có catalog tốt nhưng domain knowledge còn mỏng

Đặc biệt:

- gameplay
- systems
- third-party
- production

Một `combat` skill phải có combat model.

Một `system-iap` skill phải có transaction model.

Một `thirdparty-unitask` skill phải có cancellation/lifetime model.

Nếu bỏ `name:` và `title`, vẫn phải đoán được skill đó thuộc domain nào.

## 1.4. Thiếu planner/architect agent rõ ràng

Cần bổ sung nhóm agent trước khi code:

```text
dreamy_plan
dreamy_architect
dreamy_task_decomposer
```

Không nhất thiết cần cả 3 ở bản đầu. Có thể bắt đầu bằng:

```text
dreamy_plan
dreamy_architect
```

và để `dreamy_plan` đảm nhiệm decomposition.

---

# 2. QUALITY BAR CHUNG

## 2.1. Test đơn giản cho mọi skill

Ẩn các phần:

```text
name
title
description
```

Sau đó đọc body.

Nếu body có thể dùng y nguyên cho 5 skill khác thì skill đó chưa đạt.

Ví dụ không đạt:

```text
Inspect code.
Find owner.
Make minimal changes.
Compile.
Test.
Report.
```

Vì workflow này dùng được cho:

- combat
- shop
- IAP
- movement
- save
- UI

Một skill đạt phải thêm:

```text
domain model
decision tree
common patterns
anti-patterns
failure modes
verification đặc thù domain
Dreamy integration
```

---

# 3. CẤU TRÚC MỤC TIÊU CỦA TOOLKIT

```text
dreamy-codex-toolkit/
├── AGENTS.md
├── README.md
├── toolkit.json
│
├── rules/
│   ├── core/
│   ├── csharp/
│   ├── unity/
│   ├── gameplay/
│   ├── mobile/
│   ├── production/
│   └── dreamy/
│
├── skills/
│   ├── core/
│   ├── unity/
│   ├── gameplay/
│   ├── systems/
│   ├── platform/
│   ├── production/
│   ├── third-party/
│   └── dreamy/
│
├── agents/
│   ├── dreamy_plan.toml
│   ├── dreamy_architect.toml
│   ├── dreamy_implementer.toml
│   ├── dreamy_debugger.toml
│   ├── dreamy_code_reviewer.toml
│   ├── dreamy_tester.toml
│   ├── dreamy_unity_editor.toml
│   ├── dreamy_performance_engineer.toml
│   ├── dreamy_build_engineer.toml
│   ├── dreamy_release_validator.toml
│   ├── dreamy_package_maintainer.toml
│   ├── dreamy_docs_manager.toml
│   └── dreamy_skill_author.toml
│
├── harness/
├── evals/
├── presets/
├── compatibility/
├── docs/
└── scripts/
```

---

# 4. AGENTS.MD — CẦN BỔ SUNG NHƯNG GIỮ NGẮN

Root `AGENTS.md` không nên biến thành documentation dump.

Mục tiêu khoảng 40–100 dòng.

## 4.1. Bổ sung các invariant sau

```text
1. Inspect before modify.
2. Follow existing architecture before introducing new patterns.
3. Prefer existing Dreamy package capabilities.
4. Reusable cross-game code belongs in a package/shared module.
5. Game-specific glue belongs in Assets/_Project.
6. DataConfig owns static designer-authored data.
7. Datasave owns mutable persistent player state.
8. Runtime-only session state stays runtime-owned.
9. ServiceLocator is allowed only at composition roots / feature roots /
   presenters / high-level controllers where existing Dreamy architecture uses it.
10. Leaf UI, projectiles, VFX, pooled items receive explicit dependencies.
11. Runtime assemblies must not reference Editor assemblies.
12. Preserve .meta GUIDs and Unity serialization.
13. Do not blindly text-edit scene/prefab YAML.
14. Treat Unity MCP/editor operations as stateful.
15. After C# edits: refresh/compile → Console → relevant tests.
16. Review git diff before success.
17. Do not claim unsupported Dreamy API availability.
18. Compatibility claims require compatibility registry or current package inspection.
19. Never perform broad destructive reimports or migrations by default.
20. If verification cannot run, state exact reason.
```

## 4.2. Không đưa vào AGENTS.md

Không đưa:

- full code style
- full Addressables tutorial
- full UI architecture guide
- full mobile profiling guide
- full IAP workflow
- full async patterns

Những thứ đó đi vào skill/reference.

---

# 5. RULES — CHUẨN MỚI

Mỗi rule cần chuyển sang cấu trúc:

```md
# Rule Name

## Invariant
Điều bắt buộc.

## Why
Giải thích ngắn.

## Applies To
Scope.

## Required
Checklist bắt buộc.

## Forbidden
Các hành vi không được làm.

## Decision Tree
Khi nào áp dụng hướng nào.

## Exceptions
Ngoại lệ hợp lệ.

## Dreamy Override
Nếu Dreamy có convention riêng.

## Verification
Cách xác nhận rule được giữ.

## Related
Rules / skills liên quan.
```

Không cần mọi section cho mọi rule, nhưng rule production-grade phải có ít nhất:

```text
Invariant
Required
Forbidden
Verification
```

---

# 6. RULE PRIORITY P0 — PHẢI MỞ RỘNG TRƯỚC

## 6.1. `serialization-safety`

### Bắt buộc bổ sung

Scope:

- MonoBehaviour
- ScriptableObject
- `[Serializable]`
- `SerializeReference`
- serialized private field
- prefab
- prefab variant
- scene
- nested prefab
- asmdef/type move
- namespace rename
- class rename
- field rename
- field type change
- `.meta`
- GUID

### Required rules

```text
- Preserve `.meta` whenever moving/renaming assets.
- Use FormerlySerializedAs for compatible serialized field rename.
- Do not assume a compile success means serialized data survived.
- Inspect prefab/scene references before replacing a component.
- Type changes require explicit migration strategy.
- Namespace/class moves require checking MonoScript references and serialized data.
- Do not manually regenerate GUID.
- Avoid delete-and-recreate of assets as a rename strategy.
- Treat ScriptableObject data as serialized production data.
```

### Decision tree

```text
Rename field?
→ type compatible?
  → yes: FormerlySerializedAs
  → no: explicit migration

Move script file?
→ preserve .meta

Rename namespace/class?
→ inspect serialized MonoScript/type references

Change nested serializable structure?
→ migration + fixture test

Scene/prefab mutation?
→ inspect references + overrides first
```

### Verification

```text
- compile
- Console
- missing script scan
- prefab/scene load
- serialized fixture if applicable
- git diff check for unexpected YAML/GUID changes
```

---

## 6.2. `scene-prefab-safe-mutation`

### Required inspection order

```text
1. Inspect hierarchy
2. Identify owner prefab
3. Check prefab variant/nested prefab
4. Check overrides
5. Check serialized references
6. Determine runtime owner
7. Mutate through Unity/MCP when possible
8. Save
9. Refresh
10. Re-open/verify
```

### Forbidden

```text
- blind YAML replacement
- modifying nested prefab instance as if it were local scene data
- applying all overrides globally without understanding ownership
- replacing component without checking serialized consumers
- broad scene rewrite for a one-object change
```

---

## 6.3. `service-resolution`

### Dreamy rule cần cụ thể hóa

Allowed:

```text
GameInstaller
Bootstrap
FeatureRoot
high-level presenter/controller
cross-scene composition root
```

Avoid:

```text
UI list item
projectile
VFX object
pooled currency item
small MonoBehaviour leaf
animation event receiver
```

Preferred flow:

```text
composition root
↓ resolve once
feature root
↓ explicit Initialize(...)
leaf object
```

### Anti-pattern

```csharp
void Start()
{
    var save = ServiceLocator.Get<IPlayerSave>();
}
```

trong mọi object nhỏ.

### Acceptable exception

Một singleton-like app service bridge có thể resolve một lần ở root nếu project hiện tại đã dùng pattern đó và việc thay đổi architecture lớn hơn scope task.

---

## 6.4. `data-ownership`

Bắt buộc có decision table:

| Data | Owner |
|---|---|
| Unit base damage | DataConfig |
| Upgrade cost table | DataConfig |
| Shop offer definition | DataConfig |
| Player coins | Datasave |
| Player gems | Datasave |
| Unit current level | Datasave |
| Claimed daily reward | Datasave |
| Current battle HP | Runtime |
| Temporary buff | Runtime |
| Current target | Runtime |
| Current menu tab | View/runtime UI state |

Anti-pattern:

```text
- Save balance values in Datasave.
- Put mutable currency into config.
- Use UI prefab as a data catalog.
- Store UnityEngine.Object reference directly in persistent save.
```

---

## 6.5. `async-lifetime`

Phải bổ sung:

```text
- Every async operation must have an owner.
- Owner destruction/deactivation must define cancellation semantics.
- Do not use async void except event/callback boundary.
- Observe exceptions.
- Avoid fire-and-forget without explicit `.Forget()` or equivalent observation.
- Do not continue mutating destroyed Unity objects after await.
- Cancellation should be treated as expected control flow where appropriate.
```

Decision tree:

```text
Operation tied to GameObject?
→ destroy cancellation

Operation tied to panel visibility?
→ visibility/close cancellation

Operation tied to app lifetime?
→ app-level token

Shared preload?
→ service-owned lifetime
```

---

## 6.6. `events-lifetime`

Phải có:

```text
subscribe ↔ unsubscribe symmetry

OnEnable ↔ OnDisable
Start/Awake ↔ OnDestroy
service registration ↔ service disposal

Avoid anonymous lambda subscription if later unsubscribe is required.
Avoid duplicate subscription after pooling/reactivation.
Avoid event bus holding dead listeners.
```

---

## 6.7. `assets-lifetime`

Phải có:

```text
Every async load has ownership.
Every retained Addressable handle has a release strategy.
Do not release an asset while consumers still use it.
Do not repeatedly load/release in hot loops.
Do not hide handle ownership inside leaf UI.
```

Dreamy override:

```text
Prefer com.dreamy.assets / AssetLoader when project has the package.
Project owns Addressables groups/profiles/build configuration.
Package owns reusable runtime loading helpers.
```

---

## 6.8. `project-package-boundary`

Decision tree:

```text
Is behavior reusable across multiple games?
→ candidate package

Does it encode current game's rules/content/UI?
→ project

Does it require another game-specific type?
→ project

Would package need dependency on current project?
→ reject

Is it foundational primitive used everywhere?
→ maybe Core, but Core must remain small

Is it optional domain behavior?
→ separate package, not Core
```

Anti-pattern:

```text
com.dreamy.core → com.dreamy.ui
package → Assets/_Project
runtime package → Editor assembly
```

---

## 6.9. `ui-ownership`

Phải quy định:

```text
View:
- bind references
- render state
- collect user intent
- play local visual transitions

Presenter/Controller/Service:
- business decision
- economy transaction
- save mutation
- navigation policy
- SDK/IAP/Ads operation
```

Anti-pattern:

```text
ShopPanel directly edits coins.
RewardButton directly writes JSON.
MergeCard calculates upgrade economy.
```

---

## 6.10. `pool-ownership`

Phải bổ sung:

```text
- Object must return to the same pool that created/owns it.
- Reset mutable runtime state before reuse.
- Cancel async/tween/event subscription on despawn.
- Do not Destroy pooled object as normal lifecycle.
- Pool only when reuse frequency/alloc cost justifies it.
- Do not pool tiny rare objects by default.
```

---

# 7. AGENT SYSTEM — BỔ SUNG ROLE MỚI

## 7.1. Naming

Nếu toolkit dùng prefix Dreamy, dùng:

```text
dreamy_plan
dreamy_architect
dreamy_implementer
```

Không nên thêm agent tên `omg-plan` trực tiếp vì đó là namespace của toolkit khác.

Có thể tham khảo hành vi `omg-*`, nhưng giữ ownership rõ:

```text
OMG concept
↓
Dreamy adaptation
↓
dreamy_plan
```

---

# 8. AGENT MỚI P0 — `dreamy_plan`

Đây là agent tương đương tinh thần của `omg-plan`.

## 8.1. Mission

```text
Turn an ambiguous or cross-domain request into a concrete,
repository-aware implementation plan before any code mutation.
```

## 8.2. Khi dùng

- feature mới
- refactor nhiều file
- thay đổi architecture
- thay package
- system mới
- migration
- build/release change
- task có từ 2 domain trở lên
- task có scene/prefab + code + data
- task có rủi ro serialization/save/package

## 8.3. Khi không dùng

- typo nhỏ
- một-line null guard
- user yêu cầu sửa chính xác một dòng đã rõ
- task documentation nhỏ

## 8.4. Mandatory workflow

```text
PHASE 1 — UNDERSTAND REQUEST
- desired behavior
- current behavior
- explicit constraints
- implied constraints
- non-goals

PHASE 2 — INSPECT PROJECT
- AGENTS
- manifest/lock
- asmdef
- related code
- prefabs/scenes
- data/save
- tests
- package capability
- recent architecture pattern

PHASE 3 — OWNERSHIP MAP
For each responsibility:
- config owner
- runtime owner
- persistence owner
- UI owner
- asset owner
- lifecycle owner

PHASE 4 — IMPACT MAP
List:
- files to add
- files to modify
- assets potentially touched
- packages touched
- tests touched
- risks

PHASE 5 — IMPLEMENTATION PLAN
Break into atomic steps.

Each step must contain:
- action
- exact owner
- expected file
- dependency
- verification

PHASE 6 — RISK REVIEW
Check:
- serialization
- save migration
- async lifetime
- pooled object state
- Addressables lifetime
- mobile performance
- build/platform
- package boundary

PHASE 7 — OUTPUT
Return a numbered plan with validation gates.
Do not modify code unless explicitly delegated.
```

## 8.5. Required output format

```md
# Goal

# Current Architecture

# Constraints

# Ownership Decisions

# Files / Assets Impacted

# Implementation Steps

1. ...
   - Owner:
   - Files:
   - Depends on:
   - Verification:

# Risks

# Tests

# Definition of Done
```

## 8.6. Critical rule

Planner không tự tạo architecture mới nếu project đã có owner.

Planner phải ưu tiên:

```text
existing implementation
→ existing package
→ existing pattern
→ extension
→ new abstraction last
```

---

# 9. AGENT MỚI P0 — `dreamy_architect`

## 9.1. Mission

Đánh giá và quyết định:

```text
ownership
dependency direction
package boundary
data boundary
service boundary
lifecycle boundary
runtime/editor split
```

## 9.2. Trigger

- “nên đặt class này ở đâu”
- “có nên tạo package”
- “nên ServiceLocator hay Initialize”
- “DataConfig hay Datasave”
- “UI có nên xử lý logic này”
- circular dependency
- package split
- feature decomposition

## 9.3. Workflow

```text
1. Inspect current architecture.
2. Build dependency graph.
3. Identify actual owner of state/behavior.
4. Check existing Dreamy package capability.
5. Evaluate minimal solution.
6. Reject unnecessary abstraction.
7. Define dependency direction.
8. Define lifecycle.
9. Define verification.
```

## 9.4. Output

```text
Decision
Why
Owner
Dependency Direction
Lifecycle
Rejected Alternatives
Migration/Impact
Verification
```

## 9.5. Hard rules

```text
- Do not introduce another DI framework by default.
- Do not move code into Core just because it is reusable once.
- Do not create interfaces only for style.
- Do not package game-specific rules.
- Do not let packages reference project code.
```

---

# 10. AGENT `dreamy_implementer`

Nếu hiện toolkit dùng `dreamy_unity_developer`, có hai lựa chọn:

### Option A
Giữ `dreamy_unity_developer` là implementer chính.

### Option B
Rename/alias logic thành `dreamy_implementer`.

Không nên để cả hai có responsibility giống nhau.

## Required workflow

```text
1. Read plan if present.
2. Re-inspect exact files.
3. Make smallest safe change.
4. Preserve architecture.
5. Preserve serialization.
6. Compile.
7. Read console.
8. Run targeted tests.
9. Review diff.
10. Report exact files and evidence.
```

---

# 11. AGENT `dreamy_debugger` — PHẢI VIẾT LẠI SÂU

## Mission

```text
Find evidenced root cause before changing behavior.
```

## Debug phases

### Phase 1 — Triage

Classify:

```text
compile
runtime exception
wrong behavior
Editor
scene/prefab
save/data
async/lifecycle
pooling
Addressables
package
Android
iOS
CI/build
performance
```

### Phase 2 — Reproduce

Establish:

```text
expected
actual
steps
frequency
first bad version/state
affected platform
```

### Phase 3 — Evidence

Inspect:

```text
stack trace
console
recent diff
call chain
state owner
serialized refs
manifest/lock
package version
async owner
event subscriptions
pool lifecycle
```

### Phase 4 — Hypotheses

Rules:

```text
- rank hypotheses
- test cheapest/highest evidence hypothesis first
- do not apply 5 speculative changes simultaneously
- distinguish symptom from cause
```

### Phase 5 — Root cause

Output:

```text
first incorrect state
owner responsible
why it can occur
why current protection failed
```

### Phase 6 — Fix

```text
smallest safe fix
no opportunistic refactor
```

### Phase 7 — Verify

```text
original reproduction
compile
console
targeted test
diff
```

---

# 12. AGENT `dreamy_code_reviewer` — PHẢI CÓ 2 PASS

## Pass 1 — Correctness

Review:

```text
functional correctness
null
state transition
data ownership
save mutation
transaction
async
event lifecycle
pooling
serialization
Addressables
platform behavior
```

## Pass 2 — Architecture & maintainability

Review:

```text
dependency direction
package boundary
UI/domain separation
service lookup
duplication
public API
testability
performance risk
```

## Severity

```text
P0 BLOCKER
- data loss
- broken serialization
- package dependency violation
- build failure
- severe security/store issue

P1 BUG
- wrong behavior
- duplicate reward/purchase
- memory/resource leak
- lifecycle leak
- race condition

P2 RISK
- architecture drift
- performance risk
- missing migration
- missing regression protection

P3 MAINTAINABILITY
- naming
- duplication
- local readability
```

## Output

Findings first:

```text
[P1] Title
Location:
Evidence:
Impact:
Fix:
```

Không mở đầu bằng summary dài.

Nếu không có finding:

```text
No blocking findings.
Residual risks:
...
```

---

# 13. AGENT `dreamy_tester` — BỔ SUNG TEST LADDER

## Mission

Chọn tầng test thấp nhất nhưng đủ chứng minh behavior.

## Test ladder

```text
1. Pure C# unit
2. EditMode
3. PlayMode
4. Editor integration
5. Build validation
6. Device validation
```

## Decision tree

```text
Pure calculation/state machine?
→ unit/EditMode

MonoBehaviour lifecycle?
→ PlayMode

Serialization/prefab?
→ EditMode + prefab fixture

Addressables runtime?
→ PlayMode/integration

Android-specific?
→ build/device

Package API?
→ package test assembly
```

## Must cover

```text
happy path
boundary
invalid state
duplicate call
re-entry
cancel
load/save
migration where relevant
```

---

# 14. AGENT `dreamy_unity_editor` — BỔ SUNG STATEFUL WORKFLOW

## Mission

Thực hiện scene/prefab/asset/editor mutation an toàn.

## Required workflow

```text
Inspect state
↓
Identify asset owner
↓
Check prefab context
↓
Check overrides
↓
Perform narrow mutation
↓
Save target asset
↓
Refresh
↓
Compile if scripts changed
↓
Console
↓
Re-open/read state
```

## Hard prohibitions

```text
- broad reimport
- delete meta
- blind YAML edit
- apply all prefab overrides blindly
- kill Unity to unlock project without explicit reason
```

---

# 15. AGENT `dreamy_performance_engineer`

## Mission

Không “optimize code”, mà tìm measured bottleneck.

## Workflow

```text
1. Define target budget.
2. Reproduce on representative hardware.
3. Capture profiler evidence.
4. Determine CPU/GPU/GC/memory/IO/battery/thermal class.
5. Identify top contributor.
6. Make one focused optimization.
7. Measure again.
8. Compare before/after.
```

## Mobile budget categories

```text
CPU main thread
render thread
GPU
GC alloc/frame
managed heap
native memory
texture memory
audio memory
Addressables bundles
draw calls
overdraw
physics
UI rebuild
loading
thermal
battery
```

## Forbidden

```text
- optimize based only on intuition
- rewrite architecture before profiling
- replace all LINQ globally
- pool everything
- cache everything forever
```

---

# 16. AGENT `dreamy_build_engineer`

## Scope

```text
Unity player build
Android Gradle
iOS Xcode
CI
IL2CPP
SDK conflicts
manifest
Proguard/R8
target SDK
signing
dependency resolution
```

## Triage flow

```text
Build fails before Unity compile?
→ C#/asmdef

Unity build pipeline fails?
→ PlayerSettings/package/editor build script

Gradle dependency?
→ manifest/EDM4U/gradle deps

R8?
→ keep rules/library compatibility

Android manifest?
→ merged manifest

iOS?
→ Pods/Xcode/framework capability

CI only?
→ environment/toolchain/path/case/credentials
```

## Rule

Không nâng hàng loạt package version chỉ để “thử”.

---

# 17. AGENT MỚI P1 — `dreamy_migration_engineer`

Nên thêm nếu toolkit xử lý package/save/version upgrade thường xuyên.

## Scope

```text
save schema
package API
Unity version
namespace/type rename
serialized asset migration
dependency version
```

## Workflow

```text
old state
→ compatibility risk
→ migration path
→ reversible backup where possible
→ fixture
→ execute
→ validate
```

---

# 18. AGENT MỚI P1 — `dreamy_feature_orchestrator`

Có thể không cần nếu `dreamy-feature` skill + main developer đã đủ.

Nếu thêm agent, role phải rõ:

```text
cross-domain feature coordination
```

Nó không tự code mọi thứ.

Nó:

```text
plan
route
coordinate domains
validate final integration
```

---

# 19. AGENT KHÔNG NÊN THÊM NGAY

Tránh tạo sớm:

```text
dreamy_ui_agent
dreamy_audio_agent
dreamy_vfx_agent
dreamy_save_agent
dreamy_addressables_agent
```

Những thứ này nên là **skills**, không phải agent, trừ khi sau này workflow thật sự khác hẳn.

Agent dành cho **mode of work**.

Skill dành cho **domain knowledge**.

---

# 20. SKILL TEMPLATE CHUẨN MỚI

```md
---
name: skill-name
description: Clear trigger + scope + boundary.
---

# Purpose

# When To Use

# When Not To Use

# Domain Model

# Required Inspection

# Decision Tree

# Workflow

# Architecture Rules

# Common Patterns

# Anti-patterns

# Failure Modes

# Verification

# Dreamy Integration

# References
```

Không bắt buộc mọi skill có toàn bộ section, nhưng P0/P1 production skills nên có gần đủ.

---

# 21. `dreamy-feature` — CẦN NÂNG LÊN ORCHESTRATOR THẬT

Bổ sung feature routing matrix:

```text
Feature request
↓
Does reusable capability already exist?
├─ yes → use package
└─ no
   ↓
Project-specific?
├─ yes → _Project
└─ reusable → package candidate
```

Data routing:

```text
static definition → DataConfig
persistent player state → Datasave
session state → runtime
```

Service routing:

```text
cross-scene → app/composition root
feature-wide → feature service/root
leaf → explicit dependency
```

UI routing:

```text
view → intent/state render
presenter/controller/service → business
```

Asset routing:

```text
dynamic/shared → Dreamy AssetLoader where available
local scene ref → serialized reference if lifecycle simple
```

## Bổ sung workflow examples

### Shop

```text
Offer definition → DataConfig
Currency → Datasave
Purchase operation → ShopService/EconomyService
UI → ShopPanel
Feedback → Dreamy Feedback/Audio
Persistence → after successful transaction
Analytics → after confirmed result
```

### Unit upgrade

```text
Upgrade curve → DataConfig
owned card count → Datasave
unit level → Datasave
upgrade transaction → service
card UI → view only
```

---

# 22. `dreamy-core`

Cần thêm references:

```text
references/service-locator.md
references/event-bus.md
references/state-machine.md
references/app-lifecycle.md
references/tick-service.md
```

## ServiceLocator

Có:

```text
where allowed
where forbidden
registration timing
duplicate registration behavior
lifetime
test strategy
```

## EventBus

Có:

```text
event definition
ownership
subscribe/unsubscribe
cross-feature use
when direct call is better
avoid event soup
```

## StateMachine

Có:

```text
mutually exclusive state
transition guard
entry/exit
avoid using state machine for simple booleans
```

---

# 23. `dreamy-dataconfig`

Bổ sung:

```text
schema ownership
validation
missing config behavior
default/fallback
remote fallback if supported
key stability
authoring workflow
runtime read-only contract
```

Anti-pattern:

```text
- mutate config as player state
- load JSON repeatedly from UI
- make each panel parse config independently
```

---

# 24. `dreamy-datasave`

Bổ sung:

```text
save envelope
version
data version
stable ID
migration
backup
corruption recovery
save timing
transaction persistence
device reset semantics
encryption/tamper limits
future version behavior
```

Critical scenarios:

```text
first install
normal load
missing file
corrupt primary + valid backup
old version
future version
migration failure
app pause during transaction
duplicate save calls
```

---

# 25. `dreamy-assets`

Bổ sung:

```text
load ownership
cache policy
in-flight deduplication
release
scene asset
prefab instantiation
sprite atlas
Resources fallback
failure
cancellation
warmup
```

Decision tree:

```text
static scene-only ref?
→ serialized ref may be simpler

runtime dynamic asset?
→ AssetLoader/Addressables

frequent pooled prefab?
→ load once + pool

large optional remote content?
→ remote Addressables policy
```

---

# 26. `dreamy-ui`

Bổ sung:

```text
Screen
Popup
Overlay
panel lifecycle
back handling
navigation ownership
cache
transition
tab system
presenter split
state render
input binding
```

Critical rules:

```text
UI does not own economy.
UI does not parse save JSON.
UI does not perform raw Addressables policy.
UI should tolerate being reopened.
UI event subscriptions must be symmetric.
```

---

# 27. GAMEPLAY SKILLS — ƯU TIÊN NÂNG DEPTH

## 27.1. `combat`

### Domain model

```text
AttackIntent
AttackDefinition
AttackRuntime
HitDetection
DamageRequest
DamageCalculation
Health
Death
Feedback
```

### Flow

```text
Input/AI
↓
Attack Intent
↓
Attack State
↓
Hit Detection
↓
Damage Request
↓
Damage Calculation
↓
Health Mutation
↓
Death / State Change
↓
Feedback Event
```

### Decisions

```text
hitscan → ray/query
projectile → projectile owns travel, damage system owns policy
AoE → query targets then damage requests
melee → hitbox/window
DoT → timed effect/state owner
```

### Anti-patterns

```text
VFX directly kills target.
Animation event owns final game rule.
Projectile looks up all services globally.
UI health bar owns health.
```

---

## 27.2. `projectile`

Bổ sung:

```text
spawn
initialization
owner/source
target
movement model
collision
hit policy
pierce
bounce
lifetime
pooling
despawn
async/tween cleanup
```

Mandatory reset for pooled projectile:

```text
velocity
target
owner
hit list
timers
trail
particle
collision state
subscriptions
cancellation
```

---

## 27.3. `movement`

Bổ sung:

```text
input intent
movement authority
physics vs transform
grounding
acceleration
rotation
root motion
nav
camera-relative input
mobile joystick
```

---

## 27.4. `enemy-ai`

Bổ sung:

```text
sense
decision
target selection
state
action
navigation
cooldown
fallback
death/disable
```

Không để AI state nằm rải ở Animator + NavMeshAgent + MonoBehaviour booleans mà không có owner rõ.

---

# 28. SYSTEM SKILLS — PHẢI THÊM DOMAIN MODEL

## 28.1. `system-shop`

Flow:

```text
OfferDefinition(DataConfig)
↓
ShopService
↓
Eligibility
↓
Price
↓
Transaction
↓
Grant
↓
Persist
↓
UI refresh
↓
Analytics
```

Rules:

```text
UI never grants directly.
Grant must be idempotent where external transactions exist.
Currency deduction + reward grant should be one logical transaction.
```

---

## 28.2. `system-iap`

### Mandatory domain model

```text
Product Definition
↓
Store Product
↓
Purchase Request
↓
Store Result
↓
Transaction ID / Receipt
↓
Duplicate Check
↓
Validation Policy
↓
Grant
↓
Persist
↓
Analytics
```

### Critical rules

```text
- Never grant twice for same transaction.
- UI is not source of truth.
- Callback may occur more than once.
- Product not available must be handled.
- Pending purchase is not successful grant.
- Restore flow differs by product type.
- Receipt policy must be explicit.
```

### References

```text
references/unity-iap.md
references/android-purchase.md
references/ios-purchase.md
references/idempotency.md
references/restore.md
```

---

## 28.3. `system-ads`

Bổ sung:

```text
initialization
load
availability
show
reward callback
duplicate callback
placement
cooldown
frequency cap
interstitial gate
rewarded transaction
app pause/resume
consent
mediation
```

Critical rewarded flow:

```text
request show
↓
ad available?
↓
show
↓
verified reward callback
↓
idempotent reward grant
↓
persist
↓
analytics
```

---

## 28.4. `system-gacha`

Bổ sung:

```text
pool definition
weight
rarity
roll
pity
guarantee
duplicate conversion
grant
persist
presentation
analytics
```

Rule:

Presentation animation không phải source of truth của reward result.

---

## 28.5. `system-daily-reward`

Bổ sung:

```text
time source
claim window
day index
streak
timezone
offline clock
server authority if available
duplicate claim
reset
```

---

# 29. THIRD-PARTY SKILLS

## 29.1. `thirdparty-unitask`

Main `SKILL.md` nên có:

```text
UniTask
UniTaskVoid
Forget
CancellationToken
GetCancellationTokenOnDestroy
WhenAll
PlayerLoopTiming
exception observation
```

References:

```text
references/cancellation.md
references/fire-and-forget.md
references/player-loop.md
references/unity-lifecycle.md
```

Critical rules:

```text
- async void only callback/event boundary.
- fire-and-forget must observe errors.
- object-tied tasks cancel on destroy.
- panel-tied tasks cancel when panel lifetime ends if required.
```

---

## 29.2. `thirdparty-dotween`

Bổ sung:

```text
tween ownership
Kill
SetLink
reuse
sequence lifecycle
OnComplete
pooled UI/item lifecycle
```

Anti-pattern:

```text
pooled object keeps old tween after despawn
OnComplete mutates destroyed object
multiple Show() creates stacked tweens
```

---

## 29.3. `thirdparty-addressables`

Nếu giữ cả generic Unity Addressables và Dreamy Assets:

```text
unity-addressables
= generic Addressables knowledge

dreamy-assets
= Dreamy-specific wrapper/ownership

thirdparty-addressables
= có thể bỏ hoặc merge nếu duplicate
```

Không nên có ba skill cùng nói một thứ.

---

# 30. PRODUCTION SKILLS

## `production-code-review`

Có thể route trực tiếp sang `dreamy_code_reviewer`.

Skill giữ:

```text
review checklist
Dreamy-specific risks
severity
output format
```

Agent giữ:

```text
review behavior/workflow
```

## `production-release`

Bổ sung:

```text
version
build settings
symbols
signing
target SDK
store requirements
Addressables content
remote config
analytics
IAP
ads
privacy
crash SDK
smoke test
rollback
```

---

# 31. REFERENCES ARCHITECTURE

Mỗi skill quan trọng có thể dùng:

```text
skill/
├── SKILL.md
└── references/
    ├── architecture.md
    ├── patterns.md
    ├── anti-patterns.md
    ├── troubleshooting.md
    └── examples.md
```

Không phải skill nào cũng cần đủ 5 file.

## Quy tắc

`SKILL.md` phải chỉ rõ:

```text
Read references/troubleshooting.md when:
- runtime failure
- common fix does not explain issue

Read references/examples.md when:
- implementing a new feature
```

Tránh:

```text
References:
- references/a.md
- references/b.md
- references/c.md
```

mà không nói lúc nào cần đọc.

---

# 32. DESCRIPTION QUALITY

Description phải giúp implicit routing.

Không dùng:

```yaml
description: Use for combat.
```

Nên:

```yaml
description: >
  Implement or review Unity combat involving attacks, hit detection,
  damage, health, death, knockback, combat state, or combat feedback.
  Use for melee, projectile, hitscan, AoE, damage-over-time, or combat
  lifecycle tasks. Do not use for pure visual VFX with no combat behavior.
```

Model nhỏ cần trigger rõ.

---

# 33. PRESET STRATEGY

Không load toàn bộ.

## `core`

```text
planning
debug
review
testing
git
engineering rules
```

## `unity-minimal`

```text
core
unity-foundations
unity-serialization
unity-editor
unity-testing
```

## `unity-production`

```text
unity-minimal
ui
rendering
audio
animation
input
physics
profiling
mobile
build
```

## `dreamy-project`

```text
unity-production
dreamy-base
dreamy-core
dreamy-dataconfig
dreamy-datasave
dreamy-assets
dreamy-ui
dreamy-audio
dreamy-feedback
dreamy-localization
dreamy-feature
```

## `dreamy-package`

```text
core
unity-minimal
package-maintainer
dreamy-core
relevant package skill only
```

---

# 34. TOOLKIT AUTO-DETECTION

Installer/doctor đọc:

```text
Packages/manifest.json
Packages/packages-lock.json
ProjectVersion.txt
```

Detect:

```text
com.dreamy.core
com.dreamy.datasave
com.dreamy.dataconfig
com.dreamy.assets
com.dreamy.ui
com.dreamy.audio
com.dreamy.feedback
com.dreamy.localization
com.dreamy.editor-tools
UniTask
DOTween
Addressables
LeanPool
Odin
```

Then generate:

```json
{
  "unity": "6000.x",
  "dreamyPackages": {
    "core": true,
    "datasave": true,
    "ui": true
  },
  "thirdParty": {
    "unitask": true,
    "dotween": true
  }
}
```

Chỉ install/activate relevant skills.

---

# 35. HARNESS — CẦN ĐỦ ĐỂ AGENT KHÔNG “TỰ TIN SUÔNG”

Target commands:

```text
harness unity compile
harness unity console
harness unity test editmode
harness unity test playmode
harness unity build android
harness unity build ios
harness project inspect
harness project asmdef-check
harness project package-check
harness git diff
harness git status
```

## Verification ladder

Sau C# edit:

```text
refresh
→ compile
→ console
→ targeted tests
→ diff
```

Scene/prefab:

```text
inspect
→ mutate
→ save
→ reopen
→ console
→ relevant play test
```

---

# 36. EVALS — MODEL NHỎ PHẢI BỊ KIỂM TRA

## P0 eval cases

### Eval 1

Prompt:

```text
Store player coins in DataConfig.
```

Expected:

```text
reject
route persistent currency to Datasave
```

### Eval 2

```text
Parse shop JSON directly inside ShopPanel.
```

Expected:

```text
reject UI ownership
use DataConfig/service
```

### Eval 3

```text
Use ServiceLocator.Get in each projectile.
```

Expected:

```text
reject leaf lookup
inject dependency at spawn/init
```

### Eval 4

```text
Rename serialized field without migration.
```

Expected:

```text
FormerlySerializedAs / migration
```

### Eval 5

```text
Destroy pooled projectile on hit.
```

Expected:

```text
return to pool + reset lifecycle
```

### Eval 6

```text
Fix stutter by pooling every UI object.
```

Expected:

```text
profile first
```

### Eval 7

```text
Move shop behavior into com.dreamy.core.
```

Expected:

```text
reject Core ownership
```

### Eval 8

```text
Grant rewarded ad reward when Show() returns success.
```

Expected:

```text
grant only on verified reward callback
```

### Eval 9

```text
IAP callback fires twice.
```

Expected:

```text
transaction id/idempotency prevents double grant
```

### Eval 10

```text
Addressable asset is released immediately after returning Result.
```

Expected:

```text
lifetime violation
```

---

# 37. STATIC QUALITY VALIDATOR

Validator nên detect:

```text
skill without name/description
duplicate skill name
generic description
broken reference path
skill > configured size threshold warning
rule missing invariant
rule missing verification for P0
agent with near-duplicate instruction body
invalid toolkit index
preset references missing skill
compatibility entry without source commit
```

Optional:

```text
similarity check
```

Nếu hai agent instruction similarity > 80%:

```text
warning: likely generic role duplication
```

Đây là cách khá hữu ích để chặn tình trạng “11 agent nhưng thực ra 3 agent copy”.

---

# 38. DOCS CẦN BỔ SUNG

```text
docs/
├── architecture.md
├── agent-authoring.md
├── skill-authoring.md
├── rule-authoring.md
├── reference-authoring.md
├── eval-authoring.md
├── harness.md
├── compatibility.md
├── presets.md
└── contribution.md
```

---

# 39. `agent-authoring.md`

Phải giải thích:

```text
Agent = mode of work
Skill = domain knowledge
Rule = invariant
Harness = evidence
Eval = behavior test
```

Agent quality checklist:

```text
[ ] unique mission
[ ] unique workflow
[ ] unique stopping condition
[ ] explicit output
[ ] explicit safety boundary
[ ] exact verification
[ ] not duplicate another agent
```

---

# 40. `skill-authoring.md`

Checklist:

```text
[ ] description có trigger rõ
[ ] when-not-to-use rõ
[ ] domain model
[ ] decision tree thật sự domain-specific
[ ] anti-pattern
[ ] verification
[ ] Dreamy override nếu cần
[ ] references chỉ khi cần
[ ] không duplicate rule
```

---

# 41. `rule-authoring.md`

Rule phải:

```text
atomic
testable
short enough to understand
complete enough to avoid guessing
```

Không nên:

```text
one sentence slogan
```

cũng không nên:

```text
300-line tutorial
```

---

# 42. LỘ TRÌNH TRIỂN KHAI ĐỀ XUẤT

## Wave 1 — Agent specialization

Implement/rewrite:

```text
dreamy_plan
dreamy_architect
dreamy_debugger
dreamy_code_reviewer
dreamy_tester
dreamy_unity_editor
dreamy_performance_engineer
dreamy_build_engineer
```

### DoD

```text
- each agent has unique workflow
- output schema
- verification rules
- no obvious duplicated body
- eval coverage
```

---

## Wave 2 — Rule depth

Prioritize:

```text
serialization-safety
scene-prefab-safe-mutation
service-resolution
data-ownership
async-lifetime
events-lifetime
assets-lifetime
project-package-boundary
ui-ownership
pool-ownership
```

### DoD

Each has:

```text
Invariant
Required
Forbidden
Decision/Exception
Verification
```

---

## Wave 3 — Dreamy P0 skill depth

```text
dreamy-feature
dreamy-core
dreamy-dataconfig
dreamy-datasave
dreamy-assets
dreamy-ui
dreamy-audio
dreamy-feedback
dreamy-localization
```

---

## Wave 4 — Gameplay domain depth

```text
combat
projectile
movement
player-controller
enemy-ai
health-damage
game-state
spawn-wave
inventory
progression
```

---

## Wave 5 — F2P systems

```text
shop
iap
ads
gacha
daily reward
battle pass
analytics
remote config
```

---

## Wave 6 — Third-party

```text
unitask
dotween
addressables
newtonsoft
leanpool
odin
```

Chỉ giữ nếu package thực sự được dùng.

---

## Wave 7 — Harness

```text
compile
console
tests
build
project inspect
asmdef
manifest
diff
```

---

## Wave 8 — Evals

Tối thiểu:

```text
10 architecture
10 Unity safety
10 Dreamy ownership
10 production
10 mobile/F2P
```

---

# 43. P0/P1/P2 PRIORITY

## P0

```text
dreamy_plan
dreamy_architect
debugger rewrite
reviewer rewrite
tester rewrite

serialization
scene/prefab
data ownership
service resolution
async lifetime
assets lifetime

dreamy-feature
dreamy-datasave
dreamy-dataconfig
dreamy-ui
dreamy-assets
```

## P1

```text
combat
projectile
movement
shop
iap
ads
gacha
unitask
dotween
performance
build
```

## P2

```text
advanced rendering
advanced animation
advanced networking
DOTS
rare third-party integrations
```

---

# 44. FILE-SPEC CHO MODEL NHỎ

Khi giao model nhỏ code một skill/rule/agent, prompt phải chứa:

```text
Target file:
Existing owner:
Reference files:
Required sections:
Required decisions:
Forbidden behaviors:
Verification:
DoD:
```

Ví dụ:

```text
Task:
Rewrite agents/dreamy_debugger.toml.

Must add:
- triage classification
- reproduction phase
- evidence phase
- ranked hypotheses
- root cause phase
- minimal fix rule
- verification phase
- exact output schema

Must not:
- duplicate developer agent
- tell user generic debugging advice
- claim root cause without evidence

Verify:
- toolkit validation
- agent eval fixture
- diff review
```

---

# 45. TEMPLATE `dreamy_plan.toml`

```toml
name = "dreamy_plan"
description = """
Plan non-trivial Dreamy Unity work before implementation. Use for new
features, cross-domain changes, refactors, migrations, package changes,
scene/prefab plus code work, or tasks with meaningful architecture risk.
"""

developer_instructions = """
MISSION

Turn a request into a repository-aware implementation plan.
Do not mutate code unless the task explicitly delegates implementation.

1. UNDERSTAND

Extract:
- desired behavior
- current behavior when known
- explicit constraints
- implied architecture constraints
- non-goals

2. INSPECT

Read:
- applicable AGENTS.md
- relevant project code
- Packages/manifest.json and packages-lock.json
- relevant asmdefs
- scenes/prefabs/assets when involved
- related tests
- Dreamy compatibility data before package API claims

3. MAP OWNERSHIP

For every responsibility identify:
- static config owner
- persistent state owner
- runtime state owner
- business logic owner
- UI owner
- asset owner
- lifecycle owner

4. CHECK EXISTING CAPABILITY

Prefer in order:
- existing project implementation
- existing Dreamy package capability
- extension of existing owner
- new local component/service
- new abstraction/package only when justified

5. BUILD IMPACT MAP

List:
- files to add
- files to edit
- scenes/prefabs/assets at risk
- packages affected
- tests affected
- serialization/save/build risks

6. PLAN

Create atomic implementation steps.
Every step must state:
- action
- owner
- expected files
- dependency
- verification

7. REVIEW RISKS

Explicitly consider:
- serialization
- save migration
- async lifetime
- events
- pooling
- Addressables lifetime
- mobile performance
- package boundary
- build/platform impact

OUTPUT

# Goal
# Current Architecture
# Constraints
# Ownership Decisions
# Impacted Files / Assets
# Implementation Steps
# Risks
# Tests
# Definition of Done
"""
```

---

# 46. TEMPLATE `dreamy_architect.toml`

```toml
name = "dreamy_architect"
description = """
Decide ownership, dependency direction, package boundaries, data placement,
service resolution, lifecycle, and runtime/editor architecture for Dreamy Unity.
"""

developer_instructions = """
MISSION

Make the smallest architecture decision that fits the existing Dreamy project.

WORKFLOW

1. Inspect existing code and instructions.
2. Identify the current owner of data and behavior.
3. Build the dependency direction.
4. Check existing Dreamy package capability.
5. Decide project vs package.
6. Decide DataConfig vs Datasave vs runtime state.
7. Decide composition-root service resolution vs explicit leaf dependency.
8. Define lifecycle and cleanup.
9. Evaluate alternatives.
10. Return one preferred decision and explain rejected alternatives.

HARD RULES

- Do not add a new DI framework by default.
- Do not move feature logic into Core without foundation-level justification.
- Do not create package -> project dependencies.
- Do not let Runtime assemblies depend on Editor.
- Do not create interfaces only to satisfy a pattern.
- Prefer current project conventions over architecture replacement.

OUTPUT

Decision:
Owner:
Dependency direction:
Lifecycle:
Data ownership:
Why:
Rejected alternatives:
Migration/impact:
Verification:
"""
```

---

# 47. TEMPLATE `dreamy_debugger.toml`

```toml
name = "dreamy_debugger"
description = """
Root-cause Unity, Dreamy package, runtime, Editor, lifecycle, data, build,
and integration bugs using evidence-driven diagnosis.
"""

developer_instructions = """
MISSION

Find the evidenced root cause before changing behavior.

PHASE 1 — TRIAGE

Classify the failure:
compile, runtime, Editor, scene/prefab, data/save, async/lifecycle,
pooling, Addressables, package integration, Android/iOS build, CI, performance.

PHASE 2 — REPRODUCE

Record:
expected behavior
actual behavior
reproduction steps
frequency
platform
first known bad state/version when available

PHASE 3 — COLLECT EVIDENCE

Inspect only relevant evidence:
console
stack trace
recent diff
call chain
state owner
serialized references
manifest/lock
package version
event subscriptions
async owner
pool lifecycle

PHASE 4 — HYPOTHESES

Rank likely causes by evidence.
Test the cheapest high-confidence hypothesis first.
Never apply multiple speculative fixes simultaneously.

PHASE 5 — ROOT CAUSE

Identify:
the first incorrect state,
the responsible owner,
why the current implementation allows it.

PHASE 6 — FIX

Make the smallest architecture-consistent fix.
Avoid unrelated refactors.

PHASE 7 — VERIFY

Re-run the original reproduction.
Then run the smallest applicable:
compile
console
targeted test
scene/prefab validation
build/device validation
diff review

OUTPUT

Root cause:
Evidence:
Change:
Verification:
Remaining risk:
"""
```

---

# 48. TEMPLATE `dreamy_code_reviewer.toml`

```toml
name = "dreamy_code_reviewer"
description = """
Review Dreamy Unity changes for correctness, architecture, serialization,
lifecycle, data ownership, package boundaries, mobile risk, and regressions.
"""

developer_instructions = """
MISSION

Find concrete defects and meaningful risks. Findings first.

PASS 1 — CORRECTNESS

Check:
functional behavior
state transitions
null/invalid state
data/save mutation
transactions
async cancellation
event cleanup
pool reset
serialization
asset lifetime
platform behavior

PASS 2 — ARCHITECTURE

Check:
project/package ownership
dependency direction
Runtime/Editor boundary
DataConfig/Datasave/runtime ownership
ServiceLocator usage
UI/business separation
public API compatibility
test coverage
performance risk

SEVERITY

P0 BLOCKER:
data loss, serialization break, build failure, invalid package dependency,
critical release/security/store problem

P1 BUG:
wrong behavior, duplicate reward/purchase, lifecycle/resource leak,
race condition, deterministic crash

P2 RISK:
architecture drift, migration risk, performance risk,
missing regression protection

P3 MAINTAINABILITY:
naming, local duplication, readability

OUTPUT

List findings first:

[P1] Title
Location:
Evidence:
Impact:
Recommended fix:

Then:
Residual risks:
Verification gaps:

Do not report style-only issues unless they meaningfully affect maintenance.
"""
```

---

# 49. DEFINITION OF DONE — TOOLKIT V1 QUALITY

Một skill P0 chỉ được coi là complete khi:

```text
[ ] trigger rõ
[ ] when-not-to-use rõ
[ ] domain model
[ ] decision tree
[ ] specific workflow
[ ] anti-pattern
[ ] common failure
[ ] Dreamy integration
[ ] verification
[ ] references có mục đích rõ
[ ] ít nhất 1 eval
```

Một agent chỉ complete khi:

```text
[ ] mission khác rõ agent khác
[ ] workflow riêng
[ ] input inspection riêng
[ ] stopping condition
[ ] output schema
[ ] verification
[ ] safety/forbidden
[ ] eval
[ ] similarity với agent khác hợp lý
```

Một rule chỉ complete khi:

```text
[ ] invariant
[ ] required
[ ] forbidden
[ ] decision/exception nếu cần
[ ] verification
[ ] không duplicate skill tutorial
```

---

# 50. FINAL IMPLEMENTATION ORDER

Không tăng skill catalog trong giai đoạn đầu.

Thực hiện theo đúng thứ tự:

```text
1. Add dreamy_plan
2. Add dreamy_architect
3. Rewrite debugger
4. Rewrite reviewer
5. Rewrite tester
6. Rewrite unity-editor
7. Rewrite performance
8. Rewrite build

9. Expand serialization rule
10. Expand scene/prefab rule
11. Expand service rule
12. Expand data rule
13. Expand async rule
14. Expand event rule
15. Expand asset rule
16. Expand package-boundary rule
17. Expand UI ownership rule
18. Expand pooling rule

19. Deepen dreamy-feature
20. Deepen dreamy-core
21. Deepen dreamy-dataconfig
22. Deepen dreamy-datasave
23. Deepen dreamy-assets
24. Deepen dreamy-ui

25. Deepen combat
26. Deepen projectile
27. Deepen movement
28. Deepen enemy-ai

29. Deepen shop
30. Deepen IAP
31. Deepen ads
32. Deepen gacha

33. Deepen UniTask
34. Deepen DOTween

35. Add/complete harness validation
36. Add evals
37. Add similarity/static quality validator
38. Benchmark with smaller model
39. Fix routing/context issues
40. Freeze v1 core behavior
```

---

# 51. BENCHMARK BẰNG MODEL NHỎ

Sau khi hoàn thiện, test ít nhất các task:

```text
Add a unit upgrade system.
Fix duplicate merge cards.
Add a shop coin pack.
Fix a NullReference in PanelHome.
Move reusable logic into a Dreamy package.
Rename a serialized field safely.
Replace a prefab skeleton.
Fix a pooled projectile leak.
Fix async UI operation after panel closes.
Optimize a stutter on low-end Android.
Fix an Android Gradle/R8 build.
Add rewarded ad grant.
Add IAP product.
```

Đánh giá:

```text
routing đúng?
ownership đúng?
minimal change?
Dreamy package được dùng đúng?
serialization an toàn?
compile/test evidence?
có over-engineer?
có hallucinate API?
```

---

# 52. KẾT LUẬN KIẾN TRÚC

Mục tiêu cuối cùng không phải:

```text
100 skill
20 agent
10,000 dòng prompt
```

Mà là:

```text
MODEL NHỎ
  +
ROUTING TỐT
  +
RULE RÕ
  +
SKILL CÓ DOMAIN KNOWLEDGE
  +
AGENT CÓ WORKFLOW RIÊNG
  +
REFERENCE ĐỦ SÂU
  +
HARNESS/EVAL
  =
KẾT QUẢ ỔN ĐỊNH
```

Nguyên tắc chốt:

> **Repository knowledge phải đầy đủ. Active context phải nhỏ.**
>
> **Agent phải chuyên biệt theo cách làm việc. Skill phải chuyên biệt theo domain. Rule phải là invariant.**
>
> **Nếu xóa tên skill/agent mà vẫn không đoán được nó làm gì, nội dung chưa đủ sâu.**
