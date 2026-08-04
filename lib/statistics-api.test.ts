import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchGrowthStatisticsApi,
  fetchProductPerformanceApi,
  fetchStatisticsOverviewApi,
} from "./statistics-api";

describe("fetchStatisticsOverviewApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("fetches the overview and passes through the date range", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        revenue: 420_000,
        orderCounts: { pending: 1, confirmed: 2, shipped: 0, delivered: 3, cancelled: 1 },
        dailyTrend: [{ date: "2026-07-24", revenue: 420_000, orderCount: 1 }],
      }),
    });

    const result = await fetchStatisticsOverviewApi("token-123", {
      startDate: "2026-06-25",
      endDate: "2026-07-24",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.overview.revenue).toBe(420_000);
      expect(result.overview.orderCounts.confirmed).toBe(2);
      expect(result.overview.dailyTrend).toHaveLength(1);
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/statistics/overview?startDate=2026-06-25&endDate=2026-07-24",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer token-123" }),
      }),
    );
  });

  it("omits the query string when no range is given", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        revenue: 0,
        orderCounts: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 },
        dailyTrend: [],
      }),
    });

    await fetchStatisticsOverviewApi("token-123");

    expect(fetchMock).toHaveBeenCalledWith("/api/statistics/overview", expect.anything());
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

describe("fetchProductPerformanceApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("fetches top-selling and low-stock products", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        topProducts: [{ productId: "p1", name: "Set Concept Argentina", quantitySold: 12 }],
        lowStock: [{ productId: "p2", name: "Set Di San", stock: 0 }],
      }),
    });

    const result = await fetchProductPerformanceApi("token-123");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.performance.topProducts[0]?.quantitySold).toBe(12);
      expect(result.performance.lowStock[0]?.stock).toBe(0);
    }
  });
});

describe("fetchGrowthStatisticsApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("fetches new customer and contact inquiry counts", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        range: { start: "2026-06-25", end: "2026-07-24" },
        newCustomers: 5,
        contactInquiries: 8,
      }),
    });

    const result = await fetchGrowthStatisticsApi("token-123");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.growth.newCustomers).toBe(5);
      expect(result.growth.contactInquiries).toBe(8);
    }
  });
});
