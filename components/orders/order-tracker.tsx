"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/orders";
import { trackOrderByHashApi } from "@/lib/orders-api";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/lib/types";

/** Guest-facing order lookup: enter a tracking hash, see the order's current state. */
export function OrderTracker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialHash = searchParams.get("hash") ?? "";

  const [hashInput, setHashInput] = useState(initialHash);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialHash) {
      void lookup(initialHash);
    }
    // Only run for the hash present on first load; further lookups go through handleSubmit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(hash: string) {
    const trimmed = hash.trim();
    if (!trimmed) {
      setError("Vui lòng nhập mã đơn hàng.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await trackOrderByHashApi(trimmed);

    setIsLoading(false);

    if (!result.ok) {
      setOrder(null);
      setError(
        result.status === 404
          ? "Không tìm thấy đơn hàng với mã này. Vui lòng kiểm tra lại."
          : result.message,
      );
      return;
    }

    setOrder(result.order);
    router.replace(`/track-order?hash=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void lookup(hashInput);
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={hashInput}
          onChange={(event) => setHashInput(event.target.value)}
          placeholder="Nhập mã đơn hàng, ví dụ: ABC123"
          className="flex-1 rounded-card border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-foreground"
          aria-label="Mã đơn hàng"
        />
        <Button type="submit" size="lg" disabled={isLoading}>
          {isLoading ? <Spinner /> : null}
          Tra cứu
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {order ? <OrderResult order={order} /> : null}
    </div>
  );
}

interface OrderResultProps {
  readonly order: Order;
}

function OrderResult({ order }: OrderResultProps) {
  return (
    <article className="rounded-card border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-label text-muted">
            {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
          <h2 className="mt-1 font-display text-2xl text-foreground">{order.hash}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="font-display text-2xl text-foreground">
            {formatPrice(order.total)}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-label text-foreground">
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
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

      {order.address ? (
        <p className="mt-4 text-sm text-muted">Địa chỉ giao hàng: {order.address}</p>
      ) : null}

      {order.note ? (
        <p className="mt-1 text-sm text-muted">Ghi chú: {order.note}</p>
      ) : null}
    </article>
  );
}
