"use client";

import { ColorFilter } from "@/components/product/color-filter";
import { ProductCard } from "@/components/product/product-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { useStore } from "@/components/store/store-context";
import { useProductFilter } from "@/hooks/use-product-filter";
import { FILTER_COLORS } from "@/lib/products";

export function ShopSection() {
  const { products, isHydrated } = useStore();
  const { activeColors, filteredProducts, toggleColor, clearFilters, isFiltering } =
    useProductFilter(products.slice(0, 8));

  return (
    <section id="shop" className="bg-background py-20 lg:py-28">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Sản phẩm mới"
            title="Bộ sưu tập kit nổi bật"
            description="Những thiết kế concept mới nhất, sẵn sàng tuỳ biến theo bản sắc đội bóng của bạn."
          />
          <ColorFilter
            colors={FILTER_COLORS}
            activeColors={activeColors}
            onToggle={toggleColor}
            onClear={clearFilters}
            isFiltering={isFiltering}
          />
        </div>

        {!isHydrated ? (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <li
                key={index}
                className="aspect-[3/4] animate-pulse rounded-card bg-surface"
              />
            ))}
          </ul>
        ) : filteredProducts.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border py-20 text-center">
            <p className="font-display text-2xl text-foreground">
              Không có sản phẩm phù hợp
            </p>
            <p className="text-sm text-muted">
              Thử bỏ bớt bộ lọc màu để xem thêm thiết kế.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 text-xs font-medium uppercase tracking-label text-foreground underline underline-offset-4 hover:cursor-pointer"
            >
              Xoá bộ lọc
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
