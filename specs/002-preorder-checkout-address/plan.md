# Implementation Plan: Pre-Order Display & Checkout Delivery Address (Frontend Slice)

**Branch**: `002-preorder-checkout-address` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-preorder-checkout-address/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This plan covers a **frontend-only** slice of the broader spec, scoped down after
clarification with the requester (see Scope Decisions below). It ships:

1. **Pre-order display**: read the already-live backend field `Product.isPreOrder`
   (confirmed via the running API's Swagger contract) and show a "Pre-order" status
   on the product detail page and catalogue card instead of "In Stock"/"Out of Stock".
2. **Pre-order button + form**: for `isPreOrder` products, replace "Add to Cart" with
   a "Pre-order" button (product detail page and catalogue card) that opens a form
   collecting size, color, quantity, name, phone, delivery address, and note, and
   submits it as a regular order via the existing order-creation endpoint.
3. **Checkout delivery address (bug fix, folded in)**: while investigating the
   pre-order form's submission path, discovered the live backend's `POST /api/orders`
   already requires `address` (`required: ["items","paymentMethod","address"]`) but
   the existing checkout form never sends it — regular checkout is currently broken.
   This plan adds the address field to the existing checkout form too, since the new
   pre-order form reuses the same endpoint and needs it anyway.

### Scope Decisions (resolved via `/speckit-plan` clarification, not part of spec.md's original scope)

`spec.md` as written describes a larger feature (admin pre-order management with an
expected-availability-date, and a per-order-line pre-order flag surfaced on the admin
order list). Investigation against the live API showed the backend does **not**
support an expected-availability-date field or a per-line pre-order flag — only
`Product.isPreOrder: boolean` exists. Per explicit direction from the requester:

- **In scope**: User Story 2's display requirement (FR-010, read-only), plus a new
  pre-order acquisition flow (button → form → order) that stands in for "add to cart
  → checkout" for pre-order items, plus User Story 1 (delivery address at checkout,
  FR-001–FR-005), scoped to what the live backend actually accepts.
- **Out of scope** (left for a future plan once backend support exists): admin UI to
  toggle `isPreOrder` or set an expected date (FR-006–FR-008; product data is set
  directly via the API for now), per-order-line pre-order flag and admin order-list
  filtering (FR-009, FR-012–FR-014), and account-level saved-address management
  beyond the existing `User.address` field, which already exists and is reused as-is
  for pre-fill.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), Next.js 16 (App Router), React 19

**Primary Dependencies**: react-hook-form + zod (`@hookform/resolvers/zod`) for form
validation, matching the existing `checkout-panel.tsx` pattern; Tailwind CSS; shadcn/ui
primitives (`Button`, `Spinner`) already in use under `components/ui/`.

**Storage**: N/A — this repository is a Next.js frontend only. All persistence is via
the external NestJS API at the configured `NEXT_PUBLIC_API_URL` (dev: `localhost:8000`,
Swagger at `/api/docs`). No backend code lives in this repository or this plan.

**Testing**: Vitest (`vitest run`), existing pattern of colocated `*.test.ts` files
(e.g. `lib/orders-api.test.ts`, `lib/auth-validation.test.ts`).

**Target Platform**: Web (storefront + admin routes), mobile-first responsive.

**Project Type**: Web frontend (single Next.js app) consuming an external REST API.

**Performance Goals**: No new route; existing product/catalogue route LCP/INP/CLS
budgets (Constitution II) must not regress. The pre-order form is a modal shown on
demand, not part of initial paint.

**Constraints**: Pre-order form modal MUST be lazy-loaded (`next/dynamic`) since it's
below-the-fold / on-demand UI, per Constitution II. Delivery address is a single
free-text field (≤500 chars per the live `CreateOrderDto`), no structured
street/city/postal sub-fields, no geocoding — matching spec.md's Assumptions.

**Scale/Scope**: 2 existing components modified for status display (`product-detail-view.tsx`,
`product-card.tsx`), 1 existing form modified (`checkout-panel.tsx` + its zod schema),
1 new form/modal component (pre-order form), small additions to `lib/types.ts`,
`lib/products-api.ts`, `lib/orders-api.ts`. No new pages/routes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Feature-First, Domain-Driven Architecture** — PASS. All changes stay inside
  the existing `product`/`catalogue` and `cart`/`checkout` domains (`components/product/*`,
  `components/cart/*`, `lib/products-api.ts`, `lib/orders-api.ts`). The new pre-order
  form lives under `components/product/` (product-initiated flow) and depends inward
  on the existing `useStore().createOrder` — no new cross-domain reach-ins.
- **II. Performance Budget & Lazy-Loading by Default** — PASS, conditionally. The new
  pre-order form modal MUST be loaded via `next/dynamic` from both the product detail
  page and the catalogue card, not bundled into the initial catalogue/product route
  payload. Re-verified in Phase 1 design.
- **III. SEO & Discoverability** — PASS, no change required. No new routes; existing
  `Product`/`Offer` JSON-LD on the product detail page should have its `availability`
  reviewed so a pre-order product doesn't misreport `InStock`/`OutOfStock` — tracked
  as a design note, not a new route.
- **IV. Observability** — PASS. Existing checkout-start/checkout-complete analytics
  pattern (if present) should be mirrored for pre-order form open/submit; no new
  logging infrastructure needed.
- **V. CI/CD Quality Gates** — PASS. No exception requested; `tsc --noEmit`, `eslint`,
  `vitest run`, `next build` all apply unchanged.

**Pre-existing deviation noted, not introduced by this plan**: the constitution's
Technology Stack section mandates React Query for server state and Zustand for
client UI state. The codebase actually uses a hand-rolled `StoreContext`
(`components/store/store-provider.tsx`) for both. This plan extends the existing
`StoreContext`/`useStore().createOrder` pattern rather than migrating state
management, since a migration is unrelated to this feature's scope and would be a
separate, deliberate change.

## Project Structure

### Documentation (this feature)

```text
specs/002-preorder-checkout-address/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── orders-products-api.md
├── checklists/
│   └── requirements.md  # Already validated (spec quality checklist)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
lib/
├── types.ts              # Product.isPreOrder, Order.address, OrderLine (unchanged)
├── products-api.ts        # ApiProduct.isPreOrder + mapping
├── orders-api.ts           # CreateOrderInput.address, ApiOrder.address + mapping
└── orders-api.test.ts       # extend for address field

components/
├── product/
│   ├── product-detail-view.tsx   # pre-order status text + button swap
│   ├── product-card.tsx          # pre-order status badge + button (catalogue)
│   ├── pre-order-form.tsx        # NEW: modal form (size/color/qty/name/phone/address/note)
│   └── pre-order-form.schema.ts   # NEW: zod schema, sibling to components/schemas/checkout.schema.ts
├── schemas/
│   └── checkout.schema.ts   # add `address` field
├── cart/
│   └── checkout-panel.tsx    # add address input, send in payload
└── store/
    └── store-provider.tsx     # createOrder passthrough (no signature change needed)

app/
├── shop/[id]/             # product detail route — no route change, component change only
└── catalogue/page.tsx      # no route change, ProductCard prop change only
```

**Structure Decision**: Single Next.js application (this repository). No backend
code is added or modified — the plan only consumes an already-deployed API surface.
Every change lives inside the existing `lib/` (API + types) and `components/`
(`product/`, `cart/`, `schemas/`) layers already used for this domain; no new
top-level directories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — table intentionally left empty.
