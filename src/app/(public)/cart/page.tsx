import CartView from "@/src/modules/cart/components/CartView";

export default function CartPage() {
  return (
    <main className="flex flex-1 flex-col bg-background px-4 pb-10">
      <header className="px-1 pb-6 pt-4 text-center">
        <h1 className="mb-6 font-black text-secondary text-6xl">Tu pedido</h1>
        <p>Checa que todos tus productos estén correctos antes de seguir!.</p>
      </header>

      <CartView />
    </main>
  );
}
