"use client";

import { useMemo } from "react";
import { useStore } from "@/components/store/store-context";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUS_LABELS, ORDER_STATUSES, PAYMENT_METHOD_LABELS } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export function OrderManager() {
  const { orders, updateOrderStatus, deleteOrder } = useStore();

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  function handleDelete(id: string) {
    if (window.confirm("Xoá đơn hàng này?")) {
      void deleteOrder(id);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-foreground">Đơn hàng</h1>
        <p className="mt-2 text-sm text-muted">
          Theo dõi và cập nhật trạng thái các đơn đặt hàng từ cửa hàng.
        </p>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="rounded-card border border-dashed border-border py-20 text-center">
          <p className="font-display text-2xl text-foreground">Chưa có đơn hàng</p>
          <p className="mt-2 text-sm text-muted">
            Đơn hàng sẽ xuất hiện khi khách thanh toán từ giỏ hàng.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-card border border-border bg-surface p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-label text-muted">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-foreground">
                    {order.hash}
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    {order.name ?? "Khách"} · {order.phone ?? "—"}
                    {order.email ? ` · ${order.email}` : ""}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full border border-border px-2 py-0.5 text-muted">
                      {PAYMENT_METHOD_LABELS[order.paymentMethod]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        order.isPaid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="font-display text-2xl text-foreground">
                    {formatPrice(order.total)}
                  </span>
                  {order.discount > 0 || order.discountCode ? (
                    <span className="text-xs text-muted">
                      Tạm tính {formatPrice(order.subtotal)} · Giảm{" "}
                      {formatPrice(order.discount)}
                      {order.discountCode ? ` (${order.discountCode})` : ""}
                    </span>
                  ) : null}
                  <select
                    value={order.status}
                    onChange={(event) =>
                      void updateOrderStatus(order.id, event.target.value as OrderStatus)
                    }
                    className="h-10 rounded-card border border-border bg-background px-3 text-sm text-foreground"
                    aria-label={`Trạng thái đơn ${order.hash}`}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="mt-6 border-t border-border pt-4 text-sm">
                {order.lines.map((line, index) => (
                  <li
                    key={`${order.id}-${line.productId}-${index}`}
                    className="flex items-center justify-between gap-4 py-2"
                  >
                    <span className="text-foreground">
                      {line.productName} ({line.color} · {line.size}) × {line.quantity}
                    </span>
                    <span className="text-muted">{formatPrice(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              {order.note ? (
                <p className="mt-4 text-sm text-muted">Ghi chú: {order.note}</p>
              ) : null}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDelete(order.id)}
                  className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
                >
                  Xoá đơn
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
