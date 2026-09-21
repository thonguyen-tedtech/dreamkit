/**
 * Domain types for the Dreamkit storefront.
 * Kept framework-agnostic so they can be reused by future data sources/APIs.
 */

/** Canonical colour keys used across products and the colour filter. */
export type ColorKey =
  | "black"
  | "white"
  | "red"
  | "blue"
  | "green"
  | "orange"
  | "purple"
  | "yellow"
  | "gray"
  | "cream"
  | "pink";

/** Product type facet ("Loại"). */
export type ProductType = "set" | "jersey" | "polo";

export interface ColorMeta {
  /** Vietnamese label shown in the UI (matches the original storefront). */
  readonly label: string;
  /** Swatch colour used for rendering chips and product art. */
  readonly hex: string;
}

/** A single product photo, tagged to the colour variant it depicts. */
export interface ProductImage {
  readonly url: string;
  readonly color: ColorKey;
  /** Sort order among a product's images; index 0 is the cover photo. */
  readonly position?: number;
}

export interface Product {
  readonly id: string;
  readonly name: string;
  /** Price in Vietnamese Dong (integer, no decimals). */
  readonly price: number;
  readonly category: string;
  readonly colors: readonly ColorKey[];
  /** Primary colour drives the product card artwork gradient. */
  readonly primaryColor: ColorKey;
  /** Absolute URL to the product photo; always equal to images[0].url. */
  readonly image: string;
  /** Gallery of product photos; images[0] is the cover shown as `image`. */
  readonly images?: readonly ProductImage[];
  readonly type: ProductType;
  readonly isNew: boolean;
  /** Units currently in stock. */
  readonly stock?: number;
  /** Available for pre-order, independent of stock; takes precedence over in/out-of-stock status when true. */
  readonly isPreOrder?: boolean;
  /** Name of the collection this product belongs to, if any. */
  readonly collectionName?: string;
  /** Sort order among catalogue collections; lower shows first. */
  readonly collectionPosition?: number;
  /** Gallery photos showcasing the collection this product belongs to. */
  readonly collectionImages?: readonly ProductImage[];
  /** Video URL (e.g. TikTok) showcasing this product, if any. */
  readonly videoUrl?: string;
}

export interface Testimonial {
  readonly id: string;
  readonly club: string;
  readonly quote: string;
  /** Optional supporting photo URL. */
  readonly image: string;
}

export interface JourneyStory {
  readonly id: string;
  readonly location: string;
  readonly title: string;
  readonly excerpt: string;
  readonly image: string;
}

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

export interface FeaturedStory {
  readonly id: string;
  readonly club: string;
  readonly title: string;
  readonly body: string;
  readonly image: string;
  readonly palette: readonly { readonly label: string; readonly hex: string }[];
}

/** A single design preview inside a catalogue collection gallery. */
export interface CatalogueItem {
  readonly id: string;
  readonly image: string;
  /** Highest-resolution version available, shown in the full-screen viewer. */
  readonly fullImage: string;
  readonly alt: string;
  /** Dominant kit colours used by the colour filter (OR semantics). */
  readonly colors: readonly ColorKey[];
}

/** Named product collection shown on the /catalogue page. */
export interface CatalogueCollection {
  readonly id: string;
  readonly title: string;
  readonly items: readonly CatalogueItem[];
  /** Product type of the collection's representative product, used by the category tabs. */
  readonly productType?: ProductType;
  /** Id of the collection's representative product, linked from the "detail" button. */
  readonly productId?: string;
  /** Video URL for the collection's representative product, if any. */
  readonly videoUrl?: string;
  /** Whether the collection's representative product is available for pre-order. */
  readonly isPreOrder?: boolean;
}

/** Lifecycle status for a customer order (mirrors the backend's OrderStatus enum). */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "printing"
  | "shipping"
  | "delivered"
  | "cancelled";

/**
 * Whether an order is for one person or a bulk/team order (mirrors the
 * backend's OrderType enum).
 */
export type OrderType = "single" | "team";

/**
 * How the order's products were sourced (mirrors the backend's
 * ProductDesignMode enum). Standard orders reference existing catalog
 * products; Custom orders carry admin-uploaded design images and skip
 * straight to production.
 */
export type ProductDesignMode = "standard" | "custom";

/** How the customer pays for an order (mirrors the backend's PaymentMethod enum). */
export type PaymentMethod = "bank" | "cash";

