import type { BusinessType, OperationType } from "./api-types";

/** Optional inclusive date range shared by all three features. */
export interface DateRangeFilter {
  /** Inclusive lower bound formatted as `YYYY-MM-DD`; omit for no lower bound. */
  start_date?: string;
  /** Inclusive upper bound formatted as `YYYY-MM-DD`; omit for no upper bound. */
  end_date?: string;
}

/** Query parameters for `GET /api/metrics/alerts`. */
export interface AlertsParams extends DateRangeFilter {
  /** Spike ratio from `0.01` through `1.0`; the UI defaults to `0.3`. */
  threshold: number;
  /** Aggregation interval; the home-dashboard table uses monthly periods. */
  group_by: "month";
}

/** Query parameters for `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Direction to rank; the comparison feature always sends `income`. */
  operation_type: OperationType;
  /** Maximum rows from `1` through `20`; the comparison feature sends `5`. */
  limit: number;
  /** Segment to aggregate; each comparison panel sends `B2B` or `B2C`. */
  business_type: BusinessType;
}
