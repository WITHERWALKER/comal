# Status del proyecto — Comal

Última actualización: 10/nov/2026

## Qué es

Web de pedidos para un negocio de comida mexicana (cocina corrida: gorditas, burritos, tacos, comida corrida, aguas y postres). El cliente pide en línea y paga al recibir (a domicilio $25 o para recoger). El plan completo (admin, cocina, repartidores) está definido en `Comal_Context.md`; hoy el desarrollo se concentra en el flujo del cliente.

## Stack

- Next.js 16.4.3 (App Router, Turbopack, `cacheComponents`) + React 19.3, TypeScript
- Tailwind CSS v4, fuentes Geist/Outfit/Fraunces, animate-ui + lucide
- Supabase (`@supabase/ssr` con clientes browser/server) — proyecto linkeado, CLI instalada, `.env` con URL y publishable key (correctamente ignorado por git)
- pnpm; sin framework de tests todavía

## Lo que ya hay

### Base de datos (2 migraciones)
- `initial_catalog`: `businesses`, `profiles` (roles admin/kitchen/courier), `categories`, `products` — con soft-delete (`archived_at`), disponibilidad, FK compuesta producto↔categoría del mismo negocio, triggers `updated_at`, índices parciales y comentarios.
- `add_slug_to_categories`: columna `slug` única por negocio + función `slugify` (quita acentos) + trigger que lo genera desde `name`.
- **Sin RLS todavía** y sin tablas de pedidos.

### Flujo del cliente (lo más avanzado)
- **Home (`/`)**: completa — grid de tiles por categoría con imágenes estáticas, enlazando con `?category=<slug>`, footer con datos de `STORE`.
- **Menú (`/menu`)**: datos reales desde Supabase en servidor (`getCategories` / `getProducts` en `src/lib/supabase/queries/catalog.ts`, filtrando activos/no archivados). Componente cliente `MenuCatalog` con vista "Todo" agrupada por secciones con encabezados sticky, filtro por categoría vía `?category=`, `Suspense` con fallback, y manejo de error en la carga.
- **Carrito completo (fase 1 cerrada)**: `CartProvider` en el layout raíz con persistencia en `localStorage` (`comal-cart-v1`), hidratación segura (`isHydrated`), `add`/`remove`/`setQuantity`/`clear`, tope de 20 por ítem.
  - `ProductCard` con contadores +/− animados.
  - Botón flotante "Ver carrito" en el menú (se oculta en `/cart` y `/checkout`).
  - `/cart` real: líneas con cantidades, subtotal, empty state y barra "Continuar" → checkout.
  - Badge de contador visible en el flujo (pendiente integrarlo al navbar según el checklist).
- **Navegación**: `src/config/navigation.ts` como única fuente de rutas y links del navbar; redirects permanentes `/carrito` → `/cart` y `/repartidor` → `/courier` en `next.config.ts`. (Se corrigió el bug de rutas del status anterior.)

### Estructura y app
- Route groups: `(public)` con layout que incluye `Navbar`; `(admin)` y `(courier)` con layouts propios (metadata + noindex, sin navbar de cliente).
- `error.tsx` global con botón Reintentar.
- Documentación viva: `Comal_Context.md` (contexto maestro del producto/arquitectura), `docs/app-routes.md` (mapa de rutas y convenciones), `docs/menu-pendientes.md` (checklist actualizado con lo hecho y lo pendiente).
- Antigua carga client-side de productos (`useProduct`), la página `test-db` y la maqueta estática del carrito **fueron eliminadas** — reemplazadas por el código real.

## Lo que falta

1. **Checkout real**: `/checkout` sigue siendo una prueba con la tabla `todos`; no conecta con el carrito ni captura modalidad (domicilio/recogida), datos del cliente ni horario. Es el hueco principal del flujo.
2. **Pedidos en DB**: tablas `orders` / `order_items` (con foto histórica de precios), folios, estados (`new → preparing → ready → on_the_way → delivered / cancelled`).
3. **RLS**: nada implementado aún. Prioritario antes de exponer nada público más allá del catálogo.
4. **Autenticación**: Supabase Auth para admin/kitchen/courier, middleware y layouts protegidos (hoy `/admin` y `/courier` son placeholders estáticos).
5. **Catálogo pendientes** (documentados en `docs/menu-pendientes.md`): filtrar por `business_id` (multi-negocio), tipos generados de DB, imágenes (`image_path` no se consulta ni muestra), badges, metadata de página, sticky de la barra de categorías, manejo de `?category=` inválido, skeleton de loading.
6. **Operación**: Kanban de cocina, asignación de repartidores, verificación de entrega, WhatsApp, Realtime.
7. **Calidad**: tests (carpeta vacía), script de `typecheck`, `api/health` vacío (rompe `pnpm build` según el checklist), deploy sin decidir (Vercel vs Cloudflare).

