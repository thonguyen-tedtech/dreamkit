import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchStatisticsChartApi,
  fetchStatisticsOverviewApi,
  fetchStatisticsSummaryApi,
  inclusiveSpanDays,
  isCustomRangeWithinLimit,
  maxEndDateFor,
} from "./statistics-api";

describe("custom range limits", () => {
  it("counts both ends of the range", () => {
    expect(inclusiveSpanDays("2026-08-01", "2026-08-01")).toBe(1);
    expect(inclusiveSpanDays("2026-08-01", "2026-08-30")).toBe(30);
    expect(inclusiveSpanDays("2026-08-01", "2026-08-31")).toBe(31);
  });

  it("accepts a 30-day span and rejects a 31-day one", () => {
    expect(isCustomRangeWithinLimit("2026-08-01", "2026-08-30")).toBe(true);
    expect(isCustomRangeWithinLimit("2026-08-01", "2026-08-31")).toBe(false);
  });

  it("accepts the dashboard's default range of the last 30 days", () => {
    // Stepping back 29 days is the widest default the API will take.
    expect(isCustomRangeWithinLimit("2026-07-16", "2026-08-14")).toBe(true);
    expect(isCustomRangeWithinLimit("2026-07-15", "2026-08-14")).toBe(false);
  });

  it("caps the end date at the span limit, or at today when that comes first", () => {
    expect(maxEndDateFor("2026-08-01", "2026-12-31")).toBe("2026-08-30");
    expect(maxEndDateFor("2026-08-01", "2026-08-14")).toBe("2026-08-14");
  });

  it("carries the cap across a month boundary", () => {
    expect(maxEndDateFor("2026-01-20", "2026-12-31")).toBe("2026-02-18");
  });
});

describe("fetchStatisticsSummaryApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("fetches store-wide totals without a date range", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        _id: "6a7ecef65f94f3013372c0d7",
        key: "global",
        orderCounts: { pending: 7, confirmed: 2, shipped: 1, delivered: 4, cancelled: 1 },
        totalRevenue: 3_335_000,
        totalOrders: 15,
        totalMembers: 7,
        totalContacts: 3,
        computedAt: "2026-08-14T08:59:04.815Z",
      }),
    });

    const result = await fetchStatisticsSummaryApi("token-123");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.totalRevenue).toBe(3_335_000);
      expect(result.summary.totalOrders).toBe(15);
      expect(result.summary.totalMembers).toBe(7);
      expect(result.summary.totalContacts).toBe(3);
      expect(result.summary.orderCounts.delivered).toBe(4);
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statistics/summary",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("surfaces a failure message when the request fails", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ message: "Admin role required" }),
    });

    const result = await fetchStatisticsSummaryApi("token-123");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Admin role required");
    }
  });
});

describe("fetchStatisticsOverviewApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("returns every period-scoped figure and passes through a custom range", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        granularity: "custom",
        revenue: 420_000,
        orderCounts: { pending: 1, confirmed: 2, shipped: 0, delivered: 3, cancelled: 1 },
        topProducts: [{ productId: "p1", name: "Set Concept Argentina", quantitySold: 12 }],
        lowStock: [{ productId: "p2", name: "Set Di San", stock: 0 }],
        newCustomers: 5,
        contactInquiries: 8,
      }),
    });

    const result = await fetchStatisticsOverviewApi("token-123", {
      granularity: "custom",
      startDate: "2026-06-25",
      endDate: "2026-07-24",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.overview.revenue).toBe(420_000);
      expect(result.overview.orderCounts.confirmed).toBe(2);
      expect(result.overview.topProducts[0]?.quantitySold).toBe(12);
      expect(result.overview.lowStock[0]?.stock).toBe(0);
      expect(result.overview.newCustomers).toBe(5);
      expect(result.overview.contactInquiries).toBe(8);
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statistics/overview?startDate=2026-06-25&endDate=2026-07-24&granularity=custom",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("sends a preset period without any dates", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-08-01", end: "2026-08-14" },
        granularity: "this_month",
        revenue: 0,
        orderCounts: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
        topProducts: [],
        lowStock: [],
        newCustomers: 0,
        contactInquiries: 0,
      }),
    });

    const result = await fetchStatisticsOverviewApi("token-123", { granularity: "this_month" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      // The API resolves a preset's window itself and echoes it back.
      expect(result.overview.granularity).toBe("this_month");
      expect(result.overview.range.start).toBe("2026-08-01");
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statistics/overview?granularity=this_month",
      expect.anything(),
    );
  });

  it("omits the query string when no input is given", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        granularity: "custom",
        revenue: 0,
        orderCounts: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
        topProducts: [],
        lowStock: [],
        newCustomers: 0,
        contactInquiries: 0,
      }),
    });

    await fetchStatisticsOverviewApi("token-123");

    expect(fetchMock).toHaveBeenCalledWith("/api/statistics/overview", expect.anything());
  });

  it("surfaces the API's message when the range is too wide", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ message: "startDate and endDate must span at most 30 days" }),
    });

    const result = await fetchStatisticsOverviewApi("token-123", {
      startDate: "2026-07-01",
      endDate: "2026-07-31",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("startDate and endDate must span at most 30 days");
    }
  });

  it("surfaces a failure message when the request fails", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ message: "Admin role required" }),
    });

    const result = await fetchStatisticsOverviewApi("token-123");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Admin role required");
    }
  });
});

describe("fetchStatisticsChartApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("passes the granularity through and returns the series", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-05-01", end: "2026-07-24" },
        granularity: "monthly",
        points: [
          { period: "2026-05", revenue: 100_000, orderCount: 2 },
          { period: "2026-06", revenue: 250_000, orderCount: 5 },
        ],
      }),
    });

    const result = await fetchStatisticsChartApi("token-123", {
      startDate: "2026-05-01",
      endDate: "2026-07-24",
      granularity: "monthly",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.chart.granularity).toBe("monthly");
      expect(result.chart.points).toHaveLength(2);
      expect(result.chart.points[1]?.revenue).toBe(250_000);
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statistics/chart?startDate=2026-05-01&endDate=2026-07-24&granularity=monthly",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("omits the granularity param when none is given", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        granularity: "daily",
        points: [],
      }),
    });

    await fetchStatisticsChartApi("token-123", { startDate: "2026-06-25" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statistics/chart?startDate=2026-06-25",
      expect.anything(),
    );
  });

  it("surfaces a failure message when the request fails", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ message: "Admin role required" }),
    });

    const result = await fetchStatisticsChartApi("token-123", { granularity: "weekly" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Admin role required");
    }
  });
});
