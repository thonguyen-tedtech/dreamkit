"use client";

import { createContext, useContext } from "react";
import type { CreateOrderInput } from "@/lib/orders-api";
import type { Order, OrderStatus, Product } from "@/lib/types";

/** Result of creating an order: the API accepts it for async processing (202). */
export interface CreatedOrderRef {
  readonly hash: string;
  readonly status: OrderStatus;
}

export interface StoreContextValue {
  readonly products: readonly Product[];
  readonly orders: readonly Order[];
  readonly isHydrated: boolean;
  readonly productsError: string | null;
  readonly ordersError: string | null;
  readonly refreshProducts: () => Promise<void>;
  readonly refreshOrders: () => Promise<void>;
  readonly createOrder: (input: CreateOrderInput) => Promise<CreatedOrderRef | null>;
  readonly updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  readonly deleteOrder: (id: string) => Promise<void>;
}

export const StoreContext = createContext<StoreContextValue | null>(null);

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (context === null) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
