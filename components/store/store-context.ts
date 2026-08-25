"use client";

import { createContext, useContext } from "react";
import type { CreateOrderInput } from "@/lib/orders-api";
import type { OrderStatus, Product } from "@/lib/types";

/** Result of creating an order: the API accepts it for async processing (202). */
export interface CreatedOrderRef {
  readonly hash: string;
  readonly status: OrderStatus;
}

export interface StoreContextValue {
  readonly products: readonly Product[];
  readonly isHydrated: boolean;
  readonly productsError: string | null;
  readonly refreshProducts: () => Promise<void>;
  readonly createOrder: (input: CreateOrderInput) => Promise<CreatedOrderRef | null>;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (context === null) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
