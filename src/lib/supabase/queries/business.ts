import { DEFAULT_BUSINESS_SLUG } from "@/src/modules/checkout/domain/constants";
import { getSupabase } from "@/src/lib/supabase/server";

export type PublicBusiness = {
  name: string;
  slug: string;
  address: string;
  deliveryFee: number;
  hours: string;
  lastOrder: string;
};

type BusinessRow = {
  name: string;
  slug: string;
  address: string | null;
  delivery_fee: number | string;
  settings: unknown;
  is_active: boolean;
};

function parseStoreSettings(settings: unknown): Pick<PublicBusiness, "hours" | "lastOrder"> {
  if (!settings || typeof settings !== "object") {
    return { hours: "", lastOrder: "" };
  }
  const record = settings as Record<string, unknown>;
  return {
    hours: typeof record.hours === "string" ? record.hours : "",
    lastOrder: typeof record.lastOrder === "string" ? record.lastOrder : "",
  };
}

export function mapBusinessRow(row: BusinessRow): PublicBusiness {
  const { hours, lastOrder } = parseStoreSettings(row.settings);
  return {
    name: row.name,
    slug: row.slug,
    address: row.address?.trim() ?? "",
    deliveryFee: Number(row.delivery_fee),
    hours,
    lastOrder,
  };
}

export async function getBusinessBySlug(
  slug: string = DEFAULT_BUSINESS_SLUG,
): Promise<PublicBusiness | null> {
  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("businesses")
    .select("name, slug, address, delivery_fee, settings, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el negocio: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapBusinessRow(data as BusinessRow);
}

export async function getDefaultBusiness(): Promise<PublicBusiness> {
  const business = await getBusinessBySlug();
  if (!business) {
    throw new Error("El negocio no está disponible.");
  }
  return business;
}

/** Etiqueta legible para la hora límite de pedido (settings.lastOrder). */
export function formatLastOrderLabel(lastOrder: string): string {
  const trimmed = lastOrder.trim();
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const hour24 = Number(match[1]);
  const minutes = match[2];
  const period = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minutes} ${period}`;
}
