# Independent reviews

Initial implementation reviewed at commit `915af05beeeeeff7148305a4247503e85558e7e2`, against scope baseline `2d9c41f`. Standards/correctness and fidelity/spec were reviewed by separate agents, as required by the Implement → Code Review workflow. Reviewers did not edit files or perform native play.

## Standards / correctness
Found incorrect strike heights: mids missed crouching defenders, and the initial overhead test connected only after landing. Also found immediate AI observation despite a reaction-delay claim.

Resolved with vertical strike intervals; regression tests for unguarded crouch vulnerability, actual mid blockstun and overhead contact while airborne; eight elapsed attack ticks before AI defensive reaction. Prettier formatting made simulation and presentation readable. Reviewer independently reran all 21 tests and strict TypeScript/production build, confirming no remaining actionable findings.

## Fidelity / specification
Found three defects: low guard could not actually block mids, crouching normals lost their pose after one tick, and the AI delay claim exceeded implementation.

Resolved collision intervals and guard tests, preserved crouching posture throughout low-attack commitment, and implemented explicit reaction latency. Reviewer independently reproduced an actual jab/down-back block event, connected attack, 100 HP and blockstun; confirmed stance persistence and latency. All 21 tests pass. No remaining blocking fidelity findings.

## Workflow notes
Applied `/Users/.../.agents/skills/grill-with-docs`, `grilling`, `domain-modeling`, `implement`, `tdd` and `code-review` guidance available on the host. The user explicitly requested recommended defaults and no optional questions, so their authorization replaced the interview/confirmation pauses. Accepted branches and test seams are recorded in SPEC.md, vocabulary in CONTEXT.md and scope tradeoffs in the ADR. Tests were developed iteratively alongside implementation; this report does not claim a recorded red-before-green run for every case.
