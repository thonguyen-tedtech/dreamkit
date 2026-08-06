---

description: "Task list template for feature implementation"
---

# Tasks: Pre-Order Display & Checkout Delivery Address (Frontend Slice)

**Input**: Design documents from `/specs/002-preorder-checkout-address/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/orders-products-api.md, quickstart.md

**Tests**: Not explicitly requested in spec.md. A small number of test tasks are still
included because they extend an existing, already-tested file (`lib/orders-api.test.ts`)
and cover the one new validation-bearing artifact (the pre-order form's zod schema) —
kept minimal, not a full TDD suite.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing. Per `plan.md`'s Scope Decisions, only **User Story 1** (delivery address
at checkout) and **User Story 2** (pre-order display + acquisition) from `spec.md` are
in scope for this plan; **User Story 3** (admin pre-order management) is out of scope —
the backend has no supporting fields for it yet.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths are included in every task description

## Path Conventions

Single Next.js project at repository root (per `plan.md`'s Project Structure) — no
`backend/`/`frontend/` split, no new top-level directories.

---

## Phase 1: Setup

**Purpose**: Confirm the environment this plan depends on before touching code

- [X] T001 Confirm the local backend at `NEXT_PUBLIC_API_URL` is reachable and its
      live Swagger contract (`/api/docs-json`) still matches `contracts/orders-products-api.md`
      — specifically that `Product` accepts `isPreOrder: boolean` and `POST /api/orders`
      still requires `address` (maxLength 500). No file changes; abort/re-plan if the
      contract has drifted.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Delivery-address plumbing through the shared order types/API layer.
Both US1 (checkout) and US2 (pre-order form, which reuses order creation) send
`address` on every order, so this must land before either story's UI work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `readonly address?: string` to the `Order` interface in `lib/types.ts`
- [X] T003 Add `readonly address?: string` to the `ApiOrder` interface in
      `lib/orders-api.ts` and map it through in `mapApiOrderToOrder` (alongside the
      existing `note`/`phone`/`email` mapping)
- [X] T004 Add required `readonly address: string` to the `CreateOrderInput`
      interface in `lib/orders-api.ts` (per `contracts/orders-products-api.md`,
      `CreateOrderDto.required` includes `address`)
- [X] T005 [P] Extend `lib/orders-api.test.ts`: assert `address` is included in the
      request body built by `createOrderApi`, and that `mapApiOrderToOrder` maps a
      response's `address` field onto `Order.address`

**Checkpoint**: `CreateOrderInput`/`ApiOrder`/`Order` all carry `address`; ready for
both US1 and US2 UI work.

---

## Phase 3: User Story 1 - Provide a delivery address at checkout (Priority: P1) 🎯 MVP

**Goal**: Checkout (cart flow) requires a delivery address, persists it with the
order, pre-fills it from the signed-in account when available, and displays it on
the admin order detail view and the customer order-tracking view.

**Independent Test**: Complete checkout with an address filled in, confirm the order
succeeds and the address is stored; leave it blank and confirm a field-level error
blocks submission; open the resulting order in both the admin view and order tracker
and confirm the address is visible. (Quickstart Scenario 3.)

### Implementation for User Story 1

- [X] T006 [US1] Add `address: z.string().min(1, "...").max(500, "...")` (required,
      Vietnamese error messages matching existing fields) to `checkoutFormSchema` in
      `components/schemas/checkout.schema.ts`
- [X] T007 [US1] In `components/cart/checkout-panel.tsx`: add an address `<input>`
      (or `<textarea>`) using the existing `INPUT_CLASS`/error-display pattern, add
      `address: user?.address ?? ""` to the form's `defaultValues` and to the
      sign-in `useEffect`'s `setValue` calls (pre-fill, still editable), and include
      `address: data.address.trim()` in the object passed to `createOrder(...)`
      (depends on T002, T004, T006)
- [X] T008 [US1] In `components/orders/order-tracker.tsx`: display `order.address`
      when present, mirroring the existing `{order.note ? ... : null}` block
      (depends on T002)
- [X] T009 [US1] In `components/admin/order-manager.tsx`: display `order.address`
      when present, mirroring the existing `{order.note ? ... : null}` block
      (depends on T002)

**Checkpoint**: User Story 1 is fully functional and independently testable —
checkout now requires and persists a delivery address, visible on both admin and
customer-facing views.

---

## Phase 4: User Story 2 - Purchase a product that is available for pre-order (Priority: P2)

**Goal**: Products flagged `isPreOrder` show a distinct "Pre-order" status (instead
of in-stock/out-of-stock) on the product detail page and catalogue card, with a
"Pre-order" button in place of "Add to Cart" that opens a form (size, color,
quantity, name, phone, address, note) and submits a real order via the existing
order-creation flow.

**Independent Test**: Mark a product `isPreOrder: true` via the API, confirm its
detail page and catalogue card show "Pre-order" status/button instead of stock
status/Add to Cart; confirm a non-pre-order product is unchanged; submit the
pre-order form and confirm a real order is created and visible (with its address)
in the admin view and order tracker. (Quickstart Scenarios 1 & 2.)

### Implementation for User Story 2

- [X] T010 [P] [US2] Add `readonly isPreOrder?: boolean` to the `Product` interface
      in `lib/types.ts`
- [X] T011 [P] [US2] Add `readonly isPreOrder?: boolean` to the `ApiProduct`
      interface in `lib/products-api.ts` and pass it through unchanged in the
      product-mapping function (same treatment as `stock`)
- [X] T012 [P] [US2] Create `components/product/pre-order-form.schema.ts`: zod
      schema for `{ name, phone, address, note, size, color, quantity }` per
      `data-model.md`'s "Pre-order form state" section (name ≤100 required, phone
      ≤30 required, address ≤500 required, note ≤2000 optional, size from
      `PRODUCT_SIZES`, color from the product's `colors`, quantity ≥1), mirroring
      `checkout.schema.ts`'s style — implemented as zod validation for the free-text
      fields only (name/phone/address/note); size/color/quantity are controlled UI
      selectors (buttons/stepper), matching how product-detail-view.tsx already
      handles them outside the form
- [X] T013 [US2] Create `components/product/pre-order-form.tsx`: a modal form using
      react-hook-form + the T012 schema, reusing the existing `ColorSwatches`,
      `PRODUCT_SIZES` picker, and `QuantityStepper` for size/color/qty; pre-fills
      `name`/`phone`/`address` from the signed-in `AuthUser` (editable); on submit
      calls `useStore().createOrder({ items: [{ productId, quantity, color, size }],
      paymentMethod: "cash", address, name, phone, note })` per
      `contracts/orders-products-api.md`'s pre-order payload shape; shows a
      confirmation and closes on success, shows the create error otherwise (depends
      on T004, T010, T012)
- [X] T014 [P] [US2] In `components/product/product-detail-view.tsx`: compute status
      as `isPreOrder → "Pre-order"`, else existing in-stock/out-of-stock logic (per
      `data-model.md`'s precedence rule); when `product.isPreOrder`, render a
      "Đặt trước" button instead of the existing "Thêm vào giỏ" button, loading
      `pre-order-form.tsx` via `next/dynamic` (`ssr: false`) and opening it on click
      (depends on T010, T013)
- [X] T015 [P] [US2] In `components/product/product-card.tsx`: when
      `product.isPreOrder`, render a "Đặt trước" button (loaded via `next/dynamic`,
      same as T014) opening the pre-order form; non-pre-order cards remain
      unchanged (no button, matching current behavior) (depends on T010, T013)
- [X] T016 [P] [US2] Add `components/product/pre-order-form.schema.test.ts`
      covering the T012 schema's required-field and max-length validation
      (depends on T012)

**Checkpoint**: User Story 1 AND 2 both work independently — pre-order products are
visually distinct and purchasable through the new form, without disturbing regular
in-stock/out-of-stock products or the normal cart/checkout flow.

---

## Phase 5: Admin Pre-Order Toggle (Follow-up, Priority: P3, partial US3)

**Added after initial implementation**, per explicit user request: "add toggle
button to set isPreOrder of product in product management page." This is the
narrow slice of `spec.md`'s User Story 3 that the live backend already supports
(FR-006, plain boolean flag) — it does **not** add the expected-availability-date
(FR-007/FR-008) or per-order-line pre-order flag / admin order-list filtering
(FR-009, FR-012–FR-014), which remain out of scope per `plan.md`'s Scope Decisions
(no backend support confirmed).

**Goal**: An admin can flip a product's pre-order eligibility directly from the
product management table, without needing to open the full edit form.

**Independent Test**: In `/admin/products`, click the pre-order toggle on a
product's row; confirm the state flips immediately, persists (`PATCH
/api/products/:id`), and is reflected on that product's storefront pages (status
badge + button from Phase 4).

### Implementation for Phase 5

- [X] T021 [US3] In `components/admin/product-manager.tsx`: add
      `isPreOrder: false` to `EMPTY_PRODUCT` and `isPreOrder: product.isPreOrder`
      to `toInput()`, so the existing full-form save path (create/update) doesn't
      silently drop the flag
- [X] T022 [US3] In `components/admin/product-manager.tsx`: add a "Đặt trước"
      column to the product table with an inline toggle button per row; clicking
      it calls `updateProductApi(accessToken, product.id, { isPreOrder:
      !product.isPreOrder })` directly (partial update, no need to open the edit
      form), shows a per-row pending state, refreshes the product list, and shows
      a toast on success/failure (depends on T021)
- [X] T023 [P] [US3] Manually verify via quickstart.md-style check: toggle a
      product on in the admin table, confirm its `/shop/:id` and `/shop` card
      immediately show "Đặt trước" (Phase 4's existing logic), toggle it back off,
      confirm it reverts to normal stock status. NOT visually verified live — no
      admin credentials available in this session; user opted to skip live
      verification and spot-check manually. Verified instead via: `tsc --noEmit`
      clean, `vitest run` 132/132 passing, and code review confirming the toggle
      reuses the exact `updateProductApi` call path already exercised by the
      existing edit-form save (which mutation is well-tested indirectly via
      `lib/products-api.test.ts`), and that Phase 4's status-precedence logic
      (`product.isPreOrder === true` → "Đặt trước") already reads whatever value
      the API returns, with no new branch introduced.

**Checkpoint**: Admins can self-serve pre-order eligibility without needing direct
API/Swagger access, closing the gap noted in `plan.md`'s original Scope Decisions.

---

## Phase 6: Relocate Pre-Order Button to Catalogue (Follow-up, US2 revision)

**Added after initial implementation**, per explicit user request: "show pre-order
button in catalogue instead of homepage and shop page." Phase 4 originally put the
button on `ProductCard` (used by the homepage's `ShopSection`, the `/shop` grid via
`ShopCatalog`, and the `RelatedProducts` carousel on the product detail page). This
phase moves it to the `/catalogue` collection-gallery page instead. The product
detail page's own pre-order button (`product-detail-view.tsx`, Phase 4) was left
unchanged — it's the actual purchase page, not a listing grid, and wasn't named in
the request.

**Goal**: The "Đặt trước" button appears only on `/catalogue`, resolved per
collection from its representative product's `isPreOrder` flag; it no longer
appears on the homepage, `/shop`, or the product-detail page's related-products
carousel.

**Independent Test**: With a product flagged `isPreOrder`, confirm its
collection's CTA row on `/catalogue` shows "Đặt trước" and opens the working form;
confirm that same product's card shows no button on the homepage, `/shop`, and the
related-products carousel.

### Implementation for Phase 6

- [X] T024 [US2] Add `readonly isPreOrder?: boolean` to `CatalogueCollection` in
      `lib/types.ts`, and set it from the representative product in
      `buildCatalogueCollectionsFromProducts` (`lib/catalogue.ts`)
- [X] T025 [US2] In `components/catalogue/collection-section.tsx`: make it a
      client component, resolve the full `Product` via `useStore()` +
      `collection.productId` when `collection.isPreOrder`, and render a "Đặt
      trước" button in the existing CTA row (alongside "Xem chi tiết sản phẩm",
      not replacing it) that opens the existing `pre-order-form.tsx` (lazy-loaded
      via `next/dynamic`, same pattern as Phase 4) (depends on T024)
- [X] T026 [US2] Revert `components/product/product-card.tsx` to remove the
      pre-order button, `isPreOrderFormOpen` state, and `PreOrderForm` dynamic
      import added in Phase 4 — this removes the button from every page that
      renders `ProductCard` (homepage, `/shop`, related-products carousel)

**Checkpoint**: Verified live against the dev server — the pre-order button and
working form now appear only on `/catalogue`; homepage, `/shop`, and the affected
product's card render unchanged (no button), confirmed via screenshots and no
console errors. `tsc --noEmit` clean, `vitest run` 132/132 passing.

---

## Phase 7: Surface Pre-Order Lines in Order Management (Follow-up, closes FR-014)

**Added after initial implementation**, per explicit user request: "show
pre-order in order management." Discovered during Phase 4/6 live verification
that the live backend already computes and returns a per-order-line `isPreOrder`
flag on order creation/read (`item.isPreOrder`) — contradicting the original
`research.md` finding that no such field existed. This phase wires that
already-live field through to the admin order list, closing spec.md's FR-014
("identify, from the order list, which orders contain at least one pre-order
line without opening each order individually") without any new backend work.

**Goal**: Admins can see, at a glance in `/admin/orders`, which orders contain a
pre-order line, and which specific line(s) within an order were pre-ordered.

**Independent Test**: Place an order for a product flagged `isPreOrder`; confirm
its card in `/admin/orders` shows a "Có đặt trước" badge and the specific line
shows a "Đặt trước" tag, without opening any detail view.

### Implementation for Phase 7

- [X] T027 [US3] Add `readonly isPreOrder?: boolean` to `OrderLine` in
      `lib/types.ts`
- [X] T028 [US3] Add `readonly isPreOrder?: boolean` to `ApiOrderItem` in
      `lib/orders-api.ts` and map it through in `mapOrderItem` (depends on T027)
- [X] T029 [P] [US3] Extend `lib/orders-api.test.ts` with a test asserting
      `mapApiOrderToOrder` maps a line's `isPreOrder` flag (depends on T028)
- [X] T030 [US3] In `components/admin/order-manager.tsx`: add an order-level
      "Có đặt trước" badge (shown when `order.lines.some(line =>
      line.isPreOrder)`) alongside the existing payment-method/paid-status
      badges, and a per-line "Đặt trước" tag next to any line where
      `line.isPreOrder` is true (depends on T027)

**Checkpoint**: Verified end-to-end against the live backend — a real order
placed for a pre-order product returns `items[0].isPreOrder: true` from
`POST /api/orders`, which flows unchanged through `mapOrderItem` into
`OrderLine.isPreOrder`. Not visually confirmed in the admin UI itself (no admin
credentials in this session, consistent with Phase 5's T023) — confirmed instead
via live API response inspection plus code review of the (type-checked, tested)
render logic. `tsc --noEmit` clean, `vitest run` 133/133 passing.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Constitution compliance and end-to-end verification across both stories

- [X] T017 [P] Run `next build` and confirm `pre-order-form.tsx` (and its
      react-hook-form/zod resolver weight) is not part of the catalogue or product
      detail route's initial JS chunk — verifies the `next/dynamic` lazy-loading in
      T014/T015 actually took effect (Constitution II). Build succeeded; the form's
      code was located in its own small chunk files (not the shared bundle) via
      content search on the build output.
- [X] T018 [P] Review the product detail page's `Product`/`Offer` JSON-LD
      (Constitution III) so a pre-order product's `availability` doesn't misreport
      `InStock`/`OutOfStock`; adjust if it currently derives solely from `stock`.
      Found: no `Product`/`Offer` JSON-LD exists anywhere in this codebase today
      (pre-existing gap, unrelated to this feature) — nothing to adjust.
- [X] T019 Run all `quickstart.md` scenarios (1, 2, 3) end-to-end against the local
      backend and record results. Scenario 3 (checkout address) fully verified via
      live browser UI: empty-address validation blocks submission, filled form
      submits successfully (201), address displays on the order-tracking view.
      Scenario 2 (pre-order form → order) verified at the API-contract level (the
      exact payload the form sends was POSTed directly and returned 201 with the
      address echoed back). Scenario 1 (pre-order status/button) verified by code
      review + confirming a non-pre-order product renders unchanged in the browser;
      NOT visually confirmed with an actual `isPreOrder: true` product, since none
      exist in the live dev DB and setting one requires admin credentials not
      available in this session.
- [X] T020 Run `tsc --noEmit`, `eslint`, and `vitest run` across the full repo to
      confirm no regressions from T002–T016 (Constitution V gate). `tsc --noEmit`:
      clean. `vitest run`: 132/132 passing across 20 files. `eslint`: repo has no
      ESLint config file at all (pre-existing gap, not introduced by this change) —
      could not run.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS both user stories (both send
  `address` on order creation)
- **User Story 1 (Phase 3)**: Depends on Foundational only — no dependency on US2
- **User Story 2 (Phase 4)**: Depends on Foundational only — no dependency on US1's
  checkout-panel/order-tracker/order-manager changes (US2 uses its own new form, not
  the cart checkout form), though it reuses the same `CreateOrderInput.address` and
  `useStore().createOrder` plumbing landed in Phase 2
- **Polish (Final Phase)**: Depends on both US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent of US2 — can ship alone as the MVP
- **User Story 2 (P2)**: Independent of US1's specific UI changes, but relies on the
  same Phase 2 `address` plumbing (not on US1's checkout-panel/order-tracker/
  order-manager edits themselves)

### Within Each User Story

- US1: schema (T006) → form wiring (T007) → display (T008, T009 can run parallel to
  each other and to nothing else, since they're read-only display additions)
- US2: type/schema tasks (T010, T011, T012, all [P]) → form component (T013) →
  button wiring in the two display components (T014, T015, both [P], both depend on
  T013) → schema tests (T016, [P], depends only on T012)

### Parallel Opportunities

- T005 (test) can run in parallel with nothing else in Phase 2 (it depends on
  T002–T004 all landing first) but is independent of any US1/US2 work
- T008 and T009 (Phase 3) can run in parallel — different files, both read-only
- T010, T011, T012 (Phase 4) can run in parallel — different files, no
  interdependencies
- T014 and T015 (Phase 4) can run in parallel once T013 lands — different files
- T016 can run in parallel with T013/T014/T015 once T012 lands
- User Story 1 (Phase 3) and User Story 2 (Phase 4) can be built in parallel by two
  developers once Phase 2 is done, since they touch disjoint files

---

## Parallel Example: User Story 2

```bash
# After T013 (pre-order-form.tsx) lands, launch together:
Task: "In components/product/product-detail-view.tsx: swap in Pre-order status/button"
Task: "In components/product/product-card.tsx: add Pre-order button for isPreOrder products"
Task: "Add components/product/pre-order-form.schema.test.ts covering required-field validation"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T005) — CRITICAL, blocks both stories
3. Complete Phase 3: User Story 1 (T006–T009)
4. **STOP and VALIDATE**: Run Quickstart Scenario 3 — checkout now requires and
   displays a delivery address
