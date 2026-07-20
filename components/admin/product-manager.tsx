"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast-context";
import { useStore } from "@/components/store/store-context";
import { COLOR_META } from "@/lib/products";
import { validateProduct, type ProductFieldErrors } from "@/lib/product-admin";
import {
  createProductApi,
  deleteProductApi,
  resolveProductImage,
  updateProductApi,
  type ProductInput,
} from "@/lib/products-api";
import { uploadImageApi } from "@/lib/uploads-api";
import { formatPrice } from "@/lib/products";
import type { ColorKey, Product, ProductType } from "@/lib/types";
import { cn } from "@/lib/cn";

const EMPTY_PRODUCT: Product = {
  id: "",
  name: "",
  price: 210_000,
  category: "Set quần áo bóng đá",
  colors: ["black"],
  primaryColor: "black",
  image: "",
  images: [],
  type: "set",
  isNew: false,
  stock: 0,
  collectionName: "",
  collectionImages: [],
  videoUrl: "",
};

const COLOR_OPTIONS = Object.keys(COLOR_META) as ColorKey[];
const TYPE_OPTIONS: ProductType[] = ["set", "jersey", "polo"];

function toInput(product: Product): ProductInput {
  const images = (product.images ?? []).map((entry, index) => ({
    url: entry.url,
    color: entry.color,
    position: index,
  }));
  const collectionImages = (product.collectionImages ?? []).map((entry, index) => ({
    url: entry.url,
    color: entry.color,
    position: index,
  }));

  return {
    name: product.name,
    price: product.price,
    category: product.category,
    colors: product.colors,
    primaryColor: product.primaryColor,
    image: images[0]?.url ?? product.image,
    images,
    type: product.type,
    isNew: product.isNew,
    stock: product.stock,
    collectionName: product.collectionName,
    collectionImages,
    videoUrl: product.videoUrl,
  };
}

