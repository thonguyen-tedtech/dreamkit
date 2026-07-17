import { describe, expect, it } from "vitest";
import {
  countColors,
  filterProducts,
  paginate,
  pageCount,
  sortProducts,
  type CatalogFilters,
} from "./catalog";
import type { ColorKey, Product } from "./types";

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

const PRODUCTS: readonly Product[] = [
  makeProduct({ id: "a", price: 300, colors: ["red", "blue"], type: "jersey" }),
  makeProduct({ id: "b", price: 100, colors: ["green"], isNew: true }),
  makeProduct({ id: "c", price: 200, colors: ["blue"] }),
];

function filters(partial: Partial<CatalogFilters> = {}): CatalogFilters {
  return {
    colors: new Set<ColorKey>(),
    ...partial,
  };
}

describe("filterProducts", () => {
  it("returns everything with no active facets", () => {
    expect(filterProducts(PRODUCTS, filters())).toHaveLength(3);
  });

  it("uses OR within the colour facet", () => {
    const result = filterProducts(PRODUCTS, filters({ colors: new Set(["blue"]) }));
    expect(result.map((p) => p.id)).toEqual(["a", "c"]);
  });

});

describe("sortProducts", () => {
  it("sorts price ascending and descending without mutating", () => {
    const asc = sortProducts(PRODUCTS, "price-asc").map((p) => p.id);
    const desc = sortProducts(PRODUCTS, "price-desc").map((p) => p.id);
    expect(asc).toEqual(["b", "c", "a"]);
    expect(desc).toEqual(["a", "c", "b"]);
    expect(PRODUCTS[0].id).toBe("a");
  });

  it("floats new items first for 'latest'", () => {
    expect(sortProducts(PRODUCTS, "latest")[0].id).toBe("b");
  });
});

describe("pagination", () => {
  it("slices per page", () => {
    expect(paginate(PRODUCTS, 1, 2).map((p) => p.id)).toEqual(["a", "b"]);
    expect(paginate(PRODUCTS, 2, 2).map((p) => p.id)).toEqual(["c"]);
  });

  it("computes page count with a floor of 1", () => {
    expect(pageCount(0, 12)).toBe(1);
    expect(pageCount(16, 12)).toBe(2);
  });
});

describe("countColors", () => {
  it("counts each colour a product offers", () => {
    const counts = countColors(PRODUCTS);
    expect(counts.get("blue")).toBe(2);
    expect(counts.get("red")).toBe(1);
    expect(counts.get("green")).toBe(1);
  });
});
