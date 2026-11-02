# Visual review

`visual-review` is an experimental, client-independent skill for tasks with a
visual acceptance criterion. It uses available editor, Unity MCP, browser or
device tools to capture the real result, then shows an image or file link. It
does not take screenshots for ordinary logic/docs tasks or simply because MCP
was used. No video, generated mock image, public upload or new viewer is needed.

The production module includes the skill, so production/full presets install
it. Installation does **not** create a review store or enable cleanup hooks.
The entrypoint is [SKILL.md](../skills/production/visual-review/SKILL.md).

Run the installed skill's `scripts/visual-review.mjs` using Node. The helper is
self-contained; it manages temporary files, not the capture tool:

```text
node REVIEW setup --root /project
node REVIEW begin --root /project --task layout --input /tmp/inputs.json
# inputs.json: {"files":["path/to/changed-source"]}
# Use the available capture tool to write into the returned outputFolder.
node REVIEW add --root /project --run RUN --image /path/to/after.png --view "Relevant view/state"
node REVIEW finalize --root /project --run RUN
```

`REVIEW` means the helper's absolute path. Default to one useful after image;
register before images with `--role before` only when comparison helps. Source
changes after registering an after image prevent finalization. A copied input
image's original is preserved. The helper accepts PNG/JPEG signatures, not
proof that an image came from a real render; the agent must inspect the actual
screenshot and describe its view/state accurately.

Temporary images live under `.dreamy/visual-review/`, outside product assets and
Git. They can be opened through the client's existing file preview. Test that
path on the actual client/phone before claiming remote support. Browser/editor
capture success and Node tests do not prove mobile file delivery.

For automatic cleanup, explicitly run `setup --hooks` (use `--dry-run` first to
inspect). It installs only in free/known normal Git hook slots. Existing hook
managers are preserved and require deliberate integration. A successful commit
must match the captured source, staged tree and worktree before registered
images are deleted. Failed, partial or unrelated commits keep images. `pin`
retains a run; `teardown` disables this worktree's cleanup and keeps images.
See [workflow](../skills/production/visual-review/references/workflow.md) and
[cleanup](../skills/production/visual-review/references/cleanup.md) for details.

Local verification covers synthetic image files and real Git fixture commits,
including failures, partial staging, CRLF, sibling worktrees and hook ownership.
The routing/safety catalog contains eight definitions, not observed model
passes. Real rendered-image capture and client/mobile acceptance remain
unverified in this toolkit checkout. No consumer Editor state was changed.

Implementation verification: **140 tests, 139 pass, 1 Windows-only skip** on
Linux/Node 24.19.0, including 15 visual-review fixture tests. Skill Creator's
structural validator also passes. See the [local evidence](evidence/visual-review-20261029.json).
