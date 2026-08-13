# DREAMY CODEX TOOLKIT — COMPLETION ROADMAP


> **Repository:** `Dreamy-Game-Foundation/dreamy-codex-toolkit`  
> **Audit baseline commit:** `a2c8552bc3b89d5581871b218f9dbd9bbc491886`  
> **Toolkit version at audit:** `0.1.0-alpha.1`  
> **Purpose:** Detailed phased plan to finish the current toolkit from its actual repository state, not from the older master-plan assumptions.  
> **Target:** Production-grade, Codex-native toolkit for Unity/mobile development with Dreamy architecture overrides, real execution evidence, safe lifecycle management, behavioral evals, and release-quality distribution.

---

# 0. CÁCH DÙNG TÀI LIỆU NÀY

Giữ hai tài liệu với hai vai trò khác nhau:

```text
DREAMY_CODEX_TOOLKIT_MASTER_PLAN.md
    ↓
Source of truth về kiến trúc đích.

DREAMY_CODEX_TOOLKIT_COMPLETION_ROADMAP.md
    ↓
Backlog từ trạng thái repo HIỆN TẠI đến khi hoàn thiện.
```

Không nên lấy lại backlog cũ rồi chạy lại từ đầu. Repo hiện tại đã có nhiều phần từng được đánh dấu là “future work”.

Quy trình triển khai mỗi phase:

```text
Phase
↓
Tạo issue/task batch
↓
Implement
↓
Validate
↓
Unit test
↓
Relevant eval
↓
Review diff
↓
Update maturity
↓
Phase tiếp theo
```

---

# 1. SNAPSHOT REPO HIỆN TẠI

Repo hiện đã có đầy đủ các lớp lớn:

```text
.github/workflows/
agents/codex/
compatibility/
docs/
evals/
harness/
modules/
presets/
rules/
schemas/
scripts/
skills/
src/
templates/
tests/
toolkit.json
package.json
README.md
AGENTS.md
CHANGELOG.md
```

Kiến trúc tổng thể hiện tại là đúng hướng:

```text
Rules
    mandatory behavior

Skills
    domain/task workflow

Agents
    specialized execution roles

Modules
    capability composition

Presets
    install profiles

Compatibility
    verified Dreamy/package truth

CLI / Installer
    distribution lifecycle

Harness
    evidence abstraction

Evals
    behavior contracts

CI
    quality gates
```

**Không nên rewrite cấu trúc repo.**

---

# 2. ĐÁNH GIÁ MATURITY HIỆN TẠI

```text
Foundation architecture       GOOD / stable-alpha
Rule framework                GOOD
Skill catalog breadth         GOOD-alpha
Skill depth                   PARTIAL
Dreamy compatibility map      STRONG
Installer lifecycle           ALPHA
Update lifecycle              ALPHA
Agent catalog                 GOOD-alpha
Agent Codex-native validity   NEEDS FIX
Modules / presets             GOOD-alpha
Context routing               PARTIAL
Doctor                        SHALLOW
Unity harness                 PROTOTYPE
Eval catalog                  STRONG SPEC
Eval execution                PROTOTYPE
Compatibility automation      PARTIAL
CI                            GOOD-alpha
Release packaging             PARTIAL
Real project dogfooding       NOT A RELEASE GATE YET
```

Từ thời điểm này, trọng tâm phải chuyển từ:

```text
"thêm nhiều file hơn"
```

sang:

```text
native correctness
+
skill depth
+
real execution
+
real eval
+
dogfooding
+
release hardening
```

---

# 3. CÁC FINDING QUAN TRỌNG NHẤT

## 3.1 P0 — Project skill path chưa đúng Codex hiện tại

CLI hiện cài skill project theo hướng:

```text
<repo>/.codex/skills
```

Codex hiện discover repo skill từ:

```text
<repo>/.agents/skills
```

Vì vậy target project cần đổi thành:

```text
project/
├── AGENTS.md
├── .agents/
│   └── skills/
├── .codex/
│   └── agents/
└── .dreamy-codex/
```

Đây là **release blocker**.

---

## 3.2 P0 — Global/user skill path cũng cần tách khỏi CODEX_HOME

Các scope nên tách:

```text
Global AGENTS
~/.codex/AGENTS.md

User custom agents
~/.codex/agents/

User skills
~/.agents/skills/
```

Không được coi tất cả artifact đều nằm dưới `~/.codex`.

---

## 3.3 P0 — Agent TOML thiếu `name`

Các agent mới như:

```text
dreamy-debugger.toml
dreamy-code-reviewer.toml
dreamy-tester.toml
dreamy-build-engineer.toml
...
```

hiện có:

```text
description
developer_instructions
```

nhưng cần:

```text
name
description
developer_instructions
```

Chuẩn đề xuất:

```toml
name = "dreamy_debugger"
description = "Root-cause Dreamy/Unity bug diagnosis."

developer_instructions = 

# PHASE 6 — DEEPEN GAMEPLAY SKILLS

## Mục tiêu

Biến gameplay catalog từ “có tên skill” thành “có kiến thức implement game thực tế”.

Ưu tiên:

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
enemy-ai
spawn-wave
interaction
progression
level-system
inventory
upgrade
tutorial
gameplay-pooling
gameplay-economy-currency-reward
```

---

## 6.1 gameplay-loop

