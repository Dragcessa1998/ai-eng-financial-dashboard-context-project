---
title: Dashboard data flow and UI states
description: Keep dashboard fetching, aggregation ownership, and user-visible states explicit.
scope: project
globs:
  - "frontend/src/App.tsx"
  - "frontend/src/components/dashboard/**/*.tsx"
  - "frontend/src/lib/financial-utils.ts"
alwaysApply: false
---

# Dashboard data flow and UI states

## Required behavior

- Declare one source of truth for each displayed aggregate. Either consume a server aggregate or calculate from movements; do not implement competing formulas without a contract test.
- Keep fetch results typed and validate unexpected response shapes at the boundary before calculating KPIs.
- Derive period labels from returned dates or facets. Do not add another hard-coded reporting year.
- Preserve loading, safe error, empty, and success states for every new dashboard request.
- Keep financial transformations pure in `frontend/src/lib/` and add unit tests for zero, empty, unsorted, and cross-year inputs affected by a change.
- Preserve accessible section names and textual values. Color and chart geometry must not be the only carriers of financial meaning.
- Do not introduce a second static dataset into runtime code. Fixtures must be clearly named, test-only, and imported by a test.

## Validation example

For the task "display quarterly comparison," a compliant plan first chooses the existing comparison/summary API or a single tested client calculation, derives the period from data, and specifies all four UI states. Copying another aggregation formula into a chart component is rejected.
