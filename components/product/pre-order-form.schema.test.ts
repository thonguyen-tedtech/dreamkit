import { describe, expect, it } from "vitest";
import { preOrderFormSchema } from "./pre-order-form.schema";

const VALID = {
  name: "Jane Doe",
  phone: "0901234567",
  address: "123 Main St, Springfield",
  note: "",
};

describe("preOrderFormSchema", () => {
  it("accepts a fully filled-in form", () => {
    const result = preOrderFormSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it("accepts an empty note (optional)", () => {
    const result = preOrderFormSchema.safeParse({ ...VALID, note: "" });
    expect(result.success).toBe(true);
  });

  it.each(["name", "phone", "address"] as const)(
    "rejects an empty %s",
    (field) => {
      const result = preOrderFormSchema.safeParse({ ...VALID, [field]: "" });
      expect(result.success).toBe(false);
    },
  );

  it("rejects a name over 100 characters", () => {
    const result = preOrderFormSchema.safeParse({ ...VALID, name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("rejects a phone over 30 characters", () => {
    const result = preOrderFormSchema.safeParse({ ...VALID, phone: "1".repeat(31) });
    expect(result.success).toBe(false);
  });

  it("rejects an address over 500 characters", () => {
    const result = preOrderFormSchema.safeParse({ ...VALID, address: "a".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("rejects a note over 2000 characters", () => {
    const result = preOrderFormSchema.safeParse({ ...VALID, note: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
