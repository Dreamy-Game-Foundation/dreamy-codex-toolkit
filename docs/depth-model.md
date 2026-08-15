# Agent And Skill Depth Model

Dreamy uses depth to track operational usefulness, not prompt length.

## Levels

| Level | Meaning |
|---|---|
| D0 | Stub: name and description only. |
| D1 | Routing: activation boundary and broad owner. |
| D2 | Safe guidance: prohibitions, broad workflow, verification requirement. |
| D3 | Practitioner: domain model, concrete inspection, decisions, failure modes, test strategy. |
| D4 | Specialist: failure signatures, competing hypotheses, migration playbooks, platform/version implications, handoff rules. |
| D5 | Evidence-proven specialist: D4 plus executable eval/fixture evidence. |

## Rubric

| Dimension | Points |
|---|---:|
| Activation precision | 10 |
| Domain model | 10 |
| Inspection specificity | 10 |
| Decision depth | 15 |
| Failure modes / diagnosis | 15 |
| Implementation playbooks | 15 |
| Verification strategy | 10 |
| Evidence/source quality | 10 |
| Cross-skill handoff clarity | 5 |

Maturity bands:

- `< 40`: D1
- `40-54`: D2
- `55-69`: D3
- `70-84`: D4
- `85+`: D5 candidate

D5 also requires executed benchmark or fixture evidence.

## Policy

- P0 Dreamy skills target D4 or higher.
- Critical Unity skills target D4 or higher.
- Other P1 skills target D3 or higher.
- Agents target D4 operating protocol.
- Release-critical paths need D5 evidence before stable release claims.
