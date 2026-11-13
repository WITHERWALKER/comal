import type { DbFulfillmentType } from "../domain/fulfillment";
import { getCheckoutDatabase } from "../infrastructure/checkout-database";

export type GuestOrderItem = {
  productName: string;
  unitPrice: number;
  quantity: number;
};

export type GuestOrder = {
  id: string;
  folio: string;
  accessToken: string;
  customerName: string;
  customerPhone: string;
  fulfillmentType: DbFulfillmentType;
  deliveryAddress: string | null;
  deliveryNotes: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: GuestOrderItem[];
};

type OrderRow = {
  id: string;
  folio: string;
  access_token: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_type: DbFulfillmentType;
  delivery_address: string | null;
  delivery_notes: string | null;
  notes: string | null;
  subtotal: number | string;
  delivery_fee: number | string;
  total: number | string;
};

type ItemRow = {
  product_name: string;
  unit_price: number | string;
  quantity: number;
};

export async function getGuestOrderByToken(
  accessToken: string,
): Promise<GuestOrder | null> {
  const supabase = await getCheckoutDatabase();

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_guest_order",
    { p_access_token: accessToken },
  );

  if (!rpcError && rpcData && typeof rpcData === "object") {
    const payload = rpcData as {
      order: OrderRow;
      items: ItemRow[];
    };

    return mapGuestOrder(payload.order, payload.items ?? []);
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, folio, access_token, customer_name, customer_phone, fulfillment_type, delivery_address, delivery_notes, notes, subtotal, delivery_fee, total",
    )
    .eq("access_token", accessToken)
    .maybeSingle();

  if (orderError || !order) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, unit_price, quantity")
    .eq("order_id", order.id);

  if (itemsError) {
    return null;
  }

  return mapGuestOrder(order as OrderRow, (items as ItemRow[]) ?? []);
}

function mapGuestOrder(order: OrderRow, items: ItemRow[]): GuestOrder {
  return {
    id: order.id,
    folio: order.folio,
    accessToken: order.access_token,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    fulfillmentType: order.fulfillment_type,
    deliveryAddress: order.delivery_address,
    deliveryNotes: order.delivery_notes,
    notes: order.notes,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.delivery_fee),
    total: Number(order.total),
    items: items.map((item) => ({
      productName: item.product_name,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
    })),
  };
}
