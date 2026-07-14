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

/** Collar style facet ("Cổ áo"). */
export type CollarType = "regular" | "polo";

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
  readonly collar: CollarType;
  readonly type: ProductType;
  readonly isNew: boolean;
  /** Units currently in stock. */
  readonly stock?: number;
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
}

/** Lifecycle status for a customer order. */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

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
}

export interface Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly userId?: string;
  readonly customerName: string;
  readonly customerPhone: string;
  readonly customerEmail?: string;
  readonly lines: readonly OrderLine[];
  readonly subtotal: number;
  /** Normalized discount code applied to this order, if any. */
  readonly discountCode?: string;
  /** Amount deducted from the subtotal by the discount code; 0 if none applied. */
  readonly discountAmount: number;
  /** Amount actually charged: subtotal minus discountAmount. */
  readonly total: number;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly notes?: string;
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