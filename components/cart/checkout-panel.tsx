"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useStore } from "@/components/store/store-context";
import {
  checkoutFormSchema,
  type CheckoutFormType,
} from "@/components/schemas/checkout.schema";
import type { PaymentMethod } from "@/lib/types";
import { useCart } from "./cart-context";

interface CheckoutPanelProps {
  readonly discountCode?: string;
  readonly onSuccess: (orderHash: string) => void;
}

const PAYMENT_OPTIONS: readonly { readonly value: PaymentMethod; readonly label: string }[] = [
  { value: "cash", label: "Tiền mặt khi nhận hàng" },
  { value: "bank", label: "Chuyển khoản ngân hàng" },
];

export function CheckoutPanel({ discountCode, onSuccess }: CheckoutPanelProps) {
  const { items, clear } = useCart();
  const { createOrder } = useStore();
  const { user, isAuthenticated } = useAuthModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormType>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      address: user?.address ?? "",
      note: "",
      paymentMethod: "cash",
    },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("email", user.email);
      if (user.phone) {
        setValue("phone", user.phone);
      }
      if (user.address) {
        setValue("address", user.address);
      }
    }
  }, [user, setValue]);

  async function onSubmit(data: CheckoutFormType) {
    setError(null);

    if (!isAuthenticated && (!data.name.trim() || !data.phone.trim())) {
      setError("Vui lòng điền đầy đủ thông tin liên hệ.");
      return;
    }

    setIsSubmitting(true);

    const order = await createOrder({
      items: items.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        color: line.color,
        size: line.size,
      })),
      paymentMethod: data.paymentMethod,
      address: data.address.trim(),
      discountCode,
      name: data.name.trim() || undefined,
      phone: data.phone.trim() || undefined,
      email: data.email.trim() || undefined,
      note: data.note.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!order) {
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      return;
    }

    clear();
    onSuccess(order.hash);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 flex flex-col gap-4 border-t border-border pt-6"
      noValidate
    >
      <h3 className="text-sm font-semibold uppercase tracking-label text-foreground">
        Thông tin đặt hàng
      </h3>
      <div>
        <input {...register("name")} placeholder="Họ và tên" className={INPUT_CLASS} />
        {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
      </div>
      <div>
        <input {...register("phone")} placeholder="Số điện thoại" className={INPUT_CLASS} />
        {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
      </div>
      <div>
        <input
          type="email"
          {...register("email")}
          placeholder="Email (tuỳ chọn)"
          className={INPUT_CLASS}
        />
        {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
      </div>
      <div>
        <textarea
          {...register("address")}
          placeholder="Địa chỉ giao hàng"
          rows={2}
          className={`${INPUT_CLASS} min-h-16 py-3`}
        />
        {errors.address ? (
          <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
        ) : null}
      </div>
      <div>
        <textarea
          {...register("note")}
          placeholder="Ghi chú (tuỳ chọn)"
          rows={3}
          className={`${INPUT_CLASS} min-h-24 py-3`}
        />
        {errors.note ? <p className="mt-1 text-xs text-red-600">{errors.note.message}</p> : null}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-medium uppercase tracking-label text-muted">
          Phương thức thanh toán
        </legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex flex-1 cursor-pointer items-center gap-2 rounded-card border border-border px-3 py-2.5 text-sm text-foreground has-[:checked]:border-foreground has-[:checked]:bg-surface-strong"
            >
              <input
                type="radio"
                value={option.value}
                {...register("paymentMethod")}
                className="size-3.5"
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.paymentMethod ? (
          <p className="text-xs text-red-600">{errors.paymentMethod.message}</p>
        ) : null}
      </fieldset>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : null}
        Xác nhận đặt hàng
      </Button>
    </form>
  );
}

const INPUT_CLASS =
  "w-full rounded-card border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground";
