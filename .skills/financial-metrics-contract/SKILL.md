---
name: financial-metrics-contract
description: Audit or change a financial dashboard metric across the FastAPI response, TypeScript boundary, calculation, chart or KPI, and user-facing formatting. Use when adding a metric, changing an enum or amount/date field, correcting totals or percentages, or investigating values that differ between backend and frontend.
---

# Financial Metrics Contract

Keep each financial value consistent from the API payload to the dashboard display. Produce evidence for every layer instead of checking only the final component.

## Inputs

Collect before editing:

- the metric name and business formula;
- its API route and Pydantic response model;
- the matching TypeScript type and calculation helper;
- every KPI, chart, tooltip, or label that displays it;
- currency, locale, date period, precision, and zero-denominator policy.

If one of these is unspecified, state the missing decision. Do not invent a financial policy silently.

## Workflow

1. Treat the FastAPI/Pydantic response and generated OpenAPI schema as the wire source of truth.
2. Trace exact field names and values through `backend/app/routes.py`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`, and the consuming dashboard components.
3. Preserve the wire enums `income`/`outcome`, the documented category and business-type values, ISO dates, and numeric amounts. Reject or diagnose unknown values rather than coercing them.
4. Keep aggregation in one tested owner. Income is the sum of income movements, outcome is the sum of outcome movements, profit is income minus outcome, and profit margin is `(profit / income) * 100` with zero when income is zero.
5. Round only at API or display boundaries. Keep full precision during calculations and make the visible locale, currency, and decimal precision explicit.
6. Cover empty input, zero income, unsorted input, multiple years, negative profit, and any new enum or boundary introduced by the change.
7. Preserve a textual equivalent for every chart value so color and geometry are not the only carriers of meaning.
8. Run backend tests for wire or server changes and frontend test, lint, typecheck, and build for client changes. Inspect `/openapi.json` when the contract changes.

## Output

Report a compact trace with these columns:

| Layer | Evidence | Result |
| --- | --- | --- |
| Business formula | formula and edge-case policy | pass, gap, or changed |
| API contract | route, model, field, wire value | pass, gap, or changed |
| TypeScript boundary | type and parser/consumer | pass, gap, or changed |
| Calculation | helper and unit cases | pass, gap, or changed |
| Presentation | KPI/chart and formatter | pass, gap, or changed |
| Validation | exact commands and outcomes | pass, fail, or unavailable |

## Acceptance Criteria

- One formula and one wire vocabulary are used end to end.
- Backend and frontend boundary types agree exactly.
- Dates, amounts, currency, locale, precision, and zero behavior are explicit.
- Relevant edge cases have automated coverage.
- Charts have equivalent text and errors do not expose internals.
- Every claimed pass names observable evidence; unavailable tools remain recorded as unavailable.
