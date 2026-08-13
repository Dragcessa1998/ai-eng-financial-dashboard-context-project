---
title: Shared financial API contract
description: Keep Python responses and TypeScript domain types synchronized.
scope: project
globs:
  - "backend/app/routes.py"
  - "frontend/src/lib/financial-types.ts"
alwaysApply: false
---

# Shared financial API contract

## Canonical source and synchronization

- Treat FastAPI/Pydantic and its generated OpenAPI schema as the canonical wire contract.
- Preserve exact wire values: `income`, `outcome`; `suppliers`, `sales`, `operational`, `administrative`, `others`; `B2B`, `B2C`; ISO `YYYY-MM-DD` dates.
- When a response field or enum changes, update the TypeScript boundary and backend/frontend contract tests in the same change.
- Do not silently coerce an unknown category or omit a newly required field. Fail validation with a diagnosable error.
- Prefer generating TypeScript types from OpenAPI when adding automation; until then, record manual synchronization in the change description.

## Scope boundary

This rule governs data exchanged between services. Component-only props and backend-only internal models remain local unless they cross the HTTP boundary.

## Validation example

For the task "add a `refunds` category," a compliant change updates the Python `Category`, OpenAPI/endpoint tests, TypeScript `Category`, and a frontend parsing/behavior test. Editing only one language is rejected.
