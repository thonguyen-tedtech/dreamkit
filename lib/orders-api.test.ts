import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createOrderApi,
  fetchOrdersApi,
  mapApiOrderToOrder,
  trackOrderByHashApi,
  type ApiOrder,
} from "./orders-api";

const API_ORDER: ApiOrder = {
  _id: "6a4b68f19d7d69258ee3978f",
  user: {
    _id: "user-1",
    email: "jane@dreamkit.vn",
    name: "Jane Doe",
    role: "user",
    phone: "+1-555-0100",
  },
  items: [
    {
      product: { _id: "product-1", name: "Set Concept Argentina" },
      quantity: 2,
      unitPrice: 220_000,
      color: "blue",
      size: "M",
    },
  ],
  status: "pending",
  totalAmount: 420_000,
  discount: 20_000,
  discountCode: "SUMMER10",
  discountPercent: 0,
  paymentMethod: "cash",
  isPaid: false,
  hash: "abc-123",
  note: "Leave at front desk",
  createdAt: "2026-01-01T00:00:00.000Z",
};

describe("mapApiOrderToOrder", () => {
  it("maps API fields to the storefront order model", () => {
    const order = mapApiOrderToOrder(API_ORDER);

    expect(order).toEqual({
      id: API_ORDER._id,
      hash: "abc-123",
      userId: "user-1",
      name: "Jane Doe",
      phone: "+1-555-0100",
      email: "jane@dreamkit.vn",
      lines: [
        {
          productId: "product-1",
          productName: "Set Concept Argentina",
          unitPrice: 220_000,
          quantity: 2,
          lineTotal: 440_000,
          color: "blue",
          size: "M",
        },
      ],
      subtotal: 440_000,
      discountCode: "SUMMER10",
      discountPercent: 0,
      discount: 20_000,
      total: 420_000,
      paymentMethod: "cash",
      isPaid: false,
      status: "pending",
      createdAt: "2026-01-01T00:00:00.000Z",
      note: "Leave at front desk",
      failureReason: undefined,
    });
  });

  it("maps the failure reason when the order was cancelled by async processing", () => {
    const order = mapApiOrderToOrder({
      ...API_ORDER,
      status: "cancelled",
      failureReason: "Sản phẩm đã hết hàng",
    });

    expect(order.status).toBe("cancelled");
    expect(order.failureReason).toBe("Sản phẩm đã hết hàng");
  });

  it("falls back to the order's own name/phone/email over the populated user", () => {
    const order = mapApiOrderToOrder({
      ...API_ORDER,
      name: "Guest Name",
      phone: "+1-000-0000",
      email: "guest@dreamkit.vn",
    });

    expect(order.name).toBe("Guest Name");
    expect(order.phone).toBe("+1-000-0000");
    expect(order.email).toBe("guest@dreamkit.vn");
  });

  it("handles an unpopulated product reference", () => {
    const order = mapApiOrderToOrder({
      ...API_ORDER,
      items: [
        {
          product: "product-2",
          quantity: 1,
          unitPrice: 100_000,
          color: "black",
          size: "L",
        },
      ],
    });

    expect(order.lines[0]).toEqual({
      productId: "product-2",
      productName: "Sản phẩm",
      unitPrice: 100_000,
      quantity: 1,
      lineTotal: 100_000,
      color: "black",
      size: "L",
    });
  });
});

describe("createOrderApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("posts the order payload and returns the accepted hash/status", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 202,
      json: async () => ({ hash: "abc-123", status: "pending" }),
    });

    const result = await createOrderApi({
      items: [{ productId: "product-1", quantity: 2, color: "blue", size: "M" }],
      paymentMethod: "cash",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hash).toBe("abc-123");
      expect(result.status).toBe("pending");
    }

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      items: [{ productId: "product-1", quantity: 2, color: "blue", size: "M" }],
      paymentMethod: "cash",
    });
  });

  it("returns the backend's error message on failure", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "name and phone are required for a guest order" }),
    });

    const result = await createOrderApi({
      items: [{ productId: "product-1", quantity: 1, color: "blue", size: "M" }],
      paymentMethod: "cash",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("name and phone are required for a guest order");
    }
  });
});

describe("fetchOrdersApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("maps a raw array of orders", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [API_ORDER],
    });

    const result = await fetchOrdersApi("token");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.orders).toHaveLength(1);
      expect(result.orders[0]?.id).toBe(API_ORDER._id);
    }

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token");
  });
});

describe("trackOrderByHashApi", () => {
  const fetchMock = vi.fn();

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("fetches the order by hash without auth headers", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => API_ORDER,
    });

    const result = await trackOrderByHashApi("abc-123");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.order.hash).toBe("abc-123");
    }

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/orders/track/abc-123");
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("returns the backend's not-found message on failure", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Order with hash "bad-hash" not found' }),
    });

    const result = await trackOrderByHashApi("bad-hash");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(404);
      expect(result.message).toBe('Order with hash "bad-hash" not found');
    }
  });
});
