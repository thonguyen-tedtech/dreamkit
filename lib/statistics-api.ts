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

export interface DailyTrendPoint {
  readonly date: string;
  readonly revenue: number;
  readonly orderCount: number;
}

/** Response shape for GET /api/statistics/overview. */
export interface StatisticsOverview {
  readonly range: StatisticsDateRange;
  readonly revenue: number;
  readonly orderCounts: OrderCountsByStatus;
  readonly dailyTrend: readonly DailyTrendPoint[];
}

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

/** Response shape for GET /api/statistics/products. */
export interface ProductPerformance {
  readonly range: StatisticsDateRange;
  readonly topProducts: readonly TopProductEntry[];
  readonly lowStock: readonly LowStockEntry[];
}

/** Response shape for GET /api/statistics/growth. */
export interface GrowthStatistics {
  readonly range: StatisticsDateRange;
  readonly newCustomers: number;
  readonly contactInquiries: number;
}

/** Optional inclusive date filter shared by all statistics endpoints; omit for the backend's 30-day default. */
export interface StatisticsQueryInput {
  readonly startDate?: string;
  readonly endDate?: string;
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

export interface FetchProductPerformanceSuccess {
  readonly ok: true;
  readonly performance: ProductPerformance;
}

export type FetchProductPerformanceResult =
  | FetchProductPerformanceSuccess
  | FetchStatisticsFailure;

export interface FetchGrowthSuccess {
  readonly ok: true;
  readonly growth: GrowthStatistics;
}

export type FetchGrowthResult = FetchGrowthSuccess | FetchStatisticsFailure;

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function buildQueryString(input?: StatisticsQueryInput): string {
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
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Revenue, order-status breakdown, and daily trend for the range. Admin only. */
export async function fetchStatisticsOverviewApi(
  accessToken: string,
  input?: StatisticsQueryInput,
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

/** Top-selling products and current low-stock products for the range. Admin only. */
export async function fetchProductPerformanceApi(
  accessToken: string,
  input?: StatisticsQueryInput,
): Promise<FetchProductPerformanceResult> {
  const result = await apiFetch<ProductPerformance>(
    `/api/statistics/products${buildQueryString(input)}`,
    { method: "GET", headers: authHeaders(accessToken) },
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, performance: result.data };
}

/** New customer signups and contact inquiry volume for the range. Admin only. */
export async function fetchGrowthStatisticsApi(
  accessToken: string,
  input?: StatisticsQueryInput,
): Promise<FetchGrowthResult> {
  const result = await apiFetch<GrowthStatistics>(
    `/api/statistics/growth${buildQueryString(input)}`,
    { method: "GET", headers: authHeaders(accessToken) },
  );

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, growth: result.data };
}
