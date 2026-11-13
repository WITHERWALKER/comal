# Menú y flujo público — pendientes

Checklist del **cliente** (home, menú, carrito, checkout, confirmación).  
No incluye admin ni repartidor.

Última actualización: 12/nov/2026 · Contexto: [`comal-context.md`](comal-context.md) · Estado global: [`status-project.md`](status-project.md)

Marcar con `[x]` conforme se complete.

---

## Hecho (referencia)

### Catálogo y menú

- [x] Catálogo desde Supabase (`getCategories` / `getProducts` en [`catalog.ts`](../src/lib/supabase/queries/catalog.ts)).
- [x] Filtro por categoría con `?category=` y `slug` en BD.
- [x] Vista **Todo** agrupada por secciones + encabezados de categoría ([`MenuCatalog`](../src/modules/products/components/MenuCatalog.tsx)).
- [x] `ProductCard` con controles +/- y carrito en contexto ([`CartProvider`](../src/shared/context/cart-provider.tsx)).
- [x] Página [`/menu`](../src/app/(public)/menu/page.tsx) con `Suspense` y manejo de error en el loader.

### Carrito

- [x] Persistencia (`localStorage`, clave `comal-cart-v1`).
- [x] Página [`/cart`](../src/app/(public)/cart/page.tsx) con [`CartView`](../src/modules/cart/components/CartView.tsx).
- [x] Botón flotante “Ver pedido” en menú ([`CartFloatingButton`](../src/modules/cart/components/CartFloatingButton.tsx)) con contador.
- [x] Continuar → checkout con subtotal real.
- [x] `DELIVERY_FEE` en [`menu.ts`](../src/lib/menu.ts).

### Checkout y confirmación

- [x] Checkout real en [`/checkout`](../src/app/(public)/checkout/page.tsx) ([`CheckoutForm`](../src/modules/checkout/components/CheckoutForm.tsx)): modalidad, datos, notas, pago, resumen.
- [x] Validación y precios server-side ([`resolve-order-lines`](../src/modules/checkout/lib/resolve-order-lines.ts), negocio por `DEFAULT_BUSINESS_SLUG`).
- [x] Creación de pedido + líneas en BD ([`persist-order`](../src/modules/checkout/lib/persist-order.ts)).
- [x] Confirmación pública [`/order/[token]`](../src/app/(public)/order/[token]/page.tsx) vía `get_guest_order` / [`OrderConfirmationView`](../src/modules/checkout/components/OrderConfirmationView.tsx).
- [x] Vaciar carrito al llegar a confirmación ([`ClearCartOnMount`](../src/modules/checkout/components/ClearCartOnMount.tsx)).
- [x] Migraciones de pedidos + políticas RLS de invitado (insert/select + RPC).

### Infra menor

- [x] [`/api/health`](../src/app/api/health/route.ts) — `pnpm build` OK.
- [x] Eliminada la página de prueba `test-db` (ya no existe en el repo).

---

## Datos y backend (menú público)

- [ ] **RLS** en `categories` / `products` para lectura pública anónima (pedidos ya tienen RLS; catálogo sigue sin políticas).
- [ ] **Multi-negocio**: filtrar por `business_id` en `catalog.ts` (checkout ya resuelve negocio; el menú trae todas las filas visibles).
- [ ] **Tipos generados** (`database.types.ts`) y usarlos en `catalog.ts` y checkout.
- [ ] **Imágenes**: `image_path` en query y UI (`ProductCard` / Storage).
- [ ] **Orden de productos**: criterio único (`sort_order` vs solo `name`).
- [ ] **Badges** (p. ej. «Favorito»): campo o regla en BD.
- [ ] **Descripción de categoría** (subtítulo): columna en BD o copy acordado.

---

## UX / UI del menú

- [ ] **Barra de categorías sticky** bajo el navbar.
- [ ] **Scroll-spy en Todo**: resaltar categoría activa al hacer scroll.
- [ ] `?category=` **inválido**: redirect o mensaje claro (hoy un slug desconocido se comporta como «Todo»).
- [ ] **Copy de empty state** distinto para Todo vs categoría sin productos (hoy mismo texto en ambos).
- [ ] `loading.tsx` en `/menu` con skeleton (hoy texto en fallback).
- [ ] `error.tsx` en segmento menú o boundary reutilizable.
- [ ] **Metadata** (`title`, `description`) en home, menú, carrito y checkout.
- [ ] **Copy de negocio**: hora límite y envío alineados con [`STORE`](../src/lib/menu.ts) (parte hardcodeada en `menu/page.tsx`).
- [ ] **Home → menú**: comprobar que cada slug en [`page.tsx`](../src/app/(public)/page.tsx) existe en BD (p. ej. `postres`).

---

## Carrito y navbar

- [ ] **Badge en navbar** con ítems del carrito (el contador vive en el botón flotante, no en [`Navbar`](../src/shared/components/Navbar.tsx)).
- [ ] **formatPrice** (`Intl` MXN) en menú y carrito (checkout ya lo usa).

---

## Checkout y post-confirmación (pulido / fase 2)

- [ ] **Metadata** y título en checkout.
- [ ] **Pedido programado** (`scheduled_for` en BD; sin UI).
- [ ] **Reglas de horario** (corte 4:30 pm, anticipación mínima) en servidor.
- [ ] **Seguimiento del pedido** para el cliente (misma URL con estados en tiempo real o enlace “ver estado”); hoy solo confirmación estática.
- [ ] Registrar ruta `order` en [`navigation.ts`](../src/config/navigation.ts) y documentar en [`app-routes.md`](app-routes.md).
- [ ] Endurecer políticas RLS de lectura en `orders` antes de producción.

---

## Calidad

- [ ] Prueba manual/E2E: home → categoría → carrito → recarga → checkout → confirmación → volver al menú.
- [ ] Commitear y aplicar en remoto migraciones + módulo checkout aún locales (nov 2026).

---

## Prioridad sugerida (solo público)

1. RLS catálogo + filtro `business_id` + slugs home validados.
2. `?category=` inválido + metadata básica.
3. Imágenes, sticky categorías, skeletons y `formatPrice` en menú.
4. Seguimiento de pedido / programados (si entran en el siguiente hito de producto).
