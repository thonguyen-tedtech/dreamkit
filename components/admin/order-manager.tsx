"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/components/store/store-context";
import { formatPrice } from "@/lib/products";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PRODUCT_DESIGN_MODE_LABELS,
} from "@/lib/orders";
import type { Order, OrderStatus } from "@/lib/types";
import { OrderCreateForm } from "./order-create-form";

/** Statuses where a shipping/tracking code is captured before the change is applied. */
const STATUSES_REQUIRING_TRACKING: readonly OrderStatus[] = ["shipping", "delivered"];

export function OrderManager() {
  const { orders, deleteOrder } = useStore();
  const [isCreating, setIsCreating] = useState(false);

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Đơn hàng</h1>
          <p className="mt-2 text-sm text-muted">
            Theo dõi và cập nhật trạng thái các đơn đặt hàng từ cửa hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating((current) => !current)}
          className="rounded-card border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:cursor-pointer hover:bg-surface-strong"
        >
          {isCreating ? "Đóng" : "+ Tạo đơn hàng"}
        </button>
      </div>

      {isCreating ? (
        <OrderCreateForm onCreated={() => setIsCreating(false)} />
      ) : null}

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
            <OrderRow key={order.id} order={order} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

interface OrderRowProps {
  readonly order: Order;
  readonly onDelete: (id: string) => void;
}

function OrderRow({ order, onDelete }: OrderRowProps) {
  const { updateOrderStatus } = useStore();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [trackingInput, setTrackingInput] = useState("");

  const hasPreOrderLine = order.lines.some((line) => line.isPreOrder);

  function handleStatusChange(status: OrderStatus) {
    if (STATUSES_REQUIRING_TRACKING.includes(status) && !order.trackingNumber) {
      setPendingStatus(status);
      setTrackingInput("");
      return;
    }
    void updateOrderStatus(order.id, status);
  }

  function confirmTracking() {
    if (!pendingStatus || !trackingInput.trim()) {
      return;
    }
    void updateOrderStatus(order.id, pendingStatus, trackingInput.trim());
    setPendingStatus(null);
  }

  function cancelTracking() {
    setPendingStatus(null);
    setTrackingInput("");
  }

  return (
    <article className="rounded-card border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-label text-muted">
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
          <h2 className="mt-1 font-display text-2xl text-foreground">{order.hash}</h2>
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
            {hasPreOrderLine ? (
              <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
                Có đặt trước
              </span>
            ) : null}
            <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
              {ORDER_TYPE_LABELS[order.orderType]}
            </span>
            <span className="rounded-full bg-accent px-2 py-0.5 font-medium text-accent-foreground">
              {PRODUCT_DESIGN_MODE_LABELS[order.productDesignMode]}
            </span>
            {order.trackingNumber ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-muted">
                Vận đơn: {order.trackingNumber}
              </span>
            ) : null}
          </p>
          {order.customDesignImages && order.customDesignImages.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {order.customDesignImages.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt="Ảnh thiết kế"
                  className="h-16 w-16 rounded-card border border-border object-cover"
                />
              ))}
            </div>
          ) : null}
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
            onChange={(event) => handleStatusChange(event.target.value as OrderStatus)}
            className="h-10 rounded-card border border-border bg-background px-3 text-sm text-foreground"
            aria-label={`Trạng thái đơn ${order.hash}`}
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          {pendingStatus ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={trackingInput}
                onChange={(event) => setTrackingInput(event.target.value)}
                placeholder="Nhập mã vận đơn"
                className="h-10 w-40 rounded-card border border-border bg-background px-3 text-sm text-foreground"
              />
              <button
                type="button"
                onClick={confirmTracking}
                disabled={!trackingInput.trim()}
                className="rounded-card bg-foreground px-3 py-2 text-xs font-medium text-background hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={cancelTracking}
                className="text-xs text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
              >
                Huỷ
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ul className="mt-6 border-t border-border pt-4 text-sm">
        {order.lines.map((line, index) => (
          <li key={`${order.id}-${line.productId}-${index}`} className="py-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-foreground">
                {line.productName}
                {line.isPreOrder ? (
                  <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-label text-accent-foreground">
                    Đặt trước
                  </span>
                ) : null}
              </span>
              <span className="text-muted">{formatPrice(line.lineTotal)}</span>
            </div>
            <ul className="mt-1 flex flex-col gap-0.5 pl-3 text-xs text-muted">
              {line.customizationDetails.map((detail, detailIndex) => (
                <li key={detailIndex}>
                  Size {detail.size}
                  {detail.name ? ` · ${detail.name}` : ""}
                  {detail.jerseyNumber ? ` · Số ${detail.jerseyNumber}` : ""} × {detail.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {order.address ? (
        <p className="mt-4 text-sm text-muted">Địa chỉ giao hàng: {order.address}</p>
      ) : null}

      {order.note ? (
        <p className="mt-1 whitespace-pre-line text-sm text-muted">Ghi chú: {order.note}</p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(order.id)}
          className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
        >
          Xoá đơn
        </button>
      </div>
    </article>
  );
}
