# Cleanup after a matching commit

`setup` creates the ignored local store only. `setup --hooks` explicitly opts
the project into automatic cleanup; simply loading or installing this skill
never installs Git hooks. Do not run setup in an unrelated repository.

```text
node REVIEW setup --root /project --hooks --dry-run
node REVIEW setup --root /project --hooks
node REVIEW doctor --root /project
```

The helper only installs wrappers in the normal Git hooks directory when both
slots are empty or contain its exact known wrappers. It refuses foreign hooks
and a configured `core.hooksPath` without changing them. For Husky/Lefthook or
another hook manager, explicitly integrate these two invocations using that
manager's existing contract, preserving its failure semantics:

```text
node REVIEW before-commit --root /project
node REVIEW after-commit --root /project
```

Run `before-commit` last after any formatter/index mutations. It replaces the
local pending ticket, rejects tracked/staged files under the review root, and
arms only finalized runs with source matching the index and at least one
declared input changed in this commit. Partial staging, unrelated commits and
changes after the screenshot preserve images. Git clean filters are used to
compare working content to staged blobs, including CRLF normalization.

`after-commit` checks the new commit's tree and single parent against the ticket
(the first commit is also supported), manifest/image hashes and worktree ID.
Deletion uses only registered regular files in that run. Other files, runs,
worktrees, tracked images, modified images and symbolic links are preserved or
rejected. Missing/unverifiable evidence preserves the files. Merge/amend/rebase
semantics and bypassed hooks are not claimed supported; no matching ticket
means no cleanup. A post-commit cleanup error does not undo the commit.

Each cleanup leaves a small receipt and updates the run status. Before images
may describe old source; finalization and commit binding use the after images.
No implicit TTL sweeper or broad `git clean` command is installed.

```text
node REVIEW pin --root /project --run RUN
node REVIEW unpin --root /project --run RUN
node REVIEW teardown --root /project
```

`pin` keeps images through commits. `teardown` disables this worktree's cleanup
and removes its unchanged helper runtime, preserving images and ignore rules.
Shared Git wrappers remain as no-ops for worktrees without an enabled store;
they may still serve other linked worktrees. No hook manager configuration is
rewritten. Project/toolkit uninstall retains `.dreamy/` user data, so run
teardown first if cleanup should stop too. Re-run setup after updating the
helper. A moved/copied worktree has a different identity: preserve its images
and reconcile/reinitialize the local store deliberately; ordinary setup refuses
to adopt mismatched ownership.

The local store and manifest are operational metadata, not a security boundary
against arbitrary code running as the same user. Avoid manually editing them;
path/identity/hash checks prevent accidental broad deletion, not a hostile
administrator forging a new valid store.
