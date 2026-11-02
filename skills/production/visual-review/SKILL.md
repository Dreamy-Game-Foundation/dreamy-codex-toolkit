---
name: visual-review
description: Show real screenshots when a task needs visual verification, using the available editor, browser or device tools. Keep temporary review images out of Git and clean them after a matching successful commit.
---

# Visual Review

## Scope

Use when appearance is part of acceptance: UI/layout, scene composition, camera framing, materials or another visible result. Use the capture tool already available for that task. MCP use alone, reading a Console, ordinary logic changes and documentation do not need screenshots.

## Decisions

- Identify the right project/page/device and the state the user needs to see. Inspect with the task's domain tools, make the authorized change, then capture the actual rendered result. Default to one useful after image; add before/after or other states when they help review.
- A hierarchy/state snapshot is not a screenshot. Do not generate a mock image as execution evidence. If capture/export is unavailable, report that limitation and continue checks that can run.
- Preserve editor/browser state outside the task. Do not install capture packages, change cameras or enter Play Mode merely to manufacture an image. Domain instructions still govern serialized assets, package APIs and verification.
- Use `scripts/visual-review.mjs` to store PNG/JPEG files outside product assets. It manages files and source binding; it does not drive the capture tool. Read `references/workflow.md` for the short setup/begin/add/finalize commands.
- Return the image or an accessible file link with a short caption naming the view/state. Use the client's existing file preview, including Orca when relevant; read its version-matched guide before client-specific commands. Never publish a public link automatically or claim the user viewed the file.
- Images are ignored from the start. Automatic deletion requires explicit project setup with `--hooks`; it runs only after a successful commit matching the captured source. Existing foreign hooks are preserved; use manual integration when needed. Read `references/cleanup.md` before hook setup or cleanup.

## Verification

Inspect the screenshot for the intended visual criterion and report compile/Console/tests separately. Verify file links in the actual client before claiming remote/mobile support. Never use a screenshot as proof of compilation or behavior it cannot show.

## References

- Read `references/workflow.md` when saving or presenting screenshots; it includes Unity MCP, browser and device routing.
- Read `references/cleanup.md` for setup, source-bound commit cleanup, existing hook integration and teardown.
