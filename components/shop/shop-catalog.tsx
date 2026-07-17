"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { useStore } from "@/components/store/store-context";
import { useCatalog } from "@/hooks/use-catalog";
import { cn } from "@/lib/cn";
import { Pagination } from "./pagination";
import { ShopFilters } from "./shop-filters";
import { ShopToolbar } from "./shop-toolbar";

export function ShopCatalog() {
  const { products, isHydrated } = useStore();
  const catalog = useCatalog(products);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  if (!isHydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-96 animate-pulse rounded-card bg-surface lg:block" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-card bg-surface"
            />
          ))}
        </div>
      </div>
    );
  }

  const filters = (
    <ShopFilters
      products={products}
      activeColors={catalog.activeColors}
      onToggleColor={catalog.toggleColor}
      onClear={catalog.clearFilters}
      hasActiveFilters={catalog.hasActiveFilters}
    />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block">{filters}</aside>

      <div className="flex flex-col gap-8">
        <ShopToolbar
          rangeStart={catalog.rangeStart}
          rangeEnd={catalog.rangeEnd}
          totalCount={catalog.totalCount}
          sort={catalog.sort}
          pageSize={catalog.pageSize}
          onSortChange={catalog.setSort}
          onPageSizeChange={catalog.setPageSize}
          onOpenFilters={() => setIsMobileFiltersOpen((open) => !open)}
        />

        <div
          className={cn(
            "rounded-card border border-border p-6 lg:hidden",
            isMobileFiltersOpen ? "block" : "hidden",
          )}
        >
          {filters}
        </div>

        {catalog.pageItems.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
            {catalog.pageItems.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border py-24 text-center">
            <p className="font-display text-2xl text-foreground">
              Không tìm thấy sản phẩm
            </p>
            <p className="text-sm text-muted">
              Thử điều chỉnh hoặc xoá bớt bộ lọc để xem thêm.
            </p>
            <button
              type="button"
              onClick={catalog.clearFilters}
              className="mt-2 text-xs font-medium uppercase tracking-label text-foreground underline underline-offset-4 hover:cursor-pointer"
            >
              Xoá bộ lọc
            </button>
          </div>
        )}

        <Pagination
          page={catalog.page}
          totalPages={catalog.totalPages}
          onPageChange={catalog.setPage}
        />
      </div>
    </div>
  );
}