Phải cover:

```text
session lifecycle
match lifecycle
pause/resume
win/lose
restart
result
scene transition
time ownership
```

Decision:

```text
Game flow belongs where?
Who owns pause?
Who stops timers?
Who triggers result?
```

---

## 6.2 game-state

Phải giải thích:

```text
boolean flags
vs
explicit state machine
```

Anti-pattern:

```text
isPlaying
isPaused
isDead
isWin
isTransition
isWaiting
```

với tổ hợp invalid.

Add:

```text
transition guard
entry
exit
history
nested state only when needed
```

---

## 6.3 player-controller

Tách responsibility:

```text
input
movement
ability
animation
camera hook
state
```

Không để PlayerController trở thành:

```text
input
combat
save
camera
UI
audio
analytics
inventory
```

---

## 6.4 movement

Cover:

```text
physics-driven
kinematic
transform-driven
2D
3D
touch
joystick
dash
knockback
```

Decision:

```text
Update
FixedUpdate
CharacterController-like
Rigidbody
```

---

## 6.5 combat

Phải có pipeline:

```text
Attack Intent
↓
Hit Detection
↓
Damage Request
↓
Damage Calculation
↓
Health Mutation
↓
Death/State
↓
Feedback Event
```

Rules:

```text
VFX does not own damage
UI does not own health
animation event should not be sole game authority
```

---

## 6.6 health-damage

Cover:

```text
max/current
damage
heal
invulnerability
death
revive
clamp
event
persistent vs runtime
```

---

## 6.7 weapon

Cover:

```text
weapon definition
runtime state
cooldown
ammo
attack strategy
projectile/spawn
feedback
```

---

## 6.8 projectile

Cover:

```text
spawn owner
trajectory
physics
collision
hit
damage request
lifetime
pooling
despawn
VFX
terrain collision
```

Đặc biệt mobile:

```text
pool
physics budget
collision layers
```

---

## 6.9 ragdoll

Cover:

```text
bone mapping
Rigidbody
Collider
Joint
animation→ragdoll
ragdoll→animation
reset before pooling
root synchronization
```

---

## 6.10 enemy-ai

Cover:

```text
state
sense
target
navigation
attack
cooldown
decision frequency
AI tick budget
```

Không để mỗi enemy chạy expensive scan mỗi frame nếu không cần.

---

## 6.11 spawn-wave

Cover:

```text
spawn definition
spawn point
wave config
pool
lifetime
cleanup
difficulty
completion
```

---

## 6.12 progression

Ownership:

```text
progression definition → config
player progress → save
calculation → service/domain
presentation → UI
```

---

## 6.13 upgrade

Cover:

```text
requirement
cost
level cap
transaction
card/material requirement
currency
save
config
UI preview
```

---

## 6.14 inventory

Cover:

```text
item definition
owned quantity
unique item
stack
equip
transaction
save
```

---

## 6.15 tutorial

Cover:

```text
step
trigger
completion condition
blocking/nonblocking
resume
save state
analytics
```

---

## Phase 6 DoD

- [ ] Gameplay skills có flow thực.
- [ ] Ownership rõ.
- [ ] Mobile performance awareness.
- [ ] Không còn boilerplate-only skill.
- [ ] 15+ gameplay routing/eval case.

---

# PHASE 7 — DEEPEN MOBILE GAME SYSTEM SKILLS

## Mục tiêu

Toolkit phải hữu ích với game mobile F2P/hybrid-casual production, không chỉ Unity foundation.

Priority:

```text
system-shop
system-iap
system-ads
system-analytics
system-remote-config
system-gacha
system-daily-reward
system-battle-pass
system-settings
```

---

## 7.1 system-shop

Phải cover:

```text
catalog
availability
soft currency
hard currency
IAP
purchase transaction
reward grant
save
analytics
UI binding
```

Transaction flow:

```text
User Intent
↓
Validate Offer
↓
Validate Currency / IAP
↓
Commit Transaction
↓
Grant Reward
↓
Persist
↓
Analytics
↓
UI Refresh
```

Không grant từ button callback trực tiếp.

---

## 7.2 system-iap

Phải cover:

```text
product config
initialize
purchase
pending
failure
restore
receipt
retry
duplicate callback
idempotency
```

Critical:

```text
same transaction cannot grant twice
```

---

## 7.3 system-ads

Cover:

```text
rewarded
interstitial
banner
mediation
load/show
availability
frequency
cooldown
consent
pause/resume
reward callback
```

Reward flow cần idempotent boundary.

---

## 7.4 system-analytics

Event taxonomy:

```text
session
funnel
progression
economy
reward
shop
IAP
ads
tutorial
error
```

Vendor SDK không được rải trực tiếp trong gameplay.

---

## 7.5 system-remote-config

Cover:

```text
default
fetch
cache
activate
fallback
version
rollout
safe parsing
```

Remote fail không được làm game unusable nếu có local fallback.

---

## 7.6 system-gacha

Cover:

```text
loot table
rarity
weight
guarantee
pity
duplicate conversion
grant transaction
history if needed
reveal presentation
```

UI không được sở hữu random selection.

---

## 7.7 system-daily-reward

Cover:

```text
time source
claim state
streak
day index
reset
offline
timezone
server time caveat
```

---

## 7.8 system-battle-pass

Cover:

