"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  variantOptionId?: number;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantOptionId?: number) => void;
  updateQuantity: (
    productId: number,
    variantOptionId: number | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) =>
              i.productId === item.productId &&
              i.variantOptionId === item.variantOptionId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId &&
                i.variantOptionId === item.variantOptionId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId, variantOptionId) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.variantOptionId === variantOptionId
              )
          ),
        }));
      },

      updateQuantity: (productId, variantOptionId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantOptionId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId &&
            i.variantOptionId === variantOptionId
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "cart",
    }
  )
);
