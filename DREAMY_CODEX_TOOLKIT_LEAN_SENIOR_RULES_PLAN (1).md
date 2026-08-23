# Dreamy Codex Toolkit — Lean Senior Engineering Rules Plan

> Goal: add senior-level engineering guidance without bloating agent context or increasing token cost unnecessarily.

---

# 1. Design Goal

Dreamy Codex Toolkit should have a **small always-on Senior Core** and load deeper architecture knowledge only when relevant.

Target architecture:

```text
ALWAYS LOADED
Senior Core
~300–600 tokens
        ↓
CONDITIONAL
architecture-patterns skill
        ↓
ON DEMAND
specific pattern/reference
```

Do **not** load full SOLID explanations, MVP, Strategy, State, Factory, Observer, etc. for every task.

The main principle is:

> Prefer the simplest concrete design that preserves ownership, dependency direction, lifecycle correctness, testability, and required behavior. Introduce abstraction or patterns only when a real problem justifies the complexity.

---

# 2. Keep Only 7 Global Senior Rules

These are the only new senior rules that should normally be always available.

## 2.1 Explicit Ownership

Every important state/resource/behavior should have a clear owner.

Ask:

```text
Who creates it?
Who mutates it?
Who disposes/cancels it?
Who persists it?
Who publishes changes?
Who decides transitions?
```

Especially important for:

```text
async
events
pooling
save data
UI
Addressables handles
scene lifecycle
SDK callbacks
```

## 2.2 Dependency Direction

Dependencies should point toward stable owners and lower-level abstractions.

Preferred conceptual direction:

```text
foundation
    ↑
domain
    ↑
feature
    ↑
presentation / composition
```

Rules:

```text
Runtime MUST NOT depend on Editor.
Reusable packages MUST NOT depend on concrete game-project code.
Avoid circular feature dependencies.
Leaf objects SHOULD NOT discover global dependencies unnecessarily.
```

## 2.3 Pragmatic SOLID

SOLID is a **diagnostic framework**, not a requirement to maximize abstraction.

Compact interpretation:

```text
SRP
One clear cohesive responsibility / reason for business change.

OCP
Create extension seams only when real variation exists.

LSP
Implementations must preserve the observable contract expected by consumers.

ISP
Consumers should depend only on the capability they actually need.

DIP
High-level policy should not depend directly on volatile implementation details.
```

Critical rule:

```text
Interface != SOLID.
Factory != OCP.
More classes != better architecture.
```

Do not create interfaces, factories, providers, or extension points without a real boundary or variation.

## 2.4 KISS + YAGNI + Pragmatic DRY

Prefer the simplest design that preserves required invariants.

Do not add:

```text
future extension points
unused interfaces
generic factories
premature frameworks
configurability with no current consumer
```

DRY means:

```text
Do not duplicate knowledge.
```

It does **not** mean every similar code fragment must share an abstraction.

Duplicated business rules are dangerous.

Some duplicated syntax is acceptable when abstraction would couple unrelated concepts.

## 2.5 Composition Over Inheritance

Prefer composition when behaviors vary independently.

Use inheritance only when the subtype is genuinely substitutable and shares a stable contract.

Avoid subclass-tree explosions when behavior dimensions can be composed.

## 2.6 Pattern Justification

Before introducing a nontrivial pattern, answer:

```text
What concrete problem exists?
What variation/force requires the pattern?
What simpler option was considered?
Why is the simpler option insufficient?
What complexity does the pattern add?
How will the result be verified?
```

If these cannot be answered:

```text
Use a normal class/method.
```

## 2.7 Verify Behavior, Not Intention

A design is not correct because it:

```text
looks clean
uses SOLID vocabulary
uses a known pattern
compiles mentally
```

Prefer executable or observable verification:

```text
compile
tests
asmdef validation
project inspection
runtime reproduction
git diff
build evidence
```

Never claim:

```text
verified
tested
supported
```

without corresponding evidence.

---

# 3. Do NOT Add Every Pattern as a Global Rule

Patterns are **decision tools**, not universal constraints.

Do not globally load:

```text
Strategy
State
Observer
Command
Factory
Builder
Adapter
Facade
Decorator
Repository
Specification
MVP
MVC
MVVM
```

Instead create one conditional skill:

```text
skills/architecture-patterns/
```

Recommended structure:

```text
skills/architecture-patterns/
├── SKILL.md
└── references/
    ├── pattern-selection.md
    ├── strategy.md
    ├── state.md
    ├── observer-event-bus.md
    ├── command.md
    ├── factory.md
    ├── adapter.md
    ├── facade.md
    ├── mvp.md
    └── anti-patterns.md
```

