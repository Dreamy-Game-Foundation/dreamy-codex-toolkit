# ROLE

Bạn là một **Senior AI Developer Tooling Architect + Senior Unity Architect + Codex Agent/Skill Engineer**.

Nhiệm vụ của bạn là **nghiên cứu kỹ các repository được cung cấp**, sau đó xây dựng một **Master Plan cực kỳ chi tiết** cho một repository mới tên tạm thời:

`Dreamy-Game-Foundation/dreamy-codex-toolkit`

Toolkit này sẽ là bộ **Codex development toolkit chuẩn nội bộ của Dreamy Game Foundation**, dùng chung cho nhiều Unity project và các Unity package của studio.

**Chưa implement code ở bước này. Chỉ nghiên cứu, phân tích và lên architecture + implementation plan.**

---

# 1. REPOSITORY PHẢI NGHIÊN CỨU

## A. Repository tham khảo về AI coding toolkit

### 1. Everything Claude Unity

https://github.com/XeldarAlz/everything-claude-unity

Phải nghiên cứu ít nhất:

- cấu trúc repository;
- rules;
- skills;
- agents;
- commands;
- hooks;
- settings;
- safety mechanisms;
- Unity-specific knowledge;
- C# rules;
- architecture rules;
- performance rules;
- serialization rules;
- gameplay skills;
- systems skills;
- platform skills;
- third-party skills;
- workflow giữa agents / skills / commands;
- cách họ phân chia knowledge;
- cách họ tránh agent thực hiện thao tác nguy hiểm;
- những gì phù hợp hoặc không phù hợp với Codex.

Không được chỉ đọc README.

Hãy inspect trực tiếp các folder/file quan trọng.

---

### 2. Unity Claude Skills

https://github.com/Nice-Wolf-Studio/unity-claude-skills

Phải nghiên cứu:

- taxonomy các Unity skills;
- cách chia skill theo domain;
- cấu trúc `SKILL.md`;
- description dùng để route skill;
- references;
- Unity foundations;
- editor tooling;
- architecture;
- async;
- animation;
- UI;
- physics;
- rendering;
- audio;
- navigation;
- data-driven;
- testing;
- các Unity-specific best practices.

Mục tiêu là xác định:

> Những Unity knowledge domain nào một Codex toolkit production-grade nên có.

---

### 3. Oh My Game Kit

https://github.com/tranvietanh0/oh-my-game-kit

Đây là repository cần nghiên cứu **đặc biệt kỹ**, vì tôi muốn Dreamy Codex Toolkit có độ rộng và cách tổ chức gần với hướng này.

Phải nghiên cứu:

- `AGENTS.md`;
- `.agents/skills`;
- agents;
- modules;
- presets;
- installer;
- CLI;
- `kit.json`;
- validation;
- doctor;
- install state;
- global install;
- project-local install;
- managed AGENTS blocks;
- skill context budget;
- references;
- engine-specific presets;
- skill prefix/naming;
- tests;
- release workflow;
- versioning;
- cách bảo vệ config người dùng;
- cách update/uninstall toolkit;
- cách họ thiết kế Codex-native toolkit thay vì Claude-specific toolkit.

Đặc biệt phân tích:

> Những gì nên học gần như trực tiếp từ Oh My Game Kit và những gì Dreamy nên làm khác.

---

# 2. DREAMY BASE PHẢI NGHIÊN CỨU

## Main template

https://github.com/Dreamy-Game-Foundation/dreamy-template-project

Không chỉ đọc README.

Phải inspect ít nhất:

- `Packages/manifest.json`;
- `Packages/packages-lock.json` nếu có;
- `Assets/_Project`;
- Bootstrap;
- `GameInstaller`;
- `GameInit`;
- Scene flow;
- config examples;
- save examples;
- UI examples;
- pooling;
- Address constants;
- assembly definitions;
- package integration;
- ProjectSettings liên quan;
- docs/conventions nếu có.

Phải hiểu rõ:

```text
BootstrapScene
GameInstaller
GameInit
SceneLoader
MainScene
Assets/_Project
```

và cách template đóng vai trò **composition root của các Dreamy package**.

---

