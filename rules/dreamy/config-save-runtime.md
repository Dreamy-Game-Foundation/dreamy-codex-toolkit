# dreamy.config-save-runtime

## Invariant

DataConfig owns static designer-authored data, Datasave owns mutable persistent player state, and runtime owners hold ephemeral session/UI state.

## Required

| Data | Owner |
|---|---|
| Unit base damage | DataConfig |
| Upgrade cost table | DataConfig |
| Shop offer definition | DataConfig |
| Reward table | DataConfig |
| Localization metadata | DataConfig |
| Player coins | Datasave |
| Player gems | Datasave |
| Unit current level | Datasave |
| Owned inventory/unit IDs | Datasave |
| Claimed daily reward | Datasave |
| Current battle HP | Runtime |
| Temporary buff | Runtime |
| Current combat target | Runtime |
| Current match score | Runtime |
| Current menu tab | View/runtime UI state |

## Forbidden

- Saving balance values or tuning tables in Datasave.
- Putting mutable currency, inventory, settings, or claim state in config.
- Using UI prefabs as data catalogs.
- Storing UnityEngine.Object references directly in persistent save data.
- Letting presentation animation decide persisted reward results.

## Decision Tree

Can a designer tune it without a player account? Use DataConfig.

Must it survive app restart and belongs to one player? Use Datasave.

Does it exist only for the current scene, match, panel, cooldown, or animation? Keep it runtime-owned.

Does it reference a Unity asset? Persist a stable ID, not the object reference.

## Exceptions

Editor-only sample/demo data can live with authoring assets when it is not a runtime save/config contract.

## Verification

- Inspect model fields touched by the change.
- Confirm transactions mutate Datasave through the intended owner.
- Confirm config remains read-only at runtime except supported reload/import flows.
- Add migration tests when persistent schema changes.

## Related

`dreamy.ui-boundary`, `gameplay.deterministic-economy`, `csharp.immutability-state`.
