# Contract: `/api/orders` (extended)

This documents the additions this feature requires to the existing NestJS backend contract already consumed by `lib/orders-api.ts`. The backend is out-of-repo; this is the interface the frontend requires it to satisfy. Existing fields not listed here are unchanged.

## POST /api/orders (extended)

Used by both cart checkout (`components/cart/checkout-panel.tsx`) and the new standalone pre-order form (`components/product/preorder-form.tsx`) — same endpoint, per [research.md](../research.md) §3.

### Request body (extends existing `CreateOrderInput`)

```jsonc
{
  "items": [
    { "productId": "string", "quantity": 1, "color": "string", "size": "string" }
    // Cart checkout: 1+ items. Pre-order: exactly 1 item (FR-003, FR-012).
  ],
  "paymentMethod": "cash" | "bank",
  "discount": 0,                // unchanged, optional
  "discountCode": "string",     // unchanged, optional
  "name": "string",             // unchanged; required for guest orders — also serves as shipping recipient name
  "phone": "string",            // unchanged; required for guest orders — also serves as shipping recipient phone
  "email": "string",            // unchanged, optional
  "note": "string",             // unchanged, optional

  // NEW — required on every order (FR-007):
  "shippingAddress": {
    "street": "string",
    "ward": "string",
    "province": "string"
  },

  // NEW — optional, set true only by the pre-order form (FR-003):
  "isPreorder": true
}
```

### Response body (extends existing `ApiOrder`)

```jsonc
{
  "_id": "string",
  "hash": "string",
  "items": [ /* unchanged */ ],
  "status": "pending",           // unchanged OrderStatus values
  "totalAmount": 0,
  "isPaid": false,                // unchanged meaning: full order amount settled
  // ...unchanged existing fields...

  // NEW:
  "shippingAddress": {
    "street": "string",
    "ward": "string",
    "province": "string"
  },
  "isPreorder": true,
  "depositAmount": 0,             // present only when isPreorder is true; server-computed, 10% of the line's price (FR-015, FR-016)
  "isDepositConfirmed": false     // present only when isPreorder is true; false until staff confirm (FR-018)
}
```

### Validation the backend is expected to enforce

- Reject the request (400) if `shippingAddress` is missing any of `street`/`ward`/`province`, or if any is empty after trimming (FR-009).
- Reject the request (400) if `isPreorder: true` and `items.length !== 1` (FR-003/FR-012).
- Reject the request (422/409, backend's existing convention) if `isPreorder: true` but the referenced product is not `preorderEligible` (FR-004) — mirrors how the backend already validates stock for regular orders.
- Compute `depositAmount` server-side as 10% of the created line's price; never trust a client-supplied deposit amount (FR-015, research.md §3).

## PATCH /api/orders/:id (extended)

Used by staff, unchanged call site (`lib/orders-api.ts:updateOrderApi`, consumed by `order-manager.tsx`).

### Request body (extends existing `UpdateOrderInput`)

```jsonc
{
  "status": "pending",          // unchanged
  "paymentMethod": "cash",      // unchanged
  "isPaid": false,               // unchanged — full order amount settled

  // NEW — only meaningful when the order's isPreorder is true:
  "isDepositConfirmed": true    // FR-018
}
```

### Response body

Returns the updated `Order` (same extended shape as the POST response above).

## GET /api/orders, GET /api/orders/track/:hash

No request/response shape changes beyond the new `Order` fields already listed above (`shippingAddress`, `isPreorder`, `depositAmount`, `isDepositConfirmed`) — both endpoints return the same extended `ApiOrder`/`Order` shape.

## Product read/write endpoints (`GET/POST/PATCH /api/products*`)

One new field flows through the existing `ApiProduct` contract (`lib/products-api.ts:31-51`), no shape restructuring:

```jsonc
{
  // ...existing ApiProduct fields...
  "preorderEligible": false   // NEW, staff-set (FR-001)
}
```
