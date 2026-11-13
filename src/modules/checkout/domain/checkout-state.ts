export type CheckoutFieldErrors = Partial<
  Record<
    | "name"
    | "phone"
    | "address"
    | "references"
    | "notes"
    | "items"
    | "fulfillment"
    | "payment"
    | "cashAmount",
    string
  >
>;

export type CheckoutActionState = {
  error?: string;
  fieldErrors?: CheckoutFieldErrors;
};

export const checkoutInitialState: CheckoutActionState = {};
