"use client";

import { useCallback, useMemo, useState } from "react";
import { filterCatalogueCollections } from "@/lib/catalogue-filter";
import type { CatalogueCollection, ColorKey } from "@/lib/types";

export interface UseCatalogueFilterResult {
  readonly activeColors: ReadonlySet<ColorKey>;
  readonly filteredCollections: readonly CatalogueCollection[];
  readonly toggleColor: (color: ColorKey) => void;
  readonly clearFilters: () => void;
  readonly isFiltering: boolean;
}

/** Colour-filter state for the catalogue gallery page. */
export function useCatalogueFilter(
  collections: readonly CatalogueCollection[],
): UseCatalogueFilterResult {
  const [activeColors, setActiveColors] = useState<ReadonlySet<ColorKey>>(
    () => new Set(),
  );

  const toggleColor = useCallback((color: ColorKey) => {
    setActiveColors((current) => {
      const next = new Set(current);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveColors((current) => (current.size === 0 ? current : new Set()));
  }, []);

  const filteredCollections = useMemo(
    () => filterCatalogueCollections(collections, activeColors),
    [collections, activeColors],
  );

  return {
    activeColors,
    filteredCollections,
    toggleColor,
    clearFilters,
    isFiltering: activeColors.size > 0,
  };
}
