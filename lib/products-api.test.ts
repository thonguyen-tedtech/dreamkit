import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchProductsApi,
  mapApiProductToProduct,
  resolveProductImage,
} from "./products-api";

const API_PRODUCT = {
  _id: "6a4b68f19d7d69258ee3978f",
  slug: "argentina",
  name: "Set quần áo bóng đá Concept Argentina",
  price: 220_000,
  category: "Áo bóng đá",
  colors: ["blue"],
  primaryColor: "blue",
  image: "/uploads/2024/11/gen-h-z7195942007819_db522f4d24bf24bd339b4166925a0983-300x300.jpg",
  type: "set",
  isNew: false,
} as const;

describe("resolveProductImage", () => {
  it("prefixes relative upload paths", () => {
    expect(resolveProductImage("/uploads/2024/11/photo.jpg")).toBe(
      "https://dreamkit.tedtech.asia/uploads/2024/11/photo.jpg",
    );
  });

  it("keeps absolute URLs unchanged", () => {
    const url = "https://example.com/photo.jpg";
    expect(resolveProductImage(url)).toBe(url);
  });
});

describe("mapApiProductToProduct", () => {
  it("maps API fields to the storefront product model", () => {
    const product = mapApiProductToProduct(API_PRODUCT);

    expect(product).toEqual({
      id: API_PRODUCT._id,
      name: API_PRODUCT.name,
      price: API_PRODUCT.price,
      category: API_PRODUCT.category,
      colors: ["blue"],
      primaryColor: "blue",
      image:
        "https://dreamkit.tedtech.asia/uploads/2024/11/gen-h-z7195942007819_db522f4d24bf24bd339b4166925a0983-300x300.jpg",
      images: [
        {
          url: "https://dreamkit.tedtech.asia/uploads/2024/11/gen-h-z7195942007819_db522f4d24bf24bd339b4166925a0983-300x300.jpg",
          color: "blue",
          position: 0,
        },
      ],
      type: "set",
      isNew: false,
      stock: undefined,
    });
  });

  it("maps a populated images array, sorted by position", () => {
    const product = mapApiProductToProduct({
      ...API_PRODUCT,
      images: [
        { url: "/uploads/b.jpg", color: "black", position: 1 },
        { url: "/uploads/a.jpg", color: "blue", position: 0 },
      ],
    });

    expect(product?.images).toEqual([
      { url: "https://dreamkit.tedtech.asia/uploads/a.jpg", color: "blue", position: 0 },
      { url: "https://dreamkit.tedtech.asia/uploads/b.jpg", color: "black", position: 1 },
    ]);
  });

  it("rejects products with invalid colours", () => {
    expect(
      mapApiProductToProduct({
        ...API_PRODUCT,
        colors: ["neon"],
        primaryColor: "neon",
      }),
    ).toBeNull();
  });
});

describe("fetchProductsApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("maps products from the paginated response envelope", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: [API_PRODUCT],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });

    const result = await fetchProductsApi();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.products).toHaveLength(1);
      expect(result.products[0]?.id).toBe(API_PRODUCT._id);
    }
  });
});
