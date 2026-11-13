"use server";

import { redirect } from "next/navigation";
import { createOrderFromForm } from "../application/create-order";
import type { CheckoutActionState } from "../domain/checkout-state";
import { orderConfirmationPath } from "../lib/routes";

export async function createOrderAction(
  _prevState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const result = await createOrderFromForm(formData);

  if (!result.ok) {
    return result.state;
  }

  redirect(orderConfirmationPath(result.accessToken));
}
