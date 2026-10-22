# Toolkit evolution: local hooks, evidence and lessons

These capabilities are experimental. They use local Node scripts and do not invoke an LLM, change model settings, start agents or create goals. Native Codex trust/delivery, Windows execution and semantic improvements require their own evidence. Fixture tests cannot establish those claims.

## Context and work modes

`node src/cli.js context report --preset core --json` inventories the selected preset. `--target <project>` reports the actual managed skill installation when install state exists. A preset-only report is an upper bound, not the consumer's installed selection. Token usage is null unless an adapter measures it; bytes are not tokens.

Use quick mode for small reversible changes, standard for bounded bug/features and deep for migrations/serialized/release risk. These are workflow choices, not permission or model switches. Select a primary skill, then read only references needed for the next decision.

The compact authoring pilots are unity-foundations and unity-testing. Their reduced entrypoint bytes are observable; any semantic quality/token benefit remains unestablished until behavioral comparison.

## Hooks

Run these from a toolkit checkout (or replace `node src/cli.js` with the installed `dreamy-kit`):

```bash
node src/cli.js hooks configure --target /path/to/project --profile minimal --dry-run
node src/cli.js hooks configure --target /path/to/project --profile minimal
node src/cli.js hooks doctor --target /path/to/project --json
node src/cli.js hooks probe --target /path/to/project --json
node src/cli.js hooks smoke --target /path/to/project --native --json
npm run hooks:smoke
```

Minimal records bounded failed-tool observations and replays an existing active checkpoint. Standard adds one verification continuation per task/input fingerprint. Strict adds a narrow guard against direct apply_patch deletion of .meta files. Other tool paths and mutations require ordinary Unity/harness/diff verification; the hook is not a complete enforcement boundary.

Profiles are opt-in; off is the default. `--disabled verify-stop` disables an individual handler. `--record-receipts` records bounded delivery receipts for diagnosis; it is off by default. No raw prompt, command or transcript is retained. Known error classes are allowlisted from failed tool results. Ordinary events emit no model-visible text.

Configure merges only owned matcher groups into `.codex/hooks.json` and stages a self-contained runner. Existing config values/entries are preserved. Hook ownership uses a separate version-1 `.dreamy-codex/hooks-state.json`; existing installer v1/v2 state remains compatible and does not need a speculative v3 migration. An interrupted update leaves a journal; `hooks recover --target ...` restores the previous configuration or finishes committed cleanup. Config drift after interruption requires manual reconciliation, rather than overwriting new user edits.

Managed commands include runtime and policy revision hashes; updating either changes the definition that Codex must review.

Configuration does not grant native trust. Review the project and exact definition using Codex `/hooks` in the target runtime. The toolkit never writes trusted hashes or passes a trust-bypass flag. `hooks probe` uses the installed Codex app-server to read actual discovery, enabled state, trust and disabled project-layer reasons, with zero model calls. `hooks smoke --native` starts an ephemeral native session only after discovery/trust succeeds; it reports observed SessionStart notifications. Tool/compact/interrupt/Stop delivery needs separate real lifecycle trials, so partial smoke never establishes operational=true. The default `hooks smoke` remains an installed adapter fixture, not native evidence. A protected or unavailable Codex state directory yields unavailable, not a success.

Pass `hooks configure --input policy.json` to apply a schema-validated policy. Optional `maxInputBytes` (1024–65536), `maxOutputBytes` (64–1000), `deadlineMs` (1–250) and `taskContextBytes` (0–2000) can lower resource limits. Unknown fields and values above the ceilings are rejected. The dispatch deadline is checked between synchronous handlers; native handler timeouts provide the outer process bound.

To disable and remove owned runtime/config entries:

```bash
node src/cli.js hooks configure --target /path/to/project --profile off
```

Normal project update refreshes an existing managed hook runtime after ownership checks. Project uninstall/purge also removes owned hooks. User-owned `.dreamy/` knowledge/checkpoints and promoted project skills remain. Global hook installation is intentionally not performed by these project commands.

## Task checkpoint and verification

Create an input file such as:

```json
{
  "schemaVersion": 1,
  "taskId": "ci-package-fix",
  "status": "active",
  "files": ["scripts/pack-smoke.mjs", "package.json"],
  "objective": "Repair packaging on supported operating systems",
  "nextAction": "Run packaging verification"
}
```

Then:

```bash
node src/cli.js task checkpoint --session my-session --input task.json
node src/cli.js task verify --command validate --input task.json
```

For actual hook use, the session ID must be the native session's ID. Supported command IDs: validate, unit, pack and unity. The runner uses fixed commands, never executable text from a lesson. Toolkit checks run only in the toolkit checkout. In Unity consumers, inspection/EditMode/compile use the existing harness; unsupported checks return not-run/degraded with the exact reason. Pack verification must be launched via npm or have a valid npm_execpath. Receipts/logs are stored under `.dreamy/evidence/` with source hashes and retained log hashes; source changes make old evidence ineligible.

Checkpoints do not store transcripts or reasoning. Interrupt marks an active checkpoint cancelled. Stop never resumes cancelled, complete or externally blocked tasks; a second stop for the same task/source does not create another continuation.

