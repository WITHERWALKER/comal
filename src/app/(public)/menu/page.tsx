import { getCategories, getProducts } from "@/src/lib/supabase/queries/catalog";
import CartFloatingButton from "@/src/modules/cart/components/CartFloatingButton";
import MenuCatalog from "@/src/modules/products/components/MenuCatalog";
import { Suspense } from "react";

function MenuCatalogFallback() {
  return (
    <p className="mt-6 text-center text-muted-foreground">Cargando menú…</p>
  );
}

async function MenuCatalogLoader() {
  try {
    const [categories, products] = await Promise.all([
      getCategories(),
      getProducts(),
    ]);

    return <MenuCatalog categories={categories} products={products} />;
  } catch {
    return (
      <p className="pt-8 text-center text-destructive">
        No se pudo cargar el menú. Intenta de nuevo más tarde.
      </p>
    );
  }
}

export default function MenuPage() {
  return (
    <main className="flex flex-1 flex-col px-4 pb-10 bg-background">
      <header className="px-1 pb-6 pt-4 text-center">
        <h1 className="font-black text-secondary text-6xl mb-6">Menú</h1>

        <p>Ordena tus alimentos aquí y realiza tu pedido!</p>
        <p>Haz tu pedido antes de las 4:30 pm.</p>
        <p>Envío a domicilio $25. Pagas al recibir.</p>
      </header>

      <Suspense fallback={<MenuCatalogFallback />}>
        <MenuCatalogLoader />
      </Suspense>
      <CartFloatingButton />
    </main>
  );
}
