import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/types";
import { useProductFilter } from "./use-product-filter";

const PRODUCTS: readonly Product[] = [
  {
    id: "a",
    name: "A",
    price: 1,
    category: "x",
    colors: ["black", "red"],
    primaryColor: "black",
    image: "a.jpg",
    type: "set",
    isNew: true,
  },
  {
    id: "b",
    name: "B",
    price: 2,
    category: "x",
    colors: ["blue"],
    primaryColor: "blue",
    image: "b.jpg",
    type: "set",
    isNew: false,
  },
  {
    id: "c",
    name: "C",
    price: 3,
    category: "x",
    colors: ["green", "red"],
    primaryColor: "green",
    image: "c.jpg",
    type: "jersey",
    isNew: false,
  },
];

describe("useProductFilter", () => {
  it("returns all products when no filter is active", () => {
    const { result } = renderHook(() => useProductFilter(PRODUCTS));

    expect(result.current.filteredProducts).toHaveLength(3);
    expect(result.current.isFiltering).toBe(false);
  });

  it("filters with OR semantics across selected colours", () => {
    const { result } = renderHook(() => useProductFilter(PRODUCTS));

    act(() => result.current.toggleColor("red"));

    expect(result.current.filteredProducts.map((p) => p.id)).toEqual([
      "a",
      "c",
    ]);
    expect(result.current.isFiltering).toBe(true);
  });

  it("includes products matching any active colour", () => {
    const { result } = renderHook(() => useProductFilter(PRODUCTS));

    act(() => result.current.toggleColor("red"));
    act(() => result.current.toggleColor("blue"));

    expect(result.current.filteredProducts.map((p) => p.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("toggling the same colour twice removes the filter", () => {
    const { result } = renderHook(() => useProductFilter(PRODUCTS));

    act(() => result.current.toggleColor("blue"));
    act(() => result.current.toggleColor("blue"));

    expect(result.current.filteredProducts).toHaveLength(3);
    expect(result.current.isFiltering).toBe(false);
  });

  it("clears all active filters", () => {
    const { result } = renderHook(() => useProductFilter(PRODUCTS));

    act(() => result.current.toggleColor("red"));
    act(() => result.current.clearFilters());

    expect(result.current.filteredProducts).toHaveLength(3);
    expect(result.current.isFiltering).toBe(false);
  });
});
