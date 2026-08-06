# Phase 0 Research: Pre-Order Display & Checkout Delivery Address (Frontend Slice)

All unknowns below were resolved by inspecting the live backend's Swagger contract
(`GET http://localhost:8000/api/docs-json`) and the current frontend source, not by
assumption. No `NEEDS CLARIFICATION` markers remain.

## 1. Does the backend actually support `isPreOrder` on Product?

- **Decision**: Yes — consume it as `isPreOrder: boolean` (optional/undefined treated
  as `false`, mirroring how `stock` is currently handled as optional).
- **Rationale**: `UpdateProductDto` and `CreateProductDto` in the live Swagger schema
  both define `isPreOrder: { type: "boolean", example: true }`. No default is
  documented, so the frontend must treat a missing value as "not pre-order" the same
  way it treats `stock === undefined` as "in stock" today (`product-detail-view.tsx:72`).
- **Alternatives considered**: Deriving pre-order status from `stock <= 0` was
  considered (and is spec.md's Edge Cases explicitly reject this: "the flag is not
  automatically removed by stock changes"). Rejected — `isPreOrder` is an explicit,
  independent flag per the live schema and per spec.md's Assumptions.

## 2. Is there a separate expected-availability-date field?

- **Decision**: No such field exists on the backend today. Not implemented.
- **Rationale**: `UpdateProductDto`/`CreateProductDto` properties list (fetched live)
  contains exactly: `name, price, category, colors, primaryColor, image, type, isNew,
  stock, images, collectionName, collectionImages, collectionPosition, videoUrl,
  isPreOrder`. No `expectedAvailabilityDate`/`preOrderDate`/similar. Building UI for a
  field the API can't persist would silently no-op or 400; out of scope until the
  backend adds it.
- **Alternatives considered**: Store the date client-side only (e.g., in the note
  field) — rejected as a hack that fabricates data the backend doesn't own, and it
  contradicts spec.md's admin-Requirements framing (FR-007/FR-008 assume backend
  persistence and past-date validation, neither of which the API can do today).

## 3. What does "pre-order button" replace, and where?

- **Decision**: On the product detail page (`product-detail-view.tsx`), the existing
  "Thêm vào giỏ" (Add to Cart) button is replaced with a "Đặt trước" (Pre-order)
  button when `product.isPreOrder` is true. On the catalogue card
  (`product-card.tsx`), which today has **no purchase action at all** (verified: no
  "stock" or cart references in that file), a "Đặt trước" button is added, but only
  for `isPreOrder` products — non-pre-order cards are unchanged (still no button),
  since adding a general quick-add-to-cart affordance to every card is a separate,
  unrequested feature.
