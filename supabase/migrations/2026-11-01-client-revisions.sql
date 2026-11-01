-- ════════════════════════════════════════════════════════════════════
--  WRONGE — client revisions (2026-11-01)
--  • One product: the 4-in-1 package (jacket + blank panel + 2 art panels) at ৳4,800
--  • Sizes M, L, XL, XXL with the client's size chart
--  • Old announcements (cash on delivery, panel packs) removed
--  • place_order saves the courier and payment terms chosen at checkout
--  Run once in the Supabase SQL editor. Safe to re-run.
--  Note: delivery fees (৳80 inside / ৳150 outside Chattogram) are unchanged.
-- ════════════════════════════════════════════════════════════════════

begin;

alter table public.store_settings alter column jacket_price set default 4800;
alter table public.store_settings alter column announcement drop default;

update public.store_settings set
  jacket_price = 4800,
  announcement = null,
  size_chart = '[
    {"size":"M","chest":"40","length":"26","sleeve":"","fit":""},
    {"size":"L","chest":"42","length":"27","sleeve":"","fit":""},
    {"size":"XL","chest":"44","length":"28","sleeve":"","fit":""},
    {"size":"XXL","chest":"46","length":"29","sleeve":"","fit":""}
  ]'::jsonb
where id = 1;

-- XS and S are no longer sold. Kept (inactive) so older orders still make sense.
update public.jacket_sizes set is_active = false where size in ('XS', 'S');
insert into public.jacket_sizes (size, sort_order, stock, is_active) values
  ('M', 3, 0, true), ('L', 4, 0, true), ('XL', 5, 0, true), ('XXL', 6, 0, true)
on conflict (size) do update set is_active = true;

-- Places an order atomically: checks + reduces stock, writes order, items, event.
-- Called ONLY from the server (service role) after prices were recalculated there.
create or replace function public.place_order(p_order jsonb, p_items jsonb)
returns table (new_order_id uuid, new_order_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_item  jsonb;
  v_panel jsonb;
  v_qty   integer;
  v_rows  integer;
  v_order public.orders;
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::int;

    if v_item->>'item_type' in ('jacket','bundle') then
      update public.jacket_sizes
         set stock = stock - v_qty
       where size = v_item->>'size' and is_active and stock >= v_qty;
      get diagnostics v_rows = row_count;
      if v_rows = 0 then
        raise exception 'OUT_OF_STOCK_SIZE:%', v_item->>'size';
      end if;
    end if;

    for v_panel in select * from jsonb_array_elements(coalesce(v_item->'panels', '[]'::jsonb)) loop
      if (v_panel->>'id') is not null and (v_panel->>'id') ~ '^[0-9a-f-]{36}$' then
        update public.panels set stock = stock - v_qty
         where id = (v_panel->>'id')::uuid and stock is not null;
        -- the CHECK (stock >= 0) constraint aborts the whole order if a panel sells out
      end if;
    end loop;
  end loop;

  insert into public.orders (
    customer_name, phone, email, district, area, address, delivery_zone, note,
    subtotal, discount, delivery_fee, total, payment_method, courier, ip_hash
  ) values (
    p_order->>'customer_name', p_order->>'phone', nullif(p_order->>'email',''),
    p_order->>'district', nullif(p_order->>'area',''), p_order->>'address',
    p_order->>'delivery_zone', nullif(p_order->>'note',''),
    (p_order->>'subtotal')::int, coalesce((p_order->>'discount')::int, 0),
    (p_order->>'delivery_fee')::int, (p_order->>'total')::int,
    case when p_order->>'payment_method' in ('full_advance','delivery_fee_advance') then p_order->>'payment_method' else 'cod' end,
    nullif(p_order->>'courier',''), p_order->>'ip_hash'
  ) returning * into v_order;

  insert into public.order_items (order_id, item_type, title, size, quantity, unit_price, line_total, panels)
  select v_order.id, i->>'item_type', i->>'title', nullif(i->>'size',''), (i->>'quantity')::int,
         (i->>'unit_price')::int, (i->>'line_total')::int, coalesce(i->'panels','[]'::jsonb)
    from jsonb_array_elements(p_items) as i;

  insert into public.order_events (order_id, status, note, created_by)
  values (v_order.id, 'pending', 'Order placed', 'customer');

  new_order_id := v_order.id;
  new_order_number := v_order.order_number;
  return next;
end $$;
revoke all on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to service_role;

commit;
