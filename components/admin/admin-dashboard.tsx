"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/orders";
import {
  fetchGrowthStatisticsApi,
  fetchProductPerformanceApi,
  fetchStatisticsOverviewApi,
  type DailyTrendPoint,
  type GrowthStatistics,
  type ProductPerformance,
  type StatisticsOverview,
} from "@/lib/statistics-api";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Mirrors the backend's default range for the statistics endpoints (30 days before today, through today). */
function defaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

export function AdminDashboard() {
  const { orders } = useStore();
  const { accessToken } = useAuthModal();
  const { showToast } = useToast();

  const [{ startDate, endDate }, setAppliedRange] = useState(defaultDateRange);
  const [startDateInput, setStartDateInput] = useState(startDate);
  const [endDateInput, setEndDateInput] = useState(endDate);
  const [overview, setOverview] = useState<StatisticsOverview | null>(null);
  const [performance, setPerformance] = useState<ProductPerformance | null>(null);
  const [growth, setGrowth] = useState<GrowthStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStatistics = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setIsLoading(true);

    const [overviewResult, performanceResult, growthResult] = await Promise.all([
      fetchStatisticsOverviewApi(accessToken, { startDate, endDate }),
      fetchProductPerformanceApi(accessToken, { startDate, endDate }),
      fetchGrowthStatisticsApi(accessToken, { startDate, endDate }),
    ]);

    if (overviewResult.ok) {
      setOverview(overviewResult.overview);
    } else {
      showToast(overviewResult.message, "error");
    }

    if (performanceResult.ok) {
      setPerformance(performanceResult.performance);
    } else {
      showToast(performanceResult.message, "error");
    }

    if (growthResult.ok) {
      setGrowth(growthResult.growth);
    } else {
      showToast(growthResult.message, "error");
    }

    setIsLoading(false);
  }, [accessToken, startDate, endDate, showToast]);

  useEffect(() => {
    void loadStatistics();
  }, [loadStatistics]);

  function handleApplyRange(event: FormEvent) {
    event.preventDefault();
    setAppliedRange({ startDate: startDateInput, endDate: endDateInput });
  }

  const totalOrders = useMemo(
    () => (overview ? Object.values(overview.orderCounts).reduce((sum, n) => sum + n, 0) : 0),
    [overview],
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Tổng quan</h1>
          <p className="mt-2 text-sm text-muted">
            Thống kê doanh thu, đơn hàng và tăng trưởng theo khoảng thời gian.
          </p>
        </div>
        <form onSubmit={handleApplyRange} className="flex flex-wrap items-end gap-2">
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
              max={isoDate(new Date())}
              onChange={(event) => setEndDateInput(event.target.value)}
              className="rounded-card border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-foreground"
            />
          </label>
          <Button type="submit" disabled={isLoading}>
            Áp dụng
          </Button>
        </form>
      </div>

      {isLoading && !overview ? (
        <LoadingOverlay label="Đang tải thống kê…" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Doanh thu" value={formatPrice(overview?.revenue ?? 0)} />
            <StatCard label="Tổng đơn hàng" value={String(totalOrders)} href="/admin/orders" />
            <StatCard label="Khách hàng mới" value={String(growth?.newCustomers ?? 0)} href="/admin/users" />
            <StatCard
              label="Lượt liên hệ"
              value={String(growth?.contactInquiries ?? 0)}
              href="/admin/contacts"
            />
          </div>

          <section className="rounded-card border border-border bg-surface p-6">
            <h2 className="font-display text-xl text-foreground">Đơn hàng theo trạng thái</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {ORDER_STATUSES.map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs"
                >
                  <span className="font-medium text-foreground">{ORDER_STATUS_LABELS[status]}</span>
                  <span className="text-muted">{overview?.orderCounts[status] ?? 0}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-card border border-border bg-surface p-6">
            <h2 className="font-display text-xl text-foreground">Doanh thu theo ngày</h2>
            <DailyTrendChart points={overview?.dailyTrend ?? []} />
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-card border border-border bg-surface p-6">
              <h2 className="font-display text-xl text-foreground">Sản phẩm bán chạy</h2>
              <TopProductsList products={performance?.topProducts ?? []} />
            </section>

            <section className="rounded-card border border-border bg-surface p-6">
              <h2 className="font-display text-xl text-foreground">Sắp hết hàng</h2>
              <LowStockList products={performance?.lowStock ?? []} />
            </section>
          </div>
        </>
      )}

      <section className="rounded-card border border-border bg-surface p-6">
        <h2 className="font-display text-xl text-foreground">Đơn hàng gần đây</h2>
        {orders.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Chưa có đơn hàng nào.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {orders.slice(0, 5).map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-foreground">{order.hash}</p>
                  <p className="text-sm text-muted">{order.name ?? "Khách"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                  <p className="text-xs text-muted">{ORDER_STATUS_LABELS[order.status]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/orders"
          className="mt-4 inline-flex text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:underline"
        >
          Xem tất cả đơn hàng
        </Link>
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

function DailyTrendChart({ points }: { points: readonly DailyTrendPoint[] }) {
  if (points.length === 0) {
    return <p className="mt-4 text-sm text-muted">Không có dữ liệu trong khoảng thời gian này.</p>;
  }

  const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);

  return (
    <div className="mt-6 flex items-end gap-1.5 overflow-x-auto pb-2">
      {points.map((point) => {
        const heightPercent = Math.max(
          Math.round((point.revenue / maxRevenue) * 100),
          point.revenue > 0 ? 4 : 0,
        );
        return (
          <div
            key={point.date}
            title={`${point.date}: ${formatPrice(point.revenue)} · ${point.orderCount} đơn`}
            className="flex w-7 shrink-0 flex-col items-center gap-1"
          >
            <div className="flex h-32 w-full items-end rounded bg-surface-strong">
              <div
                className="w-full rounded-t bg-accent transition-[height]"
                style={{ height: `${heightPercent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted">{point.date.slice(5)}</span>
          </div>
        );
      })}
    </div>
  );
}

function TopProductsList({
  products,
}: {
  products: ProductPerformance["topProducts"];
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

function LowStockList({ products }: { products: ProductPerformance["lowStock"] }) {
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
