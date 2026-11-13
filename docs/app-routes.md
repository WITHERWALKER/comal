# Estructura de rutas (`src/app`)

Convenciones del App Router en Comal. Los **route groups** `(nombre)` organizan código y layouts; **no** forman parte de la URL.

## Mapa

| Ruta | Archivo | Layout | Audiencia |
|------|---------|--------|-----------|
| `/` | `(public)/page.tsx` | `(public)/layout` | Cliente |
| `/menu` | `(public)/menu/page.tsx` | `(public)/layout` | Cliente |
| `/cart` | `(public)/cart/page.tsx` | `(public)/layout` | Cliente |
| `/checkout` | `(public)/checkout/page.tsx` | `(public)/layout` | Cliente |
| `/order/[token]` | `(public)/order/[token]/page.tsx` | `(public)/layout` | Cliente (confirmación invitado) |
| `/admin` | `(admin)/admin/page.tsx` | `(admin)/admin/layout` | Operación |
| `/courier` | `(courier)/courier/page.tsx` | `(courier)/courier/layout` | Repartidor |
| `/api/health` | `api/health/route.ts` | — | Infra |

## Redirects (URLs antiguas en español)

- `/carrito` → `/cart`
- `/repartidor` → `/courier`

Configurados en [`next.config.ts`](../next.config.ts).

## Links en código

Usar [`src/config/navigation.ts`](../src/config/navigation.ts) (`routes`, `menuCategoryUrl`, `publicNavLinks`). No hardcodear paths en componentes.

## Providers

- **Root** [`layout.tsx`](../src/app/layout.tsx): fuentes, shell HTML, `CartProvider` (cliente; compartido hasta tener layouts más finos).
- **Público** [`(public)/layout.tsx`](../src/app/(public)/layout.tsx): `Navbar`.
- **Admin / courier**: layouts propios sin navbar de cliente (auth vía middleware en el futuro).

## Añadir páginas

- Flujo cliente (menú, pedido, confirmación): bajo `(public)/`.
- Panel admin: bajo `(admin)/admin/…` con `layout.tsx` del segmento.
- Repartidor: bajo `(courier)/courier/…`.
