"use client";

import { useCart } from "@/src/shared/context/cart-provider";
import { useEffect, useRef } from "react";

/** Vacía el carrito una vez al montar la confirmación de pedido. */
export default function ClearCartOnMount() {
  const { clear } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    clear();
  }, [clear]);

  return null;
}
