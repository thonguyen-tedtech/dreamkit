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

export interface Product {
  readonly id: string;
  readonly name: string;
  /** Price in Vietnamese Dong (integer, no decimals). */
  readonly price: number;
  readonly category: string;
  readonly colors: readonly ColorKey[];
  /** Primary colour drives the product card artwork gradient. */
  readonly primaryColor: ColorKey;
  /** Absolute URL to the product photo (sourced from dreamkit.vn). */
  readonly image: string;
  readonly collar: CollarType;
  readonly type: ProductType;
  readonly isNew: boolean;
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
