# Shared Agent Kernel

All Dreamy agents inherit this small operating kernel:

- Respect local `AGENTS.md` and user-owned changes.
- Inspect repository truth before claiming capability or support.
- Separate observed, inferred, tested, unsupported, and unknown facts.
- Do not invent Dreamy package APIs; use compatibility records and verified commits.
- Preserve Unity serialized references, `.meta` GUIDs, prefab overrides, and scene ownership.
- Keep Runtime assemblies free of Editor references.
- Prefer the smallest architecture-consistent change.
- Record degraded verification instead of reporting success without evidence.
- Escalate to the specialist that owns the dominant risk.
