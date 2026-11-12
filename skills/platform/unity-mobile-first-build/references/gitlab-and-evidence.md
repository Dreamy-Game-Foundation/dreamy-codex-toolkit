# GitLab execution and evidence

## Before spending a CI run

Resolve the canonical remote after repo rename; a local folder need not be renamed.
Inspect effective root/includes/workflow/job rules and server CI config path.
Review source/ref combinations for push, MR and manual; a commented manual rule
does nothing. A normalized rule snapshot is not a full rules evaluator. Check
runner tags, protected ref eligibility, executor/shell, quoting/cwd, toolchain,
Unity license, dependency access and CI variable/environment scopes. Do not dump
CI variables. Missing information is unknown, not success.

Find the owner of generated CI. InitializeOnLoad can overwrite root YAML on import.
Read external batch/shell/Python/Editor entrypoints or obtain a versioned contract:
inputs, workdir, game checkout SHA, SDK pin/injection, output destination, secret
handling, cleanup and **all** post-build effects and exit codes. A script can build
successfully then commit, delete tags, force-push or upload; build permission does
not authorize those effects. A source path/contract without a revision is not
reproducible. Block execution until unsafe out-of-scope behavior is removed or a
safe build-only mode is verified. Do not inherit disabled TLS verification,
production environment, machine paths or storage policies from another game.

## Authorized execution

Review scoped diff → commit only intended files → create/switch/integrate the
build branch using a clean isolated workspace if needed → normal push to the
specified remote/ref. Preserve unrelated staged/unstaged work. Do not reset/clean
the user's checkout or force-push. Authorization persists within its stated scope;
do not repeatedly ask for already-authorized steps. New external effects still
need authority. A plan-only request stops at a reviewable plan.

Record push result, pipeline/source/ref/SHA, job/runner state and **actual HEAD
immediately before build**. Scripts that fetch branch tips can race even when the
pipeline metadata has the expected SHA. Record injected SDK full commit and build
script version. A green job can ignore failing post-build commands; inspect the
underlying results as well as status. No new pipeline merely to check whether a
rule matches; inspect/lint/simulate without execution when available and permitted.

## Failure, budget and lessons

Before running, choose a retry budget appropriate to cost and scope (a reasonable
proposal is baseline plus up to two evidence-producing corrections). No blind
rerun when the same failure adds no evidence. Stop for missing permission/source/
secret/identity, side effects beyond scope or exhausted budget. Escalate with a
specific request to the owner; do not message other people without authorization.

For each incident capture target platform and runner host separately, game SHA,
pipeline/job, SDK/script/toolchain revisions, first causal diagnostic with scoped
redacted context, observed facts, hypotheses, smallest change, exact verification
command/result and unknowns. Compiler summary without the actual CS diagnostic is
not enough to assign a particular assembly error. Do not infer causes or success
from commit names. Triage in order:

Git/auth → runner/shell → Unity license/toolchain → package resolution → SDK
injection/assembly compile → Firebase/dependencies → Android Gradle/manifest/R8
or iOS Pods/native compile/link → signing → packaging/archive/export/artifact →
device startup. Use the relevant platform reference for the failing layer.

Record only observed failures. A verified lesson requires fresh matching failure/
task/command/target/source/checker evidence supported by the installed toolkit.
Do not label CI build logs as `validate`/Editor compile receipts just to pass a
schema with no CI adapter. Preserve historical receipts and mark stale/mismatched
evidence; no automatic lesson/skill promotion or transcript collection.

## Artifact and claim ladder

Report independently: configuration inspected, post-injection target compile,
push, pipeline creation, runner assigned, build succeeded, artifact published,
artifact downloaded/verified, device startup/SDK smoke. A static preflight pass
cannot advance downstream gates. A success copy message is not retrieval proof.

Handoff: URL/path without credential parameters, access/retention/audience,
filename/format/size/SHA-256 (or archive manifest), application ID, app version/
build number, target/ABI/variant, signing fingerprint/team/profile role, source/
SDK/script revisions, pipeline/job links, exact validation commands and remaining
limitations. Compare downloaded bytes with expected metadata and signing identity.
Reject stale/wrong artifact even if the job is green. Device checks identify the
exact artifact tested. No store upload unless separately requested.

## Secret handling

Use only opaque secret source references in intake. CI file variables provide a
temporary **path**, not necessarily the desired binary contents. Use supported
secure file/secret-manager/runner provisioning for keystores/P12/profiles; base64
is encoding, not secrecy. Check protection/environment scope and runner access.
Mask/hidden options have constraints and do not protect against malicious scripts.
Never echo passwords, private keys, full env/BuildConfig, raw unreviewed traces or
signed URLs into logs/fixtures/reports. Retain only bounded sanitized diagnostics.

## Sources

- [GitLab rules](https://docs.gitlab.com/ci/jobs/job_rules/).
- [GitLab YAML and workflow](https://docs.gitlab.com/ci/yaml/).
- [GitLab variables](https://docs.gitlab.com/ci/variables/).
- [GitLab artifacts](https://docs.gitlab.com/ci/jobs/job_artifacts/).
