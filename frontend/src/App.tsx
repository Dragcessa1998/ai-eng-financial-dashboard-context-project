import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import {
  computeKPIs,
  computeMonthlyData,
  formatReportingPeriod,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);

const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

function ChartModuleFallback({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[376px] items-center justify-center rounded-xl border border-border/60 bg-card text-sm text-muted-foreground"
    >
      Loading {label}
    </div>
  );
}

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [period, setPeriod] = useState("Loading reporting period");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setPeriod(formatReportingPeriod(movements));
      })
      .catch(() => {
        setError(
          "Financial data could not be loaded. Check the backend API and try again.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to dashboard content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        aria-busy={loading}
        className="dark min-h-screen bg-background text-foreground"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <DashboardHeader period={period} />

            <p className="sr-only" role="status" aria-live="polite">
              {loading ? "Loading financial dashboard data" : "Financial dashboard data loaded"}
            </p>

            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
              >
                {error}
              </div>
            ) : null}

            <section aria-label="Key performance indicators">
              <KPIRow metrics={metrics} loading={loading} />
            </section>

            <section
              aria-label="Financial charts"
              className="grid grid-cols-1 gap-4 xl:grid-cols-2"
            >
              <Suspense fallback={<ChartModuleFallback label="income and outcome chart" />}>
                <IncomeOutcomeChart data={monthlyData} loading={loading} />
              </Suspense>
              <Suspense fallback={<ChartModuleFallback label="profit margin chart" />}>
                <ProfitPercentChart data={monthlyData} loading={loading} />
              </Suspense>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
