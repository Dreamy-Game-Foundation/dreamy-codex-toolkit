---
name: dreamy-assets
description: Define or review Dreamy asset request, cache, deduplication and release ownership, including cancelled panel loads and pooled prefab lifetime.
requires.packages: ["com.dreamy.assets"]
---

# Dreamy Assets candidate

## Scope

Use for dynamic loading/instantiation, cache lifetime and failed/cancelled requests. A static serialized scene reference needs no loader by default. Addressables group/catalog changes require their own installed tooling. Respect requests to inspect without editing.

## Decisions

- Inspect manifest/lock, verified loader API and existing owner before naming methods. Do not infer Dreamy support from generic Addressables behavior.
- Name who requests, who retains and who releases each handle/instance. Keep in-flight deduplication and cache policy at a loader/service/pool owner rather than list items.
- Cancellation of one caller must not release a shared load still used by another. Specify whether an abandoned completion is retained by the cache or released by its owner.
- Before binding after await, check caller lifetime/request generation. A closed/reopened panel must reject stale results even if cancellation was requested.
- Keep remote-content progress/failure/retry and size policies explicit when relevant. Project content groups/profiles remain project-owned; do not release the result immediately before returning it.

## Verification

Check duplicate requests, mixed caller cancellation, failure/retry, close-before-complete and final release. Assert retained handles/instances match live ownership. Use Editor/content validation where available; static package detection alone is not a content-build pass.

## References

Read `references/load-ownership.md` for request/cache lifetime and `references/addressables-policy.md` when the task involves Addressables ownership or content policy.
