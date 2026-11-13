import type { FulfillmentType, PaymentType } from "../types.checkout";
import type { DbFulfillmentType } from "./fulfillment";

export type CheckoutLineInput = {
  productId: string;
  quantity: number;
};

export type ParsedCheckoutForm = {
  customerName: string;
  customerPhone: string;
  fulfillment: FulfillmentType;
  fulfillmentType: DbFulfillmentType;
  paymentMethod: PaymentType;
  cashAmount: number | null;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  kitchenNotes: string | null;
  items: CheckoutLineInput[];
};

export type ResolvedOrderLine = {
  productId: string;
  businessId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type OrderAmounts = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};
