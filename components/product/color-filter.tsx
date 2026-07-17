"use client";

import { COLOR_META } from "@/lib/products";
import type { ColorKey } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ColorFilterProps {
  colors: readonly ColorKey[];
  activeColors: ReadonlySet<ColorKey>;
  onToggle: (color: ColorKey) => void;
  onClear: () => void;
  isFiltering: boolean;
}

/**
 * Colour facet control. Implemented as a group of toggle buttons
 * (`aria-pressed`) so the filter is fully keyboard accessible and announced
 * correctly by assistive tech.
 */
export function ColorFilter({
  colors,
  activeColors,
  onToggle,
  onClear,
  isFiltering,
}: ColorFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-label text-muted">
        Lọc theo màu
      </span>
      <div className="flex items-center gap-2" role="group" aria-label="Lọc sản phẩm theo màu">
        {colors.map((color) => {
          const isActive = activeColors.has(color);
          return (
            <button
              key={color}
              type="button"
              aria-pressed={isActive}
              aria-label={COLOR_META[color].label}
              title={COLOR_META[color].label}
              onClick={() => onToggle(color)}
              className={cn(
                "size-7 rounded-full border-2 transition-transform duration-200 hover:scale-110 hover:cursor-pointer",
                isActive
                  ? "border-foreground ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "border-border",
              )}
              style={{ backgroundColor: COLOR_META[color].hex }}
            />
          );
        })}
      </div>
      {isFiltering ? (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium uppercase tracking-label text-muted underline-offset-4 hover:cursor-pointer hover:text-foreground hover:underline"
        >
          Xoá bộ lọc
        </button>
      ) : null}
    </div>
  );
}
