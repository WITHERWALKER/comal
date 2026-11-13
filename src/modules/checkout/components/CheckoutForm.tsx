"use client";

import { useCart } from "@/src/shared/context/cart-provider";
import CheckoutOptionCard from "./CheckoutOptionCard";
import { useActionState, useState } from "react";
import {
  CheckoutActionState,
  FulfillmentType,
  PaymentType,
} from "../types.checkout";
import { Banknote, Bike, CreditCard, Loader2, Store } from "lucide-react";
import CheckoutField from "./CheckoutField";
import { createOrderAction } from "../actions/create-order";
import { checkoutInitialState } from "../types.checkout";
import type { PublicBusiness } from "@/src/lib/supabase/queries/business";
import { formatPrice } from "../lib/format-price";
import Link from "next/link";
import { routes } from "@/src/config/navigation";

export default function CheckoutForm({
  business,
}: {
  business: Pick<PublicBusiness, "address" | "deliveryFee">;
}) {
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("domicilio");
  const [payment, setPayment] = useState<PaymentType>("efectivo");

  const [state, formAction, pending] = useActionState<
    CheckoutActionState,
    FormData
  >(createOrderAction, checkoutInitialState);

  const { lines, subtotal, isHydrated } = useCart();
  const deliveryFee = fulfillment === "domicilio" ? business.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const errors = state.fieldErrors ?? {};

  if (isHydrated && lines.length === 0 && !pending) {
    return (
      <div className="mt-6 flex flex-col items-center gap-6 rounded-2xl bg-secondary px-6 py-12 text-center">
        <p className="font-serif text-2xl font-bold text-secondary-foreground">
          No hay nada en tu pedido
        </p>
        <Link
          href={routes.menu}
          className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground"
        >
          Ir al menú
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-8" noValidate>
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          lines.map((l) => ({ id: l.id, quantity: l.quantity })),
        )}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 px-2 font-serif text-2xl font-bold">
          Entrega
        </legend>

        <div className="grid grid-cols-2 gap-3">
          <CheckoutOptionCard
            name="fulfillment"
            value="domicilio"
            checked={fulfillment === "domicilio"}
            onChange={() => setFulfillment("domicilio")}
            icon={<Bike className="size-5" aria-hidden />}
            title="A domicilio"
            detail={`+ ${formatPrice(business.deliveryFee)}`}
          />

          <CheckoutOptionCard
            name="fulfillment"
            value="recoger"
            checked={fulfillment === "recoger"}
            onChange={() => setFulfillment("recoger")}
            icon={<Store className="size-5" aria-hidden />}
            title="Paso por él"
            detail="Sin costo"
          />
        </div>

        {fulfillment === "recoger" && (
          <p className="rounded-xl bg-[#ebe5d8] px-4 py-3 text-sm leading-relaxed">
            Recoge en <strong>{business.address}</strong>. Te avisamos por teléfono
            cuando esté listo.
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 px-2 font-serif text-2xl font-bold">
          Tus datos
        </legend>

        <CheckoutField
          label="Nombre"
          name="name"
          autoComplete="name"
          error={errors.name}
        />

        <CheckoutField
          label="Teléfono"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10 dígitos"
          error={errors.phone}
        />

        {fulfillment === "domicilio" && (
          <>
            <CheckoutField
              label="Dirección"
              name="address"
              autoComplete="street-address"
              placeholder="Calle, número y colonia"
              error={errors.address}
            />
            <CheckoutField
              label="Referencias (opcional)"
              name="references"
              placeholder="Portón verde, entre calles…"
              error={errors.references}
            />
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="px-1 text-sm font-medium">
            Notas para la cocina (opcional)
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={2}
            maxLength={255}
            placeholder="Sin cebolla, salsa aparte…"
            aria-invalid={Boolean(errors.notes)}
            className="rounded-xl border border-input bg-card px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
          />
          {errors.notes ? (
            <p className="px-1 text-sm text-destructive">{errors.notes}</p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 px-2 font-serif text-2xl font-bold">
          Pago
        </legend>

        <p className="mb-2 px-2 text-sm text-muted-foreground">
          No cobramos en línea. Pagas{" "}
          {fulfillment === "domicilio" ? "al repartidor" : "en el mostrador"} al
          recibir tu pedido.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <CheckoutOptionCard
            name="payment"
            value="efectivo"
            checked={payment === "efectivo"}
            onChange={() => setPayment("efectivo")}
            icon={<Banknote className="size-5" aria-hidden />}
            title="Efectivo"
            detail="Al recibir"
          />
          <CheckoutOptionCard
            name="payment"
            value="tarjeta"
            checked={payment === "tarjeta"}
            onChange={() => setPayment("tarjeta")}
            icon={<CreditCard className="size-5" aria-hidden />}
            title="Tarjeta"
            detail="Terminal física"
          />
        </div>
        {errors.payment ? (
          <p className="px-1 text-sm text-destructive">{errors.payment}</p>
        ) : null}
        {payment === "efectivo" && (
          <CheckoutField
            label="¿Con cuánto pagas? (opcional)"
            name="cashAmount"
            type="number"
            inputMode="numeric"
            min={total}
            placeholder={`Ej. ${Math.ceil(total / 100) * 100 + (total % 100 === 0 ? 100 : 0)}`}
            hint="Para llevarte el cambio exacto."
            error={errors.cashAmount}
          />
        )}
      </fieldset>

      <section aria-label="Resumen" className="rounded-2xl bg-card p-5">
        <ul className="flex flex-col gap-2 text-sm">
          {lines.map((line) => (
            <li key={line.id} className="flex justify-between gap-4">
              <span>
                {line.quantity} × {line.name}
              </span>
              <span className="tabular-nums">
                {formatPrice(line.price * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span className="tabular-nums">{formatPrice(deliveryFee)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-semibold">Total a pagar</span>
            <span className="font-serif text-2xl font-bold tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </section>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      {errors.items ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.items}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || lines.length === 0}
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-70"
      >
        {pending && <Loader2 className="size-5 animate-spin" aria-hidden />}
        {pending
          ? "Enviando pedido…"
          : `Confirmar pedido · ${formatPrice(total)}`}
      </button>
    </form>
  );
}
