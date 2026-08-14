# Handle Ownership

Addressables handles are resources with owners. Do not release while consumers still retain references. Avoid load/release in hot loops. Centralize labels/addresses and verify catalog/build behavior.
