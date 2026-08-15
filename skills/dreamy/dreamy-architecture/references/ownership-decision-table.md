# Ownership Decision Table

| Concern | Preferred Owner | Avoid |
|---|---|---|
| Static designer data | DataConfig or authoring asset | Save file, presenter, scene singleton |
| Persistent player state | Datasave-owned model/repository | DataConfig, UI widget, static field |
| Runtime session state | Runtime model/service with lifecycle owner | ScriptableObject asset mutation |
| Business transaction | Domain/application service | Button handler, panel, VFX |
| Presentation state | Presenter/panel view model | Save repository |
| Scene composition | Scene/prefab owner | Package runtime assembly |
| Asset lifetime | Asset loader/cache owner | Leaf UI or projectile leaking handles |
| Platform integration | Platform/build service or adapter | Generic gameplay package |
| Global service resolution | Composition root/high-level controller | Leaf behaviours by default |

Use direct dependencies when ownership is local and explicit. Use events for cross-owner notification. Use queries/read models for UI observation. Use Service Locator only where the project already establishes it or at high-level roots.
