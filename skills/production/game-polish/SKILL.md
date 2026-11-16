---
name: game-polish
description: Polish existing Unity gameplay and UI interactions through game-feel diagnosis, targeted tuning and before/after verification. Use for improving responsiveness, impact, readability or interaction rhythm; route isolated VFX authoring, reskins and performance bugs to their specialists.
---

# Game Polish

## Scope

Improve an existing interaction or a requested game-wide pass. Supports Unity with optional verified Dreamy integration. Preserve the requested mood, mechanics, art direction and plan-only/no-build/no-AI choices. A tense, heavy or quiet interaction need not become fast or exuberant. Isolated asset creation, layout repairs, runtime bugs and profiling tasks stay with their domain owners.

## Decisions

1. Establish audit/plan versus implementation, the interaction/coverage in scope, desired feel, input and target device. Inspect instructions, current changes, Unity version, manifest/lock and the input → gameplay result → presentation path before package claims. Reuse existing config, camera, tween, audio, feedback and pool owners. Neither a feedback package nor a new framework is required.
2. Reproduce a representative scenario and retain a baseline tied to source/config, camera, resolution and state. Separate observation, hypothesis and intended change. A clip can suggest a timing problem; it cannot establish code causality or device input latency. Read [diagnosis-and-priorities.md](references/diagnosis-and-priorities.md) to identify the earliest broken link and rank work by player impact, frequency, confidence, cost and risk.
3. Set acceptance and invariants before tuning. Fix dropped input, mismatched contact, obscured information or blocked interactions ahead of decorative layers. Read [control-and-impact.md](references/control-and-impact.md) for control, physicality, camera and impact; read [ui-reward-and-rhythm.md](references/ui-reward-and-rhythm.md) for UI, rewards and loop continuity. Use only relevant branches. Values are experiments with units, not universal presets. Identify rule/difficulty changes explicitly; do not infer permission to redesign from “polish”.
4. Implement a small causally related group, replay, then keep, adjust or revert it against acceptance. Match anticipation/contact/recovery and coordinate channels without obscuring outcomes. Keep damage/reward authority in gameplay owners; distinguish predicted input cues from confirmed outcomes. Define clock scope before hit-stop/slow motion; preserve pause, input, UI and network behavior. Cancel owned work and reset pooled presentation so stale callbacks cannot affect a new lifetime. Preserve GUIDs/bindings and use verified Editor mutation for serialized assets.
5. Compare at normal speed under matching conditions; use slow motion for diagnosis. Review actual motion, listen when judging audio, and use device evidence for haptics/performance claims. Read [verification.md](references/verification.md) before accepting changes. A pilot proves a direction; for whole-game requests continue through the agreed loop, UI and transition coverage. Stop at the requested result or explicit limit, retaining concrete gaps when tools or evidence are unavailable.

## Verification

After C# changes refresh/compile and read Console; select focused regression checks for changed behavior and lifecycle risks. Reload changed assets when relevant. Separate function, presentation, feel, audio, performance and human acceptance; screenshots, scripts and compile success prove different things. Report exact missing checks and reasons as degraded/not-run. Review diff/status and hand off changes, useful parameters, evidence and remaining gaps. Do not claim improved enjoyment, retention or device budgets without matching evidence.

## References

- Diagnosis, prioritization and scope: [diagnosis-and-priorities.md](references/diagnosis-and-priorities.md).
- Control, impact, camera and audio: [control-and-impact.md](references/control-and-impact.md).
- UI, rewards and rhythm: [ui-reward-and-rhythm.md](references/ui-reward-and-rhythm.md).
- Acceptance, capture and regression: [verification.md](references/verification.md).
- For a substantial pass use [polish-pass.md](assets/polish-pass.md); omit irrelevant fields for small edits. Available input/movement/combat, VFX authoring, camera, animation, UI, visual-review, feedback/audio and profiling skills provide specialist detail; absence does not block ordinary scoped work.
