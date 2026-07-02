import { describe, expect, it } from "vitest";
import { CATALOGUE_COLLECTIONS } from "./catalogue";
import { countCatalogueColors, filterCatalogueCollections } from "./catalogue-filter";

describe("filterCatalogueCollections", () => {
  it("returns all collections when no colours are selected", () => {
    expect(filterCatalogueCollections(CATALOGUE_COLLECTIONS, new Set())).toEqual(
      CATALOGUE_COLLECTIONS,
    );
  });

  it("keeps items that match any selected colour", () => {
    const filtered = filterCatalogueCollections(
      CATALOGUE_COLLECTIONS,
      new Set(["blue"]),
    );

    expect(filtered.length).toBeGreaterThan(0);
    for (const collection of filtered) {
      for (const item of collection.items) {
        expect(item.colors).toContain("blue");
      }
    }
  });

  it("drops collections with no matching items", () => {
    const filtered = filterCatalogueCollections(
      CATALOGUE_COLLECTIONS,
      new Set(["cream"]),
    );

    expect(filtered.every((collection) => collection.items.length > 0)).toBe(true);
    expect(
      filtered.some((collection) =>
        collection.items.some((item) => item.colors.includes("cream")),
      ),
    ).toBe(true);
  });
});

describe("countCatalogueColors", () => {
  it("counts every colour occurrence across catalogue items", () => {
    const counts = countCatalogueColors(CATALOGUE_COLLECTIONS);

    expect(counts.get("red")).toBeGreaterThan(0);
    expect(counts.get("blue")).toBeGreaterThan(0);
  });
});
