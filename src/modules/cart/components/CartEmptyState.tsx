import Link from "next/link";
import { routes } from "@/src/config/navigation";

export default function CartEmptyState() {
  return (
    <div className="mt-8 flex flex-col items-center gap-4 text-center">
      <p className="text-muted-foreground text-sm">
        Tu pedido está vacío. <br />
        Agrega unas gorditas, un burrito o tu comida corrida del día.
      </p>
      <Link
        href={routes.menu}
        className="text-sm font-semibold uppercase tracking-wider text-primary underline underline-offset-4"
      >
        Ver menú
      </Link>
    </div>
  );
}
