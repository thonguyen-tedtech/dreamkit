import { COLOR_META } from "@/lib/products";
import type { ColorKey } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ColorSwatchesProps {
  colors: readonly ColorKey[];
  className?: string;
  /** Currently selected colour; only meaningful when `onSelect` is provided. */
  selectedColor?: ColorKey;
  /** Makes the swatches clickable (e.g. to preview a colour variant). Omit for a read-only row. */
  onSelect?: (color: ColorKey) => void;
}

/** Row of colour dots showing the variants a product ships in; clickable when `onSelect` is given. */
export function ColorSwatches({ colors, className, selectedColor, onSelect }: ColorSwatchesProps) {
  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {colors.map((color) => {
        const isSelected = color === selectedColor;

        if (!onSelect) {
          return (
            <li
              key={color}
              className="size-5 rounded-full border border-border"
              style={{ backgroundColor: COLOR_META[color].hex }}
              title={COLOR_META[color].label}
            >
              <span className="sr-only">{COLOR_META[color].label}</span>
            </li>
          );
        }

        return (
          <li key={color}>
            <button
              type="button"
              onClick={() => onSelect(color)}
              aria-label={COLOR_META[color].label}
              aria-pressed={isSelected}
              title={COLOR_META[color].label}
              className={cn(
                "size-5 rounded-full border transition-transform hover:cursor-pointer hover:scale-110",
                isSelected
                  ? "scale-110 border-foreground ring-1 ring-foreground ring-offset-1 ring-offset-background"
                  : "border-border",
              )}
              style={{ backgroundColor: COLOR_META[color].hex }}
            />
          </li>
        );
      })}
    </ul>
  );
}
