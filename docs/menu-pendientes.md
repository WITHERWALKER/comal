# Menú — pendientes

Lista de trabajo para el menú público y el flujo cliente inmediato.  
Actualizado a partir del estado del repo y [`Comal_Context.md`](../Comal_Context.md).

Marcar con `[x]` conforme se complete.

---

## Hecho (referencia)

- [x] Catálogo desde Supabase (`getCategories` / `getProducts` en [`src/lib/supabase/queries/catalog.ts`](../src/lib/supabase/queries/catalog.ts)).
- [x] Filtro por categoría con `?category=` y `slug` en BD.
- [x] Vista **Todo** agrupada por secciones + encabezados sticky ([`MenuCatalog`](../src/modules/products/components/MenuCatalog.tsx)).
- [x] `ProductCard` + carrito en memoria ([`CartProvider`](../src/shared/context/cart-provider.tsx)).
- [x] Página [`/menu`](<../src/app/(public)/menu/page.tsx>) con copy básico y `Suspense`.

---

## Datos y backend (menú público)

- [ ] **RLS** en `categories` / `products` para lectura pública anónima (la migración inicial indica que RLS va en migraciones posteriores).
- [ ] **Multi-negocio**: filtrar por `business_id` (hoy se traen filas sin acotar al negocio demo).
- [ ] **Tipos generados** (`database.types.ts`) y usarlos en `catalog.ts` en lugar de rows manuales.
- [ ] **Imágenes**: incluir `image_path` en la query y mostrarlas en `ProductCard` (Storage + URL pública o firmada).
- [ ] **Orden de productos**: definir criterio (solo `name`, `sort_order`, etc.).
- [ ] **Badges** (p. ej. «Favorito»): campo en BD o regla de negocio; no existe aún en schema.
- [ ] **Descripción de categoría** (subtítulo bajo el nombre): columna en BD o copy estático (pospuesto; sigue en maqueta).

---

## UX / UI del menú

- [ ] **Barra de categorías sticky** bajo el navbar (hoy la rejilla scrollea con la página).
- [ ] **Scroll-spy en Todo**: resaltar categoría activa al pasar secciones al hacer scroll.
- [ ] `?category=` **inválido**: redirect a `/menu` o estado «categoría no encontrada» (hoy slug desconocido puede confundir con Todo o lista vacía).
- [ ] **Copy de empty state** distinto para Todo vs categoría sin productos.
- [ ] `loading.tsx` en `/menu` con skeleton (hoy solo texto en fallback de `Suspense`).
- [ ] `error.tsx` o boundary reutilizable (hoy `catch` genérico en la page).
- [ ] **Metadata** (`title`, `description`) en `menu/page.tsx`.
- [ ] **Copy de negocio**: alinear envío $25 y hora límite con [`STORE`](../src/lib/menu.ts) (parte hardcodeada en la page).
- [ ] **Home → menú**: verificar que cada `?category=` en [`page.tsx`](<../src/app/(public)/page.tsx>) coincida con `categories.slug` en BD.

---

## Producto en tarjeta y carrito (desde menú)

- [x] **Cantidad visible en menú** (controles +/- con iconos animate-ui en `ProductCard`).
- [x] **Persistencia del carrito** (`localStorage`, clave `comal-cart-v1`).
- [x] **Badge en navbar** con `count` de `useCart`.
- [x] **Página carrito** conectada a `useCart` ([`CartView`](../src/modules/cart/components/CartView.tsx)).
- [x] **Ruta del carrito**: [`/cart`](../src/app/(public)/cart/page.tsx).
- [x] **`DELIVERY_FEE`** en [`menu.ts`](../src/lib/menu.ts) (checkout en fase 2).
- [ ] **Checkout** real (sustituir prueba `todos` en [`checkout/page.tsx`](<../src/app/(public)/checkout/page.tsx>)).
- [x] Botón **Continuar** del carrito → checkout (subtotal real; checkout en fase 2).

---

## Calidad y operación

- [ ] Quitar o proteger [`test-db`](<../src/app/(public)/test-db/page.tsx>) en producción.
- [ ] Prueba manual/E2E: Todo → filtro → deep link desde home → carrito → recarga.
- [ ] Arreglar **TypeScript** del proyecto (`api/health/route.ts`) para que `pnpm build` pase en CI.

---

## Prioridad sugerida

1. Slugs home + `?category=` inválido + RLS lectura pública.
2. ~~Carrito persistente + badge en navbar~~ (fase 1 hecha).
3. Imágenes y polish UI (sticky categorías, loading, empty states).
4. Subtítulos / favoritos si entran en diseño final.
5. Checkout y creación de pedido (cierra el flujo MVP).
