---
title: Deterministic financial data behavior
description: Keep generated financial results isolated, chronological, and testable.
scope: project
globs:
  - "backend/app/routes.py"
alwaysApply: false
---

# Deterministic financial data behavior

## Required behavior

- Use a local `random.Random(seed)` instance. Do not seed or consume Python's module-level random generator in request code.
- Make the reference date an explicit parameter at the generation boundary so tests can freeze it.
- Preserve chronological ordering at public list boundaries and state whether a helper accepts unsorted input.
- Keep financial aggregations pure. Define and test behavior for empty collections and zero denominators.
- Validate a requested period before calculating an equal-duration previous period.
- Round only at API/display boundaries; do not repeatedly round intermediate totals.

## Scope boundary

This rule covers generation, filtering, aggregation, comparison, and alert logic in the existing backend module. It does not authorize replacing mock data with a database.

## Validation example

For the task "add randomized forecast movements," a compliant proposal injects a local seeded generator and reference date and adds repeatability/concurrency tests. A call to `random.seed(...)` inside a route is rejected.