# 3. TOÀN BỘ DREAMY ORGANIZATION

Phải inspect repository trong organization:

https://github.com/orgs/Dreamy-Game-Foundation/repositories

Không được chỉ phân tích `dreamy-template-project`.

Hãy tìm và nghiên cứu tất cả package/repo có liên quan tới foundation hiện tại, đặc biệt:

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
```

Nếu organization hiện có thêm package foundation mới thì phải phát hiện và đưa vào phân tích.

Với mỗi package, inspect:

- README;
- package.json;
- Runtime;
- Editor;
- Tests;
- asmdef;
- public APIs quan trọng;
- dependency;
- ownership;
- responsibility;
- dependency direction;
- editor tools;
- validation tools;
- existing conventions.

Sau đó tạo một:

# Dreamy Package Dependency Map

Ví dụ:

```text
com.dreamy.ui
      ↓
com.dreamy.assets
      ↓
com.dreamy.core
```

Nhưng phải dựa trên repository thực tế, không đoán.

---

# 4. MỤC TIÊU CỦA TOOLKIT

Tôi **không muốn** một toolkit nhỏ chỉ gồm:

```text
dreamy-core
dreamy-ui
dreamy-assets
dreamy-save
```

Tôi muốn xây dựng một toolkit **rộng, đầy đủ và production-grade**, tương tự tinh thần:

```text
Everything Claude Unity
+
Unity Claude Skills
+
Oh My Game Kit
```

nhưng:

- native cho Codex;
- follow các chuẩn Unity/C#/game development industry;
- có kiến thức đầy đủ về mobile game production;
- có generic skills;
- có production skills;
- có Dreamy-specific overrides;
- phù hợp trực tiếp với Dreamy base;
- không phá architecture hiện có.

---

# 5. TRIẾT LÝ KIẾN TRÚC BẮT BUỘC

Toolkit phải được thiết kế theo tầng:

```text
Industry Engineering Rules
            ↓
C# Rules
            ↓
Unity Rules
            ↓
Game Development Rules
            ↓
Mobile Production Rules
            ↓
Dreamy Architecture Overrides
            ↓
Project-specific instructions
```

Dreamy rules **không được thay thế** industry best practices.

Dreamy chỉ override những chỗ studio đã có architectural decision riêng.

Ví dụ:

Industry:

```text
Avoid uncontrolled global dependencies.
Prefer explicit dependency boundaries.
```

Dreamy:

```text
Dreamy đã chọn ServiceLocator làm service registry.
```

Do đó rule phải thành:

```text
Use Dreamy ServiceLocator according to Dreamy architecture.

Allowed:
- GameInstaller
- bootstrap
- feature root
- presenter
- high-level controller

Avoid:
- UI item
- projectile
- VFX
- pooled leaf component

Pass dependency downward explicitly.
```

Không được kết luận kiểu:

```text
ServiceLocator luôn là best practice.
```

---

# 6. PHẢI XÁC ĐỊNH DREAMY ARCHITECTURE OVERRIDES

Sau khi đọc code thật, hãy xác định chính xác những rule nào cần override.

Ít nhất phải xem xét:

## Project vs Package

```text
Reusable framework
→ Dreamy package

Game-specific code
→ Assets/_Project
```

---

## Composition Root

Xác định vai trò thật của:

```text
GameInstaller
```

---

## Service architecture

Phân tích:

```text
ServiceLocator
EventBus
StateMachine
Singletons
AppLifecycle
Tick service
```

và đề xuất rule phù hợp.

---

## Data ownership

Phân biệt rõ:

```text
DataConfig
vs
Datasave
vs
runtime state
```

Ví dụ cần xác nhận:

```text
level balance
enemy stats
shop price
reward table
→ DataConfig

