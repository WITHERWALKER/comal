# Status del proyecto — Comal

Última actualización: 12/nov/2026

## Qué es

Web de pedidos para un negocio de comida mexicana (cocina corrida: gorditas, burritos, tacos, comida corrida, aguas y postres). El cliente pide en línea y paga al recibir (domicilio $25 o recogida). El plan completo (admin, cocina, repartidores) está en [`comal-context.md`](comal-context.md); el desarrollo activo sigue concentrado en el **flujo del cliente**.

## Stack

- Next.js 16.4.3 (App Router, Turbopack) + React 19.3, TypeScript
- Tailwind CSS v4, fuentes Geist/Outfit/Fraunces, animate-ui + lucide
- Supabase (`@supabase/ssr`, cliente browser/server), migraciones versionadas en `supabase/migrations/`
- pnpm; **sin framework de tests** ni script `typecheck` dedicado
- `pnpm build` pasa (incluye `/api/health`)

---

## Todo el proyecto — hecho / pendiente

### Hecho

| Área | Estado |
|------|--------|
| **Repo y base** | Commits incrementales en `master`; redirects `/carrito` → `/cart`, `/repartidor` → `/courier`; `navigation.ts` como fuente de rutas; `error.tsx` global |
| **Catálogo (BD)** | Migración inicial: `businesses`, `profiles`, `categories`, `products` (soft-delete, disponibilidad, FK compuesta); slugs en categorías |
| **Pedidos (BD)** | Migración `orders` + `order_items` (folios, estados, fulfillment, snapshot de precios, `access_token`, código de entrega); RLS en pedidos con políticas de invitado (insert + select acotado) y función `get_guest_order` |
| **Flujo cliente — navegación** | Home con tiles por categoría; menú con datos Supabase; carrito persistente (`localStorage`); botón flotante de carrito en menú |
| **Flujo cliente — checkout** | Formulario real (domicilio/recogida, datos, pago efectivo/tarjeta, validación server-side, precios desde BD); server action + módulo `checkout/` (domain/application/infrastructure); confirmación en `/order/[token]` con vaciado de carrito |
| **Placeholders operación** | Layouts `(admin)` y `(courier)` con noindex |
| **Docs** | `comal-context.md`, `app-routes.md`, `menu-pendientes.md`, este archivo |

### Pendiente (fuera del flujo “solo cliente”)

| Prioridad | Tarea |
|-----------|--------|
| Alta | **Auth** Supabase para `admin` / `kitchen` / `courier`; middleware y layouts protegidos |
| Alta | **Panel admin**: catálogo CRUD, pedidos, pausa de negocio, rechazos |
| Alta | **Cocina**: Kanban por estados (`pending` → `preparing` → `ready` …) |
| Alta | **Repartidor**: cola de entregas, verificación de código, marcar entregado |
| Alta | **RLS catálogo** (`categories` / `products`): lectura pública anónima sin dejar tablas abiertas al resto |
| Media | **Realtime** + resincronización; notificaciones (p. ej. WhatsApp) |
| Media | **Pedidos programados** (`scheduled_for` en schema, sin UI pública aún) |
| Media | **Multi-negocio** end-to-end (filtro `business_id` en queries del menú; hoy checkout usa `DEFAULT_BUSINESS_SLUG`) |
| Media | **Tipos generados** de Supabase (`database.types.ts`) |
| Baja | Tests automatizados; script `typecheck` en CI |
| Baja | Decisión y despliegue (Vercel vs Cloudflare) |
| Ops | Aplicar migraciones nuevas en remoto; commitear trabajo local pendiente de checkout (ver git) |

---

## Flujo público (cliente) — resumen

Ver checklist detallado en [`menu-pendientes.md`](menu-pendientes.md).

**Cerrado en MVP reciente:** menú → carrito → checkout → pedido en Postgres → pantalla de confirmación.

**Sigue abierto (público):** seguridad y datos del catálogo (RLS, `business_id`, imágenes), pulido UX del menú (sticky, loading, `?category=` inválido, metadata), formato de precios en tarjetas, badge de carrito en navbar (hoy solo botón flotante), pedidos programados, consulta de estado del pedido después de confirmar, pruebas E2E manuales/documentadas.

---

## Estructura actual (resumida)

```
src/app/
├── (public)/          # home, menu, cart, checkout, order/[token]
├── (admin)/admin/
├── (courier)/courier/
└── api/health/
src/modules/
├── products/          # MenuCatalog, ProductCard, …
├── cart/
└── checkout/          # dominio, actions, confirmación
src/lib/supabase/      # client, server, queries/catalog.ts
supabase/migrations/   # 5 archivos (catálogo, slugs, orders, guest policies)
docs/
```

---

## Deuda técnica menor

- Precios en `ProductCard` / carrito con `${price}` crudo; `formatPrice` existe en checkout pero no en todo el menú.
- `src/lib/menu.ts` conserva menú estático legacy; solo se usan `STORE` y `DELIVERY_FEE`.
- Copy del menú ($25, 4:30 pm) duplicado respecto a `STORE`.
- Slugs del home hardcodeados; conviene validar contra `categories.slug` en BD.
- Política `orders_guest_select` muy permisiva (`using (access_token is not null)`); revisar antes de producción.
- **Git:** checkout, `/order/[token]`, migraciones guest y varios ajustes siguen sin commitear (nov 2026).

---

## Veredicto

El **MVP del cliente** (pedir sin cuenta y persistir en BD) está implementado en código local; falta endurecer catálogo (RLS + multi-negocio), pulir UX del menú y cerrar el circuito operativo (admin, cocina, repartidor). El siguiente bloque crítico para “producto usable en producción” es **RLS del catálogo + aplicar migraciones + commit del checkout**.
