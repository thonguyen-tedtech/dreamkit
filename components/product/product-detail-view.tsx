"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "@/components/cart/cart-view";
import { useCart } from "@/components/cart/cart-context";
import { useStore } from "@/components/store/store-context";
import { Container } from "@/components/ui/container";
import { COLOR_META, TYPE_LABELS, formatPrice } from "@/lib/products";
import { PRODUCT_SIZES, type ProductSize } from "@/lib/product-sizes";
import type { ColorKey, ProductImage } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ColorSwatches } from "./color-swatches";
import { ProductTabs } from "./product-tabs";
import { RelatedProducts } from "./related-products";

interface ProductDetailViewProps {
  readonly id: string;
}

export function ProductDetailView({ id }: ProductDetailViewProps) {
  const { products, isHydrated } = useStore();
  const product = products.find((item) => item.id === id);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ColorKey | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize>("M");
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  if (!isHydrated) {
    return (
      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-card bg-surface" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 animate-pulse rounded bg-surface" />
            <div className="h-8 w-2/3 animate-pulse rounded bg-surface" />
            <div className="h-6 w-32 animate-pulse rounded bg-surface" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="font-display text-2xl text-foreground">
          Không tìm thấy sản phẩm
        </p>
        <p className="text-sm text-muted">
          Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.
        </p>
        <Link
          href="/shop"
          className="mt-2 text-xs font-medium uppercase tracking-label text-foreground underline underline-offset-4"
        >
          Quay lại cửa hàng
        </Link>
      </Container>
    );
  }

  const images: readonly ProductImage[] = product.images?.length
    ? product.images
    : [{ url: product.image, color: product.primaryColor }];
  const activeImage = images[Math.min(activeImageIndex, images.length - 1)];
  const color = selectedColor ?? product.primaryColor;
  const inStock = product.stock === undefined || product.stock > 0;
  const relatedProducts = products.filter((item) => item.id !== product.id);

  function handleAdd() {
    if (!product) {
      return;
    }
    addItem(product.id, color, selectedSize, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  function handleSelectColor(option: ColorKey) {
    setSelectedColor(option);
    const matchIndex = images.findIndex((image) => image.color === option);
    if (matchIndex !== -1) {
      setActiveImageIndex(matchIndex);
    }
  }

  function showPreviousImage() {
    setActiveImageIndex((index) => (index - 1 + images.length) % images.length);
  }

  function showNextImage() {
    setActiveImageIndex((index) => (index + 1) % images.length);
  }

  return (
    <Container className="py-10">
      <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-label text-muted">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              Trang chủ
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/shop" className="hover:text-foreground">
              Cửa hàng
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="max-w-[16rem] truncate text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 pb-24 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square overflow-hidden rounded-card border border-border bg-surface">
            {product.isNew ? (
              <span className="absolute left-4 top-4 z-10 bg-accent px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-label text-accent-foreground">
                Mới
              </span>
            ) : null}
            <Image
              key={activeImage.url}
              src={activeImage.url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Ảnh trước"
                  className="absolute left-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow transition-colors hover:cursor-pointer hover:bg-background"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m15 6-6 6 6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Ảnh tiếp theo"
                  className="absolute right-3 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow transition-colors hover:cursor-pointer hover:bg-background"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m9 6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <ul className="flex flex-wrap gap-3">
              {images.map((image, index) => (
                <li key={`${image.url}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    aria-label={`Ảnh ${index + 1}`}
                    aria-pressed={index === activeImageIndex}
                    className={cn(
                      "relative size-16 overflow-hidden rounded-card border hover:cursor-pointer",
                      index === activeImageIndex ? "border-foreground" : "border-border",
                    )}
                  >
                    <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-5">
          <span className="text-xs font-medium uppercase tracking-label text-highlight">
            {product.category}
          </span>
          <h1 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold text-foreground">{formatPrice(product.price)}</p>

          <p className="text-sm text-muted">
            {TYPE_LABELS[product.type]} ·{" "}
            <span className={inStock ? "text-foreground" : "text-red-600"}>
              {inStock ? "Còn hàng" : "Hết hàng"}
            </span>
          </p>

          {product.colors.length > 1 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-label text-foreground">
                Màu sắc — {COLOR_META[color].label}
              </span>
              <ul className="flex items-center gap-2">
                {product.colors.map((option) => (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => handleSelectColor(option)}
                      aria-label={COLOR_META[option].label}
                      aria-pressed={color === option}
                      className={cn(
                        "size-7 rounded-full border transition-transform hover:cursor-pointer",
                        color === option
                          ? "scale-110 border-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background"
                          : "border-border",
                      )}
                      style={{ backgroundColor: COLOR_META[option].hex }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ColorSwatches colors={product.colors} />
          )}

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

          <div className="mt-2 flex items-center gap-4">
            <QuantityStepper
              quantity={quantity}
              onChange={(next) => setQuantity(Math.max(1, next))}
            />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              className="flex-1 rounded-card bg-accent px-6 py-3 text-xs font-medium uppercase tracking-label text-accent-foreground transition-colors hover:cursor-pointer hover:bg-foreground/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {!inStock ? "Hết hàng" : justAdded ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
            </button>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      <RelatedProducts products={relatedProducts} />
    </Container>
  );
}
