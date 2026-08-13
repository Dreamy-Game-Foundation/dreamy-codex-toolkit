---
name: dreamy-feature
description: Orchestrate cross-domain Dreamy features using detected capabilities and verification evidence.
---

# Dreamy Feature

## When To Use

- Building or modifying a gameplay, UI, economy, audio, feedback, asset, or save feature in a Dreamy Unity project.
- Coordinating multiple Dreamy packages in one user-facing workflow.
- Deciding whether data belongs in config, runtime state, save data, UI, or a shared service.

## Read First

- `Packages/manifest.json`
- `Packages/packages-lock.json` when present
- affected asmdefs
- `compatibility/dreamy-packages.json`
- nearby feature folders and project `AGENTS.md`

## Workflow

1. Identify the feature owner, assembly, scene/prefab touch points, and Dreamy packages involved.
2. Route static design data to DataConfig, persistent state to Datasave, UI presentation outside shared service logic, and reusable runtime behavior to Core/services.
3. Keep the change inside the existing feature/module boundary unless the current architecture already has a shared package for it.
4. Verify compile/test status or state why it was not run.

## Allowed Claims

Only claim a Dreamy API is supported when the package record has a verified commit and the claim is not listed under drift or unsupported contracts.

## Red Flags

- Creating a new global service before checking existing service composition.
- Putting persistent player state in read-only config.
- Mutating prefabs/scenes without identifying the owning feature.
- Referencing Editor assemblies from Runtime assemblies.
