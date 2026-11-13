import {
  CHECKOUT_MAX_PER_ITEM,
  CHECKOUT_MAX_TOTAL_ITEMS,
} from "../domain/constants";
import type { ParsedCheckoutForm, CheckoutLineInput } from "../domain/create-order-input";
import type { CheckoutFieldErrors } from "../domain/checkout-state";
import { toDbFulfillment } from "../domain/fulfillment";
import type { FulfillmentType, PaymentType } from "../types.checkout";

type ParseSuccess = { ok: true; data: Omit<ParsedCheckoutForm, "items"> & { items: CheckoutLineInput[] } };
type ParseFailure = {
  ok: false;
  error?: string;
  fieldErrors: CheckoutFieldErrors;
};

export type ParseCheckoutFormResult = ParseSuccess | ParseFailure;

function trim(value: FormDataEntryValue | null, max = 300): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function parseItemLines(raw: string): CheckoutLineInput[] | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) return null;

  const quantities = new Map<string, number>();

  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) return null;
    const { id, quantity } = entry as { id?: unknown; quantity?: unknown };
    if (typeof id !== "string") return null;
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      return null;
    }
    quantities.set(id, (quantities.get(id) ?? 0) + quantity);
  }

  let totalItems = 0;
  const items: CheckoutLineInput[] = [];

  for (const [productId, quantity] of quantities) {
    if (quantity > CHECKOUT_MAX_PER_ITEM) return null;
    totalItems += quantity;
    items.push({ productId, quantity });
  }

  if (totalItems > CHECKOUT_MAX_TOTAL_ITEMS) return null;
  return items;
}

export function parseCheckoutForm(formData: FormData): ParseCheckoutFormResult {
  const fieldErrors: CheckoutFieldErrors = {};

  const items = parseItemLines(trim(formData.get("items"), 10_000));
  if (!items) {
    fieldErrors.items =
      "Tu pedido no es válido. Revisa tu carrito e inténtalo de nuevo.";
  }

  const fulfillment = trim(formData.get("fulfillment"), 20) as
    | FulfillmentType
    | "";
  if (fulfillment !== "domicilio" && fulfillment !== "recoger") {
    fieldErrors.fulfillment = "Elige cómo quieres recibir tu pedido.";
  }

  const paymentMethod = trim(formData.get("payment"), 20) as PaymentType | "";
  if (paymentMethod !== "efectivo" && paymentMethod !== "tarjeta") {
    fieldErrors.payment = "Elige cómo vas a pagar.";
  }

  const customerName = trim(formData.get("name"), 120);
  if (customerName.length < 2) {
    fieldErrors.name = "Escribe tu nombre.";
  }

  const customerPhone = trim(formData.get("phone"), 30).replace(/\D/g, "");
  if (customerPhone.length !== 10) {
    fieldErrors.phone = "Escribe un teléfono de 10 dígitos.";
  }

  let deliveryAddress: string | null = null;
  let deliveryNotes: string | null = null;

  if (fulfillment === "domicilio") {
    const address = trim(formData.get("address"), 255);
    if (address.length < 10) {
      fieldErrors.address = "Escribe tu dirección completa.";
    } else {
      deliveryAddress = address;
    }

    const references = trim(formData.get("references"), 255);
    if (references.length > 255) {
      fieldErrors.references = "Las referencias son demasiado largas.";
    } else if (references) {
      deliveryNotes = references;
    }
  }

  const kitchenNotes = trim(formData.get("notes"), 255);
  if (kitchenNotes.length > 255) {
    fieldErrors.notes = "Las notas son demasiado largas.";
  }

  const cashRaw = trim(formData.get("cashAmount"), 10);
  let cashAmount: number | null = null;
  if (paymentMethod === "efectivo" && cashRaw) {
    const value = Number(cashRaw);
    if (!Number.isFinite(value) || value <= 0 || value > 10_000) {
      fieldErrors.cashAmount = "Cantidad no válida.";
    } else {
      cashAmount = Math.round(value);
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  if (
    !items ||
    (fulfillment !== "domicilio" && fulfillment !== "recoger") ||
    (paymentMethod !== "efectivo" && paymentMethod !== "tarjeta")
  ) {
    return {
      ok: false,
      error: "No pudimos leer los datos del pedido.",
      fieldErrors: {},
    };
  }

  return {
    ok: true,
    data: {
      customerName,
      customerPhone,
      fulfillment,
      fulfillmentType: toDbFulfillment(fulfillment),
      paymentMethod,
      cashAmount,
      deliveryAddress,
      deliveryNotes,
      kitchenNotes: kitchenNotes || null,
      items,
    },
  };
}

export function validateCashAmount(
  cashAmount: number | null,
  paymentMethod: PaymentType,
  total: number,
): string | undefined {
  if (paymentMethod !== "efectivo" || cashAmount === null) return undefined;
  if (cashAmount < total) {
    return "Debe ser igual o mayor al total.";
  }
  return undefined;
}