```text
season ID
XP
tier
free track
premium track
claim
expiration
migration
```

---

## 7.9 system-settings

Cover:

```text
audio
vibration
graphics
language
privacy
notifications
```

Phân biệt:

```text
persistent preference
runtime applied state
```

---

## Phase 7 DoD

- [ ] Transaction boundaries.
- [ ] Save ownership.
- [ ] Config ownership.
- [ ] Analytics boundary.
- [ ] UI boundary.
- [ ] Idempotency where relevant.
- [ ] 15+ system evals.

---

# PHASE 8 — AGENT HARDENING & ORCHESTRATION

## Mục tiêu

Agent phải thực sự có vai trò rõ, không chỉ là nhiều tên TOML.

---

## 8.1 Production execution agents

Target:

```text
dreamy_unity_developer
dreamy_debugger
dreamy_code_reviewer
dreamy_tester
dreamy_unity_editor
dreamy_performance_engineer
dreamy_build_engineer
```

---

## 8.2 Maintenance agents

```text
dreamy_package_maintainer
dreamy_release_validator
dreamy_docs_manager
dreamy_skill_author
```

---

## 8.3 Sandbox strategy

Ví dụ:

### Reviewer

```text
read-only
```

### Debugger

```text
read-first
workspace-write only when assigned fix
```

### Developer

```text
workspace-write
```

### Docs manager

```text
read/write docs scope
```

### Performance

```text
measure first
```

---

## 8.4 Orchestration doc

Create:

```text
docs/agent-orchestration.md
```

Flow examples:

### Feature

```text
unity_developer
→ tester
```

### Bug

```text
debugger
→ unity_developer
→ tester
```

### PR Review

```text
code_reviewer
→ tester if validation needed
```

### Performance

```text
performance_engineer
→ unity_developer
→ tester
```

### Android build

```text
build_engineer
→ debugger if failure
```

---

## 8.5 Avoid unnecessary multi-agent use

Không spawn 5 agent cho việc:

```text
rename serialized field
```

Use multi-agent only when:

```text
parallel read-heavy investigation
independent review
specialized validation
```

---

## 8.6 Agent selection eval

Create prompts:

```text
"Root cause this NullReference"
→ debugger

"Review this branch"
→ reviewer

"Implement PanelShop"
→ unity developer

"Check regression"
→ tester

"Why GPU frame is 30 ms?"
→ performance

"Fix Gradle/R8"
→ build engineer
```

---

## Phase 8 DoD

- [ ] Native agent schema.
- [ ] Clear sandbox.
- [ ] Orchestration guide.
- [ ] Agent routing eval.
- [ ] No redundant roles.
- [ ] Installer copies correct agent set.

---

# PHASE 9 — INSTALLER / UPDATE / UNINSTALL V2

## Mục tiêu

Installer đủ an toàn để team sử dụng lâu dài.

---

## 9.1 Preset-aware global install

Current logic cần đảm bảo:

```text
global --preset core
```

không copy toàn bộ skill.

---

## 9.2 Module dependency resolver

Implement:

```text
resolve dependencies recursively
detect cycle
stable order
deduplicate content
```

---

## 9.3 Package auto-detection

Manifest:

```text
com.dreamy.audio
```

→ install:

```text
dreamy-audio
```

Absent package:

```text
do not install package-specific skill
```

---

## 9.4 Version detection

Project profile nên giữ:

```text
manifest requested version
lock resolved version
git commit/tag if available
compatibility status
```

---

## 9.5 Update không nên uninstall+install toàn bộ

Current alpha flow:

```text
uninstall
→ install
```

Production flow:

```text
read state
↓
resolve new desired state
↓
calculate delta
↓
checksum managed files
↓
backup
↓
add/update/remove owned artifacts
↓
write new state
```

---

## 9.6 Install-state v2

Track:

```json
{
  "toolkitVersion": "...",
  "preset": "...",
  "resolvedModules": [],
  "skills": [],
  "agents": [],
  "managedFiles": [],
  "checksums": {},
  "detectedPackages": [],
  "compatibilitySnapshot": {},
  "schemaVersion": 2
}
```

---

## 9.7 State migrations

Need:

```text
v1 → v2
v2 → future
```

No breaking old installs silently.

---

## 9.8 Safe update conflict strategy

Default:

```text
managed file drift
→ refuse
```

Options:

```text
--dry-run
--backup
--force
```

`--force` phải rõ rủi ro.

---

## Phase 9 DoD

- [ ] Native paths.
- [ ] Global preset-aware.
- [ ] Dependency resolver.
- [ ] Package detection.
- [ ] Delta update.
- [ ] State v2.
- [ ] Migration test.
- [ ] Windows/Linux.

---

# PHASE 10 — DOCTOR & CAPABILITY DETECTION

## Mục tiêu

`doctor` phải trả lời được:

```text
Toolkit có thật sự hoạt động trong machine/project này không?
```

---

## 10.1 Codex checks

```text
Codex executable
version
CODEX_HOME
AGENTS files
repo .agents/skills
user .agents/skills
project custom agents
agent schema
config syntax
```

---

## 10.2 Unity checks

```text
ProjectVersion.txt
Unity project
Unity executable
Unity Hub path
compatible version
batchmode capability
```

---

## 10.3 Git checks

```text
git executable
repo
status
safe.directory
```

---

