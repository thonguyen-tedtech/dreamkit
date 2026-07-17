"use client";

import { useMemo } from "react";
import { countColors } from "@/lib/catalog";
import { COLOR_META } from "@/lib/products";
import type { ColorKey, Product } from "@/lib/types";
import { FilterGroup } from "./filter-group";

interface ShopFiltersProps {
  products: readonly Product[];
  activeColors: ReadonlySet<ColorKey>;
  onToggleColor: (value: ColorKey) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function ShopFilters({
  products,
  activeColors,
  onToggleColor,
  onClear,
  hasActiveFilters,
}: ShopFiltersProps) {
  const colorOptions = useMemo(() => {
    const counts = countColors(products);
    return (Object.keys(COLOR_META) as ColorKey[])
      .filter((color) => (counts.get(color) ?? 0) > 0)
      .map((color) => ({
        value: color,
        label: COLOR_META[color].label,
        count: counts.get(color) ?? 0,
        swatch: COLOR_META[color].hex,
      }));
  }, [products]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground">
          Lọc
        </h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
          >
            Xoá tất cả
          </button>
        ) : null}
      </div>

      <FilterGroup
        title="Màu sắc"
        options={colorOptions}
        selected={activeColors}
        onToggle={onToggleColor}
      />
    </div>
  );
}
