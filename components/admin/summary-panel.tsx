import Link from "next/link";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import type { OrderCountsByStatus, StatisticsSummary } from "@/lib/statistics-api";

/**
 * Store-wide running totals, always current and unaffected by the dashboard's period
 * filter. Deliberately shaped unlike the sections below it — a raised surface, an
 * accent rule, and one hero figure instead of a row of equal cards — so the always-on
 * store totals never read as just another period-scoped card.
 */

const COMPUTED_AT_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
});

/** Renders the summary's `computedAt` timestamp, tolerating a value the API didn't send. */
function formatComputedAt(computedAt: string | undefined): string {
  if (!computedAt) {
    return "—";
  }
  const parsed = new Date(computedAt);
  return Number.isNaN(parsed.getTime()) ? "—" : COMPUTED_AT_FORMATTER.format(parsed);
}

export function SummaryPanel({ summary }: { summary: StatisticsSummary | null }) {
  return (
    <section className="relative overflow-hidden rounded-card border border-highlight/40 bg-surface-strong p-6 sm:p-8">
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-highlight" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-label text-highlight">
          Toàn cửa hàng
        </h2>
        {summary ? (
          <p className="text-xs text-muted">Cập nhật {formatComputedAt(summary.computedAt)}</p>
        ) : null}
      </div>

      <p className="mt-6 font-display text-4xl text-foreground sm:text-5xl">
        {formatPrice(summary?.totalRevenue ?? 0)}
      </p>
      <p className="mt-2 text-xs uppercase tracking-label text-muted">Tổng doanh thu</p>

      <div className="mt-8 grid gap-6 border-t border-highlight/20 pt-6 sm:grid-cols-3">
        <SummaryStat
          label="Tổng đơn hàng"
          value={String(summary?.totalOrders ?? 0)}
          href="/admin/orders"
        />
        <SummaryStat
          label="Thành viên"
          value={String(summary?.totalMembers ?? 0)}
          href="/admin/users"
        />
        <SummaryStat
          label="Lượt liên hệ"
          value={String(summary?.totalContacts ?? 0)}
          href="/admin/contacts"
        />
      </div>

      <div className="mt-8 border-t border-highlight/20 pt-6">
        <p className="text-xs uppercase tracking-label text-muted">Đơn hàng theo trạng thái</p>
        <OrderStatusBreakdown counts={summary?.orderCounts} />
      </div>
    </section>
  );
}

/** A supporting figure inside the panel — no card of its own. */
function SummaryStat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs uppercase tracking-label text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-70">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
}

/** Order counts per status as pills. Used for both the store-wide and period figures. */
export function OrderStatusBreakdown({ counts }: { counts: OrderCountsByStatus | undefined }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {ORDER_STATUSES.map((status) => (
        <div
          key={status}
          className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs"
        >
          <span className="font-medium text-foreground">{ORDER_STATUS_LABELS[status]}</span>
          <span className="text-muted">{counts?.[status] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
