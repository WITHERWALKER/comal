-- Checkout de invitado: inserción y consulta segura por access_token

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists orders_guest_insert on public.orders;
create policy orders_guest_insert
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists order_items_guest_insert on public.order_items;
create policy order_items_guest_insert
  on public.order_items
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.get_guest_order(p_access_token uuid)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_order public.orders%rowtype;
  v_items json;
  v_result json;
begin
  select * into v_order
  from public.orders
  where access_token = p_access_token;

  if not found then
    return null;
  end if;

  select coalesce(json_agg(row_to_json(oi)), '[]'::json) into v_items
  from public.order_items oi
  where oi.order_id = v_order.id;

  v_result := json_build_object(
    'order', row_to_json(v_order),
    'items', v_items
  );

  return v_result;
end;
$$;

comment on function public.get_guest_order(uuid) is
  'Devuelve un pedido y sus líneas para la confirmación pública con access_token.';

revoke all on function public.get_guest_order(uuid) from public;
grant execute on function public.get_guest_order(uuid) to anon, authenticated;