## 10.4 Dreamy checks

```text
manifest
lock
package versions
known drift
compatibility support
missing dependency
```

---

## 10.5 Harness checks

```text
MCP?
Unity CLI?
Dreamy Editor Tools headless?
static-only?
```

---

## 10.6 Severity

```text
ERROR
WARN
INFO
```

Example:

```text
ERROR
skills installed in non-discovered path

WARN
Unity MCP unavailable

WARN
Dreamy UI has known dependency drift

INFO
dreamy-audio detected
```

---

## 10.7 JSON contract

```json
{
  "status": "warn",
  "checks": [],
  "capabilities": {},
  "recommendations": []
}
```

---

## Phase 10 DoD

- [ ] Real environment detection.
- [ ] Meaningful warning.
- [ ] JSON.
- [ ] Broken fixture tests.
- [ ] Harness capability report.

---

# PHASE 11 — REAL UNITY HARNESS

## Mục tiêu

Hoàn thiện vòng:

```text
edit
→ compile
→ console
→ test
→ diff
```

Đây là phase kỹ thuật quan trọng nhất.

---

## 11.1 Architecture

```text
dreamy-harness
    ↓
Adapter Resolver
    ├── Unity MCP
    ├── Dreamy Editor Tools headless
    ├── Unity CLI bridge
    └── Static fallback
```

---

## 11.2 Adapter priority

```text
1. verified MCP
2. verified Dreamy Editor Tools API
3. toolkit Unity CLI bridge
4. static degraded fallback
```

---

## 11.3 Compile

Real `compile` phải:

```text
trigger refresh
wait compile
capture compiler diagnostics
capture status
```

---

## 11.4 Console

Return:

```text
errors
warnings
exceptions
session/timestamp
```

---

## 11.5 EditMode

Return:

```text
passed
failed
skipped
duration
failure details
artifact
```

---

## 11.6 PlayMode

Same evidence contract.

---

## 11.7 Validate project

Potential checks:

```text
missing scripts
build scenes
manifest
asmdef
Dreamy validation
known package drift
```

---

## 11.8 Validate Addressables

Where available:

```text
group
profile
duplicate address
missing entry
catalog
build config
```

---

## 11.9 Android smoke build

At least:

```text
development build
artifact path
full log
result
```

---

## 11.10 iOS

On unsupported host:

```text
degraded with explicit reason
```

On supported host:

```text
Xcode project generation
```

---

## 11.11 Unity bridge strategy

Preferred long-term:

### A. Extend `com.dreamy.editor-tools`

Add verified public headless API.

Benefits:

```text
reuse existing build/scene/data validation
avoid duplicate tooling
```

### B. Optional editor-only toolkit bridge

If upstream package should remain independent:

```text
integrations/unity-harness/
```

or editor-only embedded package.

Must not create runtime dependency.

---

## 11.12 Evidence schema

```json
{
  "schemaVersion": 1,
  "adapter": "unity-cli",
  "operation": "compile",
  "status": "pass",
  "observedAt": "...",
  "exitCode": 0,
  "errors": [],
  "warnings": [],
  "diagnostics": [],
  "artifacts": [],
  "degradedReason": null
}
```

---

## 11.13 Never fake success

Nếu Unity không chạy:

```text
degraded
```

Không bao giờ:

```text
pass
```

chỉ vì static validation okay.

---

## Phase 11 DoD

- [ ] Compile real.
- [ ] Console real.
- [ ] EditMode real.
- [ ] PlayMode real.
- [ ] Stable evidence.
- [ ] Template project verified.
- [ ] Android smoke build.
- [ ] Degraded fallback correct.

---

# PHASE 12 — REAL BEHAVIOR EVAL RUNNER

## Mục tiêu

Biến 60 contract thành quality measurement thực.

---

## 12.1 Hai lớp eval

### Static

Fast CI:

```text
schema
IDs
expected arrays
forbidden claims
coverage
```

### Behavioral

Slower:

```text
run prompt
capture output
grade
```

---

## 12.2 Runner structure

```text
evals/
├── catalog.json
├── runner/
├── graders/
├── fixtures/
└── results/
```

---

## 12.3 Scoring dimensions

Giữ hướng hiện tại:

```text
routing       20%
decision      35%
safety        20%
verification  15%
clarity       10%
```

---

## 12.4 Routing

Grade:

```text
selected correct domain
correct Dreamy override
no dominant unrelated route
```

---

## 12.5 Decision

Example:

```text
Prompt:
Store coins in DataConfig

Pass:
Reject and route to Datasave
```

---

## 12.6 Safety

Check:

```text
forbiddenClaims
```

và safety-critical architecture.

---

## 12.7 Verification

Implementation answer phải có:

```text
compile/test/harness requirement
```

---

## 12.8 Golden + semantic grader

Use deterministic keyword/concept grader cho critical constraints.

Semantic grader cho cách diễn đạt linh hoạt.

---

## 12.9 Result artifact

```text
release/evals/<version>.json
```

Summary:

```text
total
pass
fail
category
critical
routing
```

---

## 12.10 Gates

```text
Alpha critical >= 90%
Beta critical  >= 95%
v1 critical    >= 98%
P0 safety      = 100%
```

---

## Phase 12 DoD

- [ ] Model runner.
- [ ] 60 executable.
- [ ] Score report.
- [ ] Critical gate.
- [ ] Actionable failures.


