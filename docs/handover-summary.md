# Validated handover summary

## Review method

This summary was produced with AI assistance and then checked against the repository itself. Every statement below names the source that supports it; where the initial impression was incomplete, the correction is recorded explicitly.

## What the product does

The repository contains a financial metrics dashboard for a single synthetic business dataset. The browser loads movements from the FastAPI service, computes four headline KPIs (income, outcome, profit, and profit margin), and plots monthly income/outcome and profit-margin series. The API also exposes facets, grouped summaries, top categories, period comparison, anomaly candidates, and B2B/B2C views.

Evidence:

- `frontend/src/App.tsx` fetches `/api/metrics`, computes KPIs/monthly points, and renders the dashboard.
- `frontend/src/components/dashboard/` contains the header, KPI cards, and two Recharts visualizations.
- `backend/app/routes.py` defines the movement model, deterministic data generator, calculation helpers, and HTTP endpoints.
- `backend/tests/test_routes.py` documents the expected endpoint behavior in 15 tests.

## Repository map and entry points

| Area | Entry point | Responsibility |
| --- | --- | --- |
| Browser application | `frontend/src/main.tsx` | Mounts React in strict mode. |
| Dashboard orchestration | `frontend/src/App.tsx` | Fetch state, error/loading handling, KPI and chart composition. |
| UI components | `frontend/src/components/dashboard/` | Presentational KPI and chart components. |
| Financial calculations | `frontend/src/lib/financial-utils.ts` | Pure KPI, monthly aggregation, currency, and percent helpers. |
| API application | `backend/app/main.py` | Creates FastAPI, installs CORS, and includes the router. |
| API/domain module | `backend/app/routes.py` | Pydantic schemas, mock data, filters, aggregations, and routes. |
| Service topology | `docker-compose.yml` | Runs Vite on 5173 and FastAPI on 8000; Vite proxies `/api` to `backend:8000`. |

## Runtime flow

1. `docker compose up --build` builds both service images and mounts their source directories.
2. Vite serves the React app on port 5173. In the compose network, its `/api` proxy targets `http://backend:8000`.
3. `App.tsx` requests `GET /api/metrics` once on mount.
4. FastAPI calls `generate_mock_movements(seed=42)`, producing 30 movements for each month and returning them chronologically.
5. The frontend derives KPIs and monthly chart points with pure utilities, then renders loading, error, empty, or populated states.

## API surface verified from code

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Liveness response. |
| `GET /api/metrics` | Movements filtered by date, category, or operation type. |
| `GET /api/metrics/facets` | Available values and date range. |
| `GET /api/metrics/summary` | Day/week/month aggregation with optional business type. |
| `GET /api/metrics/categories/top` | Ranked categories for an operation type. |
| `GET /api/metrics/comparison` | Net value against the immediately preceding equal-duration period. |
| `GET /api/metrics/alerts` | Outcome increases relative to the preceding running average. |
| `GET /api/metrics/b2b`, `GET /api/metrics/b2c` | Segment-specific movement lists. |

## Corrections made while validating the AI summary

- **Initial impression:** the checked-in `mock-data.ts` feeds the dashboard. **Correction:** `App.tsx` fetches the backend; `mock-data.ts` is currently unused.
- **Initial impression:** the dashboard displays server-generated aggregate endpoints. **Correction:** the current screen only consumes `/api/metrics` and calculates its displayed aggregates in the browser. The other aggregate endpoints are implemented and tested but not wired into this UI.
- **Initial impression:** all data belongs to calendar year 2024 because the header says `2024 - Full Year`. **Correction:** the backend derives years from `date.today()`; the hard-coded header can diverge from returned dates.
- **Initial impression:** anomaly alerts compare a period with only the preceding period. **Correction:** `detect_outcome_alerts` compares each period with the average of all prior outcomes.
- **Initial impression:** Docker and test commands had been verified on this workstation. **Correction:** source/configuration inspection succeeded, but this host has no `docker`, `node`/`npm`, or installed Python `pytest`, so runtime verification remains an explicit environment gap rather than a claimed result.

## Claim-by-claim status

Legend: ✅ verified in code or by a run · ❌ wrong, corrected above · ❓ unverified.

| Claim from the AI summary | Status | Evidence |
| --- | --- | --- |
| Two services (Vite/React on 5173, FastAPI on 8000) wired by Compose | ✅ | `docker-compose.yml` |
| Vite proxies `/api` to `backend:8000` | ✅ | `frontend/vite.config.ts` |
| Backend also exposes debugpy on 5678 | ✅ | `backend/Dockerfile` CMD, compose ports |
| `mock-data.ts` feeds the dashboard | ❌ | Unused; `App.tsx` fetches `/api/metrics` |
| UI consumes the aggregate endpoints | ❌ | Only `/api/metrics`; aggregates computed in `financial-utils.ts` |
| Data covers calendar year 2024 | ❌ | `_year_for_month` uses `date.today()`; on 2026-11-03 facets return 2025-11-01 → 2026-10-28 |
| Alerts compare with the previous period only | ❌ | `detect_outcome_alerts` averages all prior periods |
| 360 movements, 30 per month, `seed=42` | ✅ | `generate_mock_movements`; asserted in `test_generate_mock_movements_returns_full_year_sorted_data` |
| 15 backend tests pass | ✅ | Re-run 2026-11-03: `python -m pytest -q` → 15 passed |
| 5 frontend tests pass, lint clean | ✅ | Re-run 2026-11-03: `npm test` → 5 passed; `npm run lint` clean |
| `docker compose up` brings the stack up healthy | ❓ | Not run: images not pulled on the verification host |

## Baseline verification record

Commands attempted on 2026-08-13:

| Command | Result |
| --- | --- |
| `docker compose config --quiet` | Not runnable: `docker` is not installed on the host. |
| `cd backend && python3 -m pytest -q` | Not runnable: the system Python does not have `pytest`. |
| `cd frontend && npm test -- --run` | Not runnable: `npm` is not installed. |
| `cd frontend && npm run lint` | Not runnable: `npm` is not installed. |

The repository contains 15 backend tests and 5 frontend unit tests. Their existence and intent were reviewed directly, but this document does not misrepresent static inspection as a passing run.

## Handover conclusion

This is a small two-service demonstration with a clear happy path and useful unit/endpoint coverage. The primary maintenance risks are duplicated domain contracts across Python and TypeScript, a broad CORS policy combined with credential support, global random-state mutation, stale/unused mock data, a hard-coded reporting period, and missing automation that would make the documented checks reproducible for every contributor.