coins
inventory
progress
settings
tutorial state
→ Datasave
```

---

## Asset ownership

Phân tích:

```text
Dreamy AssetLoader
Addressables
Resources fallback
cache
release ownership
```

---

## UI

Phân tích:

```text
UIPanel
PanelManager
UILayerRoot
Screen
Popup
Overlay
Tween
Transition
Cache
```

---

## Audio

Phân tích:

```text
AudioKey
Catalog
Library
Profile
Mixer
Pooling
```

---

## Feedback

Phân tích module:

```text
VFX
Haptic
Floating Text
Icon Fly
Screen Flash
Camera Shake
Sequence
```

---

## Localization

Phân tích:

```text
CSV
Unity Localization
String Tables
Asset Tables
Smart Strings
bindings
typed keys
```

---

## Editor Tools

Phân tích các tool hiện có và xác định cái nào có thể dùng làm:

```text
Codex harness
validation
compile
build
scene management
package inspection
```

---

# 7. RULE SYSTEM PHẢI ĐẦY ĐỦ

Hãy đề xuất taxonomy đầy đủ cho:

```text
rules/
```

Ít nhất phải nghiên cứu khả năng có các nhóm:

```text
core/
csharp/
unity/
gameplay/
mobile/
production/
dreamy/
```

---

# 8. CORE RULES

Phải xem xét:

```text
engineering
workflow
safety
git
documentation
dependency management
change scope
verification
```

Rule phải bao gồm những nguyên tắc như:

```text
inspect before modify
root cause before fix
minimal safe change
follow existing architecture
avoid unnecessary dependency
avoid speculative abstraction
review diff
verify before reporting success
```

---

# 9. C# RULES

Phải xem xét đầy đủ:

```text
style
naming
architecture
async
events
collections
memory
error handling
API design
testing
nullability
immutability
allocation
```

Nhưng:

> Không biến toolkit thành một bộ Clean Code cực đoan không phù hợp game development.

---

# 10. UNITY RULES

Phải cover rộng.

Ít nhất:

```text
Unity foundations
lifecycle
MonoBehaviour
serialization
scene
prefab
ScriptableObject
Addressables
Resources
UI
physics
physics2D
input
animation
Animator
Timeline
camera
Cinemachine
navigation
particles
VFX
URP
rendering
shader
material
audio
async
testing
editor tooling
profiling
memory
build
```

---

# 11. UNITY SERIALIZATION SAFETY

Toolkit phải có rule rõ về:

```text
.meta
GUID
scene serialization
prefab references
FormerlySerializedAs
class rename
namespace rename
asmdef rename
serialized field rename
```

Agent không được vô tư refactor rồi làm mất reference Unity.

---

# 12. SCENE / PREFAB SAFETY

Phải yêu cầu:

```text
Inspect hierarchy
↓
Inspect prefab ownership
↓
Inspect overrides
↓
Inspect serialized references
↓
Modify
↓
Validate
```

Nếu Unity MCP/editor tools khả dụng thì ưu tiên thao tác stateful qua Editor thay vì sửa YAML scene/prefab bằng text.

---

# 13. PERFORMANCE RULES

Phải phù hợp mobile game.

Cover:

```text
CPU
GPU
GC
memory
allocation
Update
physics
pooling
draw calls
overdraw
textures
audio
Addressables
loading
battery
thermal
```

Các anti-pattern cần xem xét:

```text
FindObjectOfType in hot path
GameObject.Find
repeated Camera.main
repeated GetComponent
LINQ in hot loop
string allocation per frame
Instantiate/Destroy spam
unbounded pools
Addressables leaks
```

---

# 14. MOBILE RULES

Dreamy chủ yếu làm mobile nên mobile phải là **first-class domain**, không phải một file phụ.

Cover:

```text
Android
iOS
low-end devices
safe area
touch
memory
thermal
battery
package size
texture compression
audio compression
IL2CPP
ARM64
build pipeline
store readiness
```

---

# 15. ANDROID

Phải cover:

```text
target SDK
min SDK
Gradle
AGP
JDK
IL2CPP
ARM64
R8
manifest
permissions
AAB
Play Billing
SDK compatibility
```

---

# 16. IOS

Cover:

```text
bundle ID
signing
build number
minimum OS
StoreKit
privacy
ATT
capabilities
Xcode
IL2CPP
```

---

# 17. GAMEPLAY SKILL SYSTEM

Toolkit phải có generic gameplay skills, không chỉ infrastructure.

Hãy đánh giá danh sách như:

```text
gameplay-loop
game-state
player-controller
movement
combat
health-damage
weapon
projectile
ragdoll
physics-gameplay
enemy-ai
navigation
spawning
wave-system
interaction
camera-gameplay
input-gameplay
pooling
progression
level-system
economy
currency
reward
loot
inventory
upgrade
skill-system
quest
tutorial
```

Không cần giữ chính xác tên này.

Hãy thiết kế taxonomy tối ưu hơn nếu cần.

---

# 18. GAME SYSTEM SKILLS

Phải cover mobile production systems như:

```text
UI
save
config
assets
audio
feedback
localization
pooling
event
services
scene flow
loading
settings
shop
currency
economy
reward
gacha
daily reward
battle pass
analytics
ads
IAP
remote config
tutorial
notification
leaderboard
cloud save
```

Phân biệt:

```text
generic implementation skill
```

với:

```text
Dreamy-specific package skill
```

Ví dụ:

```text
ui-system
```

là generic.

```text
dreamy-ui
```

là cách implement UI theo Dreamy base.

---

# 19. PRODUCTION SKILLS

Phải có nhóm production chuyên dụng:

```text
debug
code-review
refactor
optimize
CPU profiling
GPU profiling
memory profiling
crash analysis
ANR analysis
build debugging
Android build
iOS build
CI debugging
release readiness
dependency upgrade
migration
package maintenance
```

---

# 20. THIRD-PARTY SKILLS

Dựa trên `dreamy-template-project` thực tế, xác định những dependency thường dùng cần skill riêng.

Ví dụ có thể bao gồm:

```text
UniTask
DOTween
Addressables
LeanPool
Newtonsoft JSON
Odin
Firebase
```

Nhưng chỉ thêm nếu:

```text
commonly used
+
has enough domain-specific workflow
+
worth consuming context
```

Không tạo skill cho mọi package trong manifest.

---

# 21. DREAMY-SPECIFIC SKILLS

Sau khi phân tích package thật, hãy đề xuất đầy đủ.

Dự kiến có thể gồm:

```text
dreamy-base
dreamy-architecture
dreamy-feature
dreamy-debug
dreamy-testing

