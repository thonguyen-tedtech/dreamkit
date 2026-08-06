# Quickstart: Validate Pre-Order Display & Checkout Delivery Address

Validates the frontend slice described in [plan.md](./plan.md) against the live
backend. See [data-model.md](./data-model.md) for field details and
[contracts/orders-products-api.md](./contracts/orders-products-api.md) for the exact
request/response shapes involved.

## Prerequisites

- Backend API running locally at `http://localhost:8000` (Swagger UI at
  `http://localhost:8000/api/docs`) with `NEXT_PUBLIC_API_URL` pointed at it.
- Frontend dev server: `npm run dev` (or the project's equivalent script).
- Admin credentials for marking a product `isPreOrder` via the API (no admin UI for
  this in scope — use `PATCH /api/products/:id` directly from Swagger UI, or the DB,
  with `{ "isPreOrder": true }`).
- At least one existing product's ID to mark, plus one regular (non-pre-order)
  product for the negative-case checks.

## Scenario 1 — Pre-order status displays instead of stock status

1. Via Swagger UI (`/api/docs`), `PATCH /api/products/:id` with
   `{ "isPreOrder": true }` for a chosen product.
2. Open that product's detail page (`/shop/:id`) in the storefront.
   - **Expect**: status line shows "Đặt trước" (Pre-order), not "Còn hàng"/"Hết hàng".
   - **Expect**: the purchase button reads "Đặt trước" (Pre-order), not
     "Thêm vào giỏ" (Add to Cart), regardless of `stock` value.
3. Open the catalogue page (`/catalogue` or equivalent) and locate that product's card.
   - **Expect**: the card shows a "Đặt trước" button (not present on regular cards).
4. Open a different, non-pre-order product's detail page and catalogue card.
   - **Expect**: unchanged — normal in-stock/out-of-stock status, "Thêm vào giỏ"
     button on the detail page, no button on the catalogue card (matches today's
     baseline behavior).

## Scenario 2 — Pre-order form submits a real order

1. From the pre-order product's detail page (or catalogue card), click "Đặt trước".
   - **Expect**: a modal/form opens with size, color, quantity, name, phone,
     address, note fields. Only network activity visible so far is the initial page
     load — the form component should not have been in the catalogue route's initial
     JS bundle (verify: form component is dynamically imported, e.g. check the
     Network tab for a separate chunk request on open, or check `next build` output
     for a route-level bundle that doesn't include `pre-order-form`).
2. Submit with the address field left empty.
   - **Expect**: submission is blocked with a field-level "address is required" error
     (mirrors `checkoutFormSchema`'s validation pattern).
3. Fill in all fields (pick a size/color, quantity ≥1, name, phone, a delivery
   address, optional note) and submit.
   - **Expect**: a `POST /api/orders` request fires with `items: [{ productId,
     quantity, color, size }]`, `paymentMethod: "cash"`, `address`, `name`, `phone`,
     `note` (per contracts doc) — inspect via browser DevTools Network tab or backend
     logs.
   - **Expect**: success — response is 201/200, form closes or shows a confirmation,
     and the created order is retrievable via `GET /api/orders/track/:hash`
     (returned in the response) or in the admin order list.
4. Open the resulting order in `components/admin/order-manager.tsx` (admin UI) and
   via the customer-facing order tracker (`/track-order?hash=...`).
   - **Expect**: the delivery address entered in step 3 is visible in both views.

## Scenario 3 — Regular checkout now sends and displays address (bug fix)

1. Add a regular (non-pre-order) product to the cart and proceed to checkout.
   - **Expect**: the checkout form now includes a delivery address field (in
     addition to the existing name/phone/email/note/payment-method fields).
   - **Expect**: if signed in with an account that has a saved `address`, the field
     is pre-filled but remains editable.
2. Leave address empty and submit.
   - **Expect**: blocked with a field-level "address is required" error.
3. Fill in address and submit.
   - **Expect**: `POST /api/orders` now includes `address` in its body (previously
     omitted — verify via Network tab this is no longer a 400).
   - **Expect**: order succeeds; address is visible on the resulting order in both
     the admin order detail view and the customer order-tracking view.

## Automated checks

- `npm run typecheck` (`tsc --noEmit`) — new `isPreOrder`/`address` fields must not
  introduce type errors across `lib/`, `components/product/`, `components/cart/`.
- `npm run lint` (`eslint`).
- `vitest run` — extend `lib/orders-api.test.ts` to cover `address` in
  `CreateOrderInput`/`mapApiOrderToOrder`; add a test file for the new pre-order
  form schema (`pre-order-form.schema.test.ts`) covering required-field validation.
- `next build` — confirm the pre-order form is not part of the catalogue/product
  route's initial JS chunk (Constitution II).
