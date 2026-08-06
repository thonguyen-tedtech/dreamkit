# Feature Specification: Pre-Order Purchasing & Checkout Delivery Address

**Feature Branch**: `[002-preorder-checkout-address]`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "implement pre-order feature and add address field in order form"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provide a delivery address at checkout (Priority: P1)

A customer (guest or signed in) checking out enters a delivery address alongside their existing contact details, so the store has somewhere to ship the order.

**Why this priority**: Today no order — guest or signed-in — captures any shipping address at all, so completed orders cannot reliably be delivered without a manual follow-up call. This is a foundational data gap that blocks fulfillment for every order, independent of pre-order support, and delivers value on its own.

**Independent Test**: Can be fully tested by completing checkout with a delivery address, then confirming the address is saved with the order and visible on both the admin order detail view and the customer order-tracking view.

**Acceptance Scenarios**:

1. **Given** a customer has filled in their cart and reached checkout, **When** they submit the order with a delivery address filled in, **Then** the order is created and the address is stored with it.
2. **Given** a customer reaches checkout and leaves the delivery address empty, **When** they try to submit, **Then** the system blocks submission and shows a field-level "address is required" error.
3. **Given** a signed-in customer has a saved address on their account, **When** they reach checkout, **Then** the address field is pre-filled with that saved value but remains editable for this specific order.
4. **Given** an order has been placed with a delivery address, **When** an admin opens that order's detail view, or the customer opens order tracking for it, **Then** the delivery address is displayed.

---

### User Story 2 - Purchase a product that is available for pre-order (Priority: P2)

A customer browsing the catalogue finds a product marked as available for pre-order (not currently in stock, or not yet released), adds it to their cart, and completes checkout for it the same way they would for any in-stock product.

**Why this priority**: This is the core new capability the feature is meant to deliver — letting the store take orders (and revenue) for products it can't ship immediately, rather than losing the sale. It depends on User Story 1 only in that checkout now also asks for an address; it does not depend on User Story 3.

**Independent Test**: Can be fully tested by flagging a product as pre-order-eligible, confirming it displays a "Pre-order" indicator instead of "In Stock"/"Out of Stock" on listing and detail pages, adding it to a cart, and completing checkout for it.

**Acceptance Scenarios**:

1. **Given** a product has been marked available for pre-order with an expected availability date, **When** a customer views its listing card or detail page, **Then** it shows a clearly distinguishable "Pre-order" status and the expected availability date, instead of "In Stock" or "Out of Stock".
2. **Given** a product is marked available for pre-order, **When** a customer adds it to their cart and completes checkout, **Then** the order is created successfully using the same checkout flow (including the delivery address from User Story 1), and the corresponding order line is recorded as a pre-order.
3. **Given** a cart contains both a pre-order item and a regular in-stock item, **When** the customer checks out, **Then** a single order is created containing both lines, with only the pre-order line marked as such.
4. **Given** an order line was purchased while its product was marked pre-order-eligible, **When** an admin later removes pre-order eligibility from that product, **Then** the already-placed order line still shows as a pre-order (the historical record does not change).

---

### User Story 3 - Manage and monitor pre-order products and orders (Priority: P3)

An admin marks which products are available for pre-order (with an optional expected availability date), and can see, from the order list, which orders contain pre-order items so they know which orders are waiting on stock.

**Why this priority**: Builds on User Story 2 by giving admins the day-to-day management and visibility they need to run the pre-order program (deciding what's eligible, tracking what's still pending). The store can still take pre-orders without this if eligibility is set directly in the data, but this is what makes the feature usable in practice.

**Independent Test**: Can be fully tested by toggling a product's pre-order eligibility and expected date on/off from the admin product form, and by confirming the admin order list/detail clearly flags orders containing pre-order lines.

**Acceptance Scenarios**:

1. **Given** an admin is editing a product, **When** they mark it as available for pre-order and optionally set an expected availability date, **Then** saving the product updates its status on customer-facing pages immediately.
2. **Given** an admin tries to set an expected availability date in the past, **When** they save, **Then** the system rejects the save with a validation error.
3. **Given** orders exist with and without pre-order lines, **When** an admin views the order list, **Then** orders containing at least one pre-order line are visibly distinguishable without opening each order individually.
4. **Given** an admin removes pre-order eligibility from a product, **When** they save, **Then** the product reverts to showing its regular in-stock/out-of-stock status based on its stock count.

---

### Edge Cases

