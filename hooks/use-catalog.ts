"use client";

import { useCallback, useMemo, useState } from "react";
import {
  PAGE_SIZE,
  filterProducts,
  pageCount,
  paginate,
  sortProducts,
  type SortKey,
} from "@/lib/catalog";
import type { ColorKey, Product } from "@/lib/types";

export interface UseCatalogResult {
  readonly pageItems: readonly Product[];
  readonly totalCount: number;
  readonly totalPages: number;
  readonly page: number;
  readonly pageSize: number;
  readonly rangeStart: number;
  readonly rangeEnd: number;
  readonly sort: SortKey;
  readonly activeColors: ReadonlySet<ColorKey>;
  readonly hasActiveFilters: boolean;
  readonly setSort: (sort: SortKey) => void;
  readonly setPage: (page: number) => void;
  readonly setPageSize: (pageSize: number) => void;
  readonly toggleColor: (color: ColorKey) => void;
  readonly clearFilters: () => void;
}

function toggleInSet(set: ReadonlySet<ColorKey>, value: ColorKey): Set<ColorKey> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

/**
 * Orchestrates the shop catalogue: faceted filtering, sorting and pagination.
 *
 * All derivations are memoised, and any filter change resets to page 1 so the
 * user never lands on an out-of-range page. Pure list operations live in
 * `lib/catalog` and are unit-tested independently.
 */
export function useCatalog(products: readonly Product[]): UseCatalogResult {
  const [activeColors, setActiveColors] = useState<ReadonlySet<ColorKey>>(
    () => new Set(),
  );
  const [sort, setSortState] = useState<SortKey>("popularity");
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState<number>(PAGE_SIZE);

  const filtered = useMemo(
    () => filterProducts(products, { colors: activeColors }),
    [products, activeColors],
  );

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const totalCount = sorted.length;
  const totalPages = pageCount(totalCount, pageSize);
  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => paginate(sorted, safePage, pageSize),
    [sorted, safePage, pageSize],
  );

  const setPage = useCallback((next: number) => setPageState(next), []);
  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setPageState(1);
  }, []);
  const setSort = useCallback((next: SortKey) => {
    setSortState(next);
    setPageState(1);
  }, []);

  const toggleColor = useCallback((color: ColorKey) => {
    setActiveColors((current) => toggleInSet(current, color));
    setPageState(1);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveColors(new Set());
    setPageState(1);
  }, []);

  const rangeStart = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, totalCount);
  const hasActiveFilters = activeColors.size > 0;

  return {
    pageItems,
    totalCount,
    totalPages,
    page: safePage,
    pageSize,
    rangeStart,
    rangeEnd,
    sort,
    activeColors,
    hasActiveFilters,
    setSort,
    setPage,
    setPageSize,
    toggleColor,
    clearFilters,
  };
}
