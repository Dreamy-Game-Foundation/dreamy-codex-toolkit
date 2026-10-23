# Skill Authoring

Use existing ownership and patch an appropriate skill before adding a new one. A recurring failure is evidence for a lesson; it only justifies a new skill when a distinct reusable workflow is missing.

Choose `authoringProfile` in skills/index.json:

- `compact-workflow`: a focused procedure with Scope, Decisions, Verification and References. Target 300–800 tokens; deterministic entrypoint cap 5,000 bytes. Specific triggers and near-miss exclusions belong in its frontmatter/scope.
- `domain-specialist` (existing default): domain/ownership model, required inspection, decision tree, workflow, invariants, anti-patterns, failures, verification, allowed claims and conditional references. Existing detailed headings remain validated for this profile.

Size is a budget, not a quality score. Move conditional material to references with explicit reading triggers. Do not repeat shared instructions in every paragraph. A short skill is valid if it explains the non-obvious decisions and what proves success.

Keep package API claims tied to compatibility/source evidence. Preserve user scope; project preferences are not global rules. Do not bake model choice, automatic delegation or external actions into skill activation.

For behavior-changing candidates, prepare positive cases, near-miss negatives and a conflict case. Structural validation/keyword matches do not establish behavioral improvement. Use the existing benchmark runner, retain provenance and inspect actual artifacts. See [evolution workflow](toolkit-evolution.md) for candidates, promotion, bounded recall and rollback.
