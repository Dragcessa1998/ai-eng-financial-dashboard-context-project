# Component specifications

These are frontend contracts, not implementation instructions. Components may choose their internal hooks and composition as long as the props, visible states, and acceptance criteria below remain true.

## Shared types

```ts
type RequestState = "idle" | "loading" | "success" | "error";

interface AvailableDateRange {
  minDate: string; // YYYY-MM-DD
  maxDate: string; // YYYY-MM-DD
}
```

## Feature 1 — Date range filter

### `DateRangeFilter`

Props:

```ts
interface DateRangeFilterProps {
  value: DateRangeFilter;
  availableRange: AvailableDateRange | null;
  state: RequestState;
  validationMessage: string | null;
  onChange: (nextValue: DateRangeFilter) => void;
  onClear: () => void;
}
```

Responsibilities and conditional rendering:

- Render labeled `date` inputs for `start_date` and `end_date` and a clear action.
- While facets load, disable dates and show a compact loading message/skeleton.
- When facets succeed, show `Available data: {minDate} to {maxDate}` next to the inputs and apply those values as input bounds.
- If facets fail, keep the dashboard usable with empty optional filters and show a non-blocking range-reference error.
- If `start_date > end_date` or either value is outside the available range, show `validationMessage`, set the invalid input's `aria-invalid`, and do not request filtered data.
- If only one date is filled, emit that single optional parameter. Start-only means from that date onward; end-only means through that date.
- Clearing emits `{}` and restores all available data.

### `DashboardHomePage`

Props:

```ts
interface DashboardHomePageProps {
  initialDateRange?: DateRangeFilter;
}
```

- Own the active `DateRangeFilter` and pass it to every home-page metrics/alerts request.
- On a valid change, show loading states without leaving stale values labeled as current.
- If filtered metrics are empty, keep the filter visible and show an explicit no-data state in KPIs/charts.

## Feature 2 — Anomaly alerts

### `AnomalyAlertsSection`

Props:

```ts
interface AnomalyAlertsSectionProps {
  dateRange: DateRangeFilter;
  defaultThreshold?: number;
}
```

- Render below the existing charts.
- Default the threshold to `0.3` and request monthly alerts with the active date range.
- Coordinate threshold validation and the table request state.

### `ThresholdInput`

Props:

```ts
interface ThresholdInputProps {
  value: number;
  min: 0.01;
  max: 1;
  step: 0.01;
  disabled: boolean;
  onChange: (nextValue: number) => void;
}
```

- Render a labeled numeric input and the equivalent percentage for comprehension.
- Reject values below `0.01`, above `1.0`, or non-numeric input; retain the last valid result until corrected and show an inline error.

### `AnomalyAlertsTable`

Props:

```ts
interface AnomalyAlertsTableProps {
  entries: AlertsResponse;
  state: RequestState;
  onRetry: () => void;
}
```

Conditional rendering:

- `loading`: render a labeled table skeleton.
- `error`: render a safe error message and retry action instead of stale rows.
- `success` with entries: render columns **Period**, **Recorded outcome**, **Previous-period baseline**, and **Percentage increase**. Currency and ratios are formatted for display without changing raw response values.
- `success` with `entries.length === 0`: keep the section and headers visible and show **No spending anomalies match the current threshold and date range.** The table must never silently disappear.

## Feature 3 — B2B vs B2C comparison

### `BusinessComparisonPage`

Props:

```ts
interface BusinessComparisonPageProps {
  initialDateRange?: DateRangeFilter;
}
```

- Render a page heading, the shared `DateRangeFilter`, two segment panels side by side at large widths, and one comparison chart below.
- Load facets once for date/category reference and issue separate top-category requests with `business_type` `B2B` and `B2C`, `operation_type=income`, and `limit=5`.
- Because the API category enum contains at most five values, the sum of the returned five category totals is the selected group's total and is the denominator for percentages.
- Treat B2B and B2C request states independently; one failed panel must not hide a successful panel.

### `BusinessCategoryPanel`

Props:

```ts
interface BusinessCategoryPanelProps {
  businessType: "B2B" | "B2C";
  categories: TopCategoriesResponse;
  state: RequestState;
  onRetry: () => void;
}
```

Conditional rendering for **both** panels:

- `loading`: panel-scoped skeleton.
- `error`: segment-specific message and retry action.
- `success` with rows: table columns **Category**, **Total income**, and **Group percentage**; percentage is `row.total_amount / sum(all returned rows)` and is zero only when the denominator is zero.
- `success` with an empty list: retain the named B2B/B2C panel and render **No income categories are available for this segment and date range.**

### `BusinessIncomeComparisonChart`

Props:

```ts
interface BusinessIncomeComparisonChartProps {
  b2bTotal: number | null;
  b2cTotal: number | null;
  state: RequestState;
}
```

- Compare total B2B and B2C income in one visual with textual value labels.
- Render only after both successful panel results are available.
- While either panel loads, show a chart skeleton; if either fails, show a chart-specific unavailable state without hiding the panels.
- When both totals are zero, render a zero-data message and accessible `0` values rather than an empty chart.

## Cross-feature acceptance criteria

- Dates are inclusive `YYYY-MM-DD` query values and both fields remain optional.
- No component uses `any` or an untyped response.
- Loading, error, empty, and success rendering is explicit for every request surface.
- Keyboard users can reach every input/action, validation is associated with its input, and charts repeat values as text.