dreamy-core
dreamy-dataconfig
dreamy-datasave
dreamy-assets
dreamy-ui
dreamy-audio
dreamy-feedback
dreamy-localization
dreamy-editor-tools

dreamy-package-maintainer
dreamy-mobile
```

Nhưng danh sách cuối cùng phải dựa trên code thật.

---

# 22. DREAMY-FEATURE ORCHESTRATOR

Tôi muốn đặc biệt xem xét một skill:

```text
dreamy-feature
```

Đây không phải skill biết API cụ thể.

Nó là orchestrator cho việc thêm feature mới.

Ví dụ:

```text
"Thêm hệ thống Shop"
```

Nó phải tự route đến:

```text
shop
economy
currency
reward
dreamy-dataconfig
dreamy-datasave
dreamy-ui
dreamy-assets
dreamy-audio
dreamy-feedback
```

Flow dự kiến:

```text
Requirement
↓
Inspect existing implementation
↓
Determine ownership
↓
Find existing package capabilities
↓
Determine static config
↓
Determine persistent state
↓
Determine services
↓
Determine UI
↓
Implement
↓
Compile
↓
Read Console
↓
Test
↓
Review diff
```

Hãy đánh giá kỹ ý tưởng này.

---

# 23. SKILL FORMAT

Thiết kế skill theo Codex-native progressive disclosure.

Ví dụ:

```text
skill-name/
├── SKILL.md
├── references/
├── scripts/
└── assets/
```

`SKILL.md` phải ngắn.

Chi tiết API dài đưa vào:

```text
references/
```

Phải đề xuất:

- frontmatter format;
- naming convention;
- description convention;
- when to use;
- when not to use;
- verification;
- references;
- scripts.

---

# 24. CONTEXT BUDGET

Không được đề xuất:

```text
70–100 skill global
```

Hãy thiết kế chiến lược:

```text
global core skills
+
project-local Unity skills
+
Dreamy skills
+
auto-detected package skills
```

Phải giải thích:

- skill nào global;
- skill nào project;
- skill nào preset-specific;
- cách tránh context explosion.

---

# 25. PRESET SYSTEM

Tôi muốn có preset tương tự Oh My Game Kit.

Hãy thiết kế ít nhất:

```text
core
unity-minimal
unity-production
unity-full

