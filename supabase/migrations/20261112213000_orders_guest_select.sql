-- INSERT … RETURNING y conteo de folios requieren política SELECT en pedidos.

drop policy if exists orders_guest_select on public.orders;
create policy orders_guest_select
  on public.orders
  for select
  to anon, authenticated
  using (access_token is not null);