# PHASE 13 — COMPATIBILITY & PACKAGE DRIFT AUTOMATION

## Mục tiêu

Biến compatibility registry thành hệ thống có thể duy trì lâu dài khi Dreamy packages thay đổi.

---

## 13.1 Current limitation

Current refresh mainly validates metadata đã ghi và tạo report.

Nó chưa thực sự:

```text
scan upstream repo
read package.json
read asmdef
read latest tag
read dependency
compare commit
```

---

## 13.2 Add upstream scan

Tạo:

```text
scripts/scan-dreamy-packages.mjs
```

Với mỗi package:

```text
resolve repository
resolve ref/tag
read package.json
read Runtime asmdef
read Editor asmdef
read dependencies
read tests
read README version claims
record commit
```

---

## 13.3 Candidate vs verified

Không tự động overwrite compatibility truth.

Flow:

```text
Upstream scan
↓
Candidate report
↓
Maintainer review
↓
Verified registry update
```

Data states:

```text
observed-candidate
verified
drift
unsupported
```

---

## 13.4 Drift checks

Detect:

```text
package.json version != tag
template manifest != supported package version
lock resolved commit != expected
asmdef uses dependency missing in package.json
README sample version stale
Runtime references Editor
missing test assembly
```

---

## 13.5 Human report

Output cả:

```text
release/compatibility-drift-report.json
release/compatibility-drift-report.md
```

---

## Phase 13 DoD

- [ ] Upstream scan.
- [ ] Candidate/verified separation.
- [ ] Drift report.
- [ ] CI P0 gate.
- [ ] Package maintainer workflow.

---

# PHASE 14 — CI & RELEASE ENGINEERING

## Mục tiêu

Release phải reproducible và kiểm chứng được.

---

## 14.1 Split CI jobs

Recommended:

```text
validate
unit-test
static-eval
compatibility
package-smoke
release-check
```

Behavior model eval:

```text
nightly
manual
release candidate
```

nếu thời gian/chi phí cao.

---

## 14.2 OS matrix

Bắt buộc:

```text
Ubuntu
Windows
```

macOS thêm khi cần iOS/release verification.

---

## 14.3 Node matrix

Ít nhất:

```text
Node 20
Current LTS
```

---

## 14.4 npm pack smoke

CI:

```bash
npm pack
```

Sau đó install tarball vào fixture sạch.

Test:

```text
dreamy-kit validate
dreamy-kit install
dreamy-kit doctor
dreamy-kit uninstall
```

---

## 14.5 Version sync

Release check phải đảm bảo:

```text
toolkit.json
package.json
CHANGELOG
release tag
```

đồng bộ.

---

## 14.6 Generated files

Release gate fail nếu:

```text
run generator
→ git diff not clean
```

---

## 14.7 Release artifact

Publish:

```text
npm package
GitHub release archive
checksum
release notes
compatibility report
eval summary
```

---

## Phase 14 DoD

- [ ] Linux CI.
- [ ] Windows CI.
- [ ] npm pack smoke.
- [ ] Version sync.
- [ ] Generated file cleanliness.
- [ ] Release artifact reproducible.

---

# PHASE 15 — DREAMY TEMPLATE INTEGRATION

## Mục tiêu

Prove toolkit hoạt động trên canonical Dreamy base.

Target:

```text
Dreamy-Game-Foundation/dreamy-template-project
```

---

## 15.1 Install lifecycle

Run:

```text
install
doctor
update
uninstall
```

Verify user bytes preserved.

---

## 15.2 Representative tasks

Test ít nhất:

```text
1. Add Dreamy UI popup
2. Add DataConfig table
3. Add Datasave field/migration
4. Load Addressable prefab
5. Add AudioKey usage
6. Add feedback effect
7. Add localization key/binding
8. Add reusable service
9. Modify existing scene/prefab safely
10. Fix a forced compile error
```

---

## 15.3 Routing verification

Record:

```text
prompt
selected skills
selected agent
result
verification
```

---

## 15.4 Harness verification

At least:

```text
compile
console
EditMode
PlayMode where relevant
git diff
```

---

## Phase 15 DoD

- [ ] Full lifecycle passes.
- [ ] 10 representative tasks.
- [ ] No architecture violation.
- [ ] Harness evidence saved.
- [ ] Failures converted into evals.

---

# PHASE 16 — REAL GAME PROJECT DOGFOODING

## Mục tiêu

Không release 1.0 chỉ dựa trên template fixture.

Chọn ít nhất 2–3 project thật có profile khác nhau:

```text
UI-heavy
physics-heavy
content/system-heavy
```

---

## 16.1 Measure

Track:

```text
routing accuracy
wrong skill activation
missing skills
compile success
agent usefulness
context size
false warnings
installer conflict
Dreamy compatibility issue
```

---

## 16.2 Real-task sample

Target:

```text
20–30 tasks
```

Bao gồm:

```text
feature
bug
refactor
UI
save
physics
mobile build
performance
package update
```

---

## 16.3 Failure feedback loop

Mọi failure meaningful phải tạo một trong:

```text
new eval
skill update
rule update
harness fix
compatibility correction
```

Không fix riêng project rồi bỏ đó.

---

## Phase 16 DoD

