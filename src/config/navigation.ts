/** Rutas públicas y de operación — única fuente de verdad para links y redirects. */
export const routes = {
  home: "/",
  menu: "/menu",
  cart: "/cart",
  checkout: "/checkout",
  courier: "/courier",
  admin: "/admin",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export function menuCategoryUrl(slug: string): string {
  return `${routes.menu}?category=${encodeURIComponent(slug)}`;
}

export const publicNavLinks = [
  { href: routes.home, label: "Inicio" },
  { href: routes.menu, label: "Menú" },
  { href: routes.cart, label: "Mi pedido" },
  { href: routes.courier, label: "Repartidores" },
] as const;
