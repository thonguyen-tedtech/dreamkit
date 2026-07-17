import type { ColorKey, Product } from "./types";

/** Sort options offered in the shop toolbar (mirrors the WooCommerce store). */
export type SortKey =
  | "popularity"
  | "rating"
  | "latest"
  | "price-asc"
  | "price-desc";

export interface CatalogFilters {
  readonly colors: ReadonlySet<ColorKey>;
}

export const PAGE_SIZE = 12;

/** Selectable "items per page" limits offered in the toolbar. */
export const PAGE_SIZE_OPTIONS: readonly number[] = [6, 12, 24];

export const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: "popularity", label: "Thứ tự theo mức độ phổ biến" },
  { value: "rating", label: "Thứ tự theo điểm đánh giá" },
  { value: "latest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: thấp đến cao" },
  { value: "price-desc", label: "Giá: cao xuống thấp" },
];

/** Filters products by colour (OR match); an empty facet imposes no constraint. */
export function filterProducts(
  products: readonly Product[],
  filters: CatalogFilters,
): readonly Product[] {
  return products.filter(
    (product) =>
      filters.colors.size === 0 ||
      product.colors.some((color) => filters.colors.has(color)),
  );
}

/** Returns a new, sorted array (does not mutate the input). */
export function sortProducts(
  products: readonly Product[],
  sort: SortKey,
): readonly Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "latest":
      return copy.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "rating":
    case "popularity":
    default:
      return copy;
  }
}

/** Slices the list for the given 1-based page. */
export function paginate(
  products: readonly Product[],
  page: number,
  pageSize: number = PAGE_SIZE,
): readonly Product[] {
  const start = (page - 1) * pageSize;
  return products.slice(start, start + pageSize);
}

export function pageCount(
  total: number,
  pageSize: number = PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Counts products per colour (a product contributes to each of its colours). */
export function countColors(
  products: readonly Product[],
): Map<ColorKey, number> {
  const counts = new Map<ColorKey, number>();
  for (const product of products) {
    for (const color of product.colors) {
      counts.set(color, (counts.get(color) ?? 0) + 1);
    }
  }
  return counts;
}
