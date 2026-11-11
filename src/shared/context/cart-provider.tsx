"use client";

import {
  loadCartFromStorage,
  saveCartToStorage,
} from "@/src/modules/cart/lib/storage";
import type {
  CartLine,
  CartProduct,
  StoredCartItems,
} from "@/src/modules/cart/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type { CartLine, CartProduct } from "@/src/modules/cart/types";

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isHydrated: boolean;
  quantityOf: (id: string) => number;
  add: (product: CartProduct) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, quantity: number, product?: CartProduct) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const MAX_PER_ITEM = 20;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<StoredCartItems>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCartFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveCartToStorage(items);
  }, [items, isHydrated]);

  const setQuantity = useCallback(
    (id: string, quantity: number, product?: CartProduct) => {
      setItems((prev) => {
        if (quantity <= 0) {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        }

        const existing = prev[id];
        const lineProduct = existing?.product ?? product;
        if (!lineProduct) return prev;

        return {
          ...prev,
          [id]: {
            product: lineProduct,
            quantity: Math.min(quantity, MAX_PER_ITEM),
          },
        };
      });
    },
    [],
  );

  const add = useCallback((product: CartProduct) => {
    setItems((prev) => {
      const current = prev[product.id];
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: Math.min((current?.quantity ?? 0) + 1, MAX_PER_ITEM),
        },
      };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const current = prev[id];
      if (!current) return prev;

      const next = { ...prev };
      const quantity = current.quantity - 1;

      if (quantity <= 0) delete next[id];
      else next[id] = { ...current, quantity };

      return next;
    });
  }, []);

  const clear = useCallback(() => setItems({}), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = Object.values(items).map(
      ({ product, quantity }) => ({ ...product, quantity }),
    );

    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal: lines.reduce(
        (sum, line) => sum + line.quantity * line.price,
        0,
      ),
      isHydrated,
      quantityOf: (id) => items[id]?.quantity ?? 0,
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [items, isHydrated, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
