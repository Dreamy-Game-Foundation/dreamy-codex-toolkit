# Save and show screenshots

Run the helper with Node from this skill's `scripts/` directory. `REVIEW` below
means the absolute path to `scripts/visual-review.mjs`; `--root` selects the
consumer Git worktree. The helper uses Node built-ins and works standalone.

```text
node REVIEW setup --root /project
node REVIEW begin --root /project --task shop-layout --input /tmp/review-input.json
```

Input JSON: `{"files":["Assets/UI/Shop.prefab","Assets/UI/ShopPresenter.cs"]}`.
Select source/config/content paths responsible for the rendered result; include
relevant shared inputs, not just the file that was edited. These are explicit
inputs, not a guarantee about external runtime data. Paths must be relative to
the worktree and outside the review store. Deleted inputs are allowed.
Save the intended source/serialized changes before capturing. An unsaved
editor-only preview cannot be bound to a commit by selecting unrelated files;
keep such a run pinned or leave automatic cleanup unarmed.

`begin` returns a run ID and absolute `outputFolder`, already Git-ignored. Give
that folder to the existing capture tool **when its schema supports it**. Keep
screenshots outside Unity `Assets/` or equivalent product asset roots. The
helper does not invent tool names, execute capture commands or modify scenes.

```text
node REVIEW add --root /project --run RUN --image /project/.dreamy/visual-review/runs/RUN/after.png --view "Game View: shop open"
node REVIEW finalize --root /project --run RUN
node REVIEW list --root /project
```

`add` defaults to `--role after`; use `--role before` for a baseline. It records
source hashes at the time the image is registered. Finalization requires a real
file with a PNG/JPEG signature and at least one after image whose source still
matches. File-signature checks do not prove the screenshot is authentic or
decodable; inspect the image with the available viewer. Capturing before and
after is optional; do not add steps without a visual reason.

A file already in this run's folder is adopted only by this explicit command.
An external file is copied; its original remains untouched. `add` returns both
paths so the agent can account for any separate capture-tool temporary file.
Only registered copies belong to cleanup. Never delete user attachments or
product images merely because they were used as an input.

Present one image or accessible file link with its view/state and a short
finding. `list` returns paths/captions and status, not image bytes. Prefer the
client's local/paired file preview; for Orca use its installed `orca-cli` guide,
and test ignored-folder visibility on the actual phone. A saved host file is
not evidence that a phone opened it. Links expire after successful cleanup.

## Tool routing

- **Unity/editor MCP:** inspect the actual instance/project, manifest/lock,
  scene/prefab and tool schema. Use a verified screenshot capability and
  supported output folder. Match Game View/Scene View/preview to the criterion.
  Camera-only render paths may omit overlay UI; inspect what was captured.
  An image returned inline without file export needs a supported export path
  before promising remote file access. Report missing capability honestly.
- **Browser:** use the existing browser/client automation workflow. Select the
  exact page/viewport and capture after the relevant state has rendered. Do not
  create a new authenticated session or reset the user's page unnecessarily.
- **Device/other editor:** use its available screenshot/export tool, identify
  the device/document and store the exported image in the returned folder.

Do not introduce video recording, streaming, cloud storage, generated mock
images or a new viewer service. Compile and behavioral tests remain separate.