/** Application role used for route access control. */
export type UserRole = "admin" | "customer";

export interface AuthUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly phone?: string;
  readonly address?: string;
}

/** One size/name/number grouping within an order line, with its own quantity. */
export interface OrderCustomizationDetail {
  readonly size: string;
  /** Name to print, if any. */
  readonly name?: string;
  /** Jersey number to print, if any. */
  readonly jerseyNumber?: string;
  readonly quantity: number;
}

export interface OrderLine {
  readonly productId: string;
  readonly productName: string;
  /** Catalog product photo, when the referenced product is still populated. */
  readonly productImage?: string;
  readonly unitPrice: number;
  readonly customizationDetails: readonly OrderCustomizationDetail[];
  /** Derived client-side: unitPrice × the sum of every detail's quantity. */
  readonly lineTotal: number;
  /** Whether this line was purchased as a pre-order, fixed at time of purchase. */
  readonly isPreOrder?: boolean;
}

export interface Order {
  readonly id: string;
  /** Random tracking reference from the backend; shown to customers as their order reference. */
  readonly hash: string;
  readonly userId?: string;
  readonly name?: string;
  readonly phone?: string;
  readonly email?: string;
  /** Delivery address captured at checkout. Optional only because orders placed before this field existed have none. */
  readonly address?: string;
  readonly lines: readonly OrderLine[];
  /** Derived client-side: sum of each line's lineTotal (the backend doesn't persist it separately). */
  readonly subtotal: number;
  /** Normalized discount code applied to this order, if any. */
  readonly discountCode?: string;
  /** Percentage the discount code resolved to at checkout, if any. */
  readonly discountPercent?: number;
  /** Flat amount subtracted after the percentage discount; 0 if none applied. */
  readonly discount: number;
  /** Amount actually charged. */
  readonly total: number;
  readonly paymentMethod: PaymentMethod;
  readonly isPaid: boolean;
  readonly status: OrderStatus;
  /** Single-person vs. bulk/team order. */
  readonly orderType: OrderType;
  /** Standard catalog product vs. custom uploaded design. */
  readonly productDesignMode: ProductDesignMode;
  /** Links to the custom design images; present when productDesignMode is "custom". */
  readonly customDesignImages?: readonly string[];
  /** Shipping tracking number; set by the admin, required before the order can be marked delivered. */
  readonly trackingNumber?: string;
  /** Server-stamped timestamp of the moment an admin confirmed the order. Anchors the printing/packaging estimate. */
  readonly confirmedAt?: string;
  /** Server-stamped timestamp of the moment the order entered "in_production" (custom orders). */
  readonly productionCompletedAt?: string;
  /** Server-stamped timestamp of the moment the order entered "printing". */
  readonly printingCompletedAt?: string;
  /** Server-stamped timestamp of the moment the order entered "shipping". */
  readonly shippingCompletedAt?: string;
  readonly createdAt: string;
  readonly note?: string;
}


export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly address: string;
  readonly role: UserRole;
  readonly createdAt: string;
  readonly isEmailVerified: boolean;
}

/** Read state of a contact-form submission. */
export type ContactStatus = "unread" | "read";

export interface Contact {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly message: string;
  readonly status: ContactStatus;
  readonly createdAt: string;
}

/** How a discount code's value is interpreted. */
export type DiscountType = "percentage" | "fixed";

/** Computed (not stored) lifecycle status of a discount code. */
export type DiscountCodeStatus =
  | "scheduled"
  | "active"
  | "expired"
  | "exhausted"
  | "disabled";

export interface DiscountCode {
  readonly id: string;
  /** Normalized (trimmed, uppercased) unique code customers enter at checkout. */
  readonly code: string;
  readonly description?: string;
  readonly discountType: DiscountType;
  /** Percentage (1-100) or a non-negative fixed VND amount, per discountType. */
  readonly value: number;
  readonly minOrderAmount?: number;
  /** ISO date string; code is not usable before this date. */
  readonly startsAt?: string;
  /** ISO date string; code is not usable after this date. */
  readonly expiresAt?: string;
  /** Total redemption cap across all customers; unlimited if omitted. */
  readonly maxUses?: number;
  readonly perCustomerLimit?: number;
  /** Manual on/off switch, independent of dates and usage. */
  readonly isActive: boolean;
  /** Number of times redeemed so far; tracked by the checkout flow. */
  readonly usedCount: number;
  readonly createdAt: string;
}