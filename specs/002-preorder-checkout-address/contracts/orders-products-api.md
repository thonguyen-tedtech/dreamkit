# External API Contract (consumed, not owned)

This repository does not implement or modify these endpoints — they run on the
separate NestJS backend (dev: `http://localhost:8000`, Swagger UI at `/api/docs`,
machine-readable spec at `/api/docs-json`). This document pins down the exact
subset of that live contract this feature's frontend code depends on, as verified
against the running server on 2026-08-06, so the frontend mapping layers
(`lib/products-api.ts`, `lib/orders-api.ts`) have a source of truth to code against
and to catch drift in code review.

## `GET /api/products` (`ProductsController_findAll`)

Response items are not formally schema'd in Swagger (`PaginatedProductsResponseDto.data`
is typed as a loose `object[]`), but per `CreateProductDto`/`UpdateProductDto` the
product resource includes:

```jsonc
{
  // ...existing fields (name, price, category, colors, primaryColor, image, type,
  // isNew, stock, images, collectionName, collectionImages, collectionPosition,
  // videoUrl) unchanged...
  "isPreOrder": true // boolean, optional/absent on products not marked pre-order
}
```

**Frontend contract**: `lib/products-api.ts`'s `ApiProduct` interface gains
`readonly isPreOrder?: boolean`, and the product mapping function passes it through
unchanged to `Product.isPreOrder`.

## `PATCH /api/products/:id` (`ProductsController_update`)

`UpdateProductDto` (live schema) includes `isPreOrder?: boolean`. Not sent by this
plan's frontend changes — no admin UI is built to toggle it in this slice (see
plan.md Scope Decisions). Documented here only so a future admin-toggle plan knows
the field is already accepted by the backend.

## `POST /api/orders` (`OrdersController_create`)

Live `CreateOrderDto`, relevant fields:

```jsonc
{
  "items": [ // required, minItems 1
    { "productId": "string", "quantity": 1, "color": "string", "size": "string" }
  ],
  "paymentMethod": "cash", // required, enum: "bank" | "cash"
  "address": "string",     // REQUIRED, maxLength 500 — "Delivery address. Required for every order."
  "discount": 0,            // optional, number >= 0
  "discountCode": "string", // optional, maxLength 50
  "name": "string",         // optional unless no auth session, maxLength 100
  "phone": "string",        // optional unless no auth session, maxLength 30
  "email": "string",        // optional, email format
  "note": "string"          // optional, maxLength 2000
}
```

**Frontend contract — breaking discovery**: `address` is required on every order
today, but `lib/orders-api.ts`'s `CreateOrderInput` and `components/cart/checkout-panel.tsx`
currently never populate it. This plan:

1. Adds `readonly address: string` (required) to `CreateOrderInput`.
2. Adds an `address` input to `checkout-panel.tsx`'s form + `checkoutFormSchema`
   (required, ≤500 chars), pre-filled from `AuthUser.address` when signed in.
3. Adds an `address` field to the new pre-order form (required, ≤500 chars), same
   pre-fill behavior.
4. Both call paths pass `address` through to `createOrder(...)` → `createOrderApi(...)`
   → this endpoint.

**Pre-order form's specific payload** (single-item order, no discount, fixed payment
method since the form has no payment-method selector):

```jsonc
{
  "items": [{ "productId": "<product.id>", "quantity": "<form.quantity>", "color": "<form.color>", "size": "<form.size>" }],
  "paymentMethod": "cash",
  "address": "<form.address>",
  "name": "<form.name>",
  "phone": "<form.phone>",
  "note": "<form.note || undefined>"
}
```

## `GET /api/orders`, `GET /api/orders/:id`, `GET /api/orders/track/:hash`

Not formally schema'd in Swagger (same loose-`object` pattern as the products list),
but the existing `ApiOrder`/`mapApiOrderToOrder` in `lib/orders-api.ts` already
treats `name`/`phone`/`email`/`note` as present-if-set, round-tripped from what was
sent on create. This plan adds `address` to that same set:

```jsonc
{
  // ...existing fields (_id, user, items, status, totalAmount, discount,
  // discountCode, discountPercent, paymentMethod, isPaid, hash, name, phone,
  // email, note, createdAt, updatedAt) unchanged...
  "address": "string" // optional/absent on orders placed before this feature shipped
}
```

**Frontend contract**: `ApiOrder.address?: string`, mapped to `Order.address?: string`
in `mapApiOrderToOrder`. Displayed in `components/orders/order-tracker.tsx` and
`components/admin/order-manager.tsx`, mirroring the existing `{order.note ? ... :
null}` block already present in both files.

## `PATCH /api/products/:id` — no change needed for `stock`/status logic

No contract change; documented only to note that `isPreOrder` and `stock` are
independent fields per spec.md — the frontend must not derive one from the other.
