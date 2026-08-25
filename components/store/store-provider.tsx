"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast-context";
import { createOrderApi, type CreateOrderInput } from "@/lib/orders-api";
import { fetchProductsApi } from "@/lib/products-api";
import { PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";
import { StoreContext, type StoreContextValue } from "./store-context";

/**
 * Client store for the backend-hosted product catalogue, shared by the public
 * shop and the admin product manager. Orders are guest-only here (checkout
 * has no account to attach to); admins manage placed orders separately via
 * their own session in `OrderManager`.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<readonly Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

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

  const createOrderAction = useCallback(
    async (input: CreateOrderInput) => {
      const result = await createOrderApi(input);
      if (!result.ok) {
        showToast(result.message, "error");
        return null;
      }
      return { hash: result.hash, status: result.status };
    },
    [showToast],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      isHydrated,
      productsError,
      refreshProducts,
      createOrder: createOrderAction,
    }),
    [products, isHydrated, productsError, refreshProducts, createOrderAction],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
