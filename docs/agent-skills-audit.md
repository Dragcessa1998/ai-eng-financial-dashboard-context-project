# Agent skills application audit

Updated: 2026-08-13

## Skills selected and loaded

| Need | Skill | Source | Application |
| --- | --- | --- | --- |
| Accessibility | `accessibility` | `addyosmani/web-quality-skills` | WCAG 2.2 structure, keyboard bypass, live status/error announcements, decorative icon handling, and textual chart equivalents. |
| React quality | `vercel-react-best-practices` | `vercel-labs/agent-skills` | Dynamic imports for heavy chart modules and an explicit review of package/import and rendering guidance. |
| Additional topic | `performance` | `addyosmani/web-quality-skills` | Bundle-size comparison and elimination of repeated KPI array scans. Chosen because the baseline production build emitted a >500 kB chunk warning. |
| Project-specific workflow | `financial-metrics-contract` | Local `.skills/` | End-to-end audit of API fields, TypeScript types, formulas, period dates, formatting, chart text, and edge-case tests. |

The three community skills and their source hashes are recorded in `skills-lock.json`. The custom skill was generated with the Codex skill scaffold, registered in `AGENTS.md`, and passed the official `quick_validate.py` validator.

## Accessibility findings and changes

- Added a visible-on-focus skip link and focusable `main` target.
- Added `aria-busy`, a polite load status, and an assertive request-error alert.
- Marked Lucide icons and tooltip swatches as decorative.
- Added programmatic chart headings/descriptions and screen-reader lists with every exact month/value. Recharts SVG output is hidden from assistive technology to avoid a noisy duplicate representation.
- Added descriptive page title/metadata, visible focus styles, reduced-motion handling, and forced-colors support.
- Calculated contrast for the dark-theme text, muted text, badge text/icons, focus ring, and primary icon pairs; the lowest measured ratio was 5.01:1 and the primary foreground reached 16.88:1.
- Preserved native semantic elements; the read-only dashboard has no custom button, tab, dialog, or drag interaction requiring keyboard emulation.

## React and performance findings

This repository is Vite/React, not Next.js. Therefore:

- `next/image` is neither available nor appropriate, and runtime source contains no `<img>` element to replace;
- page metadata belongs in `frontend/index.html`, where title and description were added;
- `React.lazy` plus `Suspense` is the framework-correct equivalent for splitting the two Recharts components;
- the Lucide named imports remain because Vite tree-shakes the side-effect-free package and Lucide 1.8 does not ship type declarations for its deep icon paths.

Production build comparison:

| Build | Main JavaScript | Largest chart chunk | Warning over 500 kB |
| --- | ---: | ---: | --- |
| Baseline after accessibility work | 585.98 kB | bundled into main | Yes |
| After skill application | 188.25 kB | 342.29 kB | No |

The main JavaScript chunk decreased by 397.73 kB (67.9%). `computeKPIs` now accumulates income/outcome in one pass instead of four array passes.

## Custom financial-metric trace

| Layer | Evidence | Result |
| --- | --- | --- |
| Business formula | `computeKPIs`: income sum, outcome sum, profit difference, margin divided by income with zero-income policy | Pass; empty and negative-profit cases added |
| API contract | Generated OpenAPI for `GET /api/metrics` references `FinancialMovement` and requires date, amount, operation, category, and business type | Pass |
| TypeScript boundary | `financial-types.ts` uses the same field names and exact enum values as OpenAPI | Pass; still manually duplicated |
| Calculation | `financial-utils.ts` and 8 Vitest cases cover totals, zero income, empty input, negative profit, chronological cross-year aggregation, and formatting | Pass |
| Presentation | KPI text plus screen-reader chart values; reporting period derived from min/max response dates | Pass; removed stale literal `2024` |
| Validation | Frontend test/lint/typecheck/build, backend tests, OpenAPI inspection, skill validator | Pass; Docker runtime remains environment-blocked |

## Validation evidence

| Check | Result |
| --- | --- |
| `npm test` | 8/8 passed |
| `npm run lint` | Passed |
| `npx tsc --noEmit -p tsconfig.app.json` | Passed |
| `npm run build` | Passed; no chunk-size warning |
| Backend `pytest -q` through local `uv` | 15/15 passed; one upstream Starlette deprecation warning |
| Generated OpenAPI inspection | Field names, required fields, formats, and enums match the TypeScript boundary |
| `quick_validate.py .skills/financial-metrics-contract` | `Skill is valid!` |
| Local API + Vite browser check | Data and both charts rendered; period showed `Aug 2025 – Jul 2026`; activating the skip link focused `#main-content` |
| Docker Compose runtime | Not completed: the local Colima wrapper points to a missing UTM `qemu-img` binary |

No fork, public repository, push, pull request, or course authorship declaration was created as part of this local implementation.

The 4Geeks project checklist is at 24/25. The remaining item specifically requires the Next.js metadata API, which cannot truthfully be claimed in this official Vite project. The page has equivalent standards-compliant `<title>` and `<meta name="description">` elements in `frontend/index.html`; migrating the application to Next.js would be an out-of-scope rewrite.
