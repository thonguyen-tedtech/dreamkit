import { apiFetch } from "./api-client";
import type { ApiUser } from "./auth-api";
import type { ColorKey, Order, OrderLine, OrderStatus, PaymentMethod } from "./types";

/** Product reference embedded in an order item; populated by the backend. */
export interface ApiOrderProductRef {
  readonly _id: string;
  readonly name: string;
}

/** Order line shape returned by the NestJS orders API. */
export interface ApiOrderItem {
  readonly product: ApiOrderProductRef | string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly color: string;
  readonly size: string;
  /** Fixed at time of purchase by the backend from the product's pre-order state then. */
  readonly isPreOrder?: boolean;
}

/** Order shape returned by the NestJS orders API. */
export interface ApiOrder {
  readonly _id: string;
  readonly user?: ApiUser | string | null;
  readonly items: readonly ApiOrderItem[];
  readonly status: string;
  readonly totalAmount: number;
  readonly discount: number;
  readonly discountCode?: string;
  readonly discountPercent?: number;
  readonly paymentMethod: string;
  readonly isPaid: boolean;
  readonly hash: string;
  readonly name?: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
}

function mapOrderItem(item: ApiOrderItem): OrderLine {
  const product = typeof item.product === "string" ? null : item.product;
  return {
    productId: product?._id ?? (typeof item.product === "string" ? item.product : ""),
    productName: product?.name ?? "Sản phẩm",
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
    color: item.color as ColorKey,
    size: item.size,
    isPreOrder: item.isPreOrder,
  };
}

/** Maps a backend order record (populated) to the frontend order model. */
export function mapApiOrderToOrder(apiOrder: ApiOrder): Order {
  const user = typeof apiOrder.user === "string" ? null : apiOrder.user;
  const lines = apiOrder.items.map(mapOrderItem);
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);

  return {
    id: apiOrder._id,
    hash: apiOrder.hash,
    userId: user?._id ?? (typeof apiOrder.user === "string" ? apiOrder.user : undefined),
    name: apiOrder.name ?? user?.name,
    phone: apiOrder.phone ?? user?.phone,
    email: apiOrder.email ?? user?.email,
    address: apiOrder.address,
    lines,
    subtotal,
    discountCode: apiOrder.discountCode,
    discountPercent: apiOrder.discountPercent,
    discount: apiOrder.discount ?? 0,
    total: apiOrder.totalAmount,
    paymentMethod: apiOrder.paymentMethod as PaymentMethod,
    isPaid: apiOrder.isPaid,
    status: apiOrder.status as OrderStatus,
    createdAt: apiOrder.createdAt,
    note: apiOrder.note,
  };
}

export interface CreateOrderItemInput {
  readonly productId: string;
  readonly quantity: number;
  readonly color: string;
  readonly size: string;
}

/** Fields the checkout form submits to create an order. */
export interface CreateOrderInput {
  readonly items: readonly CreateOrderItemInput[];
  readonly paymentMethod: PaymentMethod;
  /** Delivery address; required by the backend for every order. */
  readonly address: string;
  readonly discount?: number;
  readonly discountCode?: string;
  /** Required when no bearer token is sent (guest order). */
  readonly name?: string;
  /** Required when no bearer token is sent (guest order). */
  readonly phone?: string;
  readonly email?: string;
  readonly note?: string;
}

export interface OrderMutationSuccess {
  readonly ok: true;
  readonly order: Order;
}

export interface OrderMutationFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export type OrderMutationResult = OrderMutationSuccess | OrderMutationFailure;

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * Creates an order. Pass an access token to link it to the signed-in account;
 * without one it's a guest order and `name`/`phone` are required.
 */
export async function createOrderApi(
  input: CreateOrderInput,
  accessToken?: string,
): Promise<OrderMutationResult> {
  const result = await apiFetch<ApiOrder>("/api/orders", {
    method: "POST",
    headers: accessToken ? authHeaders(accessToken) : undefined,
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  return { ok: true, order: mapApiOrderToOrder(result.data) };
}

/** Looks up a single order by its public tracking hash. No auth required. */
export async function trackOrderByHashApi(hash: string): Promise<OrderMutationResult> {
  const result = await apiFetch<ApiOrder>(`/api/orders/track/${encodeURIComponent(hash)}`, {
    method: "GET",
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  return { ok: true, order: mapApiOrderToOrder(result.data) };
}

export interface FetchOrdersSuccess {
  readonly ok: true;
  readonly orders: readonly Order[];
}

export interface FetchOrdersFailure {
  readonly ok: false;
  readonly message: string;
}

export type FetchOrdersResult = FetchOrdersSuccess | FetchOrdersFailure;

/** Lists orders for the signed-in account (every order if admin). Requires a bearer token. */
export async function fetchOrdersApi(accessToken: string): Promise<FetchOrdersResult> {
  const result = await apiFetch<readonly ApiOrder[]>("/api/orders", {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return { ok: true, orders: result.data.map(mapApiOrderToOrder) };
}

export interface UpdateOrderInput {
  readonly status?: OrderStatus;
  readonly paymentMethod?: PaymentMethod;
  readonly isPaid?: boolean;
}

/** Updates an order's status/payment fields. Admin only. */
export async function updateOrderApi(
  accessToken: string,
  id: string,
  input: UpdateOrderInput,
): Promise<OrderMutationResult> {
  const result = await apiFetch<ApiOrder>(`/api/orders/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(input),
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  return { ok: true, order: mapApiOrderToOrder(result.data) };
}

export interface DeleteOrderSuccess {
  readonly ok: true;
}

export interface DeleteOrderFailure {
  readonly ok: false;
  readonly status: number;
  readonly message: string;
}

export type DeleteOrderResult = DeleteOrderSuccess | DeleteOrderFailure;

/** Deletes an order. Admin only. */
export async function deleteOrderApi(
  accessToken: string,
  id: string,
): Promise<DeleteOrderResult> {
  const result = await apiFetch<undefined>(`/api/orders/${id}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });

  if (!result.ok) {
    return { ok: false, status: result.status, message: result.message };
  }

  return { ok: true };
}