dreamy-project
dreamy-package
dreamy-template
dreamy-full
```

Với mỗi preset:

- mục đích;
- rule;
- skill;
- agent;
- use case.

---

# 26. AUTO PACKAGE DETECTION

Installer nên đọc:

```text
Packages/manifest.json
```

và tự phát hiện Dreamy package.

Ví dụ:

```text
com.dreamy.audio
→ dreamy-audio skill
```

```text
com.dreamy.localization
→ dreamy-localization skill
```

Hãy đề xuất architecture cho detector.

---

# 27. PROJECT PROFILE

Xem xét generate:

```text
.dreamy-codex/project-profile.json
```

Ví dụ:

```json
{
  "engine": "unity",
  "projectType": "dreamy-game",
  "unityVersion": "...",
  "dreamyPackages": [],
  "preset": "dreamy-project"
}
```

Hãy đánh giá tính cần thiết.

---

# 28. AGENTS

Tôi muốn toolkit có agents nhưng không tạo quá nhiều chỉ để tăng số lượng.

Đánh giá agent như:

```text
implementer
debugger
reviewer
tester
unity-editor
performance
package-maintainer
```

Với từng agent:

- nhiệm vụ;
- tools;
- skills;
- workflow;
- output;
- khi nào dùng;
- khi nào không dùng.

---

# 29. COMMANDS / WORKFLOW ENTRY POINT

Everything Claude Unity có slash commands.

Codex có workflow khác Claude.

Hãy xác định:

- có cần commands không;
- commands nên được chuyển thành skill/agent/CLI như thế nào;
- những workflow nào nên có entry point rõ ràng.

Ví dụ:

```text
implement
debug
review
test
optimize
build
release
```

Không copy Claude slash-command architecture nếu Codex có cơ chế tốt hơn.

---

# 30. HARNESS

Toolkit phải hướng tới:

> Codex sửa xong phải **chứng minh thay đổi hoạt động**, không chỉ nói “done”.

Thiết kế harness cho:

```text
Unity compile
Unity Console
EditMode tests
PlayMode tests
build
project validation
package validation
Addressables validation
asmdef validation
git diff
git status
```

---

# 31. UNITY MCP

Nếu project có Unity MCP:

Toolkit phải hướng agent sử dụng MCP cho:

```text
scene inspection
hierarchy
prefab
component
serialized refs
compile
console
asset operations
```

Phải coi Editor operations là **stateful operations**.

Workflow:

```text
inspect state
before mutation
```

---

# 32. REUSE DREAMY EDITOR TOOLS

Phải kiểm tra `com.dreamy.editor-tools`.

Nếu Dreamy đã có:

```text
Scene Manager
Build Manager
Package Manager
Data Debugger
Compile tools
validation
```

thì harness nên **reuse** chúng khi có thể.

Không tạo hệ thống song song vô ích.

---

# 33. INSTALLER

Thiết kế CLI, ví dụ:

```text
dreamy-kit
```

Các command có thể gồm:

```text
dreamy-kit install
dreamy-kit update
dreamy-kit uninstall
dreamy-kit doctor
dreamy-kit validate
dreamy-kit detect
dreamy-kit list
```

---

# 34. INSTALL TARGETS

Phải thiết kế:

```text
global
project
```

Ví dụ:

```text
~/.codex/
```

và:

```text
project/.agents/
project/.codex/
```

---

# 35. MANAGED AGENTS BLOCK

Installer không được overwrite user `AGENTS.md`.

Hãy thiết kế sentinel như:

```text
<!-- DREAMY-CODEX:START -->

managed content

