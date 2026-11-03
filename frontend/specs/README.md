# Financial dashboard frontend specifications

These specifications describe what the frontend must present and the existing API contracts it must consume. They do not implement React components or perform requests.

The paths and response fields below were verified against `backend/app/routes.py`, whose Pydantic models generate `/docs` and `/openapi.json`.

## Shared date behavior

`DateRangeFilter` contains optional inclusive `start_date` and `end_date` strings in `YYYY-MM-DD` format.

- With neither value, omit both query parameters and display all available data.
- With only `start_date`, request data on or after that date through the available maximum.
- With only `end_date`, request data through that date from the available minimum.
- With both values, request the inclusive interval.
- Before a filtered request, reject `start_date > end_date` or a value outside `FacetsResponse.min_date`/`max_date` and keep a visible inline message.

## Feature 1 — Date range filter on the home dashboard

### Endpoints and types

| Endpoint | Request type | Response type | Purpose |
| --- | --- | --- | --- |
| `GET /api/metrics/facets` | none | `FacetsResponse` | Obtain `min_date`, `max_date`, and available values. |
| `GET /api/metrics` | `DateRangeFilter` | Existing `FinancialMovement[]` | Refresh all currently displayed home metrics with the inclusive range. |

Valid parameters:

- `start_date?: string` — ISO date `YYYY-MM-DD`.
- `end_date?: string` — ISO date `YYYY-MM-DD`.
- Both are optional and independently supported by the backend.

Acceptance criteria:

- Two labeled date inputs appear above the existing dashboard data.
- The available range is visible beside them after facets load.
- Every currently displayed KPI/chart uses the same active range.
- Clear removes both parameters and restores all data.

Edge cases:

1. **Only one date is filled:** send only that parameter; do not require the other input and state the effective open-ended range in helper text.
2. **Start is after end:** show an inline validation error and issue no filtered request.
3. **Valid range returns no movements:** keep inputs/reference visible and show explicit no-data KPI/chart states.
4. **Facets fail:** show a non-blocking range-reference error; empty optional filters still allow the unfiltered dashboard request.

## Feature 2 — Anomaly alerts table

### Endpoint and types

| Endpoint | Request type | Response type |
| --- | --- | --- |
| `GET /api/metrics/alerts` | `AlertsParams` | `AlertsResponse` (`AlertEntry[]`) |

Valid parameters:

- `threshold: number` — UI range `0.01` through `1.0`, default `0.3`; the current API enforces a lower bound of zero, so the stricter product minimum is a frontend rule.
- `group_by: "month"` for this table. The API also accepts `day` and `week`, but the requested column semantics are monthly here.
- Optional `start_date` and `end_date` follow the shared behavior.

Response columns map exactly as follows:

- Period → `period`.
- Recorded outcome → `outcome_total`.
- Rolling baseline → `baseline_average`.
- Percentage increase → `increase_ratio * 100` for presentation.

The API currently calculates `baseline_average` over all preceding returned periods, not strictly the previous three periods stated by the product request. The frontend must not relabel it as a three-period average until the backend contract is changed and verified.

Edge cases:

1. **No alerts:** retain the section and show “No spending anomalies match the current threshold and date range.”
2. **Threshold outside 0.01–1.0 or non-numeric:** show an inline error and make no request with the invalid value.
3. **Only one date is filled:** send that bound with threshold and `group_by=month`.
4. **Request failure:** replace rows with a safe error and retry action; do not show stale alerts as current.

## Feature 3 — B2B vs B2C comparison

### Endpoints and types

| Endpoint | Request type | Response type | Calls |
| --- | --- | --- | --- |
| `GET /api/metrics/facets` | none | `FacetsResponse` | Once for range/category reference. |
| `GET /api/metrics/categories/top` | `TopCategoriesParams` | `TopCategoriesResponse` | Once with `business_type=B2B`, once with `business_type=B2C`. |

Valid top-category parameters:

- `operation_type: "income"` for both panels.
- `limit: 5` (API constraint is integer 1–20).
- `business_type: "B2B" | "B2C"`, one per panel.
- Optional inclusive `start_date` and `end_date`.

The response supplies `category`, `operation_type`, and `total_amount`. The current category enum contains five values, so `limit=5` returns every nonzero category for a segment/range; the sum of the returned `total_amount` values is the group total used for percentage and the comparison chart. If the API ever adds more than five category values, the backend must expose an explicit group total before the UI can continue calling this percentage “of the group total.”

Acceptance criteria:

- Each panel shows category, formatted total income, and `total_amount / groupTotal` as a percentage.
- One accessible chart compares the two group totals and repeats values as text.
- The shared date filter refreshes facets/reference and both segment requests consistently.
- Panel request/empty states are independent.

Edge cases:

1. **B2B is empty and B2C has rows (or the inverse):** preserve both named panels; the empty one shows its explicit message while the successful one shows data. The combined chart shows unavailable until both totals are known.
2. **Both top-five lists are empty:** each panel shows “No income categories are available for this segment and date range,” and the chart shows accessible zero-data text rather than blank axes.
3. **One request fails:** show a retry only in that segment and a chart-unavailable state; do not discard the successful segment.
4. **Only one date is filled:** send that same single bound to both category requests.

## Source files

- [`api-types.ts`](api-types.ts) — exact response boundary types.
- [`param-types.ts`](param-types.ts) — query parameter contracts.
- [`components.md`](components.md) — component props and conditional rendering.
