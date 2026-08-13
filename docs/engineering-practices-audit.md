# Engineering practices audit

This audit is based on the checked-in source, configuration, history, and tests. It distinguishes evidence from recommendations and intentionally avoids proposing a visual redesign or feature expansion.

## Practices worth preserving

| Category | Practice | Concrete evidence | Why preserve it |
| --- | --- | --- | --- |
| Architecture | Frontend, backend, and orchestration have explicit boundaries. | `frontend/`, `backend/`, `docker-compose.yml`; Vite proxies `/api` to the compose service name. | Contributors can reason about and run each service independently. |
| Domain/API | FastAPI response models and constrained query types define the HTTP contract. | Pydantic models plus `Literal` types and `Query` bounds in `backend/app/routes.py`. | Invalid enum/limit inputs are rejected before business logic runs. |
| Data | Generated movements are repeatable and returned chronologically. | Endpoint code calls `generate_mock_movements(seed=42)` and `ensure_chronological_order`. | Stable demo data makes tests and visual review comparable. |
| Frontend | Financial transformations are pure and kept outside React components. | `computeKPIs` and `computeMonthlyData` in `frontend/src/lib/financial-utils.ts`. | Pure functions are easier to test and reuse than calculations embedded in rendering. |
| UX | Loading, request failure, and chart-empty states are handled explicitly. | `App.tsx`, `KPIRow`, `IncomeOutcomeChart`, and `ProfitPercentChart`. | The interface does not silently fail or render misleading chart shells. |
| Accessibility | Major dashboard regions have labels and content remains textual alongside charts. | `aria-label` sections in `App.tsx`, visible KPI values, chart descriptions. | Users and assistive technology receive meaning beyond color alone. |
| Testing | Tests cover calculations, chronological order, filter combinations, facets, summaries, comparison, alerts, and segment endpoints. | 15 Python tests in `backend/tests/test_routes.py`; 5 Vitest cases in `financial-utils.test.ts`. | Coverage targets business behavior rather than only component snapshots. |
| Delivery | Recent commits are narrow and describe the change made. | Git history includes separate proxy, alert, and filtering commits. | Small commits improve review and rollback quality. |

## Risks and practices to improve

| Priority | Category | Finding and evidence | Impact | Proposed correction |
| --- | --- | --- | --- | --- |
| High | Security | `backend/app/main.py` combines `allow_origins=["*"]` with `allow_credentials=True`. | A permissive policy is unsuitable for credentialed production traffic and may not behave as intended in browsers. | Load an explicit allowlist from configuration; use wildcard only for non-credentialed local development. |
| High | Data/concurrency | `generate_mock_movements` calls module-level `random.seed(seed)`. | One request mutates global random state for every concurrent request/test. | Instantiate `random.Random(seed)` and pass the local generator through movement creation. |
| High | Contract design | Python and TypeScript independently declare operation, category, business-type, and movement shapes. | A backend contract change can compile while breaking the frontend at runtime. | Treat OpenAPI/Pydantic as canonical and generate or contract-test the TypeScript boundary. |
| Medium | Product correctness | Backend years depend on `date.today()`, while `DashboardHeader` is passed the literal `2024 - Full Year`. | The visible period can contradict the actual data returned. | Derive the label from response dates/facets and freeze time in date-sensitive tests. |
| Medium | Architecture | The API implements summary endpoints, but `App.tsx` downloads all movements and recalculates summaries. | Logic can diverge, payloads grow unnecessarily, and backend aggregate tests do not protect the screen's data path. | Declare one aggregation owner per view; document and contract-test that decision. |
| Medium | Reliability | `build_metrics_facets` indexes `ordered[0]` and `ordered[-1]` without an empty-data policy. | Reusing the helper with an empty source raises an unhandled exception. | Define an explicit empty result or domain error and test it. |
| Medium | Validation | Comparison accepts dates without explicitly enforcing `start_date <= end_date`. | Reversed periods produce misleading duration and previous-period calculations. | Reject invalid ranges with a tested 422/400 response. |
| Medium | Error handling | `App.tsx` discards the actual request/status error and shows one generic message. | Debugging and recovery are difficult; users cannot distinguish unavailable service from invalid data. | Preserve a safe error category, log diagnostic detail outside the UI, and offer a retry action. |
| Medium | Source hygiene | `frontend/src/lib/mock-data.ts` duplicates a static financial dataset but is not imported. | It can be mistaken for the production source and drift from API behavior. | Remove it or label and use it only as an explicit fixture. |
| Medium | Reproducibility | Backend dependencies are unpinned and no repository CI workflow runs lint/build/tests. | Installs can change over time and regressions depend on each contributor's workstation. | Pin/lock dependencies and add automated backend/frontend checks. |
| Low | Consistency | Frontend files mix quote/semicolon styles, and Python formatting contains awkward line breaks. | Reviews include avoidable formatting noise. | Adopt one formatter per language and run it in the validation gate. |
| Low | Observability | API routes have no request correlation, structured error contract, or operational logging. | Failures in a deployed service are hard to diagnose. | Add minimal structured logging/error conventions without logging financial or secret data. |

## Proposed repository rule set

The following focused rules address the risks while preserving the useful patterns:

1. **API security and errors** — explicit credentialed CORS origins, validated query ranges, safe error responses, and no sensitive logging for `backend/app/**/*.py`.
2. **Deterministic financial data** — local random generators, explicit date dependencies, chronological output, monetary rounding boundaries, and empty-input behavior for backend financial modules.
3. **Shared financial contract** — canonical backend contract, synchronized TypeScript boundary, exact enum values, ISO dates, and contract tests across both services.
4. **Frontend data flow and states** — one aggregation owner, typed fetch parsing, derived period labels, and required loading/error/empty/success states for dashboard code.
5. **Validation gates** — backend tests plus frontend test/lint/build and compose validation before committing relevant changes; failures must be reported rather than bypassed.

Each rule is deliberately scoped by file pattern and responsibility. The validation scenarios in `.agents/rules/VALIDATION.md` exercise the rules against tasks that could realistically occur in this repository.