Add secondary references later only when real use cases justify them.

---

# 4. Pattern Selection Reference

`pattern-selection.md` should be compact.

```text
Need interchangeable algorithms/policies?
→ Strategy

Need mutually exclusive behavior with transitions and entry/exit lifecycle?
→ State

Need notification to multiple independent consumers?
→ Observer / Event Bus

Need a request represented as data for queue/undo/replay?
→ Command

Need complex or varying creation policy?
→ Factory

Need to translate an incompatible API?
→ Adapter

Need a simpler stable entrypoint over a complex subsystem?
→ Facade

Need non-trivial UI orchestration separated from rendering?
→ MVP-like View + Presenter

No real force?
→ Use a normal class/method.
```

The final branch is mandatory.

---

# 5. Architecture Patterns Skill Activation

Load `architecture-patterns` only for tasks involving:

```text
architecture
refactor
design decision
dependency structure
UI architecture
multiple implementations
state-machine design
event architecture
package boundaries
SDK abstraction
```

Do not load it for simple tasks such as:

```text
fix a typo
rename a field
simple null guard
small UI animation
straightforward bug with known root cause
```

---

# 6. MVP Guidance

MVP should be a **conditional recommendation**, not a mandatory UI framework.

Use MVP-like separation for non-trivial flows:

```text
Shop
Upgrade
Reward
Mission
Settings
Multi-step panels
```

Preferred boundary:

```text
View
    ↓ user intent
Presenter / Controller
    ↓
Domain / Services
```

View owns:

```text
serialized references
rendering
visual state
local animation
input intent
```

Presenter/Controller owns:

```text
flow
decision logic
domain orchestration
navigation requests
save/economy interaction through proper owners
```

Do not force Presenter or View interfaces for tiny visual-only components.

---

# 7. Dependency Injection Guidance

Do not add a global DI framework requirement.

DI means:

> Dependencies are provided by an owning composition boundary instead of being discovered implicitly by every leaf object.

Recommended Unity shape:

```text
Composition Root
      ↓ resolve
Feature Root
      ↓ pass
Presenter / Controller
      ↓ pass
Leaf component
```

Allowed mechanisms:

```text
constructor injection for pure C#
method/Initialize injection
serialized dependencies
factory-created dependencies
service resolution at composition roots
```

Service Locator remains acceptable near bootstrap/composition boundaries.

Avoid Service Locator in leaf objects unless justified.

---

# 8. Anti-Patterns Worth Documenting

Keep a single compact reference:

```text
anti-patterns.md
```

Include the highest-value smells:

```text
God Object
Manager-of-Everything
Singleton Everywhere
Service Locator Everywhere
Event Bus Everywhere
Interface-per-class
Factory-per-constructor
Inheritance explosion
Boolean state explosion
Static mutable state
UI business logic
Runtime → Editor dependency
Package → project dependency
Premature generic framework
Hidden async ownership
Config / Save / Runtime state mixing
```

Do not make each anti-pattern a separate global rule.

---

# 9. Reuse Existing Rules Instead of Duplicating Them

Before creating a new rule, check whether the repository already covers the behavior through:

```text
minimal-safe-change
no-speculative-abstraction
follow-existing-architecture
composition-root
service-resolution
ui-boundary
runtime/editor separation
verify-before-done
```

New senior rules should **generalize or reference** existing rules, not copy them.

If two rules say almost the same thing:

```text
merge or cross-reference
```

rather than loading both into every agent.

---

# 10. Token Budget

Recommended context budget:

```text
Senior Core:
~300–600 tokens total

Agent-specific instructions:
keep focused

Primary skill:
load when relevant

Supporting skills:
0–2 normally

Pattern reference:
load only when a pattern decision is actually needed
```

Do not optimize by deleting useful verification.

Optimize by avoiding irrelevant context.

Principle:

> Minimize context, not engineering quality.

---

# 11. Skill Composition Rule

For most tasks:

```text
1 primary skill
+ 0–2 supporting skills
+ compact global rules
```

Example:

```text
Task:
Pooled enemy continues async attack after despawn

Primary:
gameplay-pooling

Supporting:
unity-async
enemy-ai

Global:
Senior Core
```

Do not activate ten skills “just in case.”

---

# 12. Agent Integration

Only architecture-capable agents need the full Senior Core.

## Architect