- What happens when a customer leaves the delivery address blank? Checkout is blocked with a required-field validation error (same treatment as other required checkout fields).
- What happens when a product's stock count later becomes positive while it is still flagged pre-order-eligible? It continues to display as "Pre-order" until an admin explicitly clears the flag; the flag is not automatically removed by stock changes.
- What happens when an admin sets an expected availability date in the past? The save is rejected with a validation error.
- What happens when a cart mixes pre-order and in-stock items? They are combined into a single order; each order line independently records whether it was a pre-order at the time of purchase.
- What happens to pre-order status on an order line if the product is later deleted or its pre-order flag changes? The order line's own recorded pre-order flag is unaffected — it reflects the state at time of purchase, not the product's current state.
- What happens for a guest checkout (no account/saved address)? The address field starts empty and must be filled in manually; there is no saved value to pre-fill.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require a delivery address as part of checkout, for both guest and signed-in customers, before an order can be submitted.
- **FR-002**: System MUST persist the delivery address entered at checkout with the created order.
- **FR-003**: System MUST reject checkout submission with a field-level error when the delivery address is left empty.
- **FR-004**: System SHOULD pre-fill the checkout delivery address field with a signed-in customer's saved account address when one exists, while still allowing the customer to edit it for the current order.
- **FR-005**: System MUST display an order's delivery address on the admin order detail view and on the customer-facing order tracking view.
- **FR-006**: System MUST allow an admin to mark a product as available for pre-order, independent of its current stock count.
- **FR-007**: System MUST allow an admin to set and clear an optional expected availability date on a product marked available for pre-order.
- **FR-008**: System MUST reject saving a product with an expected availability date earlier than the current date.
- **FR-009**: System MUST allow an admin to remove pre-order eligibility from a product at any time; doing so MUST NOT change the pre-order status already recorded on existing order lines.
- **FR-010**: System MUST display a distinct "Pre-order" status (separate from "In Stock" and "Out of Stock") on product listing and detail pages for products flagged as pre-order-eligible, including the expected availability date when one is set.
- **FR-011**: System MUST allow a customer to add a pre-order-eligible product to their cart and complete checkout for it through the same purchase flow used for in-stock products.
- **FR-012**: System MUST allow a single order to contain a mix of pre-order and in-stock order lines from one checkout.
- **FR-013**: System MUST record, on each order line, whether it was purchased as a pre-order, fixed at the time of purchase and unaffected by later changes to the product.
- **FR-014**: System MUST allow an admin to identify, from the order list, which orders contain at least one pre-order line without opening each order individually.

### Key Entities

- **Product**: gains a pre-order eligibility flag (independent of its existing stock count) and an optional expected availability date, which together determine whether it displays as "In Stock", "Out of Stock", or "Pre-order".
- **Order**: gains a delivery address captured at checkout.
- **Order Line**: gains a flag recording whether that line was purchased as a pre-order, fixed at time of purchase.
- **Customer Account**: existing saved address is reused to pre-fill (not replace) the delivery address at checkout.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of orders placed after this feature ships have a non-empty delivery address recorded.
- **SC-002**: An admin can find the delivery address for any given order within 5 seconds of opening its detail view.
- **SC-003**: An admin can mark a product available for pre-order, with an expected date, and see it correctly labeled on the customer-facing product page in under 2 minutes.
- **SC-004**: 100% of orders containing a pre-order line are identifiable from the admin order list without opening individual orders.
- **SC-005**: Customers can complete checkout for a pre-order product in the same amount of time and number of steps as for an in-stock product (the added address step is the only difference from today's flow).

## Assumptions

- The delivery address is captured as a single free-text field (matching the existing account-level address field already present for customers), not broken into structured street/city/postal-code/country sub-fields; no address validation or geocoding is assumed.
- Every order requires a delivery address because all products sold are physical goods requiring shipment; there is no digital/no-shipping order type in scope.
- A product's pre-order eligibility is an explicit, admin-controlled flag independent of its stock count, rather than being automatically derived from stock reaching zero — this avoids incorrectly offering pre-orders on products that are simply discontinued or sold out for good.
- Pre-orders are paid in full at checkout using the same payment methods already available for regular orders (bank transfer, cash); no deposit or partial/split-payment capability is introduced by this feature.
- A single order may mix pre-order and in-stock lines; splitting the physical shipment across multiple deliveries, if needed, is handled manually by store staff and is not a system capability in scope.
- Orders placed before this feature ships will not have a stored delivery address; retroactively backfilling those existing orders is out of scope.
- No new automated notifications (email/SMS) are introduced for pre-order status or availability changes; the codebase currently has no such notification infrastructure to extend.
