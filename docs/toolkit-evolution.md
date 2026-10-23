# Toolkit evolution: local hooks, evidence and lessons

These capabilities are experimental. Hooks, lessons, skill drafts, preparation and rollout snapshots run locally without model calls. Decision benchmarks require an explicitly reviewed model/payload plan and a separate execution flag; they never change global model/account settings. Native delivery and semantic improvements require their own evidence. See the [Vietnamese owner handoff](toolkit-evolution-handoff.vi.md) for the concrete steps still requiring user action.

Current implementation merged through PR #1 on 23 October 2026, still version `0.1.0-alpha.3`. See the [feature/fix inventory](toolkit-evolution-implementation.md#feature-and-fix-inventory--23-october-2026) and [native acceptance report](toolkit-acceptance-lab-report.vi.md). Source merge does not publish a new CLI automatically; use an updated checkout/executable before updating managed project assets.

## Upgrade and compatibility

From the current toolkit checkout:

```bash
node src/cli.js update --target /path/to/project --dry-run
node src/cli.js update --target /path/to/project --backup
node src/cli.js doctor --target /path/to/project --json
```

Run these only against a project you intend to update; inspect existing changes/ownership first. `update` applies the source bundled with that CLI; it does not download or self-update the executable. For existing hooks it refreshes the managed runtime/policy after ownership checks, so native definitions may require review again. Do not use `--force` to hide drift. `task checkpoint` is a two-word subcommand, not top-level `checkpoint`; use an absolute checkout entrypoint if the PATH executable is older despite the same alpha version label.

## Context and work modes

`node src/cli.js context report --preset core --json` inventories the selected preset. `--target <project>` reports the actual managed skill installation when install state exists. A preset-only report is an upper bound, not the consumer's installed selection. Token usage is null unless an adapter measures it; bytes are not tokens.

Use quick mode for small reversible changes, standard for bounded bug/features and deep for migrations/serialized/release risk. These are workflow choices, not permission or model switches. Select a primary skill, then read only references needed for the next decision.

The compact authoring pilots are unity-foundations and unity-testing. Their byte reductions and the small authorized source-entry pilot are measured in the implementation report. Broader coding-quality and native-hook gains remain unestablished.

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

Minimal records bounded failed-tool observations when the response provides an integer `exit_code` or `exitCode`, and replays an existing active checkpoint. Codex 0.163.0 native Bash sends raw stdout without process status, so failure observation is unsupported on that response path even when delivery succeeds. With receipts enabled, updated runners report `metrics.diagnostics` with `missing-exit-code`, tool category and response kind; raw stdout/commands are not captured or parsed for status. Standard adds one verification continuation per task/input fingerprint. Strict adds a narrow guard against direct apply_patch deletion of .meta files. Other tool paths and mutations require ordinary Unity/harness/diff verification; the hook is not a complete enforcement boundary.

Profiles are opt-in; off is the default. `--disabled verify-stop` disables an individual handler. `--record-receipts` records bounded delivery receipts for diagnosis; it is off by default. No raw prompt, command or transcript is retained. Known error classes are allowlisted from failed tool results. Ordinary events emit no model-visible text.

For native Bash on **Codex 0.163.0**, an opt-in compatibility adapter can recover process status from the runtime's completed-command metadata. Set `toolStatusSource` in a policy input file:

```json
{"schemaVersion":1,"profile":"minimal","recordReceipts":true,"toolStatusSource":"codex-transcript-0.163"}
```

```bash
node src/cli.js hooks configure --input policy.json --target /path/to/project --json
```

Review the changed definitions in native `/hooks` before testing. Default `response-only` never reads transcripts. Opt-in reads at most 64 KiB of the head and 128 KiB of the tail of the event's transcript under `$CODEX_HOME/sessions` (default `~/.codex/sessions`), into local memory only. The path must not contain symlinks. The adapter requires a matching session header, exact runtime version `0.163.0`, project cwd, turn ID, tool-call ID and a single typed completed `CommandExecution` record no older than five minutes. It rejects subagent contexts, incomplete/oversized metadata, missing/out-of-window results, ambiguous matches and unsupported formats/versions. It does not scan older history or parse stdout for exit status. Only status and an allowlisted signature reach the observation; receipt diagnostics identify the status source. Reading raw bounded windows can include chat/command text in memory, but none is copied to toolkit evidence or model context.

