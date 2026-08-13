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
- Heavy chart modules are split with `React.lazy`/`Suspense`; the main production JavaScript chunk is 188.25 kB in the latest verified build.
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

On 2026-08-13, workspace-local Node/npm and `uv` installations were discovered after the initial handover audit. Frontend test/lint/typecheck/build and 15 backend tests subsequently passed. Docker runtime validation remains unavailable because the local Colima/QEMU wrapper points to a missing UTM `qemu-img` binary. See `docs/agent-skills-audit.md` for current evidence and `docs/handover-summary.md` for the original baseline attempt.
