# Save Transactions

Currency deduction, reward grant, claim flags, purchase IDs, pity changes, and analytics ordering belong in one logical transaction. Persist idempotency keys for external callbacks before accepting retries.
