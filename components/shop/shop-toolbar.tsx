import { useId } from "react";
import { PAGE_SIZE_OPTIONS, SORT_OPTIONS, type SortKey } from "@/lib/catalog";

interface ShopToolbarProps {
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  sort: SortKey;
  pageSize: number;
  onSortChange: (sort: SortKey) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenFilters: () => void;
}

const SELECT_CLASS =
  "h-11 rounded-card border border-border bg-background px-4 text-sm text-foreground focus:border-foreground focus:outline-none";

export function ShopToolbar({
  rangeStart,
  rangeEnd,
  totalCount,
  sort,
  pageSize,
  onSortChange,
  onPageSizeChange,
  onOpenFilters,
}: ShopToolbarProps) {
  const sortId = useId();
  const pageSizeId = useId();

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex items-center gap-2 rounded-card border border-border px-4 py-2 text-xs font-medium uppercase tracking-label text-foreground hover:cursor-pointer lg:hidden"
        >
          Lọc
        </button>
        <p className="text-sm text-muted" aria-live="polite">
          {totalCount === 0
            ? "Không có kết quả"
            : `Hiển thị ${rangeStart}–${rangeEnd} của ${totalCount} kết quả`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor={pageSizeId}
            className="text-xs font-medium uppercase tracking-label text-muted"
          >
            Hiển thị
          </label>
          <select
            id={pageSizeId}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className={SELECT_CLASS}
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} / trang
              </option>
            ))}
          </select>
        </div>

        <label htmlFor={sortId} className="sr-only">
          Sắp xếp sản phẩm
        </label>
        <select
          id={sortId}
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          className={SELECT_CLASS}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
