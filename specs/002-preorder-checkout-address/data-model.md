# Phase 1 Data Model: Pre-Order Display & Checkout Delivery Address (Frontend Slice)

This repository has no backend/database — "data model" here means the frontend
TypeScript types that mirror the live API contract (`lib/types.ts`) and the mapping
layers that translate the wire shape into them (`lib/products-api.ts`,
`lib/orders-api.ts`). No new entities are introduced; two existing entities gain
fields.

## Entity: Product (`lib/types.ts`)

| Field | Type | Change | Notes |
|---|---|---|---|
| `isPreOrder` | `boolean` | **new, optional** | Mirrors live `UpdateProductDto`/`CreateProductDto`. Treat `undefined` as `false` (not pre-order), same convention as `stock === undefined` meaning "in stock" today. |

Derived display status (not a stored field, computed in the two components that
render it):

```
status =
  isPreOrder            → "Pre-order" ("Đặt trước")
  else stock === 0      → "Out of Stock" ("Hết hàng")
  else                  → "In Stock" ("Còn hàng")
```

`isPreOrder` takes precedence over stock count, per spec.md Edge Cases ("continues
to display as Pre-order until an admin explicitly clears the flag; not automatically
removed by stock changes").

### `ApiProduct` (`lib/products-api.ts`) — wire shape

| Field | Type | Change |
|---|---|---|
| `isPreOrder` | `boolean \| undefined` | **new**, added to the interface and to the `mapApiProductToProduct` (or equivalently-named) mapping function, passed through unchanged like `stock`. |

`ProductInput` (used by `createProductApi`/`updateProductApi`) is **not** changed in
this plan — no admin UI is being built to set `isPreOrder` in this slice (see plan.md
Scope Decisions), so the create/update path doesn't need to send it yet. (If a future
admin toggle is added, `ProductInput` already derives from `Omit<Product, "id">`, so
it will pick up `isPreOrder` automatically once the type gains the field.)

## Entity: Order (`lib/types.ts`)

| Field | Type | Change | Notes |
|---|---|---|---|
| `address` | `string` | **new, required-at-creation, optional-on-read** | Modeled as `readonly address?: string` on the `Order` display type (an order fetched from the backend should always have one going forward, but existing pre-feature orders won't, so the type stays optional to avoid a false non-null guarantee). |

### `ApiOrder` (`lib/orders-api.ts`) — wire shape

| Field | Type | Change |
|---|---|---|
| `address` | `string \| undefined` | **new**, added alongside the existing optional `name`/`phone`/`email`/`note` fields; mapped through in `mapApiOrderToOrder`. |

### `CreateOrderInput` (`lib/orders-api.ts`) — request shape

| Field | Type | Change | Notes |
|---|---|---|---|
| `address` | `string` | **new, required** | Matches live `CreateOrderDto.required = ["items","paymentMethod","address"]`. Unlike `name`/`phone` (optional unless guest), `address` is unconditionally required by the backend for every order — guest or signed-in. |

No changes to `CreateOrderItemInput`, `OrderLine`, or `OrderStatus` — the backend has
no per-line pre-order flag today (confirmed absent from `CreateOrderItemDto`), so
`OrderLine` is unchanged in this plan (see plan.md Scope Decisions).

## New: Pre-order form state (component-local, not a persisted entity)

Lives entirely inside the new `components/product/pre-order-form.tsx` +
`pre-order-form.schema.ts`; not part of `lib/types.ts` since it never round-trips
through a GET — it's write-only input that gets translated into a `CreateOrderInput`
on submit.

```ts
// pre-order-form.schema.ts (zod) — mirrors checkout.schema.ts conventions
{
  name: string (max 100, required — pre-order form has no "guest vs signed-in"
                relaxation; always collected directly in the form)
  phone: string (max 30, required)
  address: string (max 500, required)
  note: string (max 2000, optional)
  size: ProductSize (required — reuses PRODUCT_SIZES)
  color: ColorKey (required — reuses product.colors)
  quantity: number (min 1, required)
}
```

On submit, this maps 1:1 to:

```ts
createOrder({
  items: [{ productId: product.id, quantity, color, size }],
  paymentMethod: "cash", // pre-order form has no payment method selector — see contracts doc
  name, phone, address, note,
})
```

## Validation Rules Summary (sourced from the live `CreateOrderDto`/`CreateProductDto`)

| Field | Rule | Source |
|---|---|---|
| `address` | required, string, ≤500 chars | live `CreateOrderDto.address` |
| `name` | ≤100 chars (required in pre-order form; required-if-guest in checkout form, existing behavior unchanged) | live `CreateOrderDto.name` + existing `checkout.schema.ts` |
| `phone` | ≤30 chars (same conditional-required pattern as `name`) | live `CreateOrderDto.phone` |
| `note` | ≤2000 chars, optional | live `CreateOrderDto.note`, existing `checkout.schema.ts` |
| `isPreOrder` | boolean, no validation (read-only in this slice) | live `UpdateProductDto.isPreOrder` |

## State Transitions

None — `isPreOrder` is read-only in this slice (no admin toggle built), and a
submitted pre-order becomes a normal `Order` with the existing `OrderStatus`
lifecycle (`pending` → ... ) already handled by `admin/order-manager.tsx`. No new
states are introduced.
