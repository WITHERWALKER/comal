import { Suspense } from "react";
import CheckoutForm from "@/src/modules/checkout/components/CheckoutForm";
import { getDefaultBusiness } from "@/src/lib/supabase/queries/business";

export default async function CheckoutPage() {
  const business = await getDefaultBusiness();

  return (
    <main className="flex flex-1 flex-col px-4 pb-10 pt-8 bg-background">
      <h1 className="font-serif text-2xl font-bold">Checkout</h1>
      <Suspense
        fallback={<p className="mt-4 text-muted-foreground">Cargando…</p>}
      >
        <CheckoutForm business={business} />
      </Suspense>
    </main>
  );
}
