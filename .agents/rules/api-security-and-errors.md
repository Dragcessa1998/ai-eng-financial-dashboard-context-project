---
title: API security and error boundaries
description: Protect FastAPI configuration and return safe, validated failures.
scope: project
globs:
  - "backend/app/**/*.py"
alwaysApply: false
---

# API security and error boundaries

## Required behavior

- For credentialed CORS, use an explicit origin allowlist loaded from configuration. Never combine wildcard origins with `allow_credentials=True` outside an explicitly non-credentialed local mode.
- Validate relationships that type parsing alone cannot prove. Date ranges must reject `start_date > end_date`; numeric limits must remain bounded.
- Keep Pydantic response models on public routes. Add a stable, non-sensitive error shape when introducing an expected domain failure.
- Log enough context to diagnose a failure (route, safe category, correlation identifier) but never log credentials, tokens, environment values, or complete financial payloads.
- Convert expected invalid input into a tested 4xx response. Do not expose stack traces or internal exception text to clients.

## Scope boundary

This rule governs API configuration, routes, and error handling. It does not prescribe frontend messages or financial calculation formulas.

## Validation example

For the task "allow a deployed dashboard at `https://finance.example.com` to send cookies," a compliant change adds that exact configured origin and a CORS test. Adding `*` while retaining credentials is rejected.
