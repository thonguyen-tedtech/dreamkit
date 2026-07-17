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
  | "cream";

/** Product type facet ("Loại"). */
export type ProductType = "set" | "jersey" | "polo-shirt";

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
  /** Name of the collection this product belongs to, if any. */
  readonly collectionName?: string;
  /** Gallery photos showcasing the collection this product belongs to. */
  readonly collectionImages?: readonly string[];
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
}

/** Lifecycle status for a customer order (mirrors the backend's OrderStatus enum). */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

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

export interface OrderLine {
  readonly productId: string;
  readonly productName: string;
  readonly unitPrice: number;
  readonly quantity: number;
  readonly lineTotal: number;
  readonly color: ColorKey;
  readonly size: string;
}

export interface Order {
  readonly id: string;
  /** Random tracking reference from the backend; shown to customers as their order reference. */
  readonly hash: string;
  readonly userId?: string;
  readonly name?: string;
  readonly phone?: string;
  readonly email?: string;
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