import { describe, expect, it } from "vitest";
import { buildCatalogueCollectionsFromProducts, getCatalogueFilterColors } from "./catalogue";
import type { Product } from "./types";

function makeProduct(overrides: Partial<Product> & Pick<Product, "id">): Product {
  return {
    name: overrides.id,
    price: 100,
    category: "x",
    colors: ["red"],
    primaryColor: "red",
    image: "x.jpg",
    type: "set",
    isNew: false,
    ...overrides,
  };
}

describe("buildCatalogueCollectionsFromProducts", () => {
  it("tags each image with the colour recorded on that image, not the whole product's colours", () => {
    const product = makeProduct({
      id: "a",
      colors: ["red", "blue"],
      collectionName: "Storm",
      collectionImages: [
        { url: "/a.jpg", color: "red" },
        { url: "/b.jpg", color: "blue" },
      ],
    });

    const [collection] = buildCatalogueCollectionsFromProducts([product]);

    expect(collection.items).toEqual([
      { id: "storm-0", image: "/a.jpg", fullImage: "/a.jpg", alt: "Storm", colors: ["red"] },
      { id: "storm-1", image: "/b.jpg", fullImage: "/b.jpg", alt: "Storm", colors: ["blue"] },
    ]);
  });

  it("unions colours across products that share the same collection image URL", () => {
    const shared = "/shared.jpg";
    const products = [
      makeProduct({
        id: "a",
        colors: ["red"],
        collectionName: "Storm",
        collectionImages: [{ url: shared, color: "red" }],
      }),
      makeProduct({
        id: "b",
        colors: ["blue"],
        collectionName: "Storm",
        collectionImages: [{ url: shared, color: "blue" }],
      }),
    ];

    const [collection] = buildCatalogueCollectionsFromProducts(products);

    expect(collection.items).toHaveLength(1);
    expect(collection.items[0].colors).toEqual(["red", "blue"]);
  });

  it("skips products with no collection name or no collection images", () => {
    const withoutName = makeProduct({
      id: "a",
      collectionImages: [{ url: "/a.jpg", color: "red" }],
    });
    const withoutImages = makeProduct({ id: "b", collectionName: "Storm" });

    expect(buildCatalogueCollectionsFromProducts([withoutName, withoutImages])).toEqual([]);
  });
});

describe("getCatalogueFilterColors", () => {
  it("returns every distinct colour across all collection items", () => {
    const collections = buildCatalogueCollectionsFromProducts([
      makeProduct({
        id: "a",
        collectionName: "Storm",
        collectionImages: [
          { url: "/a.jpg", color: "red" },
          { url: "/b.jpg", color: "blue" },
        ],
      }),
    ]);

    expect([...getCatalogueFilterColors(collections)].sort()).toEqual(["blue", "red"]);
  });
});
