# Architecture Anti-patterns

Use this list as a smell detector, not as automatic proof of a bug.

- God Object
- Manager-of-Everything
- Singleton Everywhere
- Service Locator Everywhere
- Event Bus Everywhere
- Interface-per-class
- Factory-per-constructor
- Inheritance explosion
- Boolean state explosion
- Static mutable state
- UI business logic
- Runtime to Editor dependency
- Package to project dependency
- Premature generic framework
- Hidden async ownership
- Config, save, and runtime state mixing

For each smell, explain the concrete impact: wrong owner, reversed dependency, lifecycle leak, untestable behavior, data loss risk, package coupling, or unnecessary complexity.
