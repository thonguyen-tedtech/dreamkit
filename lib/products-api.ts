import { apiFetch } from "./api-client";
import type { ColorKey, Product, ProductImage, ProductType } from "./types";

const UPLOADS_ORIGIN =
  process.env.NEXT_PUBLIC_UPLOADS_URL ?? "https://dreamkit.tedtech.asia";

const COLOR_KEYS = new Set<ColorKey>([
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
]);

const PRODUCT_TYPES = new Set<ProductType>(["set", "jersey", "polo-shirt"]);

/** Product image shape returned by the NestJS products API. */
export interface ApiProductImage {
  readonly url: string;
  readonly color: string;
  readonly position?: number;
}

/** Product shape returned by the NestJS products API. */
export interface ApiProduct {
  readonly _id: string;
  readonly slug: string;
  readonly name: string;
  readonly price: number;
  readonly category: string;
  readonly colors: readonly string[];
  readonly primaryColor: string;
  readonly image: string;
  readonly images?: readonly ApiProductImage[];
  readonly type: string;
  readonly isNew: boolean;
  readonly stock?: number;
  readonly collectionName?: string;
  readonly collectionImages?: readonly string[];
  readonly videoUrl?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly __v?: number;
}

export interface ProductsListMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

export interface ProductsListResponse {
  readonly data: readonly ApiProduct[];
  readonly meta: ProductsListMeta;
}

export interface FetchProductsSuccess {
  readonly ok: true;
  readonly products: readonly Product[];
}

export interface FetchProductsFailure {
  readonly ok: false;
  readonly message: string;
}

export type FetchProductsResult = FetchProductsSuccess | FetchProductsFailure;

function isColorKey(value: string): value is ColorKey {
  return COLOR_KEYS.has(value as ColorKey);
}

/** Resolves API-relative upload paths to absolute image URLs. */
export function resolveProductImage(image: string): string {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${UPLOADS_ORIGIN}${image}`;
}

/** Maps a backend product record to the frontend catalog model. */
export function mapApiProductToProduct(apiProduct: ApiProduct): Product | null {
  if (!isColorKey(apiProduct.primaryColor)) {
    return null;
  }

  const colors = apiProduct.colors.filter(isColorKey);
  if (colors.length === 0) {
    return null;
  }

  if (!PRODUCT_TYPES.has(apiProduct.type as ProductType)) {
    return null;
  }

  const images: readonly ProductImage[] = (apiProduct.images ?? [])
    .filter((entry): entry is ApiProductImage & { color: ColorKey } => isColorKey(entry.color))
    .map((entry) => ({
      url: resolveProductImage(entry.url),
      color: entry.color,
      position: entry.position,
    }))
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return {
    id: apiProduct._id,
    name: apiProduct.name,
    price: apiProduct.price,
    category: apiProduct.category,
    colors,
    primaryColor: apiProduct.primaryColor,
    image: resolveProductImage(apiProduct.image),
    images:
      images.length > 0
        ? images
        : [{ url: resolveProductImage(apiProduct.image), color: apiProduct.primaryColor, position: 0 }],
    type: apiProduct.type as ProductType,
    isNew: apiProduct.isNew,
    stock: apiProduct.stock,
    collectionName: apiProduct.collectionName,
    collectionImages: apiProduct.collectionImages?.map(resolveProductImage),
    videoUrl: apiProduct.videoUrl,
  };
}

/** Fields the admin form can create or update a product with. */
export type ProductInput = Omit<Product, "id">;

export interface ProductMutationSuccess {
  readonly ok: true;
  readonly product: Product;
}

export interface ProductMutationFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export type ProductMutationResult = ProductMutationSuccess | ProductMutationFailure;

export interface DeleteProductSuccess {
  readonly ok: true;
}

export interface DeleteProductFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export type DeleteProductResult = DeleteProductSuccess | DeleteProductFailure;

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function mutationFailure(
  status: number,
  message: string,
): ProductMutationFailure {
  return { ok: false, status, message };
}

/** Creates a product. Admin only. */
export async function createProductApi(
  accessToken: string,
  input: ProductInput,
): Promise<ProductMutationResult> {
  const result = await apiFetch<ApiProduct>("/api/products", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return mutationFailure(result.status, result.message);
  }

  const product = mapApiProductToProduct(result.data);
  if (!product) {
    return mutationFailure(0, "Máy chủ trả về dữ liệu sản phẩm không hợp lệ.");
  }

  return { ok: true, product };
}

/** Updates a product. Admin only. */
export async function updateProductApi(
  accessToken: string,
  id: string,
  input: Partial<ProductInput>,
): Promise<ProductMutationResult> {
  const result = await apiFetch<ApiProduct>(`/api/products/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return mutationFailure(result.status, result.message);
  }

  const product = mapApiProductToProduct(result.data);
  if (!product) {
    return mutationFailure(0, "Máy chủ trả về dữ liệu sản phẩm không hợp lệ.");
  }

  return { ok: true, product };
}

/** Deletes a product. Admin only. */
export async function deleteProductApi(
  accessToken: string,
  id: string,
): Promise<DeleteProductResult> {
  const result = await apiFetch<undefined>(`/api/products/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  return { ok: true };
}

/** Fetches the public product catalog from the API. */
export async function fetchProductsApi(): Promise<FetchProductsResult> {
  const result = await apiFetch<ProductsListResponse>("/api/products", {
    method: "GET",
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
    };
  }

  const products = result.data.data
    .map(mapApiProductToProduct)
    .filter((product): product is Product => product !== null);

  return { ok: true, products };
}
