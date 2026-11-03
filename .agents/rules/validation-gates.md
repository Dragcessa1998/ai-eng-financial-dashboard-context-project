---
title: Repository validation gates
description: Run the smallest complete verification set for every affected service.
scope: project
alwaysApply: true
---

# Repository validation gates

Before committing, select checks from the affected paths:

| Changed area | Required checks |
| --- | --- |
| `backend/**` | `cd backend && pytest -q` |
| `frontend/**` | `cd frontend && npm test -- --run`, `npm run lint`, and `npm run build` |
| API contract in either service | Both backend and frontend checks; inspect `/openapi.json` or the generated contract diff. |
| Docker/configuration | `docker compose config --quiet`; for runtime changes, `docker compose up --build` and verify ports 5173, 8000, and `/health`. |
| `.agents/rules/**` or `memory-bank/**` | Re-read `AGENTS.md`, check rule scopes against a concrete repository task, and run `git diff --check`. |

## Failure policy

- Never claim a check passed if its executable or dependency is unavailable.
- Record the exact command and failure, distinguish environment failures from product failures, and run every still-available check.
- Do not weaken, skip, or delete a test merely to obtain a green result.
- Keep commits focused enough that a failed gate identifies one phase or responsibility.

## Completion evidence

A handover is complete only when the change summary names the checks actually run, their results, and any unresolved environment or external-delivery requirement.
