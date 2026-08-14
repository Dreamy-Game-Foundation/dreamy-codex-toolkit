# Unity Lifecycle

After every await, confirm the Unity owner is still valid before mutating objects. Pooled objects must cancel old tasks on despawn and create a fresh owner lifetime on spawn.
