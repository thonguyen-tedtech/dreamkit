import { describe, expect, it } from "vitest";
import {
  deleteProduct,
  slugifyProductId,
  upsertProduct,
  validateProduct,
} from "./product-admin";
import type { Product } from "./types";

const BASE: Product = {
  id: "kit-a",
  name: "Kit A",
  price: 210_000,
  category: "Set quần áo bóng đá",
  colors: ["red"],
  primaryColor: "red",
  image: "https://example.com/a.jpg",
  images: [{ url: "https://example.com/a.jpg", color: "red", position: 0 }],
  type: "set",
  isNew: true,
};

describe("slugifyProductId", () => {
  it("normalises Vietnamese product names", () => {
    expect(slugifyProductId("Áo Đà Nẵng Storm")).toBe("ao-da-nang-storm");
  });
});

describe("validateProduct", () => {
  it("flags a missing name", () => {
    const errors = validateProduct({ ...BASE, name: "" });
    expect(errors.name).toBeTruthy();
  });

  it("passes for a valid product", () => {
    const errors = validateProduct(BASE);
    expect(errors).toEqual({});
  });

  it("flags a product with no images", () => {
    const errors = validateProduct({ ...BASE, images: [] });
    expect(errors.images).toBeTruthy();
  });
});

describe("upsertProduct", () => {
  it("replaces an existing product", () => {
    const updated = { ...BASE, name: "Kit B" };
    const next = upsertProduct([BASE], updated);
    expect(next).toHaveLength(1);
    expect(next[0]?.name).toBe("Kit B");
  });
});

describe("deleteProduct", () => {
  it("removes a product by id", () => {
    expect(deleteProduct([BASE], "kit-a")).toEqual([]);
  });
});
