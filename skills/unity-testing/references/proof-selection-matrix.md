# Proof Selection Matrix

| Risk | Cheapest Valid Proof |
|---|---|
| Pure calculation | Unit test |
| State machine transition | Unit test |
| Save migration helper | Unit test plus old-save fixture |
| ScriptableObject serialization | EditMode |
| Prefab wiring/reference | EditMode or editor validation |
| MonoBehaviour lifecycle | PlayMode |
| Async scene/panel flow | PlayMode |
| Importer/menu/batch tool | Editor integration |
| Runtime-to-Editor asmdef | Static asmdef validation |
| Gradle/Xcode dependency | Platform build |
| Permission/store SDK | Device or store validation |
| Thermal/performance | Device profiling |

Negative cases to consider: duplicate call, re-entry, cancel, destroy, disable, scene unload, invalid data, missing reference, old save, partial migration, unsupported platform.

Before weakening a flaky test, identify the nondeterministic owner, remove timing assumptions, replace arbitrary delays, capture lifecycle state, and isolate mutable fixtures.
