# Rule applicability validation

The rule set was tested through repository-specific change simulations. These are not generic prompt examples: every scenario names current files and a likely maintenance task.

| Rule | Simulated task | Rule decision | Result |
| --- | --- | --- | --- |
| API security and errors | Permit credentialed access from a deployed dashboard in `backend/app/main.py`. | Require an explicit configured origin and a CORS test; reject wildcard + credentials. | Pass — the rule produces a concrete safe change and test boundary. |
| Deterministic financial data | Add randomized forecasts beside `generate_mock_movements`. | Require local `random.Random`, injected reference date, stable ordering, and repeatability tests. | Pass — it directly prevents the global-state risk found in the source. |
| Shared financial contract | Add `refunds` to the category enum. | Update Pydantic/OpenAPI, TypeScript, and both contract test surfaces together. | Pass — it prevents the current duplicated contract from drifting. |
| Frontend dashboard data flow | Add a quarterly comparison chart. | Choose one aggregation owner, validate the boundary, derive its period, and handle loading/error/empty/success. | Pass — it guides the existing `App.tsx`/lib/component workflow without redesigning it. |
| Validation gates | Change a response field used by the dashboard. | Run backend tests and frontend test/lint/build, inspect the contract, and report unavailable tooling honestly. | Pass — it supplies an unambiguous, path-based verification set. |

## Ambiguity and overlap review

- The backend security rule and deterministic-data rule both match `routes.py`, but their responsibilities do not conflict: one governs HTTP/security boundaries and the other financial calculations.
- The shared-contract rule applies only to two boundary files and takes precedence for wire names/types.
- The frontend rule owns presentation data flow but defers wire values to the shared-contract rule.
- The always-on validation rule changes no implementation style; it only defines evidence required before completion.

## Validation limitations

Semantic applicability was reviewed against source and documented above. A later workspace-tool discovery allowed frontend test/lint/typecheck/build and backend pytest to pass; the current evidence is in `docs/agent-skills-audit.md`. Docker runtime remains unavailable because the local Colima wrapper references a missing UTM `qemu-img` binary.