- [ ] 2+ real games.
- [ ] 20+ real tasks.
- [ ] Task report.
- [ ] Failure-to-eval loop.
- [ ] No P0 install corruption.

---

# PHASE 17 — BETA HARDENING

## Mục tiêu

Chuyển từ feature-rich alpha sang beta đáng tin.

---

## 17.1 Freeze core schemas

Không thay schema tùy hứng.

Breaking changes cần migration.

---

## 17.2 Context tuning

Review:

```text
skill descriptions
overlap
preset size
duplicate references
unused skill
```

Remove những thứ không mang giá trị.

---

## 17.3 Documentation completion

Required:

```text
README
quickstart
installation
architecture
rules
skill authoring
agent authoring
orchestration
harness
evals
compatibility
release
troubleshooting
```

---

## 17.4 Windows-first hardening

Test:

```text
PowerShell
paths with spaces
Unity Hub paths
npm global
Git safe.directory
Windows separator
shell availability
```

---

## 17.5 Upgrade migration tests

Test:

```text
alpha install-state → beta
old preset → new preset
removed skill
renamed module
```

---

## Beta target

Recommended:

```text
0.8.0-beta.1
```

---

## Phase 17 DoD

- [ ] No known P0.
- [ ] Stable schemas.
- [ ] Full docs.
- [ ] Windows usability.
- [ ] Upgrade path.
- [ ] Real-project adoption.

---

# PHASE 18 — V1.0 PRODUCTION RELEASE

## Mục tiêu

Chỉ claim production-ready khi đủ evidence.

---

## V1 Gate — Codex Native

- [ ] Project skills discovered from `.agents/skills`.
- [ ] User skills discovered from correct user root.
- [ ] Custom agents parse and discover.
- [ ] AGENTS chain validated.
- [ ] No obsolete config assumptions.

---

## V1 Gate — Knowledge

- [ ] P0 Dreamy skills verified.
- [ ] P0 Unity skills operational/verified.
- [ ] Gameplay core operational.
- [ ] Mobile systems operational.
- [ ] Rendering module meaningful.
- [ ] No major template-only skill.

---

## V1 Gate — Installer

- [ ] Install.
- [ ] Detect.
- [ ] Doctor.
- [ ] Update.
- [ ] Uninstall.
- [ ] Dry-run.
- [ ] State migrations.
- [ ] Checksum protection.
- [ ] Windows/Linux.

---

## V1 Gate — Harness

- [ ] Git status.
- [ ] Git diff.
- [ ] Compile.
- [ ] Console.
- [ ] EditMode.
- [ ] PlayMode.
- [ ] Project validate.
- [ ] Android smoke build.
- [ ] Correct iOS degraded/build behavior.

---

## V1 Gate — Evals

- [ ] 60+ executable behavior cases.
- [ ] Critical pass >= 98%.
- [ ] P0 safety = 100%.
- [ ] Routing score tracked.
- [ ] Release eval artifact published.

---

## V1 Gate — Compatibility

- [ ] Verified package records.
- [ ] Upstream drift scan.
- [ ] No unsupported current API claim.
- [ ] P0 drift resolved or explicitly unsupported.

---

## V1 Gate — Dogfood

- [ ] Dreamy template.
- [ ] 2+ real games.
- [ ] 20+ real tasks.
- [ ] Failures integrated into eval suite.

---

## V1 Gate — Release

- [ ] npm artifact.
- [ ] GitHub release.
- [ ] Changelog.
- [ ] Checksums.
- [ ] Release notes.
- [ ] Compatibility report.
- [ ] Eval report.

---

# PHASE 19 — OPTIONAL CODEX PLUGIN DISTRIBUTION

## Mục tiêu

Sau khi direct install đã ổn định, cân nhắc package toolkit thành reusable Codex plugin/bundle.

Không làm sớm.

Plugin có thể bundle:

```text
Dreamy skills
Dreamy custom agents
optional Unity MCP dependency
tooling metadata
```

CLI installer vẫn có thể giữ cho:

```text
Unity project bootstrap
AGENTS setup
package detection
local profile
```

Plugin không thay thế mọi chức năng installer.

---

# 6. MODULE DEPENDENCY TARGET

Recommended graph:

```text
foundation
│
├── unity-core
│   ├── unity-gameplay
│   └── unity-rendering
│
├── game-systems
├── mobile
├── production
└── dreamy-foundation
    └── dreamy-packages
```

Suggested JSON dependencies:

```text
foundation:
[]

unity-core:
["foundation"]

unity-gameplay:
["foundation", "unity-core"]

unity-rendering:
["foundation", "unity-core"]

game-systems:
["foundation"]

mobile:
["foundation", "unity-core"]

production:
["foundation"]

dreamy-foundation:
["foundation"]

dreamy-packages:
["dreamy-foundation"]
```

Validator:

```text
cycle detection
missing dependency
stable resolution
dedup
```

---

# 7. PRESET TARGET

## core

```text
foundation
```

## unity-minimal

```text
foundation
minimal Unity skills
```

## unity-production

```text
foundation
unity-core
mobile
production
```

## unity-full

```text
foundation
unity-core
unity-gameplay
unity-rendering
game-systems
mobile
production
```

## dreamy-project

```text
foundation
unity-core
dreamy-foundation
dreamy-packages auto-filtered
```

## dreamy-production

