# IAP Idempotency

Persist processed transaction ID or receipt identity. Duplicate callbacks return already-processed state without second grant. Grant and processed marker must not be split across failure-prone saves.
