/** Operation direction accepted and returned by the Financial Metrics API. */
export type OperationType = "income" | "outcome";

/** Financial movement category values exposed by the API. */
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";

/** Business segment values exposed by the API. */
export type BusinessType = "B2B" | "B2C";

/** Response from `GET /api/metrics/facets`. */
export interface FacetsResponse {
  /** Operation types available in the current dataset. */
  operation_types: OperationType[];
  /** Business segments available in the current dataset. */
  business_types: BusinessType[];
  /** Financial categories available in the current dataset. */
  categories: Category[];
  /** Earliest movement date, formatted as `YYYY-MM-DD`. */
  min_date: string;
  /** Latest movement date, formatted as `YYYY-MM-DD`. */
  max_date: string;
}

/** One anomaly returned by `GET /api/metrics/alerts`. */
export interface AlertEntry {
  /** Aggregation bucket identifier: ISO date, ISO week, or `YYYY-MM`. */
  period: string;
  /** Total outcome recorded in the period, in the dataset currency. */
  outcome_total: number;
  /** Average outcome of all preceding returned periods, in the dataset currency. */
  baseline_average: number;
  /** Increase over the baseline as a ratio; `0.3` means a 30% increase. */
  increase_ratio: number;
}

/** Array response from `GET /api/metrics/alerts`. */
export type AlertsResponse = AlertEntry[];

/** One ranked category returned by `GET /api/metrics/categories/top`. */
export interface CategoryEntry {
  /** Category represented by this aggregate row. */
  category: Category;
  /** Direction aggregated by the request; the comparison view requires `income`. */
  operation_type: OperationType;
  /** Sum for the category and selected filters, in the dataset currency. */
  total_amount: number;
}

/** Array response from `GET /api/metrics/categories/top`. */
export type TopCategoriesResponse = CategoryEntry[];
