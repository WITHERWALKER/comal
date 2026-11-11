-- =============================================================================
-- Comal — Agregar slug automático a categories
-- Generado desde el name mediante trigger
-- =============================================================================

create or replace function public.slugify(input text)
returns text
language plpgsql
immutable
as $$
declare
  result text;
begin
  -- Convertir a minúsculas, quitar acentos y caracteres especiales
  result := lower(input);
  result := translate(
    result,
    'áéíóúüñÁÉÍÓÚÜÑ',
    'aeiouunAEIOUUN'
  );
  -- Reemplazar cualquier cosa que no sea letra, número o espacio por nada
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  -- Reemplazar espacios y guiones múltiples por un solo guion
  result := regexp_replace(result, '[\s-]+', '-', 'g');
  -- Quitar guiones al inicio y al final
  result := trim(both '-' from result);
  return result;
end;
$$;

comment on function public.slugify(text) is
  'Genera un slug URL-friendly a partir de un texto (minúsculas, sin acentos, con guiones).';

alter table public.categories
  add column slug varchar(80);

update public.categories
set slug = public.slugify(name)
where slug is null;

alter table public.categories
  alter column slug set not null;

alter table public.categories
  add constraint categories_slug_format
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.categories
  add constraint categories_business_slug_unique
  unique (business_id, slug);

create or replace function public.set_category_slug()
returns trigger
language plpgsql
as $$
begin
  -- Solo generar si no viene slug o si cambió el name
  if new.slug is null or (tg_op = 'UPDATE' and new.name is distinct from old.name) then
    new.slug := public.slugify(new.name);
  end if;
  return new;
end;
$$;

create trigger set_categories_slug
  before insert or update on public.categories
  for each row
  execute function public.set_category_slug();

comment on column public.categories.slug is
  'Slug único por negocio, generado automáticamente desde el name.';