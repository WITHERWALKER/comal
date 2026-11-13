export type FulfillmentType = "domicilio" | "recoger";

export type PaymentType = "efectivo" | "tarjeta";

export type { CheckoutActionState, CheckoutFieldErrors } from "./domain/checkout-state";
export { checkoutInitialState } from "./domain/checkout-state";
