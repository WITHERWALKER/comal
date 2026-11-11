"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/src/config/navigation";
import { useCart } from "@/src/shared/context/cart-provider";
import { ArrowRight } from "lucide-react";

export default function CartFloatingButton() {
  const pathname = usePathname();
  const { count, subtotal, isHydrated } = useCart();

  if (!isHydrated || count === 0) return null;
  if (pathname === routes.cart || pathname === routes.checkout) return null;

  return (
    <>
      <div className="h-24 shrink-0 bg-background" aria-hidden />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link
          href={routes.cart}
          aria-label={`Ver pedido, ${count} artículos`}
          className="pointer-events-auto flex items-center justify-between rounded-2xl bg-secondary px-5 py-4 text-primary-foreground shadow-lg shadow-secondary/25 transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-lg">Ver carrito</span>
            <ArrowRight size={24} strokeWidth={2} />
          </div>

          <div className="flex items-center gap-2 font-medium text-lg">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground tabular-nums">
              {count}
            </span>
            <span>${subtotal}</span>
          </div>
        </Link>
      </div>
    </>
  );
}