```text
foundation
unity-core
unity-gameplay
game-systems
mobile
production
dreamy-foundation
dreamy-packages
```

## dreamy-package

```text
foundation
production
dreamy-foundation
package-specific skill
```

## dreamy-template

```text
dreamy-production
editor/toolkit maintenance
```

## dreamy-full

```text
all stable non-experimental modules
```

---

# 8. SKILL DEEPENING PRIORITY

## Tier A

```text
dreamy-feature
dreamy-core
dreamy-dataconfig
dreamy-datasave
dreamy-assets
dreamy-ui

unity-ui
unity-physics
unity-input-system
unity-animation
unity-addressables
unity-testing
```

## Tier B

```text
dreamy-audio
dreamy-feedback
dreamy-localization
dreamy-editor-tools

combat
projectile
movement
game-state
progression
upgrade

system-shop
system-iap
system-ads
system-analytics
```

## Tier C

```text
rendering
URP
shader
material
VFX
navigation
Cinemachine
```

---

# 9. IMMEDIATE ISSUE BACKLOG

## P0

1. Migrate project skills `.codex/skills` → `.agents/skills`.
2. Migrate user/global skills → `$HOME/.agents/skills`.
3. Add `name` to all custom agent TOMLs.
4. Remove/replace legacy per-agent config registration.
5. Add agent validator.
6. Normalize skill index paths to `/`.
7. Add metadata path portability validation.
8. Generate agent index.
9. Generate README agent list.
10. Remove dead legacy module.
11. Clarify eval maturity.
12. Implement real Unity compile adapter.
13. Implement real Unity console adapter.
14. Implement real EditMode adapter.
15. Implement real PlayMode adapter.
16. Expand doctor native Codex checks.

---

# 10. NEXT ISSUE BATCH

## P1

17. Add skill maturity.
18. Add duplicate boilerplate report.
19. Add context-budget report.
20. Make global install preset-aware.
21. Deepen dreamy-ui.
22. Deepen dreamy-core.
23. Deepen dreamy-dataconfig.
24. Deepen dreamy-datasave.
25. Deepen dreamy-assets.
26. Deepen unity-ui.
27. Deepen unity-physics.
28. Deepen unity-input-system.
29. Deepen unity-animation.
30. Deepen unity-addressables.
31. Rebuild unity-rendering module.
32. Add unity-rendering.
33. Add unity-urp.
34. Add unity-shader.
35. Add unity-material.
36. Add unity-vfx.
37. Add unity-particles.
38. Add unity-navigation.
39. Add unity-cinemachine.
40. Deepen combat.
41. Deepen projectile.
42. Deepen progression.
43. Deepen upgrade.
44. Deepen system-shop.
45. Deepen system-iap.
46. Deepen system-ads.
47. Delta-based update.
48. Install-state v2.
49. Migration system.
50. Full doctor diagnostics.
51. Real behavior eval runner.
52. Routing scoring.
53. Agent selection eval.
54. Upstream package scanner.
55. Module dependency resolver.
56. Module cycle validator.
57. Windows CI.
58. npm pack smoke.
59. Dreamy template integration.
60. Real-project dogfood protocol.

---

# 11. RELEASE MILESTONES

## 0.1.0-alpha.2

```text
Codex-native path repair
agent validity
POSIX metadata
catalog consistency
```

## 0.2.0-alpha

```text
Dreamy skill depth
Unity skill depth
module dependency cleanup
context report
```

## 0.3.0-alpha

```text
real compile
console
EditMode
PlayMode
doctor
```

## 0.4.0-alpha

```text
behavior eval runner
routing eval
agent eval
```

## 0.5.0-alpha

```text
rendering/navigation/Cinemachine
mobile systems depth
compatibility scanner
```

## 0.8.0-beta

```text
template dogfood
real game dogfood
Windows hardening
update migrations
```

## 0.9.0-beta

```text
release hardening
context tuning
documentation
```

## 1.0.0

```text
production release
```

---

# 12. RECOMMENDED EXECUTION ORDER

Một developer làm tuần tự:

```text
1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 8
7. Phase 9
8. Phase 10
9. Phase 11
10. Phase 12
11. Phase 6
12. Phase 7
13. Phase 5
14. Phase 13
15. Phase 14
16. Phase 15
17. Phase 16
18. Phase 17
19. Phase 18
20. Phase 19 optional
```

Lý do:

```text
correct integration
before
more content

deep core knowledge
before
niche knowledge

real verification
before
production claim
```

---

# 13. ACCEPTANCE STANDARD — SKILL

Mỗi operational skill:

- [ ] Valid frontmatter.
- [ ] Specific description.
- [ ] Positive triggers.
- [ ] Negative triggers.
- [ ] Required inspection.
- [ ] Domain-specific decision tree.
- [ ] Domain-specific workflow.
- [ ] Domain-specific failure modes.
- [ ] Verification.
- [ ] Dreamy integration where relevant.
- [ ] Valid references.
- [ ] No unsupported API claim.
- [ ] Eval coverage if P0.
- [ ] Routing test.

---

# 14. ACCEPTANCE STANDARD — AGENT

- [ ] `name`.
- [ ] `description`.
- [ ] `developer_instructions`.
- [ ] Narrow responsibility.
- [ ] Correct sandbox.
- [ ] No redundant role.
- [ ] Correct skill expectations.
- [ ] Native discovery.
- [ ] Selection eval.

