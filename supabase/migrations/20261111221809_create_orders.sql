-- =============================================================================
-- Comal — Pedidos, artículos e información de rechazo
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.order_status as enum (
  'pending',
  'preparing',
  'ready',
  'on_the_way',
  'delivered',
  'rejected',
  'cancelled'
);

create type public.fulfillment_type as enum (
  'delivery',
  'pickup'
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  business_id       uuid not null references public.businesses (id) on delete restrict,
  folio             text not null,
  status            public.order_status not null default 'pending',
  fulfillment_type  public.fulfillment_type not null,

  -- Cliente
  customer_name     text not null,
  customer_phone    text not null,

  -- Entrega
  delivery_address  text,
  delivery_notes    text,
  scheduled_for     timestamptz,

  -- Importes
  subtotal          numeric(12, 2) not null,
  delivery_fee      numeric(12, 2) not null default 0,
  total             numeric(12, 2) not null,

  -- Consulta sin cuenta
  access_token      uuid not null default gen_random_uuid() unique,

  -- Código de entrega (texto plano, 4 dígitos)
  delivery_code     text,

  -- Rechazo
  rejection_reason  text,

  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- Longitudes
  constraint orders_customer_name_length
    check (length(btrim(customer_name)) between 2 and 120),
  constraint orders_customer_phone_length
    check (length(btrim(customer_phone)) between 8 and 20),
  constraint orders_delivery_address_length
    check (delivery_address is null or length(btrim(delivery_address)) between 10 and 255),
  constraint orders_delivery_notes_length
    check (delivery_notes is null or length(btrim(delivery_notes)) <= 255),
  constraint orders_notes_length
    check (notes is null or length(btrim(notes)) <= 255),
  constraint orders_rejection_reason_length
    check (rejection_reason is null or length(btrim(rejection_reason)) <= 255),
  constraint orders_delivery_code_format
    check (delivery_code is null or delivery_code ~ '^[0-9]{4}$'),

  -- Importes
  constraint orders_subtotal_nonnegative check (subtotal >= 0),
  constraint orders_delivery_fee_nonnegative check (delivery_fee >= 0),
  constraint orders_total_nonnegative check (total >= 0),

  -- Dirección obligatoria solo en delivery
  constraint orders_delivery_address_required
    check (
      fulfillment_type = 'pickup'
      or (fulfillment_type = 'delivery' and delivery_address is not null)
    ),

  -- Al menos un motivo de rechazo cuando el estado es rejected
  constraint orders_rejection_requires_reason_or_items
    check (
      status <> 'rejected'
      or rejection_reason is not null
      -- Los productos rechazados se validan en la app o con trigger más adelante
    )
);

comment on table public.orders is 'Pedidos de clientes. Empiezan en pending y pasan a preparing al aceptarse.';
comment on column public.orders.access_token is 'Token para que el cliente consulte el pedido sin cuenta.';
comment on column public.orders.delivery_code is 'Código de 4 dígitos en texto plano. Se genera al aceptar.';
comment on column public.orders.rejection_reason is 'Motivo de rechazo (texto libre). Puede ir solo o junto con productos.';

create index orders_business_id_idx on public.orders (business_id);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at desc);
create unique index orders_business_folio_unique on public.orders (business_id, folio);

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- order_items (snapshot)
-- ---------------------------------------------------------------------------
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid not null,
  business_id  uuid not null,

  product_name text not null,
  unit_price   numeric(12, 2) not null,
  quantity     integer not null,
  notes        text,
  rejected     boolean not null default false,

  created_at   timestamptz not null default now(),

  constraint order_items_product_name_length
    check (length(btrim(product_name)) between 1 and 120),
  constraint order_items_notes_length
    check (notes is null or length(btrim(notes)) <= 255),
  constraint order_items_quantity_positive
    check (quantity > 0),
  constraint order_items_unit_price_nonnegative
    check (unit_price >= 0),

  constraint order_items_product_same_business_fk
    foreign key (product_id, business_id)
    references public.products (id, business_id)
    on delete restrict
);

comment on table public.order_items is 'Artículos del pedido con snapshot de nombre y precio.';

create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_product_id_idx on public.order_items (product_id);