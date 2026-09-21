"use client";

import { Button } from "@/components/ui/button";
import type { CartDetailLine } from "@/lib/cart";

export interface LineCustomization {
  readonly name: string;
  readonly jerseyNumber: string;
}

export function cartLineKey(productId: string, color: string, size: string): string {
  return `${productId}-${color}-${size}`;
}

interface CustomizationStepProps {
  readonly items: readonly CartDetailLine[];
  readonly customizations: Readonly<Record<string, LineCustomization>>;
  readonly onChange: (key: string, patch: Partial<LineCustomization>) => void;
  readonly onBack: () => void;
  readonly onContinue: () => void;
}

/** Checkout step: collect an optional print name + jersey number per cart line. */
export function CustomizationStep({
  items,
  customizations,
  onChange,
  onBack,
  onContinue,
}: CustomizationStepProps) {
  return (
    <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-label text-foreground">
          Thông tin in tên/số
        </h3>
        <p className="mt-1 text-xs text-muted">
          Nhập tên và số áo muốn in cho từng sản phẩm (tuỳ chọn).
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((line) => {
          const key = cartLineKey(line.product.id, line.color, line.size);
          const value = customizations[key] ?? { name: "", jerseyNumber: "" };
          return (
            <li key={key} className="rounded-card border border-border p-4">
              <p className="text-sm font-medium text-foreground">
                {line.product.name}{" "}
                <span className="text-xs text-muted">
                  (Cỡ {line.size} × {line.quantity})
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  value={value.name}
                  onChange={(event) => onChange(key, { name: event.target.value })}
                  placeholder="Tên in áo (tuỳ chọn)"
                  className="h-10 flex-1 rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
                />
                <input
                  value={value.jerseyNumber}
                  onChange={(event) => onChange(key, { jerseyNumber: event.target.value })}
                  placeholder="Số áo (tuỳ chọn)"
                  className="h-10 w-32 rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground"
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
        >
          ← Quay lại giỏ hàng
        </button>
        <Button type="button" onClick={onContinue}>
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
