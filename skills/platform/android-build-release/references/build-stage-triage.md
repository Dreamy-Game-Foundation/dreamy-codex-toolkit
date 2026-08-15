# Build Stage Triage

Classify the earliest failing stage before changing settings.

1. C# compile
2. Unity asset/build preprocessing
3. Player generation
4. IL2CPP
5. Native compile/link
6. Platform dependency resolution
7. Sign/package
8. Store validation
9. Install/runtime

## Android Checks

- Gradle dependency conflict: inspect generated Gradle files, EDM4U output, duplicate Android libraries.
- Manifest merge failure: inspect merged manifest, providers, permissions, activities, target SDK.
- R8/Proguard failure: inspect missing keep rules and incompatible libraries.
- Signing failure: inspect keystore, alias, passwords, build type, Play App Signing assumptions.

Do not fix by upgrading every package, deleting all caches, or regenerating the whole project until evidence assigns that scope.
