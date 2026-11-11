import Link from "next/link";
import { routes } from "@/src/config/navigation";
import { ArrowRight } from "lucide-react";

export default function CartSummaryBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href={routes.checkout}
        className="pointer-events-auto flex items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-4 text-primary-foreground shadow-lg shadow-secondary/25 transition-all active:scale-[0.98] hover:bg-secondary/90"
      >
        <span className="font-medium text-lg">Continuar</span>

        <ArrowRight size={24} strokeWidth={2} />
      </Link>
    </div>
  );
}
