import type { FulfillmentType } from "../types.checkout";

export type DbFulfillmentType = "delivery" | "pickup";

export function toDbFulfillment(value: FulfillmentType): DbFulfillmentType {
  return value === "domicilio" ? "delivery" : "pickup";
}