<!-- DREAMY-CODEX:END -->
```

User content ngoài block phải giữ nguyên.

---

# 36. INSTALL STATE

Xem xét:

```text
.dreamy-codex/install-state.json
```

Để track:

```text
toolkit version
preset
skills
managed files
Dreamy package versions
```

---

# 37. DOCTOR COMMAND

Phải thiết kế `doctor`.

Checks nên bao gồm:

```text
Unity project detected
Unity version
AGENTS valid
skill frontmatter
missing references
duplicate skill names
manifest
Dreamy packages
broken Git package URLs
package versions
asmdef boundaries
installer state
Codex config
MCP availability
```

---

# 38. VALIDATOR

Phải có validator cho chính toolkit.

Check:

```text
skill schema
rule schema
agent schema
preset references
duplicate names
missing files
dead references
invalid JSON
managed blocks
installer
```

---

# 39. EVAL SYSTEM

Toolkit phải có eval.

Eval khác unit test.

Eval test:

> Agent có ra quyết định đúng không?

Ví dụ:

```text
"Store player coins in DataConfig."
```

Expected:

```text
Reject.
Coins belong to Datasave.
```

---

# 40. INITIAL EVAL CATEGORIES

Phải đề xuất ít nhất:

```text
architecture
service boundary
DataConfig vs Datasave
UI
Addressables
serialization
pooling
async
package boundary
debugging
performance
build
```

---

# 41. EVAL EXAMPLES

Phải thiết kế cụ thể một số case như:

### Case 1

```text
Add UI dependency to com.dreamy.core.
```

Expected:

```text
Reject dependency direction.
```

### Case 2

```text
Use ServiceLocator.Get in every UI item.
```

Expected:

```text
Reject leaf global dependency.
```

### Case 3

```text
Rename serialized field.
```

Expected:

```text
Preserve serialization compatibility.
```

### Case 4

```text
pool.Spawn → Destroy
```

Expected:

```text
Detect pool ownership violation.
```

---

# 42. VERSIONING

Thiết kế semantic versioning.

Ví dụ:

```text
0.1.0
0.2.0
1.0.0
```

Phải xác định:

- version toolkit;
- version compatibility với Dreamy package;
- Unity compatibility.

---

# 43. PACKAGE/SKILL COMPATIBILITY

Xem xét mapping:

```json
{
  "com.dreamy.core": {
    "supported": ">=x.x.x",
    "skill": "dreamy-core"
  }
}
```

Skill không được dùng API mới cho project package cũ mà không cảnh báo.

---

# 44. RELEASE WORKFLOW

Đề xuất:

```text
main
release
tags
```

hoặc architecture tốt hơn.

Phải cover:

```text
CI
validation
evals
version bump
release
installer source
```

---

# 45. CI

Toolkit CI nên validate:

```text
rules
skills
agents
presets
installer
tests
eval schemas
```

---

# 46. ANTI-PATTERN CATALOG

Plan phải đề xuất anti-pattern chung:

```text
God MonoBehaviour
God Manager
static mutable global state
business logic in UI
event leaks
async leaks
Addressables leaks
Instantiate/Destroy spam
Find hot-path
package dependency cycles
runtime → Editor
scene YAML blind editing
```

Và Dreamy-specific:

```text
duplicate Dreamy package capability

ServiceLocator in every object

player state in DataConfig

static balance in Datasave

business logic in UIPanel

manual Addressables bypassing Dreamy loader without reason

