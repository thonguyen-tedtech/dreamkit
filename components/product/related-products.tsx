"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/cn";

interface RelatedProductsProps {
  products: readonly Product[];
}

/** Carousel of other products shown on the product detail page, powered by Embla. */
export function RelatedProducts({ products }: RelatedProductsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border pb-24 pt-16">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Sản phẩm khác
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Sản phẩm trước"
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:cursor-pointer hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
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
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Sản phẩm tiếp theo"
            className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:cursor-pointer hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
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
        </div>
      </div>

      <div className={cn("mt-8 overflow-hidden")} ref={emblaRef}>
        <ul className="-ml-6 flex touch-pan-y">
          {products.map((product) => (
            <li
              key={product.id}
              className="min-w-0 shrink-0 grow-0 basis-1/2 pl-6 sm:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
