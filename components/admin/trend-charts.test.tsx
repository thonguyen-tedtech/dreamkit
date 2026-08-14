import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ChartPoint } from "@/lib/statistics-api";
import { DailyTrendChart, MonthlyTrendChart, WeeklyTrendChart } from "./trend-charts";

function dailyPoints(count: number): ChartPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    // 2026-01-01 onwards, so index 0 is the oldest point.
    period: new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10),
    revenue: (index + 1) * 1_000,
    orderCount: index,
  }));
}

/** Points are plotted as one `<rect>` hover target each, so counting them counts the series. */
function plottedCount(container: HTMLElement): number {
  return container.querySelectorAll("rect").length;
}

describe("DailyTrendChart", () => {
  it("plots at most the newest 30 days", () => {
    const { container } = render(<DailyTrendChart points={dailyPoints(45)} />);

    expect(plottedCount(container)).toBe(30);
    expect(screen.getByText("Doanh thu 30 ngày gần nhất")).toBeDefined();
  });

  it("plots every point when fewer than 30 are returned", () => {
    const { container } = render(<DailyTrendChart points={dailyPoints(7)} />);

    expect(plottedCount(container)).toBe(7);
    expect(screen.getByText("Doanh thu 7 ngày gần nhất")).toBeDefined();
  });

  it("labels the axis as DD/MM", () => {
    render(<DailyTrendChart points={dailyPoints(3)} />);

    expect(screen.getByText("01/01")).toBeDefined();
    expect(screen.getByText("03/01")).toBeDefined();
  });

  it("falls back to a message when there is no data", () => {
    render(<DailyTrendChart points={[]} />);

    expect(screen.getByText("Không có dữ liệu trong khoảng thời gian này.")).toBeDefined();
  });
});

describe("WeeklyTrendChart", () => {
  it("plots at most the newest 12 weeks", () => {
    const points = Array.from({ length: 15 }, (_, index) => ({
      period: new Date(Date.UTC(2026, 0, 5 + index * 7)).toISOString().slice(0, 10),
      revenue: 1_000,
      orderCount: 1,
    }));

    const { container } = render(<WeeklyTrendChart points={points} />);

    expect(plottedCount(container)).toBe(12);
    expect(screen.getByText("Doanh thu 12 tuần gần nhất")).toBeDefined();
  });
});

describe("MonthlyTrendChart", () => {
  it("labels YYYY-MM periods as MM/YYYY", () => {
    const points: ChartPoint[] = [
      { period: "2026-05", revenue: 100_000, orderCount: 2 },
      { period: "2026-06", revenue: 250_000, orderCount: 5 },
    ];

    const { container } = render(<MonthlyTrendChart points={points} />);

    expect(plottedCount(container)).toBe(2);
    expect(screen.getByText("05/2026")).toBeDefined();
    expect(screen.getByText("06/2026")).toBeDefined();
    expect(screen.getByText("Doanh thu 2 tháng gần nhất")).toBeDefined();
  });
});
