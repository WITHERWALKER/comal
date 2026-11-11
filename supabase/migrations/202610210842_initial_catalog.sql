-- =============================================================================
-- Comal — Migración inicial del catálogo
-- Archivo: 202610210842_initial_catalog.sql
-- Alcance: negocios, perfiles, categorías y productos.
-- Notas:
--   - RLS y tablas de pedidos se definirán en migraciones posteriores.
--   - image_path guarda el path dentro del bucket de Supabase Storage.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Función reutilizable para mantener updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function que actualiza automáticamente la columna updated_at.';

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table public.businesses (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(120) not null,
  slug        varchar(120) not null,
  is_active   boolean not null default true,
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint businesses_name_not_blank
    check (length(btrim(name)) > 0),
  constraint businesses_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint businesses_slug_unique
    unique (slug)
);

comment on table public.businesses is
  'Negocios del sistema (tenants). Un registro por negocio.';
comment on column public.businesses.slug is
  'Identificador legible único del negocio (ej. taqueria-el-guero).';
comment on column public.businesses.is_active is
  'Indica si el negocio está operativo y puede recibir pedidos.';
comment on column public.businesses.settings is
  'Configuración flexible del negocio (horarios, anticipación mínima, etc.).';

create trigger set_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete restrict,
  first_name  varchar(80) not null,
  last_name   varchar(80) not null,
  role        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint profiles_role_valid
    check (role in ('admin', 'kitchen', 'courier')),
  constraint profiles_first_name_not_blank
    check (length(btrim(first_name)) > 0),
  constraint profiles_last_name_not_blank
    check (length(btrim(last_name)) > 0)
);

comment on table public.profiles is
  'Perfiles de usuarios autenticados (admin, kitchen, courier). Ligados a auth.users.';
comment on column public.profiles.role is
  'Rol del usuario dentro del negocio. Valores permitidos: admin, kitchen, courier.';
comment on column public.profiles.business_id is
  'Negocio al que pertenece el usuario. Un usuario solo opera dentro de un negocio.';

create index profiles_business_id_idx
  on public.profiles (business_id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete restrict,
  name         varchar(80) not null,
  sort_order   integer not null default 0,
  is_available boolean not null default true,
  archived_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint categories_name_not_blank
    check (length(btrim(name)) > 0),
  constraint categories_sort_order_nonnegative
    check (sort_order >= 0),
  constraint categories_business_name_unique
    unique (business_id, name),
  constraint categories_id_business_unique
    unique (id, business_id)
);

comment on table public.categories is
  'Categorías del menú. archived_at indica soft-delete.';
comment on column public.categories.is_available is
  'Si la categoría se muestra actualmente en el menú público.';
comment on column public.categories.archived_at is
  'Fecha de soft-delete. NULL = categoría activa.';
comment on column public.categories.sort_order is
  'Orden de visualización dentro del menú del negocio.';

create index categories_business_sort_idx
  on public.categories (business_id, sort_order);

create index categories_business_available_idx
  on public.categories (business_id, sort_order)
  where archived_at is null and is_available = true;

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references public.businesses (id) on delete restrict,
  category_id  uuid not null,
  name         varchar(120) not null,
  description  varchar(255),
  price        numeric(12, 2) not null,
  image_path   varchar(512),
  is_available boolean not null default true,
  archived_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint products_name_not_blank
    check (length(btrim(name)) > 0),
  constraint products_price_nonnegative
    check (price >= 0),
  constraint products_description_not_blank
    check (description is null or length(btrim(description)) > 0),
  constraint products_category_same_business_fk
    foreign key (category_id, business_id)
    references public.categories (id, business_id)
    on delete restrict
);

comment on table public.products is
  'Productos del menú. archived_at indica soft-delete. image_path guarda el path en Supabase Storage.';
comment on column public.products.image_path is
  'Path del archivo en el bucket de Supabase Storage (ej. products/uuid.webp).';
comment on column public.products.price is
  'Precio unitario en la moneda del negocio. Siempre >= 0.';
comment on column public.products.is_available is
  'Si el producto se muestra actualmente en el menú público.';
comment on column public.products.archived_at is
  'Fecha de soft-delete. NULL = producto activo.';
comment on column public.products.category_id is
  'Categoría a la que pertenece. Debe ser del mismo negocio (FK compuesta).';

create index products_business_availability_idx
  on public.products (business_id, is_available)
  where archived_at is null;

create index products_category_id_idx
  on public.products (category_id);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();