Uses all Senior Core rules and conditionally loads `architecture-patterns`.

Primary questions:

```text
Who owns this?
What depends on what?
What actually varies?
Is abstraction justified?
What is the simplest safe design?
```

## Unity Developer

Uses Senior Core during implementation.

Should prefer existing project architecture and avoid inventing patterns unnecessarily.

## Code Reviewer

Checks:

```text
ownership
dependency direction
hidden dependencies
unnecessary abstraction
substitutability
wide interfaces
UI/domain leakage
lifecycle correctness
```

Findings must explain actual impact.

## Tester

Uses ownership/boundaries to choose valid test seams.

Must not request interfaces solely to make mocking easier when a cheaper real test exists.

## Skill Author

Every pattern reference must contain:

```text
when to use
when not to use
simpler alternative
trade-offs
Unity implications
verification
```

---

# 13. Minimal Eval Set

Do not build a huge senior-rule benchmark initially.

Create approximately 10–15 focused cases.

Examples:

## SOLID / YAGNI

```text
Only one damage formula exists.
User requests Strategy + Factory for future extensibility.

Expected:
Keep simple design unless real variation exists.
```

## SRP

```text
ShopPanel renders UI, calculates economy, edits save, sends analytics.

Expected:
Identify mixed ownership and separate meaningful responsibilities.
```

## LSP

```text
One implementation requires hidden Init() before normal interface calls.

Expected:
Identify broken substitutability/contract.
```

## DI

```text
Projectile calls ServiceLocator.Get() every spawn.

Expected:
Prefer dependency passed from owning creation/composition boundary.
```

## Events

```text
Owned child needs to tell direct owner something.

Expected:
Prefer direct call rather than global EventBus.
```

## Pattern selection

```text
Three interchangeable attack algorithms.
→ Strategy
```

```text
AI behavior with meaningful transitions and entry/exit cleanup.
→ State
```

```text
Simple constructor with no creation variation.
→ No Factory
```

The most important eval type is:

```text
Can the agent correctly decide NOT to use a pattern?
```

---

# 14. Implementation Plan

## Step 1 — Add Lean Senior Core

Create/merge approximately one compact `engineering.senior-core` rule or a very small equivalent set.

Do not create 20 always-loaded rules.

## Step 2 — Deduplicate Existing Rules

Check overlap with current core/Dreamy/Unity rules.

Remove redundant wording.

## Step 3 — Add `architecture-patterns` Skill

Start only with:

```text
pattern-selection
Strategy
State
Observer/Event Bus
Factory
Adapter
Facade
MVP
anti-patterns
```

Add Command if real use cases already exist.

## Step 4 — Integrate Architect / Developer / Reviewer

Do not update every agent immediately.

Start with the three agents where architecture reasoning matters most.

## Step 5 — Add 10–15 Focused Eval Cases

Focus on:

```text
correct architecture choice
rejection of unnecessary pattern
ownership
dependency direction
MVP boundary
Service Locator misuse
```

## Step 6 — Measure

Compare:

```text
before Senior Core
vs
after Senior Core
```

Measure:

```text
architecture decision accuracy
unnecessary abstraction rate
pattern overuse
token usage
```

If quality does not improve enough to justify context cost:

```text
simplify further
```

---

# 15. Definition of Done

The lean Senior Rules layer is complete when:

- [ ] only 6–8 compact global senior principles are always loaded;
- [ ] existing rules are reused rather than duplicated;
- [ ] SOLID is pragmatic, not interface-driven;
- [ ] DI does not require a framework;
- [ ] design patterns live in a conditional skill;
- [ ] every pattern has a “when not to use” section;
- [ ] MVP is conditional, not mandatory;
- [ ] Architect/Developer/Reviewer use the same senior principles;
- [ ] skill activation remains narrow;
- [ ] at least 10–15 architecture decision evals exist;
- [ ] unnecessary-pattern cases are tested;
- [ ] token increase remains small and measurable.

---

# 16. Final Rule

The entire senior layer should reinforce this order:

```text
Ownership
    ↓
Dependency direction
    ↓
Lifecycle correctness
    ↓
Simple concrete design
    ↓
Pattern only when justified
    ↓
Verification
```

Not:

```text
SOLID vocabulary
    ↓
more interfaces
    ↓
more factories
    ↓
more files
    ↓
looks senior
```

A senior agent must be equally capable of recommending:

```text
Strategy Pattern
```

and saying:

```text
A normal class and direct method call are better here.
```

That restraint is part of the standard.
