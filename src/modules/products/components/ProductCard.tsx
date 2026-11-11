"use client";

import type { MenuProduct } from "@/src/modules/products/types";
import { Minus } from "@/src/shared/components/animate-ui/icons/minus";
import { Plus } from "@/src/shared/components/animate-ui/icons/plus";
import { useCart } from "@/src/shared/context/cart-provider";
import { useState } from "react";

interface ProductCardProps {
  product: MenuProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, description, price } = product;
  const { add, setQuantity, quantityOf } = useCart();
  const quantity = quantityOf(id);
  const [minusPulse, setMinusPulse] = useState(0);
  const [plusPulse, setPlusPulse] = useState(0);

  function handleAddFirst() {
    setPlusPulse((n) => n + 1);
    add(product);
  }

  function handleIncrease() {
    setPlusPulse((n) => n + 1);
    setQuantity(id, quantity + 1, product);
  }

  function handleDecrease() {
    setMinusPulse((n) => n + 1);
    setQuantity(id, quantity - 1, product);
  }

  return (
    <li className="flex items-center justify-between gap-4 border-b border-border px-2 py-5 last:border-b-0">
      <div className="flex flex-col gap-2">
        <h3 className="font-serif text-xl leading-none font-bold">{name}</h3>
        <p className="text-sm leading-none text-neutral-500">{description}</p>
        <span className="font-medium">${price}</span>
      </div>

      {quantity === 0 ? (
        <button
          type="button"
          onClick={handleAddFirst}
          aria-label={`Agregar ${name} al pedido`}
          className="flex size-10 aspect-square items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform active:scale-95"
        >
          <Plus
            key={plusPulse}
            animate
            size={24}
            speed={2}
            className="text-primary-50"
          />
        </button>
      ) : (
        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
          <button
            type="button"
            onClick={handleDecrease}
            aria-label={`Quitar un ${name}`}
            className="flex size-9 items-center justify-center rounded-full text-secondary transition-transform active:scale-95"
          >
            <Minus
              key={minusPulse}
              animate
              size={20}
              speed={2}
              className="text-secondary"
            />
          </button>

          <span className="min-w-6 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            aria-label={`Agregar otro ${name}`}
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform active:scale-95"
          >
            <Plus
              key={plusPulse}
              animate
              size={20}
              speed={2}
              className="text-primary-50"
            />
          </button>
        </div>
      )}
    </li>
  );
}
