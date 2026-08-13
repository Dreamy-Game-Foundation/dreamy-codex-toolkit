---
name: dreamy-dataconfig
description: Use Dreamy DataConfig for typed read-only design data and validation.
---

# Dreamy DataConfig

## When To Use

- Reading or validating typed design-time data.
- Moving hardcoded gameplay, economy, UI, audio, or localization values into config.
- Reviewing whether a feature is mixing static config with mutable save/runtime state.

## Read First

- `compatibility/dreamy-packages.json` record for `com.dreamy.dataconfig`
- consumer `Packages/manifest.json`
- affected config assets, schemas, generators, validators, and tests

## Workflow

1. Confirm the consumer project declares required dependencies.
2. Keep config read-only at runtime unless verified package docs say mutation is supported.
3. Validate missing keys, duplicate ids, type mismatches, and default-value behavior.
4. Route player progress, balances, inventory, and unlock state to Datasave or runtime services instead of DataConfig.

## Current Drift

Treat UniTask availability as drift until the consumer manifest declares it or compatibility says it is fixed.

## Verification

- Run the smallest config validation command available in the project.
- If no command exists, inspect import/console status and state the gap.

## Red Flags

- Config asset writes during gameplay.
- Silent fallback when a required config key is missing.
- Claiming async APIs are available while UniTask remains drift.
