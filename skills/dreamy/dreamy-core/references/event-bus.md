# Event Bus

Use events for cross-feature notification where direct ownership would couple unrelated domains. Define event owner, payload contract, publisher, subscriber lifetime, and unsubscribe path. Prefer direct method calls inside one owner. Avoid anonymous subscriptions when cleanup is required.
