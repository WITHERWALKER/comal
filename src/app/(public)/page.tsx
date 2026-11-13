import Link from "next/link";
import { menuCategoryUrl, routes } from "@/src/config/navigation";
import {
  formatLastOrderLabel,
  getDefaultBusiness,
} from "@/src/lib/supabase/queries/business";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

type Tile = {
  href: string;
  label: string;
  image?: string;
  className: string;
};

const tiles: Tile[] = [
  {
    href: menuCategoryUrl("gorditas"),
    label: "Gorditas",
    image: "/images/gorditas1.png",
    className: "aspect-square",
  },
  {
    href: menuCategoryUrl("burritos"),
    label: "Burritos",
    image: "/images/burritos1.png",
    className: "aspect-square",
  },
  {
    href: menuCategoryUrl("comida-corrida"),
    label: "Comida corrida",
    image: "/images/comida-corrida.png",
    className: "col-span-2 aspect-[2/1]",
  },
  {
    href: menuCategoryUrl("tacos"),
    label: "Tacos",
    image: "/images/tacos.png",
    className: "row-span-2",
  },
  {
    href: menuCategoryUrl("bebidas"),
    label: "Aguas & Bebidas",
    image: "/images/bebidas1.png",
    className: "aspect-square",
  },
  {
    href: menuCategoryUrl("postres"),
    label: "Postres",
    className: "aspect-square bg-secondary",
  },
];

export default async function HomePage() {
  const business = await getDefaultBusiness();

  return (
    <main className="flex flex-1 flex-col px-4 pb-10 bg-background">
      <header className="px-1 pb-6 pt-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider">
          Cocina corrida mexicana
        </p>

        <h1 className="mt-3 text-balance text-5xl leading-[0.85] font-black text-secondary">
          Hecho en comal, todos los días
        </h1>

        <p className="mx-auto mt-4 max-w-xs text-pretty leading-relaxed">
          Pide en línea y paga al recibir. A domicilio o pasa por él.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className={cn(
              "group relative overflow-hidden rounded-2xl",
              tile.className,
            )}
          >
            {tile.image && (
              <>
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(max-width: 512px) 50vw, 224px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-linear-to-b from-black/45 via-black/5 to-transparent" />
              </>
            )}
            <span
              className={cn(
                "relative block p-3 font-serif text-3xl font-extrabold leading-[1.05] text-background",
              )}
            >
              {tile.label}
            </span>
          </Link>
        ))}
        <div className="col-span-2 flex items-center justify-between rounded-2xl bg-secondary-500 p-4 text-secondary-foreground">
          <span className="font-serif font-black text-background text-2xl leading-none">
            A domicilio
            <br />o para recoger
          </span>

          <Link
            href={routes.menu}
            className="rounded-lg bg-primary-300 px-3 py-2 font-semibold text-primary-950"
          >
            Ver menú
          </Link>
        </div>
      </div>

      <footer className="mt-8 rounded-2xl border border-border p-4 text-center text-sm leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">{business.address}</p>
        {business.hours ? <p>{business.hours}</p> : null}
        {business.lastOrder ? (
          <p>Último pedido a las {formatLastOrderLabel(business.lastOrder)}</p>
        ) : null}
      </footer>
    </main>
  );
}
