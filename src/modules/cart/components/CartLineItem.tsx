"use client";

import type { CartLine } from "@/src/modules/cart/types";
import { Minus, Plus } from "lucide-react";

type CartLineItemProps = {
  line: CartLine;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function CartLineItem({
  line,
  onDecrease,
  onIncrease,
}: CartLineItemProps) {
  const { name, price, quantity } = line;
  const lineTotal = price * quantity;

  return (
    <li className="flex items-center gap-4 border-b border-border px-2 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-serif text-lg font-bold">{name}</p>
        <p className="text-sm text-muted-foreground">${price} c/u</p>
      </div>

      <div className="flex items-center gap-1 rounded-full border border-border p-1">
        <button
          type="button"
          onClick={onDecrease}
          aria-label={`Quitar un ${name}`}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <Minus className="size-4" aria-hidden />
        </button>

        <span className="w-5 text-center text-sm font-semibold tabular-nums">
          {quantity}
        </span>

        <button
          type="button"
          onClick={onIncrease}
          aria-label={`Agregar otro ${name}`}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>

      <p className="w-16 text-right font-medium tabular-nums">${lineTotal}</p>
    </li>
  );
}