game-specific logic pushed into com.dreamy.core
```

---

# 47. RULE VS SKILL VS AGENT VS HARNESS

Plan phải định nghĩa cực rõ:

## Rule

Mandatory invariant.

## Skill

Domain knowledge + workflow.

## Agent

Execution role.

## Harness

Verification/tool execution.

## Preset

Selection/composition.

## Installer

Distribution.

## Eval

Behavior regression testing.

Không được trộn các khái niệm này.

---

# 48. RECOMMENDED REPOSITORY STRUCTURE

Phải đề xuất repository tree hoàn chỉnh.

Ví dụ hướng:

```text
dreamy-codex-toolkit/
│
├── AGENTS.md
├── README.md
├── toolkit.json
│
├── rules/
│
├── skills/
│
├── agents/
│
├── harness/
│
├── presets/
│
├── evals/
│
├── scripts/
│
├── templates/
│
├── docs/
│
└── tests/
```

Nhưng hãy tự cải thiện nếu architecture tốt hơn.

---

# 49. OUTPUT PLAN BẮT BUỘC

Kết quả cuối cùng phải là một **Master Architecture & Implementation Plan**, không phải một câu trả lời ngắn.

Plan phải có ít nhất các section sau.

---

## SECTION A — Executive Summary

Tóm tắt:

- toolkit là gì;
- tại sao cần;
- triết lý chính;
- điểm khác Oh My Game Kit;
- điểm khác Everything Claude Unity;
- điểm khác Unity Claude Skills.

---

## SECTION B — Repository Research

Với từng repo tham khảo:

```text
What it does well
What to borrow
What not to copy
Codex adaptation
```

---

## SECTION C — Dreamy Architecture Analysis

Phân tích:

```text
dreamy-template-project
Dreamy packages
dependency map
project/package boundaries
composition root
data ownership
UI ownership
asset ownership
audio
feedback
localization
editor tooling
```

---

## SECTION D — Design Principles

Ít nhất:

```text
Industry first
Dreamy override
Progressive disclosure
Project-local context
Minimal global context
Verification first
Safe mutation
Reusable architecture
```

---

## SECTION E — Complete Repository Structure

Tree đầy đủ.

Mô tả trách nhiệm từng folder.

---

## SECTION F — Rule Architecture

Liệt kê toàn bộ rule đề xuất.

Với mỗi rule:

```text
Name
Category
Purpose
Scope
Priority
Dreamy override?
```

---

## SECTION G — Skill Architecture

Liệt kê toàn bộ skill.

Phải group:

```text
core
unity
gameplay
systems
platform
production
third-party
dreamy
```

Với mỗi skill:

```text
name
purpose
when to use
references needed
priority
preset
Dreamy interaction
```

---

## SECTION H — Dreamy Skills

Phải mô tả chi tiết từng skill Dreamy.

---

## SECTION I — Agent Architecture

Danh sách agent và responsibility.

---

## SECTION J — Harness

Thiết kế:

```text
compile
console
tests
build
validate
diff
```

---

## SECTION K — Presets

Mô tả từng preset đầy đủ.

---

## SECTION L — Installer

Thiết kế:

```text
install
detect
doctor
update
uninstall
managed blocks
install state
```

---

## SECTION M — Eval Framework

Architecture + initial eval catalog.

---

## SECTION N — Context Budget Strategy

Phân tích cách tránh skill overload.

---

## SECTION O — Security / Safety

Destructive operations.

Unity asset safety.

Secrets.

Git.

Build/signing.

---

## SECTION P — Versioning / Compatibility

Unity + Dreamy packages + toolkit.

---

## SECTION Q — CI / Release

Plan chi tiết.

---

## SECTION R — Development Roadmap

Chia thành wave/phase.

Ví dụ:

```text
Wave 0 repository foundation
Wave 1 core rules
Wave 2 Unity
Wave 3 Dreamy
Wave 4 mobile systems
Wave 5 production
Wave 6 installer
Wave 7 harness
Wave 8 eval
Wave 9 hardening
Wave 10 v1
```

Hãy tự tối ưu roadmap.

---

# 50. MỖI WAVE PHẢI CÓ

```text
Objective
Tasks
Files/folders created
Rules created
Skills created
Agents created
Harness work
Tests
Evals
Definition of Done
Dependencies
Risks
```

---

# 51. PRIORITY

Phân loại:

```text
P0
P1
P2
P3
```

Phải cho biết cái nào nên implement trước.

---

# 52. FIRST RELEASE

Đề xuất cụ thể nội dung:

```text
v0.1.0
```

Ví dụ:

```text
number of rules
number of skills
agents
presets
evals
harness
installer
```

Không cần chạy theo số lượng.

Tập trung vào chất lượng và coverage quan trọng.

---

# 53. V1.0 DEFINITION OF DONE

Phải định nghĩa rõ:

```text
What makes Dreamy Codex Toolkit production-ready?
```

Bao gồm:

```text
routing accuracy
eval pass
install stability
Dreamy compatibility
Unity coverage
verification
docs
CI
```

---

# 54. DECISION TREES

Plan phải có decision trees cho ít nhất:

```text
Project vs package
DataConfig vs Datasave vs runtime
UI ownership
Asset ownership
Service resolution
Performance optimization
Bug fixing
```

---

# 55. EXAMPLE WORKFLOWS

Cho ít nhất các ví dụ:

## Add Shop

## Add Unit Upgrade

## Fix NullReference in UI

## Add reusable foundation service

## Modify prefab/scene

## Optimize mobile stutter

## Fix Android build

## Upgrade Dreamy package

Với mỗi workflow:

```text
rules applied
skills invoked
agent
harness
verification
```

---

# 56. CRITICAL CONSTRAINTS

Không được:

1. Chỉ copy các repo tham khảo.
2. Chỉ đọc README.
3. Chỉ tập trung Dreamy packages.
4. Chỉ tạo generic Unity skills mà bỏ qua Dreamy architecture.
5. Dump hàng chục skill vào global context.
6. Tạo abstraction không cần thiết.
7. Đề xuất DI framework mới chỉ vì industry thường dùng DI.
8. Bỏ qua ServiceLocator hiện tại của Dreamy.
9. Bỏ qua Unity serialization safety.
10. Bỏ qua mobile production.
11. Bỏ qua harness.
12. Bỏ qua eval.
13. Bỏ qua installer/versioning.
14. Bỏ qua package compatibility.
15. Implement code trước khi hoàn thành architecture plan.

---

# 57. RESEARCH REQUIREMENT

Mọi nhận định Dreamy-specific phải dựa trên code/repository thực tế.

Nếu README và code khác nhau:

```text
ưu tiên code/API hiện tại
```

và ghi rõ discrepancy.

Nếu package đang experimental hoặc incomplete:

ghi rõ:

```text
current state
planned state
```

Không tự giả định API chưa tồn tại.

---

# 58. EXPECTED QUALITY

Tôi muốn một plan có thể dùng trực tiếp làm:

```text
architecture source of truth
+
implementation roadmap
+
backlog generation source
```

Sau khi đọc plan, một developer khác phải có thể bắt đầu tạo repo `dreamy-codex-toolkit` mà không cần hỏi lại:

```text
folder nào
rule nào
skill nào
làm trước cái gì
Dreamy override ở đâu
test thế nào
release thế nào
```

---

# 59. OUTPUT FORMAT

Viết bằng Markdown.

Rất chi tiết.

Dùng:

- headings;
- tables;
- directory trees;
- diagrams bằng text;
- decision trees;
- checklist;
- priority tables;
- roadmap tables.

Không giới hạn câu trả lời chỉ để ngắn.

Ưu tiên đầy đủ và chính xác.

---

# 60. FINAL DELIVERABLE

Cuối cùng hãy tạo một file:

```text
DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md
```

Nội dung file phải là **toàn bộ Master Plan**.

Plan phải kết thúc bằng:

```text
Implementation Checklist
```

với checklist từ:

```text
Repository initialization
```

đến:

```text
v1.0 internal production release
```

---

# CORE INTENT

Điều quan trọng nhất cần luôn ghi nhớ:

> Tôi muốn một **Codex Toolkit rộng và production-grade cho Unity/mobile game development**, có các rule và skill theo chuẩn industry tương tự tinh thần Oh My Game Kit / Everything Claude Unity / Unity Claude Skills.

> Dreamy không thay thế các rule chuẩn đó.

> Dreamy là **một lớp architecture override và integration layer**, giúp Codex khi làm trong Dreamy project hiểu chính xác cách dùng `com.dreamy.*`, cách phân chia project/package, data ownership, service boundaries, UI, assets, audio, feedback, localization và editor workflows.

Kiến trúc mong muốn về tư duy:

```text
INDUSTRY
   ↓
C#
   ↓
UNITY
   ↓
GAME DEVELOPMENT
   ↓
MOBILE PRODUCTION
   ↓
DREAMY ARCHITECTURE
   ↓
PROJECT CONTEXT
   ↓
IMPLEMENT
   ↓
VERIFY
```

Hãy bắt đầu bằng **repository research**, không bắt đầu bằng việc viết danh sách skill từ trí nhớ.