import type { ColorKey, Product, ProductType } from "./types";

export type ProductField = keyof Product;

export type ProductFieldErrors = Partial<Record<ProductField, string>>;

const COLOR_KEYS: readonly ColorKey[] = [
  "black",
  "white",
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "yellow",
  "gray",
  "cream",
];

const PRODUCT_TYPES: readonly ProductType[] = ["set", "jersey", "polo"];

export function slugifyProductId(name: string): string {
  return name
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function parseProducts(value: unknown): readonly Product[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is Product => {
    if (typeof entry !== "object" || entry === null) {
      return false;
    }
    const product = entry as Product;
    return (
      typeof product.id === "string" &&
      typeof product.name === "string" &&
      typeof product.price === "number" &&
      typeof product.category === "string" &&
      Array.isArray(product.colors) &&
      typeof product.primaryColor === "string" &&
      typeof product.image === "string" &&
      typeof product.type === "string" &&
      typeof product.isNew === "boolean"
    );
  });
}

export function validateProduct(product: Product): ProductFieldErrors {
  const errors: ProductFieldErrors = {};

  if (!product.name.trim()) {
    errors.name = "Tên sản phẩm là bắt buộc";
  }

  if (!Number.isFinite(product.price) || product.price < 0) {
    errors.price = "Giá phải là số không âm";
  }

  if (!product.category.trim()) {
    errors.category = "Danh mục là bắt buộc";
  }

  if (!product.images || product.images.length === 0) {
    errors.images = "Cần ít nhất một ảnh sản phẩm";
  } else if (
    product.images.some((entry) => !entry.url.trim() || !COLOR_KEYS.includes(entry.color))
  ) {
    errors.images = "Mỗi ảnh cần có URL và màu hợp lệ";
  }

  if (product.colors.length === 0) {
    errors.colors = "Chọn ít nhất một màu";
  } else if (!product.colors.every((color) => COLOR_KEYS.includes(color))) {
    errors.colors = "Màu không hợp lệ";
  }

  if (!COLOR_KEYS.includes(product.primaryColor)) {
    errors.primaryColor = "Màu chính không hợp lệ";
  }

  if (!PRODUCT_TYPES.includes(product.type)) {
    errors.type = "Loại sản phẩm không hợp lệ";
  }

  if (
    product.stock !== undefined &&
    (!Number.isFinite(product.stock) || product.stock < 0)
  ) {
    errors.stock = "Tồn kho phải là số không âm";
  }

  if (
    product.videoUrl?.trim() &&
    !/^https?:\/\//.test(product.videoUrl.trim())
  ) {
    errors.videoUrl = "Link video phải bắt đầu bằng http:// hoặc https://";
  }

  return errors;
}

export function isProductValid(errors: ProductFieldErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function upsertProduct(
  products: readonly Product[],
  product: Product,
  originalId?: string,
): readonly Product[] {
  const withoutOriginal = originalId
    ? products.filter((entry) => entry.id !== originalId)
    : products.filter((entry) => entry.id !== product.id);

  return [...withoutOriginal, product];
}

export function deleteProduct(
  products: readonly Product[],
  id: string,
): readonly Product[] {
  return products.filter((product) => product.id !== id);
}
