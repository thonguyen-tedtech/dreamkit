import { apiFetch } from "./api-client";

/** Inclusive ISO-8601 date range a statistics request covers. */
export interface StatisticsDateRange {
  readonly start: string;
  readonly end: string;
}

export interface OrderCountsByStatus {
  readonly pending: number;
  readonly confirmed: number;
  readonly shipped: number;
  readonly delivered: number;
  readonly cancelled: number;
}

/**
 * Window the overview covers. The three presets resolve server-side to the current
 * period-to-date and ignore `startDate`/`endDate`; only `custom` reads them.
 */
export type StatisticsPeriod = "today" | "this_week" | "this_month" | "custom";

export interface TopProductEntry {
  readonly productId: string;
  readonly name: string;
  readonly quantitySold: number;
}

export interface LowStockEntry {
  readonly productId: string;
  readonly name: string;
  readonly stock: number;
}

/**
 * Response shape for GET /api/statistics/overview — every period-scoped figure the
 * dashboard shows. Absorbed the former /statistics/products and /statistics/growth
 * endpoints, which no longer exist.
 */
export interface StatisticsOverview {
  readonly range: StatisticsDateRange;
  /** The period selector that produced `range`, echoed back by the API. */
  readonly granularity: StatisticsPeriod;
  readonly revenue: number;
  readonly orderCounts: OrderCountsByStatus;
  readonly topProducts: readonly TopProductEntry[];
  /** Always current stock, not scoped to `range`. */
  readonly lowStock: readonly LowStockEntry[];
  readonly newCustomers: number;
  readonly contactInquiries: number;
}

/**
 * Response shape for GET /api/statistics/summary — store-wide running totals as of
 * now, with no date range. The endpoint returns the raw statistics document, so it
 * also carries `_id`/`key`/timestamps; only the fields the dashboard reads are typed.
 */
export interface StatisticsSummary {
  readonly orderCounts: OrderCountsByStatus;
  /** Sum of `totalAmount` over delivered orders, matching the rollups' revenue definition. */
  readonly totalRevenue: number;
  readonly totalOrders: number;
  /** Accounts with the `user` role; admins excluded. */
  readonly totalMembers: number;
  readonly totalContacts: number;
  /** When the backend last recomputed these totals, ISO-8601. */
  readonly computedAt: string;
}

/** Bucket size of a chart series, mirroring the backend's `granularity` query value. */
export type StatisticsGranularity = "daily" | "weekly" | "monthly";

export interface ChartPoint {
  /** Bucket key: `YYYY-MM-DD` for daily, the week's Monday for weekly, `YYYY-MM` for monthly. */
  readonly period: string;
  readonly revenue: number;
  readonly orderCount: number;
}

/** Response shape for GET /api/statistics/chart. */
export interface StatisticsChart {
  readonly range: StatisticsDateRange;
  readonly granularity: StatisticsGranularity;
  readonly points: readonly ChartPoint[];
}

/**
 * Longest span the API accepts for a `custom` overview range, both ends inclusive.
 * Mirrors the backend's `MAX_CUSTOM_RANGE_DAYS`; a wider range is rejected with 400.
 */
export const MAX_CUSTOM_RANGE_DAYS = 30;

/** Inclusive day count between two ISO dates, so `2026-08-01`..`2026-08-30` is 30. */
export function inclusiveSpanDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

/** Whether a custom range is within the span the API accepts. */
export function isCustomRangeWithinLimit(startDate: string, endDate: string): boolean {
  return inclusiveSpanDays(startDate, endDate) <= MAX_CUSTOM_RANGE_DAYS;
}

/**
 * Latest end date still within the span cap for `startDate`, never past `today`.
 * Feeds the date input's `max` so the picker can't offer an over-wide range.
 */
export function maxEndDateFor(startDate: string, today: string): string {
  const limit = new Date(`${startDate}T00:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() + MAX_CUSTOM_RANGE_DAYS - 1);
  const capped = limit.toISOString().slice(0, 10);
  return capped < today ? capped : today;
}

/** Optional inclusive date filter shared by the range-scoped statistics endpoints. */
export interface StatisticsQueryInput {
  readonly startDate?: string;
  readonly endDate?: string;
}

/** Date filter plus the period, for GET /api/statistics/overview; omit `granularity` for the backend's `custom` default. */
export interface StatisticsOverviewQueryInput extends StatisticsQueryInput {
  readonly granularity?: StatisticsPeriod;
}

/** Date filter plus the bucket size, for GET /api/statistics/chart; omit `granularity` for the backend's `daily` default. */
export interface StatisticsChartQueryInput extends StatisticsQueryInput {
  readonly granularity?: StatisticsGranularity;
}

export interface FetchStatisticsFailure {
  readonly ok: false;
  readonly message: string;
}

export interface FetchOverviewSuccess {
  readonly ok: true;
  readonly overview: StatisticsOverview;
}

export type FetchOverviewResult = FetchOverviewSuccess | FetchStatisticsFailure;

export interface FetchSummarySuccess {
  readonly ok: true;
  readonly summary: StatisticsSummary;
}

export type FetchSummaryResult = FetchSummarySuccess | FetchStatisticsFailure;

export interface FetchChartSuccess {
  readonly ok: true;
  readonly chart: StatisticsChart;
}

export type FetchChartResult = FetchChartSuccess | FetchStatisticsFailure;

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

/** Shared by both range-scoped endpoints; `granularity` means a different enum to each. */
function buildQueryString(
  input?: StatisticsOverviewQueryInput | StatisticsChartQueryInput,
): string {
  if (!input) {
    return "";
  }
  const params = new URLSearchParams();
  if (input.startDate) {
    params.set("startDate", input.startDate);
  }
  if (input.endDate) {
    params.set("endDate", input.endDate);
  }
  if (input.granularity) {
    params.set("granularity", input.granularity);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Store-wide running totals as of now. Takes no date range. Admin only. */
export async function fetchStatisticsSummaryApi(
  accessToken: string,
): Promise<FetchSummaryResult> {
  const result = await apiFetch<StatisticsSummary>("/api/statistics/summary", {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, summary: result.data };
}

/**
 * Every period-scoped figure the dashboard shows: revenue, order-status breakdown,
 * top products, low stock, and growth. Admin only.
 *
 * A `custom` range may span at most `MAX_CUSTOM_RANGE_DAYS`; wider is a 400.
 */
export async function fetchStatisticsOverviewApi(
  accessToken: string,
  input?: StatisticsOverviewQueryInput,
): Promise<FetchOverviewResult> {
  const result = await apiFetch<StatisticsOverview>(
    `/api/statistics/overview${buildQueryString(input)}`,
    { method: "GET", headers: authHeaders(accessToken) },
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, overview: result.data };
}

/** Revenue and order-count series bucketed by day, ISO week, or month. Admin only. */
export async function fetchStatisticsChartApi(
  accessToken: string,
  input?: StatisticsChartQueryInput,
): Promise<FetchChartResult> {
  const result = await apiFetch<StatisticsChart>(
    `/api/statistics/chart${buildQueryString(input)}`,
    { method: "GET", headers: authHeaders(accessToken) },
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, chart: result.data };
}
