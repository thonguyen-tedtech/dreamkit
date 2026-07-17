"use client";

import { useCallback, useMemo, useState } from "react";
import { CATALOGUE_TYPE_TABS } from "@/lib/catalogue";
import { filterCatalogueCollections } from "@/lib/catalogue-filter";
import type { CatalogueCollection, ColorKey, ProductType } from "@/lib/types";

export interface UseCatalogueFilterResult {
  readonly activeColors: ReadonlySet<ColorKey>;
  readonly activeType: ProductType;
  /** Collections matching the active category tab, before the colour facet is applied. */
  readonly typeFilteredCollections: readonly CatalogueCollection[];
  readonly filteredCollections: readonly CatalogueCollection[];
  readonly toggleColor: (color: ColorKey) => void;
  readonly setActiveType: (type: ProductType) => void;
  readonly clearFilters: () => void;
  readonly isFiltering: boolean;
}

/** Category-tab + colour-filter state for the catalogue gallery page. */
export function useCatalogueFilter(
  collections: readonly CatalogueCollection[],
): UseCatalogueFilterResult {
  const [activeColors, setActiveColors] = useState<ReadonlySet<ColorKey>>(
    () => new Set(),
  );
  const [activeType, setActiveType] = useState<ProductType>(CATALOGUE_TYPE_TABS[0]);

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

  const typeFilteredCollections = useMemo(
    () => collections.filter((collection) => collection.productType === activeType),
    [collections, activeType],
  );

  const filteredCollections = useMemo(
    () => filterCatalogueCollections(typeFilteredCollections, activeColors),
    [typeFilteredCollections, activeColors],
  );

  return {
    activeColors,
    activeType,
    typeFilteredCollections,
    filteredCollections,
    toggleColor,
    setActiveType,
    clearFilters,
    isFiltering: activeColors.size > 0,
  };
}
