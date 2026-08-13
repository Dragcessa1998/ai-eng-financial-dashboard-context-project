# Technical context and stack

## Service topology

```text
Browser
  -> Vite dev server / React app (:5173)
       -> /api proxy on the compose network
            -> FastAPI + Uvicorn (:8000)
                 -> deterministic in-memory movement generation
```

`docker-compose.yml` builds one image per service, bind-mounts each source directory, exposes frontend 5173, backend 8000, and backend debug 5678. There is no database, message broker, or external API.

## Frontend

- React 19.2 and React DOM 19.2.
- TypeScript 6.0 in Vite 8.
- Tailwind CSS 4 through `@tailwindcss/vite`.
- Recharts 3.8 for charts and Lucide React for icons.
- Small shadcn-style primitives in `src/components/ui`.
- Vitest 4.1 for unit tests; ESLint 9 with TypeScript and React hooks rules.

Entry points and responsibilities:

- `src/main.tsx`: React mount/strict mode.
- `src/App.tsx`: request lifecycle and page composition.
- `src/components/dashboard/`: display components and chart tooltips.
- `src/lib/financial-types.ts`: TypeScript copy of the wire types.
- `src/lib/financial-utils.ts`: pure calculations/formatters.

## Backend

- Python with FastAPI, Uvicorn, Pydantic (through FastAPI), and HTTPX.
- Pytest and pytest-cov are declared for tests; debugpy is included for debugging.
- `app/main.py`: application and CORS setup.
- `app/routes.py`: schemas, generator, domain helpers, and every endpoint.
- `tests/test_routes.py`: 15 tests using FastAPI `TestClient`.

Backend requirements are currently unpinned, so exact installed versions are not reproducible from `requirements.txt` alone.

## Data and contract decisions

- The API's Pydantic/OpenAPI model is the canonical wire contract.
- The frontend currently duplicates the contract manually; apply `.agents/rules/shared-financial-contract.md` to boundary changes.
- Endpoint generation uses seed 42, 30 movements per month, and years relative to the current date.
- The screen currently performs aggregation in the browser even though aggregate endpoints also exist.

## Expected verification

```bash
cd backend && pytest -q
cd frontend && npm test -- --run
cd frontend && npm run lint
cd frontend && npm run build
docker compose config --quiet
docker compose up --build
curl --fail http://localhost:8000/health
```

On the 2026-08-13 handover workstation, Docker and Node/npm were unavailable and system Python lacked pytest. These commands are the required gates, not recorded passing results. See `docs/handover-summary.md` for the exact attempt record.
