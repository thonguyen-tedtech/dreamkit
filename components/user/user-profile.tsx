"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUS_LABELS } from "@/lib/orders";

export function UserProfile() {
  const { user, isAdmin, logout } = useAuthModal();
  const { orders } = useStore();

  const userOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-card border border-border bg-surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-label text-muted">Tài khoản</p>
            <h1 className="mt-2 font-display text-3xl text-foreground">{user.name}</h1>
            <p className="mt-2 text-sm text-muted">{user.email}</p>
            <p className="mt-1 text-xs uppercase tracking-label text-highlight">
              {isAdmin ? "Quản trị viên" : "Khách hàng"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isAdmin ? (
              <Link
                href="/admin"
                className="inline-flex h-11 items-center justify-center rounded-card bg-accent px-6 text-xs font-medium uppercase tracking-label text-accent-foreground transition-colors hover:bg-foreground/85"
              >
                Quản trị
              </Link>
            ) : null}
            <Button type="button" variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div>
          <h2 className="font-display text-2xl text-foreground">Đơn hàng của bạn</h2>
          <p className="mt-2 text-sm text-muted">
            Theo dõi trạng thái các đơn hàng bạn đã đặt tại Dreamkit.
          </p>
        </div>

        {userOrders.length === 0 ? (
          <div className="rounded-card border border-dashed border-border py-20 text-center">
            <p className="font-display text-2xl text-foreground">Chưa có đơn hàng</p>
            <p className="mt-2 text-sm text-muted">
              Khám phá bộ sưu tập áo đấu và đặt hàng ngay hôm nay.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-flex text-xs font-medium uppercase tracking-label text-foreground underline underline-offset-4"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {userOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-card border border-border bg-background p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-label text-muted">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-foreground">
                      {order.hash}
                    </h3>
                    <p className="mt-2 text-sm text-muted">
                      {ORDER_STATUS_LABELS[order.status]}
                    </p>
                  </div>
                  <p className="font-display text-2xl text-foreground">
                    {formatPrice(order.total)}
                  </p>
                </div>

                <ul className="mt-4 border-t border-border pt-4 text-sm">
                  {order.lines.map((line, index) => (
                    <li key={`${order.id}-${line.productId}-${index}`} className="py-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-foreground">{line.productName}</span>
                        <span className="text-muted">{formatPrice(line.lineTotal)}</span>
                      </div>
                      <ul className="mt-1 flex flex-col gap-0.5 pl-3 text-xs text-muted">
                        {line.customizationDetails.map((detail, detailIndex) => (
                          <li key={detailIndex}>
                            Size {detail.size}
                            {detail.name ? ` · ${detail.name}` : ""}
                            {detail.jerseyNumber ? ` · Số ${detail.jerseyNumber}` : ""} ×{" "}
                            {detail.quantity}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