The transcript format is an unstable implementation detail, so this compatibility adapter is version-specific and optional. Missing evidence remains `missing-exit-code`; it does not prove success. Fixture/replay checks are not native Extension acceptance. To disable the adapter, configure with `toolStatusSource: "response-only"` and review the changed definitions again. See [native test follow-up](toolkit-acceptance-lab-report.vi.md).

Configure merges only owned matcher groups into `.codex/hooks.json` and stages a self-contained runner. Existing config values/entries are preserved. Hook ownership uses a separate version-1 `.dreamy-codex/hooks-state.json`; existing installer v1/v2 state remains compatible and does not need a speculative v3 migration. An interrupted update leaves a journal; `hooks recover --target ...` restores the previous configuration or finishes committed cleanup. Config drift after interruption requires manual reconciliation, rather than overwriting new user edits.

Managed commands include runtime and policy revision hashes; updating either changes the definition that Codex must review.

Configuration does not grant native trust. Review the project and exact definition using Codex `/hooks` in the target runtime. The toolkit never writes trusted hashes or passes a trust-bypass flag. `hooks probe` uses the installed Codex app-server to read actual discovery, enabled state, trust and disabled project-layer reasons, with zero model calls. `hooks smoke --native` starts an ephemeral native session only after discovery/trust succeeds; it reports observed SessionStart notifications. Codex 0.163.0 drains pending SessionStart hooks in the first user turn, so a thread-only smoke returns not-run (exit 2) without implying a trust failure or retrying with a model. Delivery must then be checked during a separately authorized first-turn trial. A failed observed hook reports fail. Tool/compact/interrupt/Stop delivery needs separate real lifecycle trials, so partial smoke never establishes operational=true. The default `hooks smoke` remains an installed adapter fixture, not native evidence. A protected or unavailable Codex state directory yields unavailable, not a success.

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

Storage is `.dreamy/checkpoints/<session-key>.json`, keyed by native `session_id`, not a separately assumed thread ID. A new chat with a new ID does not automatically load an old chat's checkpoint. Creating a new task in the same session replaces that session's checkpoint; preserve evidence bytes first when auditing a previous cancelled task. Same-session replay also requires an active unchanged checkpoint and actual runtime context delivery; reading a JSON file manually is not proof of injection.

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

Search existing skill ownership first. Update a narrow reference when that is enough. Use `skills draft` to generate a project candidate from a fresh verified lesson without calling a model, or provide a reviewed SKILL.md with a specific description, matching name, Verification and at most 5,000 bytes. Then:

```bash
node src/cli.js skills draft portable-npm-invocation --name ci-platform
node src/cli.js skills prepare-evaluation ci-platform --input behavior-cases.json
# Alternatively: skills propose portable-npm-invocation --name ci-platform --input candidate.md
node src/cli.js skills promote ci-platform --report evaluation.json --dry-run
```

Drafts are generated from the verified trigger, action, exclusions and receipt; they are not behavioral improvements by themselves. Evaluation input has a cases array of unique id/kind/prompt/expectedBehavior records, with at least two positive, two negative and one conflict case. `prepare-evaluation` creates a candidate-hash-bound plan without execution or pass claims. Candidates live outside discovery in `.dreamy/knowledge/skill-candidates/`. Promotion requires a fresh verified lesson, unchanged candidate content and explicit behavioral evaluation for that hash: two positive, two near-miss negative and one conflict case, zero critical failures. Each case has a unique ID and an artifactPath relative to `.dreamy/`, whose actual bytes must match artifactHash. The report kind is skill-behavior-evaluation, measurement is observed-agent-behavior, status is pass. Structural/keyword checks cannot substitute for this report. The toolkit validates provenance and evidence availability; a human/agent reviewer still assesses whether the observed behavior meets the rubric.

