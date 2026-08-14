# Combat Flow

Input or AI creates AttackIntent. AttackRuntime owns timing/window. HitDetection creates DamageRequest. DamageCalculation mutates Health through the health owner. Death is idempotent. Feedback listens after the result.