- **Rationale**: Matches the literal request ("show pre-order button instead of add
  to cart" / "in catalogue page, show pre-order button") without inventing new
  behavior for non-pre-order products.

## 4. What does clicking "Pre-order" do?

- **Decision**: Opens a modal form collecting `size`, `color`, `quantity`, `name`,
  `phone`, `address`, `note`, and on submit calls the existing order-creation flow
  (`useStore().createOrder` → `createOrderApi` → `POST /api/orders`) with a
  single-item order, exactly like `checkout-panel.tsx` does today for a cart of
  items — just with one item constructed from the form's size/color/qty instead of
  reading from the cart.
- **Rationale**: Explicit direction from the requester after clarifying that no
  dedicated pre-order/lead-capture endpoint exists on the backend; reusing
  `POST /api/orders` avoids inventing a new, unbuilt backend surface and produces a
  real order the admin can already see/manage (existing order list/detail views work
  unchanged).
- **Alternatives considered**: (a) Just relabel the existing "Add to Cart" button and
  route through the normal cart/checkout flow — rejected, requester explicitly wants
  a dedicated form, not the cart. (b) Local-only form with no network call — rejected,
  requester explicitly chose "reuse existing order creation API".

## 5. Checkout delivery address: is it actually missing, and does it block this feature?

- **Decision**: Yes on both counts — treat as in-scope, fold the fix into this plan.
- **Rationale**: Live `CreateOrderDto` schema has
  `required: ["items", "paymentMethod", "address"]` with
  `address: { type: "string", maxLength: 500, description: "Delivery address.
  Required for every order." }`. `components/cart/checkout-panel.tsx` and
  `lib/orders-api.ts`'s `CreateOrderInput` currently have no `address` field at all,
  so `createOrder(...)` omits a required field on every call — both the existing
  cart checkout and the new pre-order form (which reuses the same call) would 400
  without this fix. Confirmed by requester: fold the fix into this plan rather than
  filing it separately, since the pre-order form depends on it anyway.
- **Alternatives considered**: Fix only inside the new pre-order form and leave
  `checkout-panel.tsx` broken — rejected by requester as inconsistent (same
  underlying bug, same endpoint).

## 6. Does the backend return `address` on an order, for display?

- **Decision**: Assume yes, following the same pattern as `note`/`phone`/`email` —
  optional fields on `ApiOrder`, echoed back from the stored document.
- **Rationale**: The live Swagger schema does not formally type `GET /api/orders`
  responses (`"data": { "type": "object" }`-style, same as the Products list), so
  the exact response shape isn't statically declared. However `CreateOrderDto`
  accepts `name`/`phone`/`email`/`note` and `lib/orders-api.ts`'s existing
  `ApiOrder`/`mapApiOrderToOrder` already treats all four as present-if-set on read,
  matching how a Mongoose/Nest resource typically round-trips its own input fields.
  `address` is added to `ApiOrder`/`Order`/`mapApiOrderToOrder` the same way.
- **Alternatives considered**: Treat `address` as write-only and never display it —
  rejected; FR-005 in spec.md explicitly requires displaying delivery address on
  admin order detail and customer order tracking, and the requester's "fold address
  into this plan" answer implies full support, not a write-only stub.

## 7. Pre-fill behavior for delivery address

- **Decision**: Pre-fill from the already-existing `AuthUser.address` /
  `User.address` field when signed in, for both the checkout form and the pre-order
  form, remaining editable — mirroring the existing `name`/`phone`/`email` pre-fill
  pattern in `checkout-panel.tsx` (`useEffect` calling `setValue` from `user`).
- **Rationale**: `AuthUser.address?: string` already exists (`lib/types.ts:140`) and
  is populated at login/registration; no new account-level storage needed. Matches
  spec.md FR-004.
- **Alternatives considered**: None — this field already exists and the pattern to
  reuse it is already established in the same file.

## 8. Form/validation approach for the new pre-order form

- **Decision**: react-hook-form + zod, a sibling schema file
  (`components/product/pre-order-form.schema.ts`) modeled directly on
  `components/schemas/checkout.schema.ts`, reusing the same style (Vietnamese error
  messages, `.max()` limits mirrored from the live DTOs: name ≤100, phone ≤30,
  address ≤500, note ≤2000).
- **Rationale**: Matches Constitution I (feature-first, no competing patterns) and
  the existing `checkout-panel.tsx` precedent exactly; introduces zero new
  dependencies.
- **Alternatives considered**: Uncontrolled native form with manual validation —
  rejected, inconsistent with the one existing form in this domain.

## 9. Lazy-loading the pre-order form

- **Decision**: Load the pre-order form component via `next/dynamic` (client-only,
  `ssr: false`, no `loading` skeleton needed since it's an on-demand modal, not
  above-the-fold content) from both `product-detail-view.tsx` and `product-card.tsx`.
- **Rationale**: Constitution II requires below-the-fold/on-demand UI (modals) to be
  lazy-loaded; react-hook-form + zod resolver add non-trivial weight that
  non-pre-order product pages/cards shouldn't pay for.
- **Alternatives considered**: Always bundling the form — rejected, would inflate
  the catalogue route's initial JS payload (loaded on every card) for a UI element
  most visitors never open.
