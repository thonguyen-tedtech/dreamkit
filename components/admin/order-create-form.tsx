"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/components/store/store-context";
import { useToast } from "@/components/ui/toast-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PRODUCT_SIZES } from "@/lib/product-sizes";
import { ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS, PRODUCT_DESIGN_MODE_LABELS } from "@/lib/orders";
import type { CreateOrderItemInput } from "@/lib/orders-api";
import type { OrderType, PaymentMethod, ProductDesignMode } from "@/lib/types";

interface DraftCustomization {
  readonly key: string;
  readonly name: string;
  readonly jerseyNumber: string;
  readonly size: string;
  readonly quantity: number;
}

function emptyCustomization(key: string): DraftCustomization {
  return { key, name: "", jerseyNumber: "", size: "", quantity: 1 };
}

interface DraftImage {
  readonly key: string;
  readonly url: string;
}

function emptyImage(key: string): DraftImage {
  return { key, url: "" };
}

interface OrderCreateFormProps {
  readonly onCreated: () => void;
}

export function OrderCreateForm({ onCreated }: OrderCreateFormProps) {
  const { products, createOrder } = useStore();
  const { showToast } = useToast();

  const [orderType, setOrderType] = useState<OrderType>("single");
  const [productDesignMode, setProductDesignMode] = useState<ProductDesignMode>("standard");
  const [productId, setProductId] = useState("");
  const [customImages, setCustomImages] = useState<readonly DraftImage[]>([emptyImage("0")]);
  const [rows, setRows] = useState<readonly DraftCustomization[]>([emptyCustomization("0")]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const product = products.find((candidate) => candidate.id === productId);

  useEffect(() => {
    if (productDesignMode === "custom" && !productId && products.length > 0) {
      setProductId(products[0].id);
    }
  }, [productDesignMode, productId, products]);

  useEffect(() => {
    if (orderType === "single") {
      setRows((current) => (current.length > 1 ? [current[0]] : current));
    }
  }, [orderType]);

  function updateRow(key: string, patch: Partial<DraftCustomization>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => [...current, emptyCustomization(`${Date.now()}`)]);
  }

  function removeRow(key: string) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  function updateImage(key: string, url: string) {
    setCustomImages((current) => current.map((image) => (image.key === key ? { ...image, url } : image)));
  }

  function addImage() {
    setCustomImages((current) => [...current, emptyImage(`${Date.now()}`)]);
  }

  function removeImage(key: string) {
    setCustomImages((current) => (current.length > 1 ? current.filter((image) => image.key !== key) : current));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setError("Vui lòng nhập tên và số điện thoại khách hàng.");
      return;
    }

    if (!productId) {
      setError("Vui lòng chọn sản phẩm.");
      return;
    }

    const validImages = customImages.map((image) => image.url.trim()).filter((url) => url.length > 0);
    if (productDesignMode === "custom" && validImages.length === 0) {
      setError("Vui lòng nhập ít nhất một link ảnh thiết kế cho đơn thiết kế riêng.");
      return;
    }

    const validRows = rows.filter((row) => row.size && row.quantity >= 1);
    if (validRows.length === 0) {
      setError("Vui lòng thêm ít nhất một dòng với size và số lượng hợp lệ.");
      return;
    }

    const orderItems: CreateOrderItemInput[] = [
      {
        productId,
        customizationDetails: validRows.map((row) => ({
          size: row.size,
          name: row.name.trim() || undefined,
          jerseyNumber: row.jerseyNumber.trim() || undefined,
          quantity: row.quantity,
        })),
      },
    ];

    setIsSubmitting(true);
    const order = await createOrder({
      items: orderItems,
      paymentMethod,
      address: address.trim(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      note: note.trim() || undefined,
      orderType,
      productDesignMode,
      customDesignImages: productDesignMode === "custom" ? validImages : undefined,
    });
    setIsSubmitting(false);

    if (!order) {
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
      return;
    }

    showToast(`Đã tạo đơn hàng ${order.hash}.`, "success");
    onCreated();
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-5 rounded-card border border-border bg-surface p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-label text-muted">
            Quy mô đơn hàng
          </legend>
          <div className="flex gap-2">
            {(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((value) => (
              <label
                key={value}
                className="flex flex-1 cursor-pointer items-center gap-2 rounded-card border border-border px-3 py-2.5 text-sm text-foreground has-[:checked]:border-foreground has-[:checked]:bg-surface-strong"
              >
                <input
                  type="radio"
                  name="orderType"
                  value={value}
                  checked={orderType === value}
                  onChange={() => setOrderType(value)}
                  className="size-3.5"
                />
                {ORDER_TYPE_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-xs font-medium uppercase tracking-label text-muted">
            Loại sản phẩm
          </legend>
          <div className="flex gap-2">
            {(Object.keys(PRODUCT_DESIGN_MODE_LABELS) as ProductDesignMode[]).map((value) => (
              <label
                key={value}
                className="flex flex-1 cursor-pointer items-center gap-2 rounded-card border border-border px-3 py-2.5 text-sm text-foreground has-[:checked]:border-foreground has-[:checked]:bg-surface-strong"
              >
                <input
                  type="radio"
                  name="productDesignMode"
                  value={value}
                  checked={productDesignMode === value}
                  onChange={() => setProductDesignMode(value)}
                  className="size-3.5"
                />
                {PRODUCT_DESIGN_MODE_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {productDesignMode === "standard" ? (
        <div className="flex flex-wrap items-start gap-3">
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>

          {product ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-24 w-24 rounded-card border border-border object-cover"
            />
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-label text-muted">
            Ảnh thiết kế
          </p>
          {customImages.map((image) => (
            <div key={image.key} className="flex flex-wrap items-center gap-2">
              <input
                value={image.url}
                onChange={(event) => updateImage(image.key, event.target.value)}
                placeholder="Link ảnh thiết kế"
                className={`${INPUT_CLASS} flex-1`}
              />
              {image.url.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.url.trim()}
                  alt="Ảnh thiết kế"
                  className="h-16 w-16 rounded-card border border-border object-cover"
                />
              ) : null}
              <button
                type="button"
                onClick={() => removeImage(image.key)}
                className="text-xs text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
              >
                Xoá
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addImage}
            className="self-start text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            + Thêm ảnh
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-label text-muted">
          Danh sách theo tên/số
        </p>
        {rows.map((row) => (
          <div key={row.key} className="flex flex-wrap items-center gap-2">
            <input
              value={row.name}
              onChange={(event) => updateRow(row.key, { name: event.target.value })}
              placeholder="Tên in áo (tuỳ chọn)"
              className="h-10 flex-1 rounded-card border border-border bg-background px-3 text-sm text-foreground"
            />
            <input
              value={row.jerseyNumber}
              onChange={(event) => updateRow(row.key, { jerseyNumber: event.target.value })}
              placeholder="Số áo (tuỳ chọn)"
              className="h-10 w-28 rounded-card border border-border bg-background px-3 text-sm text-foreground"
            />
            <select
              value={row.size}
              onChange={(event) => updateRow(row.key, { size: event.target.value })}
              className={SELECT_CLASS}
            >
              <option value="">Size</option>
              {PRODUCT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={row.quantity}
              onChange={(event) => updateRow(row.key, { quantity: Number(event.target.value) })}
              className="h-10 w-20 rounded-card border border-border bg-background px-2 text-sm text-foreground"
              aria-label="Số lượng"
            />
            {orderType === "team" ? (
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                className="text-xs text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
              >
                Xoá
              </button>
            ) : null}
          </div>
        ))}
        {orderType === "team" ? (
          <button
            type="button"
            onClick={addRow}
            className="self-start text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
          >
            + Thêm tên, số áo, size
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Họ và tên khách hàng"
          className={INPUT_CLASS}
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Số điện thoại"
          className={INPUT_CLASS}
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email (tuỳ chọn)"
          className={INPUT_CLASS}
        />
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
          className={SELECT_CLASS}
        >
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((value) => (
            <option key={value} value={value}>
              {PAYMENT_METHOD_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={address}
        onChange={(event) => setAddress(event.target.value)}
        placeholder="Địa chỉ giao hàng"
        rows={2}
        className={`${INPUT_CLASS} min-h-16 py-3`}
      />
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ghi chú (tuỳ chọn)"
        rows={2}
        className={`${INPUT_CLASS} min-h-16 py-3`}
      />

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : null}
        Tạo đơn hàng
      </Button>
    </form>
  );
}

const INPUT_CLASS =
  "w-full rounded-card border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground";

const SELECT_CLASS =
  "h-10 rounded-card border border-border bg-background px-3 text-sm text-foreground";
