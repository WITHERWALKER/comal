import type { StoredCartItems } from "@/src/modules/cart/types";
import { CART_STORAGE_KEY } from "@/src/modules/cart/types";

export function loadCartFromStorage(): StoredCartItems {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as StoredCartItems;
    if (!parsed || typeof parsed !== "object") return {};

    return parsed;
  } catch {
    return {};
  }
}

export function saveCartToStorage(items: StoredCartItems): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or private mode — ignore silently for MVP.
  }
}
