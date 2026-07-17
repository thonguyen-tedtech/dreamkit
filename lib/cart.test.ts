import { describe, expect, it } from "vitest";
import {
  addLine,
  cartCount,
  parseCartLines,
  removeLine,
  setLineQuantity,
  summarizeCart,
  type CartLine,
} from "./cart";
import type { Product } from "./types";

function product(id: string, price: number): Product {
  return {
    id,
    name: id,
    price,
    category: "x",
    colors: ["red"],
    primaryColor: "red",
    image: `${id}.jpg`,
    type: "set",
    isNew: false,
  };
}

const PRODUCTS = [product("a", 100), product("b", 200)];

describe("addLine", () => {
  it("appends a new line", () => {
    expect(addLine([], "a", "red", "M")).toEqual([
      { id: "a", color: "red", size: "M", quantity: 1 },
    ]);
  });

  it("merges quantity into an existing line with the same variant", () => {
    const lines = addLine(
      [{ id: "a", color: "red", size: "M", quantity: 2 }],
      "a",
      "red",
      "M",
      3,
    );
    expect(lines).toEqual([{ id: "a", color: "red", size: "M", quantity: 5 }]);
  });

  it("keeps a different colour/size as a separate line", () => {
    const lines = addLine(
      [{ id: "a", color: "red", size: "M", quantity: 2 }],
      "a",
      "blue",
      "L",
      1,
    );
    expect(lines).toEqual([
      { id: "a", color: "red", size: "M", quantity: 2 },
      { id: "a", color: "blue", size: "L", quantity: 1 },
    ]);
  });

  it("clamps quantity to the max", () => {
    expect(addLine([], "a", "red", "M", 500)[0].quantity).toBe(99);
  });
});

describe("setLineQuantity", () => {
  it("updates an absolute quantity", () => {
    expect(
      setLineQuantity([{ id: "a", color: "red", size: "M", quantity: 1 }], "a", "red", "M", 4),
    ).toEqual([{ id: "a", color: "red", size: "M", quantity: 4 }]);
  });

  it("removes the line when set below 1", () => {
    expect(
      setLineQuantity([{ id: "a", color: "red", size: "M", quantity: 1 }], "a", "red", "M", 0),
    ).toEqual([]);
  });
});

describe("removeLine / cartCount", () => {
  it("removes a line", () => {
    expect(
      removeLine([{ id: "a", color: "red", size: "M", quantity: 1 }], "a", "red", "M"),
    ).toEqual([]);
  });

  it("counts total quantity", () => {
    expect(
      cartCount([
        { id: "a", color: "red", size: "M", quantity: 2 },
        { id: "b", color: "blue", size: "L", quantity: 3 },
      ]),
    ).toBe(5);
  });
});

describe("summarizeCart", () => {
  it("computes line totals and subtotal", () => {
    const lines: CartLine[] = [
      { id: "a", color: "red", size: "M", quantity: 2 },
      { id: "b", color: "blue", size: "L", quantity: 1 },
    ];
    const summary = summarizeCart(lines, PRODUCTS);
    expect(summary.subtotal).toBe(400);
    expect(summary.count).toBe(3);
    expect(summary.items).toHaveLength(2);
    expect(summary.items[0].lineTotal).toBe(200);
  });

  it("drops lines for unknown products", () => {
    const summary = summarizeCart(
      [{ id: "ghost", color: "red", size: "M", quantity: 1 }],
      PRODUCTS,
    );
    expect(summary.items).toHaveLength(0);
    expect(summary.subtotal).toBe(0);
  });
});

describe("parseCartLines", () => {
  it("returns [] for non-array input", () => {
    expect(parseCartLines("nope")).toEqual([]);
  });

  it("keeps only well-formed entries", () => {
    const parsed = parseCartLines([
      { id: "a", color: "red", size: "M", quantity: 2 },
      { id: "b", color: "blue" },
      { quantity: 3 },
      { id: "c", color: "red", size: "NOT-A-SIZE", quantity: 1 },
      42,
    ]);
    expect(parsed).toEqual([{ id: "a", color: "red", size: "M", quantity: 2 }]);
  });
});
