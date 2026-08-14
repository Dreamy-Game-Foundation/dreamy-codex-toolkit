# Panel Lifecycle

Panels must bind, subscribe, start async/tweens, unbind, unsubscribe, cancel, and kill tweens symmetrically. Reopen should not duplicate listeners or apply stale async results.
