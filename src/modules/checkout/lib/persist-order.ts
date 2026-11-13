import type {
  ParsedCheckoutForm,
  ResolvedOrderLine,
  OrderAmounts,
} from "../domain/create-order-input";
import { getCheckoutDatabase } from "../infrastructure/checkout-database";
import { buildOrderNotes } from "./build-order-notes";
import { generateOrderFolio } from "./next-folio";

const MAX_FOLIO_ATTEMPTS = 6;

export type PersistedOrder = {
  orderId: string;
  folio: string;
  accessToken: string;
};

export async function persistOrder(
  input: ParsedCheckoutForm,
  lines: ResolvedOrderLine[],
  amounts: OrderAmounts,
  businessId: string,
): Promise<PersistedOrder> {
  const supabase = await getCheckoutDatabase();

  const notes = buildOrderNotes({
    kitchenNotes: input.kitchenNotes,
    paymentMethod: input.paymentMethod,
    cashAmount: input.cashAmount,
  });

  let order: { id: string; folio: string; access_token: string } | null = null;

  for (let attempt = 0; attempt < MAX_FOLIO_ATTEMPTS; attempt++) {
    const folio = generateOrderFolio();

    const { data, error: orderError } = await supabase
      .from("orders")
      .insert({
        business_id: businessId,
        folio,
        fulfillment_type: input.fulfillmentType,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        delivery_address: input.deliveryAddress,
        delivery_notes: input.deliveryNotes,
        notes,
        subtotal: amounts.subtotal,
        delivery_fee: amounts.deliveryFee,
        total: amounts.total,
      })
      .select("id, folio, access_token")
      .single();

    if (!orderError && data) {
      order = data;
      break;
    }

    if (orderError?.code === "23505") {
      continue;
    }

    throw new Error(orderError?.message ?? "No se pudo registrar el pedido.");
  }

  if (!order) {
    throw new Error(
      "No pudimos asignar un folio único. Intenta de nuevo en un momento.",
    );
  }

  const itemRows = lines.map((line) => ({
    order_id: order.id,
    product_id: line.productId,
    business_id: line.businessId,
    product_name: line.productName,
    unit_price: line.unitPrice,
    quantity: line.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemRows);

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(
      `No se pudieron guardar los artículos: ${itemsError.message}`,
    );
  }

  return {
    orderId: order.id,
    folio: order.folio,
    accessToken: order.access_token,
  };
}
