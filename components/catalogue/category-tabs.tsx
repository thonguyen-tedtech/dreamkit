"use client";

import { CATALOGUE_TYPE_TABS } from "@/lib/catalogue";
import { TYPE_LABELS } from "@/lib/products";
import type { ProductType } from "@/lib/types";
import { cn } from "@/lib/cn";

interface CategoryTabsProps {
  activeType: ProductType;
  onSelect: (type: ProductType) => void;
}

/** Filters catalogue collections by product category (Set / Jersey / Polo). */
export function CategoryTabs({ activeType, onSelect }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Lọc theo loại sản phẩm"
      className="flex flex-wrap gap-8 border-b border-border"
    >
      {CATALOGUE_TYPE_TABS.map((type) => {
        const isActive = type === activeType;
        return (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(type)}
            className={cn(
              "-mb-px border-b-2 pb-4 text-xs font-medium uppercase tracking-label transition-colors hover:cursor-pointer",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-foreground",
            )}
          >
            {TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