---

# 15. ACCEPTANCE STANDARD — HARNESS

- [ ] Machine-readable JSON.
- [ ] Meaningful exit code.
- [ ] Actual adapter identified.
- [ ] Evidence timestamp.
- [ ] Diagnostics preserved.
- [ ] Explicit degraded state.
- [ ] Never fake pass.
- [ ] Unit fixture.
- [ ] Windows-safe.
- [ ] Real project smoke.

---

# 16. ACCEPTANCE STANDARD — PRESET

- [ ] Valid module graph.
- [ ] Dependencies resolved.
- [ ] No duplicates.
- [ ] Context budget controlled.
- [ ] No stub skill in production preset.
- [ ] Package auto-detection.
- [ ] Installer tests.

---

# 17. SUCCESS METRICS

Track:

```text
skill count
operational skill %
verified skill %
routing accuracy
critical eval pass %
harness real-operation %
installer pass %
doctor precision
compatibility drift count
preset metadata size
real-project success %
```

Suggested v1:

```text
P0 skills operational       100%
P0 Dreamy verified          100%
critical eval pass          >= 98%
P0 safety pass              100%
native install smoke        100%
unsupported API claims      0
real project task success   >= 90%
```

---

# 18. WHAT NOT TO PRIORITIZE NOW

Không ưu tiên tiếp:

```text
more schemas
more empty skill stubs
more agent names
more presets
cosmetic badges
DOTS
multiplayer
advanced shader specialization
plugin distribution
```

trước khi xong:

```text
native Codex install
agent validity
skill depth
real Unity harness
real behavioral eval
```

---

# 19. MASTER DEFINITION OF DONE

Toolkit hoàn thiện khi:

```text
Developer installs it into a Dreamy Unity project.

Codex natively discovers the correct local skills.

Codex natively discovers valid Dreamy custom agents.

A normal prompt activates only a small relevant subset.

Generic Unity industry rules apply first.

Dreamy overrides apply where architecture requires them.

Dreamy package API claims are compatibility-verified.

Codex implements the smallest architecture-consistent change.

Unity actually compiles.

Console is actually checked.

Relevant tests actually run.

The diff is actually reviewed.

Completion is backed by evidence.

Install/update/uninstall preserve user-owned instructions.

Behavior is protected by executable evals.

The toolkit is proven on the Dreamy template and real games.
```

---

# 20. FINAL CHECKLIST

## Native Codex

- [ ] Project `.agents/skills`.
- [ ] User `$HOME/.agents/skills`.
- [ ] Project `.codex/agents`.
- [ ] User `~/.codex/agents`.
- [ ] Agent names.
- [ ] No obsolete registry.
- [ ] AGENTS discovery.

## Portability

- [ ] POSIX catalog paths.
- [ ] Windows tests.
- [ ] Linux tests.
- [ ] Stable indexes.
- [ ] No dead modules.

## Skills

- [ ] Maturity.
- [ ] Dreamy depth.
- [ ] Unity depth.
- [ ] Gameplay depth.
- [ ] Systems depth.
- [ ] Rendering.
- [ ] Routing tests.
- [ ] Context budget.

## Agents

- [ ] Developer.
- [ ] Debugger.
- [ ] Reviewer.
- [ ] Tester.
- [ ] Unity Editor.
- [ ] Performance.
- [ ] Build.
- [ ] Package maintainer.
- [ ] Release validator.
- [ ] Docs manager.
- [ ] Skill author.

## Installer

- [ ] Install.
- [ ] Detect.
- [ ] Doctor.
- [ ] Update.
- [ ] Uninstall.
- [ ] Dry-run.
- [ ] Delta update.
- [ ] State migrations.
- [ ] Managed byte preservation.

## Harness

- [ ] Git status.
- [ ] Git diff.
- [ ] Compile.
- [ ] Console.
- [ ] EditMode.
- [ ] PlayMode.
- [ ] Project validation.
- [ ] Package validation.
- [ ] Addressables validation.
- [ ] Android smoke build.
- [ ] iOS behavior.

## Evals

- [ ] 60 static contracts.
- [ ] Model runner.
- [ ] Routing.
- [ ] Decision.
- [ ] Safety.
- [ ] Verification.
- [ ] Release scoring.

## Compatibility

- [ ] Upstream scan.
- [ ] Candidate review.
- [ ] Drift report.
- [ ] Verified commits.
- [ ] asmdef dependency checks.

## CI

- [ ] Validate.
- [ ] Unit.
- [ ] Static eval.
- [ ] Windows.
- [ ] Linux.
- [ ] npm pack.
- [ ] Release gate.

## Dogfood

- [ ] Dreamy template.
- [ ] Real game 1.
- [ ] Real game 2.
- [ ] 20+ real tasks.
- [ ] Failure→eval loop.

## Release

- [ ] alpha.2
- [ ] 0.2 alpha
- [ ] harness alpha
- [ ] beta
- [ ] RC
- [ ] v1.0
- [ ] optional plugin phase

---

# END

**Điểm bắt đầu nên là Phase 0.**

Repo hiện tại đã đủ rộng để tạm dừng việc tăng số lượng skill. Giá trị cao nhất bây giờ là làm đúng native Codex integration, nâng depth của các skill đã có, và nối toolkit với một Unity verification loop thực sự.
