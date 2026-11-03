# Product overview

## Purpose

Financial Metrics Dashboard is a demonstration application that turns synthetic financial movements into a compact executive overview. Its current screen shows total income, total outcome, net profit, profit margin, monthly income/outcome, and monthly profit margin.

The backend supplies deterministic demo movements and analytical endpoints. No repository evidence supports real customer accounts, persistence, payments, or production financial records; do not describe those as implemented.

## Intended user and job

The UI calls itself an "Executive metrics dashboard," so the evidence-supported user is a viewer who needs a quick financial overview rather than an operator editing transactions. The current job is read-only monitoring:

- understand the balance between income and outcome;
- inspect profitability and its monthly trend;
- access data segmented or aggregated through the API.

Named personas, organization size, compliance requirements, and formal success targets are not specified in the repository.

## Current user journey

1. The viewer opens the Vite/React dashboard.
2. The app requests all movements from `GET /api/metrics`.
3. While waiting, KPI and chart skeletons are visible.
4. On success, the browser calculates KPI/monthly series and renders cards and charts.
5. On request failure, an English screen-reader alert displays a safe error message; there is currently no retry control.

The visible reporting-period badge is derived from the earliest and latest movement dates returned by the API rather than a hard-coded calendar year.

## Domain vocabulary

- Operation type: `income` or `outcome`.
- Category: `suppliers`, `sales`, `operational`, `administrative`, or `others`.
- Business type: `B2B` or `B2C`.
- Movement fields: ISO date, numeric amount, operation type, category, and business type.
- Net/profit: income minus outcome.
- Profit margin: profit divided by income, or zero when income is zero.

These wire values are contracts. User-facing copy can be friendlier, but code must not invent synonyms at the API boundary.

## Product boundaries

- Demo data is generated in memory for each request; there is no database.
- The screen is read-only and has no authentication or authorization.
- The checked-in static `mock-data.ts` is not the current runtime source.
- Aggregate API routes exist beyond what the current screen consumes.
- Visual redesign and new features are outside the context-handover project unless needed to validate a repository rule.
- The dashboard has no runtime image element; the checked-in `hero.png` asset is unused.
