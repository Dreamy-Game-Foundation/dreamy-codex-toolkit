# dreamy.ui-boundary

## Invariant

Dreamy UI panels render state and collect intent; business decisions, transactions, persistence, navigation policy, and SDK operations belong outside concrete views.

## Required

View owns binding serialized references, rendering state, collecting user intent, and local visual transitions.

Presenter/controller/service owns business decisions, economy transactions, save mutation, navigation policy, SDK/IAP/Ads operations, analytics decisions, and config access policy.

UI should tolerate being reopened and re-bound without duplicate subscriptions, stale async updates, or stacked tweens.

## Forbidden

- `ShopPanel` directly edits coins.
- `RewardButton` directly writes JSON/save files.
- `MergeCard` calculates upgrade economy.
- UI prefab used as a data catalog.
- Panel code performing raw Addressables policy or SDK initialization.

## Decision Tree

Pure render or button intent? View.

Business/economy/save decision? Presenter/controller/service.

Navigation/back policy? UI manager/presenter/root, not a leaf item.

Temporary visual state? View/runtime UI state.

Persistent player state? Datasave through owner service.

Static table/list content? DataConfig through owner service/presenter.

## Exceptions

Tiny local visual toggles may live in the view when they do not mutate business, save, SDK, or cross-feature state.

## Verification

- Inspect panel/item code for save, economy, config parsing, SDK, and global service calls.
- Test reopen/close/reopen for duplicate subscriptions and stale async updates.
- Confirm presenters/services own transactions and persistence.
- Compile and run UI tests/harness when available.

## Related

`dreamy.config-save-runtime`, `dreamy.service-resolution`, `csharp.events-lifetime`.
