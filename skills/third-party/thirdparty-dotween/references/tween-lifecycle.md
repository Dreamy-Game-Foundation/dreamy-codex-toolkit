# Tween Lifecycle

Every tween or sequence has an owner and a kill/reuse policy. Hide/destroy/despawn must kill or complete intentionally. Callbacks guard owner validity and must not own business transactions.
