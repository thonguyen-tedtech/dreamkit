"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { formatPrice } from "@/lib/products";
import {
  fetchStatisticsChartApi,
  fetchStatisticsOverviewApi,
  fetchStatisticsSummaryApi,
  isCustomRangeWithinLimit,
  MAX_CUSTOM_RANGE_DAYS,
  maxEndDateFor,
  type ChartPoint,
  type LowStockEntry,
  type StatisticsGranularity,
  type StatisticsOverview,
  type StatisticsPeriod,
  type StatisticsSummary,
  type TopProductEntry,
} from "@/lib/statistics-api";
import {
  DailyTrendChart,
  GRANULARITIES,
  GRANULARITY_LABELS,
  MonthlyTrendChart,
  TREND_CHART_MAX_POINTS,
  WeeklyTrendChart,
} from "@/components/admin/trend-charts";
import { OrderStatusBreakdown, SummaryPanel } from "@/components/admin/summary-panel";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const PERIODS: readonly StatisticsPeriod[] = ["today", "this_week", "this_month", "custom"];

const PERIOD_LABELS: Record<StatisticsPeriod, string> = {
  today: "Hôm nay",
  this_week: "Tuần này",
  this_month: "Tháng này",
  custom: "Tùy chọn",
};

/**
 * Mirrors the backend's default `custom` range: the last 30 days through today.
 * Both ends are inclusive, so this steps back 29 days — a 30-day span is the most
 * the API accepts.
 */
function defaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (MAX_CUSTOM_RANGE_DAYS - 1));
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

/** `YYYY-MM-DD` → `DD/MM/YYYY`. */
function displayDate(isoDay: string): string {
  const [year, month, day] = isoDay.split("-");
  return `${day}/${month}/${year}`;
}

/** The window the API actually resolved, shown so the presets aren't opaque. */
function formatRangeLabel(start: string, end: string): string {
  return start === end
    ? displayDate(start)
    : `${displayDate(start)} – ${displayDate(end)}`;
}

/**
 * The trend chart drives its own range off the selected granularity rather than the
 * page's date filter: at the filter's 30-day default a monthly chart would be a
 * single point. Each granularity asks for just enough history to fill the buckets
 * its chart plots, plus one extra so the partial bucket at the range edge can be
 * dropped by the chart's own cap.
 */
function chartDateRange(granularity: StatisticsGranularity): {
  startDate: string;
  endDate: string;
} {
  const end = new Date();
  const start = new Date();
  const buckets = TREND_CHART_MAX_POINTS[granularity];

  if (granularity === "daily") {
    start.setDate(start.getDate() - (buckets - 1));
  } else if (granularity === "weekly") {
    start.setDate(start.getDate() - 7 * buckets);
  } else {
    start.setMonth(start.getMonth() - buckets);
  }

  return { startDate: isoDate(start), endDate: isoDate(end) };
}

