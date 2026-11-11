import type { MenuProduct } from "@/src/modules/products/types";

export const CART_STORAGE_KEY = "comal-cart-v1";

export type CartProduct = Pick<
  MenuProduct,
  "id" | "name" | "description" | "price"
>;

export type CartLine = CartProduct & { quantity: number };

export type StoredCartItems = Record<
  string,
  { product: CartProduct; quantity: number }
>;
