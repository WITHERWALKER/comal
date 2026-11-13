import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { GuestOrder } from "../lib/get-guest-order";
import { formatPrice } from "../lib/format-price";
import { routes } from "@/src/config/navigation";
import ClearCartOnMount from "./ClearCartOnMount";

export default function OrderConfirmationView({
  order,
  pickupAddress,
}: {
  order: GuestOrder;
  pickupAddress: string;
}) {
  const isDelivery = order.fulfillmentType === "delivery";
  const firstName = order.customerName.split(" ")[0] ?? order.customerName;

  return (
    <>
      <ClearCartOnMount />
      <main className="flex flex-1 flex-col gap-6 px-4 pb-12 pt-6 bg-background">
        <section className="px-2 text-center">
          <CheckCircle2
            className="mx-auto size-10 text-secondary"
            aria-hidden
          />
          <h1 className="mt-3 text-balance font-serif text-4xl font-black leading-tight text-secondary sm:text-5xl">
            ¡Pedido confirmado!
          </h1>
          <p className="mt-4 text-pretty leading-relaxed">
            Gracias, {firstName}. Ya estamos echando tortillas al comal.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Folio{" "}
            <span className="font-semibold text-foreground">
              #{order.folio}
            </span>
          </p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              {isDelivery ? "Entrega en" : "Recoge en"}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug">
              {isDelivery ? order.deliveryAddress : pickupAddress}
            </p>
            {isDelivery && order.deliveryNotes ? (
              <p className="mt-2 text-xs opacity-80">{order.deliveryNotes}</p>
            ) : null}
          </div>

          <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
              Pagas al recibir
            </p>
            <p className="mt-1 font-serif text-3xl font-bold tabular-nums">
              {formatPrice(order.total)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-card p-5">
          <h2 className="font-serif text-xl font-bold">Tu pedido</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {order.items.map((item, index) => (
              <li
                key={`${item.productName}-${index}`}
                className="flex justify-between gap-4"
              >
                <span>
                  {item.quantity} × {item.productName}
                </span>
                <span className="tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className="tabular-nums">
                {formatPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="mt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(order.total)}</span>
            </div>
          </div>
        </section>

        <Link
          href={routes.menu}
          className="w-full rounded-2xl bg-secondary px-5 py-4 text-center font-semibold text-secondary-foreground"
        >
          Hacer otro pedido
        </Link>
      </main>
    </>
  );
}
