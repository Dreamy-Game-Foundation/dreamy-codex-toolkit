# Debugging, performance and variants

Read for failures, keyword/build problems or measured rendering cost. Keep appearance changes within scope.

## Original reproduction first

| Symptom | Evidence / next bounded step |
|---|---|
| Pink/missing shader | Exact shader messages, assignment, pipeline/renderer/API and includes before rewriting |
| Player loses a feature | Runtime keywords, inclusion/stripping, quality tier and player logs/capture on actual API |
| Shadow/depth mismatch | Pass execution and shared clip/deformation; inspect buffers when possible |
| Transparent sorting/halo | Blend/texture alpha convention, depth/queue, ordering and scene inputs |
| Device flicker/banding | Precision, coordinate magnitude, derivatives/mips, depth conflicts and device capture |
| Preview works, scene fails | Preview fallback versus runtime inputs/keywords and actual camera output |
| Slow scene | Representative CPU/GPU capture, passes/draws, overdraw, samples/bandwidth and resolution |

Correct the observed cause, reimport/compile and rerun the repro. Retain error/configuration. Never fix project source through generated shader caches or silent package-cache patches. C# helper changes also require refresh/compile and Console inspection.

## Keywords and build correctness

Inventory independent choices and actual combinations in materials, quality tiers and runtime code. Distinguish local/global scope and material-authored versus runtime-only requirements using installed contracts. A naive combination product indicates risk, not final stripped variant count; obtain actual build/compiler data for claims.

Use uniforms for continuous controls. Choose branches versus variants from usage, register/sample cost, target behavior and build/memory budget. Neither “all branches are free” nor “every toggle needs a keyword” is a default rule.

If stripping removed a needed variant, preserve necessary combinations through the project's supported inclusion policy and verify the player. A ShaderVariantCollection or warmup call alone proves neither coverage nor hitch-free execution. Avoid disabling stripping project-wide or retaining every variant to hide missing usage evidence.

## Optimize the bottleneck

Record device/API, resolution, quality, workload/concurrency, source baseline and metric units. Candidate experiments: less transparent overdraw, fewer passes/samples, cheaper lighting, texture packing or reduced precision where safe. Compare one bounded change under the same workload while retaining appearance. `half` does not guarantee savings/results across backends; large coordinates and depth math need care.

Separate CPU batching from GPU time, build size, compilation time and runtime memory. Fewer lines/variants/draws may help one budget without helping another. Editor FPS cannot establish device frame-time/thermal budgets.

## Evidence

Deliver repro, files, source/configuration, commands/actions, logs/captures and remaining gaps. Separate import/save/reload, shader compile, appearance, parameter lifetime, player coverage and device cost.

Use relevant asset/lifecycle tests where they exercise behavior. Regex checks, clean C# Console or nonempty images cannot replace render acceptance. Capture intended camera/boundary states. Without a graphics-capable Editor, static preparation can proceed but render remains not-run/degraded. Missing build/device capability stays explicit; do not upgrade packages to bypass infrastructure issues.