5. Ship — this alone fixes the currently-broken checkout (missing required `address`)

### Incremental Delivery

1. Setup + Foundational → address plumbing ready
2. Add User Story 1 → validate (Scenario 3) → ship (fixes checkout)
3. Add User Story 2 → validate (Scenarios 1 & 2) → ship (pre-order display + form)
4. Final Phase → Constitution/build verification → ship

### Parallel Team Strategy

With two developers, after Phase 2 (T002–T005) lands:

- Developer A: User Story 1 (T006–T009)
- Developer B: User Story 2 (T010–T016)

Both integrate cleanly since they touch disjoint files (`checkout-panel.tsx`/
`order-tracker.tsx`/`order-manager.tsx`/`checkout.schema.ts` vs. `product-detail-view.tsx`/
`product-card.tsx`/`pre-order-form.tsx`/`pre-order-form.schema.ts`).

---

## Notes

- [P] tasks touch different files with no unmet dependencies
- [Story] label maps each task to US1 or US2 for traceability against `spec.md`
- User Story 3 (admin pre-order management) is explicitly out of scope for this
  plan — no tasks generated for it (see `plan.md` Scope Decisions); a future plan
  can add it once the backend supports an expected-availability-date and a
  per-order-line pre-order flag
- Commit after each task or logical group
- Stop at either checkpoint (end of Phase 3, end of Phase 4) to validate that story
  independently before continuing