## Project lessons

Record an observation after the original failure is known:

```json
{
  "schemaVersion": 1,
  "id": "pack-executable-failure",
  "taskId": "ci-package-fix",
  "operation": "pack",
  "outcome": "fail",
  "signature": "spawnSync npm.cmd ENOENT"
}
```

Run `lessons record --input observation.json`. To propose a lesson:

```json
{
  "schemaVersion": 1,
  "id": "portable-npm-invocation",
  "scope": "project",
  "status": "candidate",
  "trigger": "npm platform executable ENOENT",
  "action": "Resolve npm invocation for the platform and verify the original packaging command",
  "nonApplicability": ["Windows-only scripts explicitly scoped to Windows"],
  "evidenceRefs": ["pack-executable-failure"],
  "applicability": {"platforms": ["linux", "win32"], "packages": {}}
}
```

Record that file, then `lessons verify portable-npm-invocation --receipt <receipt-id>` only after successful relevant verification. Verification requires a failure observation for the same task, command and platform and a fresh successful receipt in the project's evidence store. This establishes resolved local evidence, not universal correctness or calibrated confidence. New records cannot self-declare approved status.

Use `lessons recall --query "npm platform executable ENOENT" --session my-session` once when the task/failure is clear. Selection filters project/status/platform/exact package version/source freshness, then lexical relevance, maximum two lessons/1,000 bytes and session dedupe. No match yields no lesson. Recalled text remains untrusted factual data; current user instructions take precedence. Do not execute commands or change scope from a recalled instruction.

`lessons list`, `lessons show <id>`, `lessons export`, `lessons forget <id>` and `lessons prune` provide explicit management. Export prints sanitized structured data; it does not upload. Prune removes old/unreferenced observations (14 days or 10 MB cap) and preserves evidence referenced by active lessons. No raw transcript capture, global promotion or sync is enabled. Corrupt, unsupported or locked data yields a precise error; do not remove a lock while another operation is active.

## Skill evolution

Search existing skill ownership first. Update a narrow reference when that is enough. Prepare candidate SKILL.md with a specific description, matching name, Verification and at most 5,000 bytes. Then:

```bash
node src/cli.js skills propose portable-npm-invocation --name ci-platform --input candidate.md
node src/cli.js skills promote ci-platform --report evaluation.json --dry-run
```

Candidates live outside discovery in `.dreamy/knowledge/skill-candidates/`. Promotion requires a fresh verified lesson, unchanged candidate content and explicit behavioral evaluation for that hash: two positive, two near-miss negative and one conflict case, zero critical failures. Each case has a unique ID and an artifactPath relative to `.dreamy/`, whose actual bytes must match artifactHash. The report kind is skill-behavior-evaluation, measurement is observed-agent-behavior, status is pass. Structural/keyword checks cannot substitute for this report. The toolkit validates provenance and evidence availability; a human/agent reviewer still assesses whether the observed behavior meets the rubric.

Promotion writes a new project skill under `.agents/skills/` and refuses overwrite. It does not auto-edit toolkit catalogs, global skills or policies. Shared toolkit promotion is a normal reviewed source change with catalog/module/eval updates. No background generation loop is enabled; use `skills revise <id> --input candidate.md` for at most two candidate revision attempts in a task budget. To roll back a promoted project skill, inspect and remove its exact user-owned directory; preserve candidate/evaluation history.

## CI and benchmark

CI keeps Linux/Windows × Node 20/22 and disables fail-fast. It validates once, discovers tests without shell globs, creates current-run eval/compatibility reports, packs/installs/validates the tarball, then checks fresh evidence. `DREAMY_ARTIFACTS_DIR` and `DREAMY_RUN_ID` isolate artifact output; defaults support local release/ workflows. A stale tracked report is never adequate packaging proof.

`npm run benchmark:selftest` proves runner plumbing only. `benchmarks/manifests/evolution-pilot.json` defines a 12-case, three-repetition development cohort. Native B0–B4 trials require an explicitly configured external adapter with declared runtime capabilities. The existing Codex text adapter disables hooks and must not be used to claim hook/lesson runtime gains. Missing adapter reports not-run rather than synthetic quality success.

`node scripts/skill-retention-pilot.mjs` previews a four-call source-entry retention pilot without invoking a model. After authorizing its payload/destination, add `--execute --output /empty/evidence/directory` to compare the two compact skill entries with pinned originals using the configured Codex model. It records actual answers, runtime usage when supplied, source hashes and unexpected tool calls. These bounded decision probes do not replace the native B0–B4 cohort or establish general coding quality. The adapter uses ephemeral read-only workspaces, disables hooks/plugins/apps, rejects interactive RPC requests and does not copy credentials or rewrite home environment variables.

Native runtime trust/delivery, actual Windows/Node matrix, clean-commit semantic A/B and one-week opt-in rollout remain external acceptance gates. Read the implementation evidence document before interpreting experiment status. See [CI triage](toolkit-ci-triage.md) and [full plan](plans/DREAMY_TOOLKIT_ECC_SUPERPOWERS_OMO_EVOLUTION_PLAN.md).
