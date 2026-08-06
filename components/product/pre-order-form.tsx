"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuantityStepper } from "@/components/cart/cart-view";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useStore } from "@/components/store/store-context";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { COLOR_META } from "@/lib/products";
import { PRODUCT_SIZES, type ProductSize } from "@/lib/product-sizes";
import type { ColorKey, Product } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ColorSwatches } from "./color-swatches";
import { preOrderFormSchema, type PreOrderFormType } from "./pre-order-form.schema";

interface PreOrderFormProps {
  readonly product: Product;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const INPUT_CLASS =
  "w-full rounded-card border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground";

/** Modal form collecting size/color/qty + contact details, submitted as a single-item order. */
export default function PreOrderForm({ product, isOpen, onClose }: PreOrderFormProps) {
  const { createOrder } = useStore();
  const { user } = useAuthModal();
  const [selectedColor, setSelectedColor] = useState<ColorKey>(product.primaryColor);
  const [selectedSize, setSelectedSize] = useState<ProductSize>("M");
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PreOrderFormType>({
    resolver: zodResolver(preOrderFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
      note: "",
    },
  });

  function handleClose() {
    onClose();
    setIsSuccess(false);
    setSubmitError(null);
    setSelectedColor(product.primaryColor);
    setSelectedSize("M");
    setQuantity(1);
    reset();
  }

  async function onSubmit(data: PreOrderFormType) {
    setSubmitError(null);
    setIsSubmitting(true);

    const order = await createOrder({
      items: [
        {
          productId: product.id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        },
      ],
      paymentMethod: "cash",
      address: data.address.trim(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      note: data.note.trim() || undefined,
    });

    setIsSubmitting(false);

    if (!order) {
      setSubmitError("Không thể tạo đơn đặt trước. Vui lòng thử lại.");
      return;
    }

    setIsSuccess(true);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Đặt trước sản phẩm" description={product.name}>
      {isSuccess ? (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-foreground">
            Đã ghi nhận đơn đặt trước của bạn. Chúng tôi sẽ liên hệ khi sản phẩm sẵn sàng.
          </p>
          <Button type="button" size="lg" className="w-full" onClick={handleClose}>
            Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {product.colors.length > 1 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-label text-foreground">
                Màu sắc — {COLOR_META[selectedColor].label}
              </span>
              <ColorSwatches
                colors={product.colors}
                selectedColor={selectedColor}
                onSelect={setSelectedColor}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-label text-foreground">
              Kích cỡ
            </span>
            <ul className="flex flex-wrap gap-2">
              {PRODUCT_SIZES.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => setSelectedSize(option)}
                    aria-pressed={selectedSize === option}
                    className={cn(
                      "flex h-10 min-w-10 items-center justify-center rounded-card border px-3 text-sm font-medium hover:cursor-pointer",
                      selectedSize === option
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-foreground hover:bg-surface",
                    )}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-label text-foreground">
              Số lượng
            </span>
            <QuantityStepper
              quantity={quantity}
              onChange={(next) => setQuantity(Math.max(1, next))}
            />
          </div>

          <div>
            <input {...register("name")} placeholder="Họ và tên" className={INPUT_CLASS} />
            {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
          </div>
          <div>
            <input {...register("phone")} placeholder="Số điện thoại" className={INPUT_CLASS} />
            {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p> : null}
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

          {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : null}
            Xác nhận đặt trước
          </Button>
        </form>
      )}
    </Modal>
  );
}
