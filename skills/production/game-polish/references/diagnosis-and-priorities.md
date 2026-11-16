# Diagnose before embellishing

Read when choosing the problem, ordering a backlog or reviewing a broad polish request.

## Intent and baseline

Identify the action and desired quality in player terms: a heavy swing with a readable contact, a soft reward with quick continuation, a precise landing. “Juicy” alone is not acceptance. Preserve established genre, art and animation choices. Inspect existing project evidence before asking for information; ask narrowly when an unknown changes implementation or acceptance.

Map **intent → input → control response → contact/result → presentation → recovery/next action**. Find where expected and observed behavior first differ. Presentation can make a correct action unclear; a missed input or incorrect collision is a different cause. Fixing either can be within a polish request, but changing rules, difficulty, economy or content needs scope support.

Record a repeatable scenario, source revision plus relevant dirty/config state, real input path, camera, quality/resolution and target. Capture only evidence available: source establishes implementation, clips show motion, hardware observation establishes device experience. Screenshot-only or video-only reviews remain hypotheses about unobserved behavior. Do not require a new telemetry system or benchmark scene for every adjustment.

## Decision lenses

| Symptom | Inspect first | Candidate experiment | Guardrail |
| --- | --- | --- | --- |
| Input feels ignored | Action sampling, legal state, modal gate, buffer consumption | Adjust acceptance/response at the actual owner | No stale actions or extra jump/attack |
| Movement feels floaty | Acceleration, braking, gravity/air control, camera lag, pose | Tune the dominant cause independently | Preserve deliberate inertia; do not replace the controller |
| Contact lacks force | Hit frame, authoritative result, pose, reaction, sound onset | Align contact and one clear reaction | Do not mask hit detection errors with shake |
| Busy effects hide action | Silhouette, occlusion, simultaneous cues and camera | Remove/decrease conflicting layers | Important result remains readable with a channel off |
| UI feels slow | Press/pending/result/ready timings, blocking animation | Acknowledge input early; shorten unnecessary blocking | Success cue follows confirmation, not mere intent |
| Loop stalls | Waiting, recovery, transitions and repeated celebration | Reduce a specific dead interval | Preserve meaningful tension and decision time |

Readability includes visual hierarchy, contrast, size at actual camera distance, direction and threat/result distinction. More bloom, saturation or movement can worsen it. If a single layout, VFX or performance defect fully explains the task, use its narrower workflow rather than broadening the pass.

## Priorities and experiments

For substantial work, record observation/evidence separately from hypothesis, proposed change, owner, expected benefit, cost/risk, acceptance and verification. Rank qualitatively by frequency, impact on the core action and confidence, then implementation cost/risk. Avoid invented precise scores. P0 covers clear interaction/readability failures; P1 covers core feel; P2 covers embellishment. These labels are work priorities, not measured UX ratings.

One experiment changes a small causally related group. Retain old/new values and units, the reason, scenario and outcome. A/B can be two comparable runs/configurations; a permanent debug toggle is optional. Preserve unaffected successful work. If evidence contradicts the hypothesis, revise it instead of layering effects onto the wrong cause.

For a game-wide pass maintain the agreed coverage: primary verbs, main loop, relevant HUD/menu interactions, win/lose/retry, loading and transitions. Start with a representative interaction to validate direction, then finish coverage. For audit/plan-only tasks deliver findings, priorities and proposed experiments without editing the game.

## Research basis and limits

- [Celeste & Forgiveness](https://www.maddymakesgames.com/articles/celeste_and_forgiveness/) illustrates control allowances as game-feel techniques; it does not make them requirements for other genres.
- [Good Game Feel, DiGRA 2018](https://dl.digra.org/index.php/dl/article/view/936/) offers a developer-grounded framework; its abstract is a basis for structured analysis, not a universal tuning table.
- [CHI 2024: How does Juicy Game Feedback Motivate?](https://people.csail.mit.edu/dkao/pdf/3613904.3642656.pdf) found that amplification in the tested action RPG could undermine motivation when causal links and success distinctions became less clear. Treat this as evidence to test coherence, not proof that amplification always harms games.

These sources informed the workflow; they do not validate this skill's behavior or a project's subjective quality. Do not copy tuning numbers from another game as defaults.
