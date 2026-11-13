import type { PaymentType } from "../types.checkout";

export function buildOrderNotes(params: {
  kitchenNotes: string | null;
  paymentMethod: PaymentType;
  cashAmount: number | null;
}): string | null {
  const parts: string[] = [];

  if (params.kitchenNotes) {
    parts.push(params.kitchenNotes);
  }

  if (params.paymentMethod === "tarjeta") {
    parts.push("Pago: tarjeta al recibir.");
  } else if (params.cashAmount !== null) {
    parts.push(`Pago: efectivo con $${params.cashAmount}.`);
  } else {
    parts.push("Pago: efectivo al recibir.");
  }

  const combined = parts.join("\n").trim();
  return combined.length > 0 ? combined.slice(0, 255) : null;
}
