"use client";

import CartEmptyState from "@/src/modules/cart/components/CartEmptyState";
import CartLineItem from "@/src/modules/cart/components/CartLineItem";
import CartSummaryBar from "@/src/modules/cart/components/CartSummaryBar";
import { useCart } from "@/src/shared/context/cart-provider";

export default function CartView() {
  const { lines, count, subtotal, isHydrated, setQuantity, clear } = useCart();

  if (!isHydrated) {
    return (
      <p className="mt-8 text-center text-muted-foreground">Cargando pedido…</p>
    );
  }

  if (count === 0) {
    return <CartEmptyState />;
  }

  return (
    <>
      <ul className="flex flex-col">
        {lines.map((line) => (
          <CartLineItem
            key={line.id}
            line={line}
            onDecrease={() => setQuantity(line.id, line.quantity - 1)}
            onIncrease={() => setQuantity(line.id, line.quantity + 1, line)}
          />
        ))}
      </ul>

      <button
        type="button"
        onClick={clear}
        className="mx-auto mt-6 block text-sm cursor-pointer font-semibold text-destructive underline underline-offset-4 transition-opacity hover:opacity-80"
      >
        Vaciar pedido
      </button>

      <div className="my-12 flex items-center justify-between px-2">
        <span className="text-muted-foreground">Subtotal</span>

        <span className="font-serif text-2xl font-bold tabular-nums">
          ${subtotal}
        </span>
      </div>

      <CartSummaryBar />
    </>
  );
}
