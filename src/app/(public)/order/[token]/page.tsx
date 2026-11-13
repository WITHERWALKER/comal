import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderConfirmationView from "@/src/modules/checkout/components/OrderConfirmationView";
import { getGuestOrderByToken } from "@/src/modules/checkout/lib/get-guest-order";
import { getDefaultBusiness } from "@/src/lib/supabase/queries/business";

export const metadata: Metadata = {
  title: "Pedido confirmado · Comal",
};

type PageProps = {
  params: Promise<{ token: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { token } = await params;

  if (!isUuid(token)) {
    notFound();
  }

  const [order, business] = await Promise.all([
    getGuestOrderByToken(token),
    getDefaultBusiness(),
  ]);
  if (!order) {
    notFound();
  }

  return (
    <OrderConfirmationView order={order} pickupAddress={business.address} />
  );
}
