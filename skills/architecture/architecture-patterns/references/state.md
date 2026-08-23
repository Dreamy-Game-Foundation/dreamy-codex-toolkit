# State

## When To Use

Use State when behavior is mutually exclusive and transitions have meaningful entry, exit, cleanup, or cancellation rules, such as AI modes, flow states, or modal gameplay.

## When Not To Use

Do not use State for a couple of local booleans with no transition lifecycle, or for passive data labels.

## Simpler Alternative

Use an enum plus a small switch when the transition graph is tiny and has no owned lifecycle.

## Trade-offs

State localizes mode behavior and lifecycle, but can scatter logic if transitions and shared data ownership are unclear.

## Unity Implications

Define who owns the active state, who calls tick/update, and who cancels async work on exit, despawn, disable, or scene unload.

## Verification

Test allowed transitions, rejected transitions, entry and exit cleanup, and repeated enter/exit cycles.