Promotion retains its reviewed report in the candidate directory so B4 can recheck provenance/artifact hashes and lesson freshness. Promotion writes a new project skill under `.agents/skills/` and refuses overwrite. It does not auto-edit toolkit catalogs, global skills or policies. Shared toolkit promotion is a normal reviewed source change with catalog/module/eval updates. No background generation loop is enabled; use `skills revise <id> --input candidate.md` for at most two candidate revision attempts in a task budget. To roll back a promoted project skill, inspect and remove its exact user-owned directory; preserve candidate/evaluation history.

## CI and benchmark

CI keeps Linux/Windows × Node 20/22 and disables fail-fast. It validates once, discovers tests without shell globs, creates current-run eval/compatibility reports, packs/installs/validates the tarball, then checks fresh evidence. `DREAMY_ARTIFACTS_DIR` and `DREAMY_RUN_ID` isolate artifact output; defaults support local release/ workflows. A stale tracked report is never adequate packaging proof.

`npm run benchmark:selftest` proves runner plumbing only. `benchmarks/manifests/evolution-pilot.json` defines a 12-case, three-repetition development cohort. The built-in native decision adapter supports development B0–B4: B0/B1 disable hooks, B2 adds reviewed minimal hooks, B3 adds previewed eligible lesson data, and B4 adds reviewed promoted skill text. It is a decision-only, ephemeral-thread/context-filtered adapter using the existing account, not full filesystem isolation or a release-quality coding cohort. Other enabled trusted hooks are refused. The optional DREAMY_EVOLUTION_EXECUTABLE still delegates to a custom adapter. The existing Codex text adapter disables hooks and must not be used to claim hook/lesson runtime gains. Execution defaults off. Use `scripts/prepare-native-benchmark.mjs` to generate exact prompt/addition snapshots and a schema-validated `approved:false` plan, with at most four model turns. Execution additionally requires `DREAMY_EVOLUTION_EXECUTE=1` and `DREAMY_EVOLUTION_PLAN=<reviewed plan>`. The ledger prevents replay and is consumed before turn/start, including failed attempts. Payload/context/lesson/skill/hook drift blocks the trial. Native members in a plan must pass trust/readiness before any baseline turn. On Codex 0.163.0, SessionStart is deferred until the first turn: its completed notification is required before accepting the native trial result, rather than before starting the authorized turn. Missing or failed delivery rejects the result and the attempted turn remains consumed. Usage absent from runtime remains unavailable. These controls do not establish user authorization just because a local flag says approved; review the real payload/destination first.

`node scripts/skill-retention-pilot.mjs` previews a four-call source-entry retention pilot without invoking a model. After authorizing its payload/destination, add `--execute --model MODEL_ID --output /empty/evidence/directory` to compare the two compact skill entries with pinned originals using the explicitly selected model (or the configured model when `--model` is omitted). It records actual answers, runtime usage when supplied, source hashes and unexpected tool calls. These bounded decision probes do not replace the native B0–B4 cohort or establish general coding quality. The adapter uses ephemeral read-only workspaces, disables hooks/plugins/apps, rejects interactive RPC requests and does not copy credentials or rewrite home environment variables.

The Windows/Linux Node matrix and the authorized source-entry pilot have observed results in the [implementation evidence](toolkit-evolution-implementation.md). The local fixture has reviewed trust and an observed native SessionStart from the authorized two-turn pair. Both original exact-field grades remain failed because the old prompt omitted the observer label contract; see the retained evidence and future prompt correction. The later lab now observes Interrupt, PreCompact and native PostToolUse with the optional adapter; automatic replay and live standard/strict remain acceptance gates, alongside the broader B0–B4 semantic cohort, Unity checks and one-week rollout. See [CI triage](toolkit-ci-triage.md) and [full plan](plans/DREAMY_TOOLKIT_ECC_SUPERPOWERS_OMO_EVOLUTION_PLAN.md).

## Rollout observations

`node src/cli.js rollout snapshot --target /path/to/project --json` records a zero-model local observation under `.dreamy/rollout/`. It reports native trust/diagnostics and currently eligible lesson counts. Observation days are distinct UTC dates grouped by runtime/policy hash; changing that cohort resets the count. These snapshots cannot prove real task success, full native event coverage or a completed week of use. Keep daily task/latency/failure evidence and review before broadening deployment.
