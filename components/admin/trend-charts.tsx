"use client";

import { useCallback, useMemo, useState } from "react";
import { formatPrice } from "@/lib/products";
import type { ChartPoint, StatisticsGranularity } from "@/lib/statistics-api";

/**
 * Revenue trend charts for the admin dashboard, one thin wrapper per granularity
 * over a shared SVG line chart. Each wrapper owns only what differs between
 * bucket sizes: how many of the newest points to plot and how a `period` key
 * reads on the axis and in the tooltip.
 */

/** Newest N buckets each chart plots, regardless of how many points the API returns. */
export const TREND_CHART_MAX_POINTS: Record<StatisticsGranularity, number> = {
  daily: 30,
  weekly: 12,
  monthly: 12,
};

export const GRANULARITY_LABELS: Record<StatisticsGranularity, string> = {
  daily: "Theo ngày",
  weekly: "Theo tuần",
  monthly: "Theo tháng",
};

export const GRANULARITIES: readonly StatisticsGranularity[] = ["daily", "weekly", "monthly"];

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const CHART_PADDING = { top: 12, right: 12, bottom: 28, left: 56 } as const;
const PLOT_WIDTH = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

const COMPACT_PRICE_FORMATTER = new Intl.NumberFormat("vi-VN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** `YYYY-MM-DD` → `DD/MM`. */
function dayMonth(period: string): string {
  const [, month, day] = period.split("-");
  return `${day}/${month}`;
}

/** `YYYY-MM-DD` → `DD/MM/YYYY`. */
function fullDate(period: string): string {
  const [year, month, day] = period.split("-");
  return `${day}/${month}/${year}`;
}

/** `YYYY-MM` → `MM/YYYY`. */
function monthYear(period: string): string {
  const [year, month] = period.split("-");
  return `${month}/${year}`;
}

interface TrendChartProps {
  readonly points: readonly ChartPoint[];
  readonly maxPoints: number;
  /** Short form of a `period` key for the x-axis. */
  readonly formatAxisLabel: (period: string) => string;
  /** Long form of a `period` key for the hover tooltip. */
  readonly formatTooltipLabel: (period: string) => string;
  readonly caption: (visibleCount: number) => string;
  readonly emptyMessage?: string;
}

/** Shared single-series revenue line chart. Not exported — use a granularity wrapper. */
function TrendChart({
  points,
  maxPoints,
  formatAxisLabel,
  formatTooltipLabel,
  caption,
  emptyMessage = "Không có dữ liệu trong khoảng thời gian này.",
}: TrendChartProps) {
  const visiblePoints = useMemo(() => points.slice(-maxPoints), [points, maxPoints]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxRevenue = useMemo(
    () => Math.max(...visiblePoints.map((point) => point.revenue), 1),
    [visiblePoints],
  );

  const xAt = useCallback(
    (index: number) =>
      visiblePoints.length === 1
        ? CHART_PADDING.left + PLOT_WIDTH / 2
        : CHART_PADDING.left + (index / (visiblePoints.length - 1)) * PLOT_WIDTH,
    [visiblePoints.length],
  );
  const yAt = useCallback(
    (revenue: number) => CHART_PADDING.top + PLOT_HEIGHT - (revenue / maxRevenue) * PLOT_HEIGHT,
    [maxRevenue],
  );

  if (visiblePoints.length === 0) {
    return <p className="mt-4 text-sm text-muted">{emptyMessage}</p>;
  }

  const linePath = visiblePoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${xAt(index)} ${yAt(point.revenue)}`)
    .join(" ");
  const baseline = CHART_PADDING.top + PLOT_HEIGHT;
  const areaPath = `${linePath} L${xAt(visiblePoints.length - 1)} ${baseline} L${xAt(0)} ${baseline} Z`;

  // Label roughly six evenly spaced buckets so the axis never collides at 30 points.
  const labelStep = Math.max(1, Math.ceil(visiblePoints.length / 6));
  const activePoint = activeIndex === null ? null : (visiblePoints[activeIndex] ?? null);
  const activeX = activePoint && activeIndex !== null ? xAt(activeIndex) : 0;

  return (
    <figure className="mt-6">
      <div className="relative">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full text-highlight"
          role="img"
          aria-label={caption(visiblePoints.length)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {[0, 0.5, 1].map((ratio) => {
            const y = CHART_PADDING.top + PLOT_HEIGHT * (1 - ratio);
            return (
              <g key={ratio}>
                <line
                  x1={CHART_PADDING.left}
                  x2={CHART_WIDTH - CHART_PADDING.right}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={CHART_PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted text-[11px]"
                >
                  {COMPACT_PRICE_FORMATTER.format(maxRevenue * ratio)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="currentColor" opacity={0.12} />
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {visiblePoints.map((point, index) =>
            index % labelStep === 0 || index === visiblePoints.length - 1 ? (
              <text
                key={point.period}
                x={xAt(index)}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
                className="fill-muted text-[11px]"
              >
                {formatAxisLabel(point.period)}
              </text>
            ) : null,
          )}

          {activePoint ? (
            <g>
              <line
                x1={activeX}
                x2={activeX}
                y1={CHART_PADDING.top}
                y2={baseline}
                className="stroke-muted"
                strokeWidth={1}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={activeX}
                cy={yAt(activePoint.revenue)}
                r={4}
                fill="currentColor"
                className="stroke-surface"
                strokeWidth={2}
              />
            </g>
          ) : null}

          {visiblePoints.map((point, index) => (
            <rect
              key={`hit-${point.period}`}
              x={xAt(index) - PLOT_WIDTH / visiblePoints.length / 2}
              y={CHART_PADDING.top}
              width={PLOT_WIDTH / visiblePoints.length}
              height={PLOT_HEIGHT}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
        </svg>

        {activePoint ? (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-card border border-border bg-background px-3 py-2 text-xs shadow-sm"
            style={{ left: `${(activeX / CHART_WIDTH) * 100}%` }}
          >
            <p className="font-medium text-foreground">{formatTooltipLabel(activePoint.period)}</p>
            <p className="text-muted">
              {formatPrice(activePoint.revenue)} · {activePoint.orderCount} đơn
            </p>
          </div>
        ) : null}
      </div>
      <figcaption className="mt-2 text-xs text-muted">{caption(visiblePoints.length)}</figcaption>
    </figure>
  );
}

export function DailyTrendChart({ points }: { points: readonly ChartPoint[] }) {
  return (
    <TrendChart
      points={points}
      maxPoints={TREND_CHART_MAX_POINTS.daily}
      formatAxisLabel={dayMonth}
      formatTooltipLabel={fullDate}
      caption={(count) => `Doanh thu ${count} ngày gần nhất`}
    />
  );
}

export function WeeklyTrendChart({ points }: { points: readonly ChartPoint[] }) {
  return (
    <TrendChart
      points={points}
      maxPoints={TREND_CHART_MAX_POINTS.weekly}
      formatAxisLabel={dayMonth}
      // The API keys a weekly bucket by its Monday, so the tooltip says so explicitly.
      formatTooltipLabel={(period) => `Tuần bắt đầu ${fullDate(period)}`}
      caption={(count) => `Doanh thu ${count} tuần gần nhất`}
    />
  );
}

export function MonthlyTrendChart({ points }: { points: readonly ChartPoint[] }) {
  return (
    <TrendChart
      points={points}
      maxPoints={TREND_CHART_MAX_POINTS.monthly}
      formatAxisLabel={monthYear}
      formatTooltipLabel={(period) => `Tháng ${monthYear(period)}`}
      caption={(count) => `Doanh thu ${count} tháng gần nhất`}
    />
  );
}
