-- Datos de tienda en businesses; imágenes por categoría (no por producto).

-- ---------------------------------------------------------------------------
-- businesses: dirección y costo de envío
-- ---------------------------------------------------------------------------
alter table public.businesses
  add column address text,
  add column delivery_fee numeric(12, 2) not null default 0;

alter table public.businesses
  add constraint businesses_address_length
    check (address is null or length(btrim(address)) between 5 and 255),
  add constraint businesses_delivery_fee_nonnegative
    check (delivery_fee >= 0);

comment on column public.businesses.address is
  'Dirección del local para recoger pedidos.';
comment on column public.businesses.delivery_fee is
  'Costo de envío a domicilio. Se guarda en delivery_fee del pedido al crear.';

comment on column public.businesses.settings is
  'JSON: hours (texto de horario), lastOrder (hora límite, ej. 16:30 o 4:30 pm), y reglas de horario futuras.';

-- ---------------------------------------------------------------------------
-- categories: image_path (desde products)
-- ---------------------------------------------------------------------------
alter table public.categories
  add column image_path varchar(512);

comment on column public.categories.image_path is
  'Path del archivo en Supabase Storage (ej. categories/gorditas.webp).';

update public.categories c
set image_path = sub.image_path
from (
  select distinct on (p.category_id)
    p.category_id,
    p.image_path
  from public.products p
  where p.image_path is not null
  order by p.category_id, p.updated_at desc
) sub
where c.id = sub.category_id
  and c.image_path is null;

alter table public.products
  drop column image_path;

-- Valores iniciales para el negocio principal (si existe).
update public.businesses
set
  address = coalesce(
    nullif(btrim(address), ''),
  'Calle Hidalgo 214, Col. Centro'),
  delivery_fee = case when delivery_fee = 0 then 25 else delivery_fee end,
  settings =
    coalesce(settings, '{}'::jsonb)
    || jsonb_build_object(
      'hours',
      coalesce(nullif(settings->>'hours', ''), 'Lunes a sábado · 8:00 a 17:00'),
      'lastOrder',
      coalesce(nullif(settings->>'lastOrder', ''), '16:30')
    )
where slug = 'comal';
