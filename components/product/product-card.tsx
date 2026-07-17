"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import type { ColorKey, Product, ProductImage } from "@/lib/types";
import { ColorSwatches } from "./color-swatches";

interface ProductCardProps {
  product: Product;
  /** First card in the viewport can opt into priority loading. */
  priority?: boolean;
}

function ProductCardImpl({ product, priority = false }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<ColorKey>(product.primaryColor);

  const images: readonly ProductImage[] = product.images?.length
    ? product.images
    : [{ url: product.image, color: product.primaryColor }];
  const activeImage = images.find((image) => image.color === selectedColor) ?? images[0];

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-card border border-border bg-surface">
        {product.isNew ? (
          <span className="absolute left-4 top-4 z-10 bg-accent px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-label text-accent-foreground">
            Mới
          </span>
        ) : null}

        <Link href={`/shop/${product.id}`} aria-label={product.name} className="absolute inset-0 block">
          <Image
            key={activeImage.url}
            src={activeImage.url}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <span className="text-[0.7rem] font-medium uppercase tracking-label text-highlight">
          {product.category}
        </span>
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-sm font-medium leading-snug text-foreground hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          <ColorSwatches
            colors={product.colors}
            selectedColor={selectedColor}
            onSelect={setSelectedColor}
          />
        </div>
      </div>
    </article>
  );
}

/** Memoised so re-filtering only re-renders cards whose props changed. */
export const ProductCard = memo(ProductCardImpl);