export function AdminDashboard() {
  const { accessToken } = useAuthModal();
  const { showToast } = useToast();

  const [{ startDate, endDate }, setAppliedRange] = useState(defaultDateRange);
  const [startDateInput, setStartDateInput] = useState(startDate);
  const [endDateInput, setEndDateInput] = useState(endDate);
  const [period, setPeriod] = useState<StatisticsPeriod>("custom");
  const [overview, setOverview] = useState<StatisticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<StatisticsSummary | null>(null);
  const [granularity, setGranularity] = useState<StatisticsGranularity>("daily");
  const [chartPoints, setChartPoints] = useState<readonly ChartPoint[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);

    // The presets resolve their own window server-side and ignore the dates.
    const result = await fetchStatisticsOverviewApi(
      accessToken,
      period === "custom" ? { granularity: period, startDate, endDate } : { granularity: period },
    );

    if (result.ok) {
      setOverview(result.overview);
    } else {
      showToast(result.message, "error");
    }

    setIsLoading(false);
  }, [accessToken, period, startDate, endDate, showToast]);

  // Store-wide totals take no date range, so this deliberately does not depend on it.
  const loadSummary = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    const result = await fetchStatisticsSummaryApi(accessToken);

    if (result.ok) {
      setSummary(result.summary);
    } else {
      showToast(result.message, "error");
    }
  }, [accessToken, showToast]);

  const loadChart = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsChartLoading(true);

    const result = await fetchStatisticsChartApi(accessToken, {
      ...chartDateRange(granularity),
      granularity,
    });

    if (result.ok) {
      setChartPoints(result.chart.points);
    } else {
      setChartPoints([]);
      showToast(result.message, "error");
    }

    setIsChartLoading(false);
  }, [accessToken, granularity, showToast]);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    void loadChart();
  }, [loadChart]);

  function handleApplyRange(event: FormEvent) {
    event.preventDefault();

    // Caught here as well as by the date inputs' own bounds, so a typed-in date
    // gets a readable message instead of the API's 400.
    if (!isCustomRangeWithinLimit(startDateInput, endDateInput)) {
      showToast(`Khoảng thời gian tối đa là ${MAX_CUSTOM_RANGE_DAYS} ngày.`, "error");
      return;
    }

    setAppliedRange({ startDate: startDateInput, endDate: endDateInput });
  }

  function handlePeriodChange(next: StatisticsPeriod) {
    setPeriod(next);
    // Switching back to a custom window re-applies whatever the inputs currently show.
    if (next === "custom") {
      setAppliedRange({ startDate: startDateInput, endDate: endDateInput });
    }
  }

  const totalOrders = useMemo(
    () => (overview ? Object.values(overview.orderCounts).reduce((sum, n) => sum + n, 0) : 0),
    [overview],
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Tổng quan</h1>
        <p className="mt-2 text-sm text-muted">
          Thống kê toàn cửa hàng và theo khoảng thời gian.
        </p>
      </div>

      {/* 1 — Tổng kết: store-wide running totals, unaffected by the period filter. */}
      <SummaryPanel summary={summary} />

      {/* 2 — Theo kỳ: everything scoped to the selected period. */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl text-foreground">Theo kỳ</h2>
            {overview ? (
              <p className="mt-1 text-xs text-muted">
                {formatRangeLabel(overview.range.start, overview.range.end)}
              </p>
            ) : null}
          </div>
          <form onSubmit={handleApplyRange} className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Kỳ thống kê
              <select
                value={period}
                onChange={(event) => handlePeriodChange(event.target.value as StatisticsPeriod)}
                className="h-10 rounded-card border border-border bg-background px-3 text-sm text-foreground"
              >
                {PERIODS.map((option) => (
                  <option key={option} value={option}>
                    {PERIOD_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>
            {period === "custom" ? (
              <>
                <label className="flex flex-col gap-1 text-xs text-muted">
                  Từ ngày
                  <input
                    type="date"
                    value={startDateInput}
                    max={endDateInput}
                    onChange={(event) => setStartDateInput(event.target.value)}
                    className="rounded-card border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted">
                  Đến ngày
                  <input
                    type="date"
                    value={endDateInput}
                    min={startDateInput}
                    max={maxEndDateFor(startDateInput, isoDate(new Date()))}
                    onChange={(event) => setEndDateInput(event.target.value)}
                    className="rounded-card border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
                  />
                </label>
                <Button type="submit" disabled={isLoading}>
                  Áp dụng
                </Button>
              </>
            ) : null}
          </form>
        </div>

        {isLoading && !overview ? (
          <LoadingOverlay label="Đang tải thống kê…" />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Doanh thu" value={formatPrice(overview?.revenue ?? 0)} />
              <StatCard label="Đơn hàng" value={String(totalOrders)} href="/admin/orders" />
              <StatCard
                label="Khách hàng mới"
                value={String(overview?.newCustomers ?? 0)}
                href="/admin/users"
              />
              <StatCard
                label="Lượt liên hệ"
                value={String(overview?.contactInquiries ?? 0)}
                href="/admin/contacts"
              />
            </div>

            <div className="rounded-card border border-border bg-surface p-6">
              <h3 className="font-display text-lg text-foreground">Đơn hàng theo trạng thái</h3>
              <p className="mt-1 text-xs text-muted">Trong kỳ đã chọn.</p>
              <OrderStatusBreakdown counts={overview?.orderCounts} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-card border border-border bg-surface p-6">
                <h3 className="font-display text-lg text-foreground">Sản phẩm bán chạy</h3>
                <p className="mt-1 text-xs text-muted">Trong kỳ đã chọn.</p>
                <TopProductsList products={overview?.topProducts ?? []} />
              </div>

              <div className="rounded-card border border-border bg-surface p-6">
                <h3 className="font-display text-lg text-foreground">Sắp hết hàng</h3>
                {/* The API returns current stock here, not a figure scoped to the period. */}
                <p className="mt-1 text-xs text-muted">Tồn kho hiện tại.</p>
                <LowStockList products={overview?.lowStock ?? []} />
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3 — Biểu đồ: its own window, driven by the granularity select. */}
      <section className="rounded-card border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-foreground">Doanh thu</h2>
          <label className="flex items-center gap-2 text-xs text-muted">
            Hiển thị
            <select
              value={granularity}
              onChange={(event) => setGranularity(event.target.value as StatisticsGranularity)}
              className="h-10 rounded-card border border-border bg-background px-3 text-sm text-foreground"
              aria-label="Chọn khoảng thời gian của biểu đồ doanh thu"
            >
              {GRANULARITIES.map((option) => (
                <option key={option} value={option}>
                  {GRANULARITY_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {isChartLoading && chartPoints.length === 0 ? (
          <LoadingOverlay label="Đang tải biểu đồ…" />
        ) : granularity === "weekly" ? (
          <WeeklyTrendChart points={chartPoints} />
        ) : granularity === "monthly" ? (
          <MonthlyTrendChart points={chartPoints} />
        ) : (
          <DailyTrendChart points={chartPoints} />
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-card border border-border bg-surface p-6">
      <p className="text-xs uppercase tracking-label text-muted">{label}</p>
      <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}

function TopProductsList({
  products,
}: {
  products: readonly TopProductEntry[];
}) {
  if (products.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted">Chưa có dữ liệu bán hàng trong khoảng thời gian này.</p>
    );
  }

  return (
    <ul className="mt-4 divide-y divide-border">
      {products.map((product, index) => (
        <li key={product.productId} className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm text-foreground">
            <span className="mr-2 text-muted">#{index + 1}</span>
            {product.name}
          </span>
          <span className="text-sm font-medium text-foreground">{product.quantitySold} đã bán</span>
        </li>
      ))}
    </ul>
  );
}

function LowStockList({ products }: { products: readonly LowStockEntry[] }) {
  if (products.length === 0) {
    return <p className="mt-4 text-sm text-muted">Không có sản phẩm sắp hết hàng.</p>;
  }

  return (
    <ul className="mt-4 divide-y divide-border">
      {products.map((product) => (
        <li key={product.productId} className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm text-foreground">{product.name}</span>
          <span
            className={`text-sm font-medium ${
              product.stock === 0 ? "text-red-600" : "text-amber-600"
            }`}
          >
            {product.stock === 0 ? "Hết hàng" : `Còn ${product.stock}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