export function ProductManager() {
  const { accessToken } = useAuthModal();
  const { showToast } = useToast();
  const { products, refreshProducts } = useStore();
  const [draft, setDraft] = useState<Product>(EMPTY_PRODUCT);
  const [originalId, setOriginalId] = useState<string | undefined>();
  const [errors, setErrors] = useState<ProductFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const isEditing = Boolean(originalId);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [products],
  );

  function startCreate() {
    setDraft(EMPTY_PRODUCT);
    setOriginalId(undefined);
    setErrors({});
  }

  function startEdit(product: Product) {
    setDraft(product);
    setOriginalId(product.id);
    setErrors({});
  }

  function updateDraft<K extends keyof Product>(field: K, value: Product[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleAddImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!accessToken) {
      showToast("Bạn cần đăng nhập với quyền quản trị để tải ảnh lên.", "error");
      return;
    }

    setIsUploadingImage(true);
    const result = await uploadImageApi(accessToken, file);
    setIsUploadingImage(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    setDraft((current) => {
      const images = [
        ...(current.images ?? []),
        { url: result.url, color: current.primaryColor },
      ];
      return { ...current, images, image: images[0].url };
    });
  }

  function updateImageColor(index: number, color: ColorKey) {
    setDraft((current) => {
      const images = (current.images ?? []).map((entry, i) =>
        i === index ? { ...entry, color } : entry,
      );
      return { ...current, images };
    });
  }

  function removeImage(index: number) {
    setDraft((current) => {
      const images = (current.images ?? []).filter((_, i) => i !== index);
      return { ...current, images, image: images[0]?.url ?? "" };
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const images = [...(current.images ?? [])];
      const target = index + direction;
      if (target < 0 || target >= images.length) {
        return current;
      }
      const temp = images[index];
      images[index] = images[target];
      images[target] = temp;
      return { ...current, images, image: images[0]?.url ?? "" };
    });
  }

  async function handleAddCollectionImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    if (!accessToken) {
      showToast("Bạn cần đăng nhập với quyền quản trị để tải ảnh lên.", "error");
      return;
    }

    setIsUploadingImage(true);
    const result = await uploadImageApi(accessToken, file);
    setIsUploadingImage(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    setDraft((current) => ({
      ...current,
      collectionImages: [
        ...(current.collectionImages ?? []),
        { url: result.url, color: current.primaryColor },
      ],
    }));
  }

  function updateCollectionImageColor(index: number, color: ColorKey) {
    setDraft((current) => {
      const collectionImages = (current.collectionImages ?? []).map((entry, i) =>
        i === index ? { ...entry, color } : entry,
      );
      return { ...current, collectionImages };
    });
  }

  function removeCollectionImage(index: number) {
    setDraft((current) => ({
      ...current,
      collectionImages: (current.collectionImages ?? []).filter((_, i) => i !== index),
    }));
  }

  function toggleColor(color: ColorKey) {
    setDraft((current) => {
      const hasColor = current.colors.includes(color);
      const colors = hasColor
        ? current.colors.filter((entry) => entry !== color)
        : [...current.colors, color];
      return { ...current, colors };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) {
      showToast("Bạn cần đăng nhập với quyền quản trị để thực hiện thao tác này.", "error");
      return;
    }

    const nextErrors = validateProduct(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const input = toInput(draft);
    const result = originalId
      ? await updateProductApi(accessToken, originalId, input)
      : await createProductApi(accessToken, input);
    setIsSubmitting(false);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    await refreshProducts();
    showToast(isEditing ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới.", "success");
    startCreate();
  }

  async function handleDelete(product: Product) {
    if (!accessToken) {
      showToast("Bạn cần đăng nhập với quyền quản trị để thực hiện thao tác này.", "error");
      return;
    }

    if (!window.confirm("Xoá sản phẩm này?")) {
      return;
    }

    setPendingId(product.id);
    const result = await deleteProductApi(accessToken, product.id);
    setPendingId(null);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    await refreshProducts();
    showToast("Đã xoá sản phẩm.", "success");
    if (originalId === product.id) {
      startCreate();
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Sản phẩm</h1>
          <p className="mt-2 text-sm text-muted">
            Quản lý danh mục sản phẩm hiển thị trên cửa hàng.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={startCreate}>
            Thêm mới
          </Button>
          <Button type="button" variant="ghost" onClick={() => void refreshProducts()}>
            Tải lại
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_0.5fr]">
        <section className="overflow-hidden rounded-card border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-label text-muted">
                <tr>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Giá</th>
                  <th className="px-4 py-3">Tồn kho</th>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Mới</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => {
                  const isPending = pendingId === product.id;
                  return (
                    <tr key={product.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 overflow-hidden rounded-card border border-border">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4">{product.stock ?? "—"}</td>
                      <td className="px-4 py-4">{product.type}</td>
                      <td className="px-4 py-4">{product.isNew ? "Có" : "Không"}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="text-xs font-medium uppercase tracking-label text-foreground underline-offset-4 hover:cursor-pointer hover:underline"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => void handleDelete(product)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline disabled:opacity-50"
                          >
                            {isPending ? <Spinner className="size-3" /> : null}
                            Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-6">
          <h2 className="font-display text-xl text-foreground">
            {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label="Tên sản phẩm" error={errors.name}>
              <input
                value={draft.name}
                onChange={(event) => updateDraft("name", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Giá (VND)" error={errors.price}>
                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(event) => updateDraft("price", Number(event.target.value))}
                  className={INPUT_CLASS}
                />
              </Field>
              <Field label="Tồn kho" error={errors.stock}>
                <input
                  type="number"
                  min={0}
                  value={draft.stock ?? 0}
                  onChange={(event) => updateDraft("stock", Number(event.target.value))}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
            <Field label="Danh mục" error={errors.category}>
              <input
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Tên bộ sưu tập" error={errors.collectionName}>
              <input
                value={draft.collectionName ?? ""}
                onChange={(event) => updateDraft("collectionName", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Link video" error={errors.videoUrl}>
              <input
                type="url"
                placeholder="https://www.tiktok.com/@dreamkit/video/..."
                value={draft.videoUrl ?? ""}
                onChange={(event) => updateDraft("videoUrl", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="Hình ảnh sản phẩm" error={errors.images}>
              <div className="flex flex-col gap-3">
                {(draft.images ?? []).map((entry, index) => (
                  <div
                    key={`${entry.url}-${index}`}
                    className="flex items-center gap-3 rounded-card border border-border p-3"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-card border border-border">
                      <Image
                        src={resolveProductImage(entry.url)}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <select
                      value={entry.color}
                      onChange={(event) =>
                        updateImageColor(index, event.target.value as ColorKey)
                      }
                      className={cn(INPUT_CLASS, "flex-1")}
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color} value={color}>
                          {COLOR_META[color].label}
                        </option>
                      ))}
                    </select>
                    {index === 0 ? (
                      <span className="shrink-0 text-xs uppercase tracking-label text-muted">
                        Ảnh bìa
                      </span>
                    ) : null}
                    <div className="flex shrink-0 flex-col">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        aria-label="Đưa lên trước"
                        className="text-muted hover:cursor-pointer hover:text-foreground disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === (draft.images?.length ?? 0) - 1}
                        aria-label="Đưa xuống sau"
                        className="text-muted hover:cursor-pointer hover:text-foreground disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="shrink-0 text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleAddImage(event)}
                    disabled={isUploadingImage}
                    className={cn(INPUT_CLASS, "cursor-pointer py-2")}
                  />
                  {isUploadingImage ? (
                    <span className="text-xs text-muted">Đang tải ảnh lên…</span>
                  ) : null}
                </div>
              </div>
            </Field>
            <Field label="Ảnh bộ sưu tập" error={errors.collectionImages}>
              <div className="flex flex-col gap-3">
                {(draft.collectionImages ?? []).map((entry, index) => (
                  <div
                    key={`${entry.url}-${index}`}
                    className="flex items-center gap-3 rounded-card border border-border p-3"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-card border border-border">
                      <Image
                        src={resolveProductImage(entry.url)}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <select
                      value={entry.color}
                      onChange={(event) =>
                        updateCollectionImageColor(index, event.target.value as ColorKey)
                      }
                      className={cn(INPUT_CLASS, "flex-1")}
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color} value={color}>
                          {COLOR_META[color].label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCollectionImage(index)}
                      className="shrink-0 text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => void handleAddCollectionImage(event)}
                    disabled={isUploadingImage}
                    className={cn(INPUT_CLASS, "cursor-pointer py-2")}
                  />
                  {isUploadingImage ? (
                    <span className="text-xs text-muted">Đang tải ảnh lên…</span>
                  ) : null}
                </div>
              </div>
            </Field>
            <Field label="Màu chính" error={errors.primaryColor}>
              <select
                value={draft.primaryColor}
                onChange={(event) =>
                  updateDraft("primaryColor", event.target.value as ColorKey)
                }
                className={INPUT_CLASS}
              >
                {COLOR_OPTIONS.map((color) => (
                  <option key={color} value={color}>
                    {COLOR_META[color].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Màu sắc" error={errors.colors}>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => {
                  const active = draft.colors.includes(color);
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "rounded-card border px-3 py-1.5 text-xs hover:cursor-pointer",
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted",
                      )}
                    >
                      {COLOR_META[color].label}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="Loại" error={errors.type}>
              <select
                value={draft.type}
                onChange={(event) =>
                  updateDraft("type", event.target.value as ProductType)
                }
                className={INPUT_CLASS}
              >
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={draft.isNew}
                onChange={(event) => updateDraft("isNew", event.target.checked)}
                className="size-4 rounded border-border"
              />
              Đánh dấu là sản phẩm mới
            </label>
            <Button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="mt-2"
            >
              {isSubmitting ? <Spinner /> : null}
              {isEditing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "h-11 w-full rounded-card border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-foreground disabled:opacity-50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