## Estructura actual

```
src/
├── app/
│   ├── (public)/            # Cliente: layout con Navbar
│   │   ├── page.tsx         # Home (tiles → menú por categoría)
│   │   ├── menu/            # Menú con datos de Supabase
│   │   ├── cart/            # Carrito real (CartView)
│   │   └── checkout/        # Placeholder (tabla todos)
│   ├── (admin)/admin/       # Placeholder + layout
│   ├── (courier)/courier/   # Placeholder + layout
│   ├── api/health/          # Ruta vacía
│   ├── layout.tsx           # Fuentes + CartProvider
│   └── error.tsx            # Error global
├── config/navigation.ts     # Rutas y links (fuente única)
├── lib/
│   ├── supabase/            # client.ts, server.ts, queries/catalog.ts
│   └── menu.ts              # STORE, DELIVERY_FEE (legacy del menú estático)
├── modules/
│   ├── products/            # types.ts + components (MenuCatalog, Categories, ProductCard…)
│   └── cart/                # types.ts, lib/storage.ts, components (CartView…)
└── shared/
    ├── context/cart-provider.tsx
    └── components/          # Navbar, animate-ui
supabase/migrations/         # 2 migraciones SQL versionadas
docs/                        # app-routes.md, menu-pendientes.md
Comal_Context.md             # Contexto maestro del proyecto
```

La estructura sigue la dirección del `Comal_Context.md` (monolito modular: `modules/` por dominio, `config/`, `shared/`). Aún no existen las capas `domain/` / `application/` / `infrastructure/` dentro de los módulos — razonable para el tamaño actual, pero el checkout/pedidos será el momento de introducirlas.

## Detalles de deuda detectados

- `console.log` de debug en `MenuCatalog` (líneas 25 y 33) y el texto `"XD"` junto a la cantidad en `ProductCard` (línea 76) — parecen restos de pruebas que deben limpiarse antes de la demo.
- Precios mostrados con `${price}` crudo; `formatPrice` (`Intl`, MXN) existe en `menu.ts` pero no se usa.
- `src/lib/menu.ts` conserva el menú estático (`categories`, `menuItems`) que ya nadie consume; solo sirven `STORE` y `DELIVERY_FEE`. Conviene podarlo.
- Copy del menú hardcodeado ($25, 4:30 pm) duplica datos de `STORE`.
- El carrito guarda snapshot del producto; si el precio cambia en DB entre sesiones, se paga el precio viejo (aceptable para MVP, validar en checkout server-side después).
- **Git**: solo existe el commit inicial de create-next-app; todo el trabajo real (`src/`, `supabase/`, `docs/`) está sin commitear. Es el mayor riesgo operativo ahora mismo.

## Veredicto: ¿va bien?

**Sí, va bien.** En ~3 semanas pasó de maquetas a un flujo cliente casi completo con datos reales: catálogo desde Postgres con slugs, filtro por categoría con deep links, carrito persistente y navegable, navegación centralizada, estructura modular coherente con el plan y documentación viva (checklist que se mantiene al día). Se eliminaron los hacks viejos en lugar de acumularlos.

Los riesgos que sí hay que atender:

1. **Nada está commiteado** — un solo commit inicial. Prioridad #1: commit + push del trabajo actual.
2. **Checkout no existe** — es el bloqueador del flujo MVP (carrito no se convierte en pedido).
3. **RLS y multi-negocio ausentes** — las queries del catálogo no filtran `business_id` y las tablas están abiertas; hay que cerrarlo antes de que el proyecto deje de ser local.
4. **Sin tests ni typecheck** — la red de seguridad aún no existe; el checklist ya lo registra.

En resumen: el avance es real y con buena dirección arquitectónica; el trabajo pendiente es principalmente cerrar el flujo (checkout + orders), asegurar (RLS + auth) y formalizar el repo (commits, tests).
