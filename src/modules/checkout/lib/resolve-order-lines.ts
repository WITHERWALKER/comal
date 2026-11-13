import type {
  CheckoutLineInput,
  OrderAmounts,
  ResolvedOrderLine,
} from "../domain/create-order-input";
import { DEFAULT_BUSINESS_SLUG } from "../domain/constants";
import type { DbFulfillmentType } from "../domain/fulfillment";
import { getCheckoutDatabase } from "../infrastructure/checkout-database";

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  business_id: string;
};

export class CheckoutCatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutCatalogError";
  }
}

export async function resolveOrderLines(
  items: CheckoutLineInput[],
  fulfillmentType: DbFulfillmentType,
): Promise<{
  lines: ResolvedOrderLine[];
  businessId: string;
  amounts: OrderAmounts;
}> {
  const supabase = await getCheckoutDatabase();
  const productIds = items.map((item) => item.productId);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, business_id")
    .in("id", productIds)
    .is("archived_at", null)
    .eq("is_available", true);

  if (error) {
    throw new Error(`No se pudieron validar los productos: ${error.message}`);
  }

  const byId = new Map(
    (products as ProductRow[] | null)?.map((row) => [row.id, row]) ?? [],
  );

  if (byId.size !== new Set(productIds).size) {
    throw new CheckoutCatalogError(
      "Algunos productos ya no están disponibles. Actualiza tu carrito.",
    );
  }

  const businessIds = new Set(
    [...byId.values()].map((row) => row.business_id),
  );
  if (businessIds.size !== 1) {
    throw new CheckoutCatalogError("El pedido incluye productos de otro negocio.");
  }

  const businessId = [...businessIds][0]!;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, slug, is_active, delivery_fee")
    .eq("id", businessId)
    .maybeSingle();

  if (businessError || !business?.is_active) {
    throw new CheckoutCatalogError("El negocio no está disponible en este momento.");
  }

  if (business.slug !== DEFAULT_BUSINESS_SLUG) {
    // MVP single-tenant: aceptamos el business del catálogo aunque el slug difiera.
  }

  const quantityByProduct = new Map(
    items.map((item) => [item.productId, item.quantity]),
  );

  const lines: ResolvedOrderLine[] = [];

  for (const [productId, quantity] of quantityByProduct) {
    const product = byId.get(productId);
    if (!product) {
      throw new CheckoutCatalogError(
        "Algunos productos ya no están disponibles. Actualiza tu carrito.",
      );
    }

    lines.push({
      productId: product.id,
      businessId: product.business_id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity,
    });
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const businessDeliveryFee = Number(business.delivery_fee);
  const deliveryFee =
    fulfillmentType === "delivery" ? businessDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  return {
    lines,
    businessId,
    amounts: { subtotal, deliveryFee, total },
  };
}
