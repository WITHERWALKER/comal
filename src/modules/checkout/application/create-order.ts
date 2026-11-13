import type { CheckoutActionState } from "../domain/checkout-state";
import {
  parseCheckoutForm,
  validateCashAmount,
} from "../lib/parse-checkout-form";
import { CheckoutCatalogError, resolveOrderLines } from "../lib/resolve-order-lines";
import { persistOrder } from "../lib/persist-order";

export type CreateOrderSuccess = {
  ok: true;
  accessToken: string;
};

export type CreateOrderFailure = {
  ok: false;
  state: CheckoutActionState;
};

export type CreateOrderResult = CreateOrderSuccess | CreateOrderFailure;

export async function createOrderFromForm(
  formData: FormData,
): Promise<CreateOrderResult> {
  const parsed = parseCheckoutForm(formData);
  if (!parsed.ok) {
    return {
      ok: false,
      state: {
        error: parsed.error,
        fieldErrors: parsed.fieldErrors,
      },
    };
  }

  try {
    const { lines, businessId, amounts } = await resolveOrderLines(
      parsed.data.items,
      parsed.data.fulfillmentType,
    );

    const cashError = validateCashAmount(
      parsed.data.cashAmount,
      parsed.data.paymentMethod,
      amounts.total,
    );

    if (cashError) {
      return {
        ok: false,
        state: {
          fieldErrors: { cashAmount: cashError },
        },
      };
    }

    const order = await persistOrder(
      parsed.data,
      lines,
      amounts,
      businessId,
    );

    return { ok: true, accessToken: order.accessToken };
  } catch (err) {
    if (err instanceof CheckoutCatalogError) {
      return {
        ok: false,
        state: { error: err.message },
      };
    }

    const message =
      err instanceof Error ? err.message : "No se pudo crear el pedido.";

    return {
      ok: false,
      state: { error: message },
    };
  }
}
