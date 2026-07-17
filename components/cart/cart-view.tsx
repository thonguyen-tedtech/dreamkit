"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { applyDiscountCode, type DiscountApplyFailureReason } from "@/lib/discount-codes";
import { validateDiscountCodeApi } from "@/lib/discount-codes-api";
import { COLOR_META, formatPrice } from "@/lib/products";
import { cn } from "@/lib/cn";
import type { CartDetailLine } from "@/lib/cart";
import { CheckoutPanel } from "./checkout-panel";
import { useCart } from "./cart-context";

const LINK_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center rounded-card bg-accent px-6 text-xs font-medium uppercase tracking-label text-accent-foreground transition-colors hover:bg-foreground/85";

const DISCOUNT_REASON_MESSAGES: Record<DiscountApplyFailureReason, string> = {
  scheduled: "Mã giảm giá chưa đến thời gian áp dụng.",
  expired: "Mã giảm giá đã hết hạn.",
  exhausted: "Mã giảm giá đã hết lượt sử dụng.",
  disabled: "Mã giảm giá hiện không hoạt động.",
  below_minimum: "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này.",
};

interface AppliedDiscount {
  readonly code: string;
  readonly amount: number;
}

export function CartView() {
  const { items, subtotal, count, removeItem, setQuantity, clear } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuthModal();
  const [orderHash, setOrderHash] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const total = subtotal - (appliedDiscount?.amount ?? 0);

  async function handleApplyDiscount() {
    const code = discountInput.trim();
    if (!code) {
      return;
    }

    setIsApplyingDiscount(true);

    const result = await validateDiscountCodeApi(code);
    if (!result.ok) {
      showToast("Mã giảm giá không tồn tại.", "error");
      setIsApplyingDiscount(false);
      return;
    }

    const applied = applyDiscountCode(result.discountCode, subtotal);
    if (!applied.ok) {
      showToast(DISCOUNT_REASON_MESSAGES[applied.reason], "error");
      setIsApplyingDiscount(false);
      return;
    }

    setAppliedDiscount({ code: result.discountCode.code, amount: applied.discountAmount });
    showToast(`Đã áp dụng mã ${result.discountCode.code}.`, "success");
    setIsApplyingDiscount(false);
  }

  function handleRemoveDiscount() {
    setAppliedDiscount(null);
    setDiscountInput("");
  }

  if (orderHash) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border bg-surface py-24 text-center">
        <p className="font-display text-3xl text-foreground">Đặt hàng thành công</p>
        <p className="max-w-md text-sm text-muted">
          Cảm ơn bạn! Mã đơn hàng của bạn là{" "}
          <span className="font-semibold text-foreground">{orderHash}</span>.
          Dreamkit sẽ liên hệ xác nhận trong thời gian sớm nhất. Bạn có thể tra
          cứu trạng thái đơn hàng bất cứ lúc nào tại liên kết bên dưới.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link
            href={`/track-order?hash=${encodeURIComponent(orderHash)}`}
            className={cn(LINK_BUTTON_CLASS)}
          >
            Tra cứu đơn hàng
          </Link>
          <Link href="/shop" className={cn(LINK_BUTTON_CLASS)}>
            Tiếp tục mua sắm
          </Link>
          {isAuthenticated ? (
            <Link href="/account" className={cn(LINK_BUTTON_CLASS)}>
              Xem đơn hàng
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border py-24 text-center">
        <p className="font-display text-2xl text-foreground">
          Giỏ hàng của bạn đang trống
        </p>
        <p className="max-w-sm text-sm text-muted">
          Chưa có sản phẩm nào trong giỏ hàng. Khám phá các mẫu áo đấu của
          Dreamkit và thêm vào giỏ.
        </p>
        <Link href="/shop" className={cn("mt-2", LINK_BUTTON_CLASS)}>
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <section aria-label="Sản phẩm trong giỏ" className="flex flex-col">
        <ul className="border-t border-border">
          {items.map((line) => (
            <CartRow
              key={`${line.product.id}-${line.color}-${line.size}`}
              line={line}
              onRemove={() => removeItem(line.product.id, line.color, line.size)}
              onQuantityChange={(quantity) =>
                setQuantity(line.product.id, line.color, line.size, quantity)
              }
            />
          ))}
        </ul>

        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:underline"
          >
            ← Tiếp tục mua sắm
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
          >
            Xoá giỏ hàng
          </button>
        </div>
      </section>

      <aside aria-label="Tổng đơn hàng" className="h-fit rounded-card border border-border bg-surface p-8">
        <h2 className="font-display text-xl text-foreground">Tổng đơn hàng</h2>
        <dl className="mt-6 flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted">Tạm tính ({count} sản phẩm)</dt>
            <dd className="font-medium text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">Phí vận chuyển</dt>
            <dd className="text-muted">Tính khi thanh toán</dd>
          </div>
          {appliedDiscount ? (
            <div className="flex items-center justify-between">
              <dt className="text-muted">Giảm giá ({appliedDiscount.code})</dt>
              <dd className="font-medium text-foreground">
                −{formatPrice(appliedDiscount.amount)}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          {appliedDiscount ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                Đã áp dụng mã <span className="font-semibold">{appliedDiscount.code}</span>
              </span>
              <button
                type="button"
                onClick={handleRemoveDiscount}
                className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
              >
                Xoá mã
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={discountInput}
                onChange={(event) => setDiscountInput(event.target.value)}
                placeholder="Mã giảm giá"
                className="h-11 flex-1 rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
              />
              <Button
                type="button"
                variant="outline"
                disabled={isApplyingDiscount || !discountInput.trim()}
                onClick={() => void handleApplyDiscount()}
              >
                {isApplyingDiscount ? <Spinner /> : null}
                Áp dụng
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-6">
          <span className="text-sm font-semibold uppercase tracking-label text-foreground">
            Tổng cộng
          </span>
          <span className="font-display text-2xl text-foreground">
            {formatPrice(total)}
          </span>
        </div>
        <Button
          size="lg"
          className="mt-6 w-full"
          onClick={() => setShowCheckout((open) => !open)}
        >
          {showCheckout ? "Ẩn form đặt hàng" : "Tiến hành thanh toán"}
        </Button>
        {showCheckout ? (
          <CheckoutPanel
            discountCode={appliedDiscount?.code}
            onSuccess={(hash) => setOrderHash(hash)}
          />
        ) : null}
      </aside>
    </div>
  );
}

interface CartRowProps {
  line: CartDetailLine;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
}

function CartRow({ line, onRemove, onQuantityChange }: CartRowProps) {
  const { product, color, size, quantity, lineTotal } = line;

  return (
    <li className="flex gap-4 border-b border-border py-6">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-card border border-border bg-surface">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="96px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-sm font-medium leading-snug text-foreground">
            {product.name}
          </h3>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Xoá ${product.name}`}
            className="shrink-0 text-muted transition-colors hover:cursor-pointer hover:text-foreground"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-muted">{formatPrice(product.price)}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <span
            className="size-3 rounded-full border border-border"
            style={{ backgroundColor: COLOR_META[color]?.hex }}
          />
          {COLOR_META[color]?.label ?? color} · Cỡ {size}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <QuantityStepper quantity={quantity} onChange={onQuantityChange} />
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
}

interface QuantityStepperProps {
  quantity: number;
  onChange: (quantity: number) => void;
}

export function QuantityStepper({ quantity, onChange }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center rounded-card border border-border">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label="Giảm số lượng"
        className="flex size-9 items-center justify-center text-foreground hover:cursor-pointer hover:bg-surface-strong"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-foreground" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Tăng số lượng"
        className="flex size-9 items-center justify-center text-foreground hover:cursor-pointer hover:bg-surface-strong"
      >
        +
      </button>
    </div>
  );
}
