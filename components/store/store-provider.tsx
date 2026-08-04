"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useToast } from "@/components/ui/toast-context";
import {
  createOrderApi,
  deleteOrderApi,
  fetchOrdersApi,
  updateOrderApi,
  type CreateOrderInput,
} from "@/lib/orders-api";
import { fetchProductsApi } from "@/lib/products-api";
import { PRODUCTS } from "@/lib/products";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { StoreContext, type StoreContextValue } from "./store-context";

/**
 * Central client store for the backend-hosted product catalogue and orders.
 * Orders require a signed-in session (own orders for members, all for admins);
 * signed-out visitors simply see an empty order list.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const { accessToken } = useAuthModal();
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [orders, setOrders] = useState<readonly Order[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    const result = await fetchProductsApi();

    if (result.ok) {
      setProducts(result.products);
      setProductsError(null);
      return;
    }

    setProducts(PRODUCTS);
    setProductsError(result.message);
    showToast(result.message, "error");
  }, [showToast]);

  const refreshOrders = useCallback(async () => {
    if (!accessToken) {
      setOrders([]);
      setOrdersError(null);
      return;
    }

    const result = await fetchOrdersApi(accessToken);
    if (result.ok) {
      setOrders(result.orders);
      setOrdersError(null);
      return;
    }

    setOrders([]);
    setOrdersError(result.message);
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      await refreshProducts();
      if (!cancelled) {
        setIsHydrated(true);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [refreshProducts]);

  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const createOrderAction = useCallback(
    async (input: CreateOrderInput) => {
      const result = await createOrderApi(input, accessToken ?? undefined);
      if (!result.ok) {
        showToast(result.message, "error");
        return null;
      }
      void refreshOrders();
      return { hash: result.hash, status: result.status };
    },
    [accessToken, showToast, refreshOrders],
  );

  const updateOrderStatusAction = useCallback(
    async (id: string, status: OrderStatus) => {
      if (!accessToken) {
        return;
      }
      const result = await updateOrderApi(accessToken, id, { status });
      if (!result.ok) {
        showToast(result.message, "error");
        return;
      }
      const updated = result.order;
      setOrders((current) => current.map((order) => (order.id === id ? updated : order)));
    },
    [accessToken, showToast],
  );

  const deleteOrderAction = useCallback(
    async (id: string) => {
      if (!accessToken) {
        return;
      }
      const result = await deleteOrderApi(accessToken, id);
      if (!result.ok) {
        showToast(result.message, "error");
        return;
      }
      setOrders((current) => current.filter((order) => order.id !== id));
    },
    [accessToken, showToast],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      orders,
      isHydrated,
      productsError,
      ordersError,
      refreshProducts,
      refreshOrders,
      createOrder: createOrderAction,
      updateOrderStatus: updateOrderStatusAction,
      deleteOrder: deleteOrderAction,
    }),
    [
      products,
      orders,
      isHydrated,
      productsError,
      ordersError,
      refreshProducts,
      refreshOrders,
      createOrderAction,
      updateOrderStatusAction,
      deleteOrderAction,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
