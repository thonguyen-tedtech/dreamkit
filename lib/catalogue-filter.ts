import type { CatalogueCollection, ColorKey } from "./types";

/**
 * Filters catalogue collections by active colour facets.
 * Within a facet the match is OR; empty selection shows everything.
 * Collections with no matching items are omitted.
 */
export function filterCatalogueCollections(
  collections: readonly CatalogueCollection[],
  activeColors: ReadonlySet<ColorKey>,
): readonly CatalogueCollection[] {
  if (activeColors.size === 0) {
    return collections;
  }

  return collections
    .map((collection) => ({
      ...collection,
      items: collection.items.filter((item) =>
        item.colors.some((color) => activeColors.has(color)),
      ),
    }))
    .filter((collection) => collection.items.length > 0);
}

/** Counts how many catalogue items offer each colour. */
export function countCatalogueColors(
  collections: readonly CatalogueCollection[],
): ReadonlyMap<ColorKey, number> {
  const counts = new Map<ColorKey, number>();

  for (const collection of collections) {
    for (const item of collection.items) {
      for (const color of item.colors) {
        counts.set(color, (counts.get(color) ?? 0) + 1);
      }
    }
  }

  return counts;
}
