-- ════════════════════════════════════════════════════════════════════
--  WRONGE — database schema (Supabase / Postgres)
--  Run once in Supabase → SQL Editor. Safe to re-run (idempotent).
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Helpers ─────────────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─── Admins ──────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select using (public.is_admin());

-- Make an existing Auth user an admin:  select public.make_admin('you@example.com');
create or replace function public.make_admin(p_email text) returns text
language plpgsql security definer set search_path = public, auth as $$
declare v_id uuid;
begin
  select id into v_id from auth.users where lower(email) = lower(p_email);
  if v_id is null then
    return 'No auth user with that email. Create it first in Authentication → Users.';
  end if;
  insert into public.admins (user_id, email) values (v_id, lower(p_email))
  on conflict (user_id) do nothing;
  return 'OK — ' || p_email || ' is now an admin.';
end $$;
revoke all on function public.make_admin(text) from public, anon, authenticated;

-- ─── Store settings (exactly one row) ────────────────────────────────
create table if not exists public.store_settings (
  id                     smallint primary key default 1 check (id = 1),
  jacket_price           integer not null default 5000 check (jacket_price >= 0),
  jacket_compare_at      integer check (jacket_compare_at >= 0),
  pack_price             integer not null default 1000 check (pack_price >= 0),
  pack_size              smallint not null default 3 check (pack_size between 1 and 12),
  bundle_discount        integer not null default 0 check (bundle_discount >= 0),
  custom_panel_fee       integer not null default 0 check (custom_panel_fee >= 0),
  delivery_inside_dhaka  integer not null default 80 check (delivery_inside_dhaka >= 0),
  delivery_outside_dhaka integer not null default 150 check (delivery_outside_dhaka >= 0),
  free_delivery_min      integer check (free_delivery_min >= 0),
  announcement           text default 'Cash on delivery all over Bangladesh',
  orders_enabled         boolean not null default true,
  support_phone          text,
  support_email          text,
  whatsapp               text,
  facebook_url           text,
  instagram_url          text,
  size_chart             jsonb not null default '[]'::jsonb,
  updated_at             timestamptz not null default now()
);
alter table public.store_settings enable row level security;
drop trigger if exists store_settings_touch on public.store_settings;
create trigger store_settings_touch before update on public.store_settings
  for each row execute function public.touch_updated_at();
drop policy if exists "settings public read" on public.store_settings;
create policy "settings public read" on public.store_settings for select using (true);
drop policy if exists "settings admin update" on public.store_settings;
create policy "settings admin update" on public.store_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- ─── Jacket sizes / inventory ────────────────────────────────────────
create table if not exists public.jacket_sizes (
  size       text primary key,
  sort_order smallint not null default 0,
  stock      integer not null default 0 check (stock >= 0),
  is_active  boolean not null default true
);
alter table public.jacket_sizes enable row level security;
drop policy if exists "sizes public read" on public.jacket_sizes;
create policy "sizes public read" on public.jacket_sizes for select using (true);
drop policy if exists "sizes admin write" on public.jacket_sizes;
create policy "sizes admin write" on public.jacket_sizes for all
  using (public.is_admin()) with check (public.is_admin());

-- ─── Art panels ──────────────────────────────────────────────────────
create table if not exists public.panels (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name            text not null,
  artist          text not null default 'Wronge Studio',
  description     text,
  category        text not null default 'Uncategorised',
  badge           text,
  image_url       text not null,
  image_public_id text,
  stock           integer check (stock >= 0),          -- null = unlimited
  is_active       boolean not null default true,
  is_featured     boolean not null default false,
  sort_order      integer not null default 100,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.panels enable row level security;
drop trigger if exists panels_touch on public.panels;
create trigger panels_touch before update on public.panels
  for each row execute function public.touch_updated_at();
drop policy if exists "panels public read" on public.panels;
create policy "panels public read" on public.panels for select using (is_active or public.is_admin());
drop policy if exists "panels admin write" on public.panels;
create policy "panels admin write" on public.panels for all
  using (public.is_admin()) with check (public.is_admin());

-- ─── Orders ──────────────────────────────────────────────────────────
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique default ('WR-' || nextval('public.order_number_seq')),
  status         text not null default 'pending'
                 check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','returned')),
  customer_name  text not null,
  phone          text not null,
  email          text,
  district       text not null,
  area           text,
  address        text not null,
  delivery_zone  text not null check (delivery_zone in ('inside_dhaka','outside_dhaka')),
  note           text,
  subtotal       integer not null check (subtotal >= 0),
  discount       integer not null default 0,
  delivery_fee   integer not null default 0,
  total          integer not null check (total >= 0),
  payment_method text not null default 'cod',
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  courier        text,
  tracking_code  text,
  admin_note     text,
  ip_hash        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx  on public.orders (status);
create index if not exists orders_phone_idx   on public.orders (phone);
alter table public.orders enable row level security;
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
drop policy if exists "orders admin read" on public.orders;
create policy "orders admin read" on public.orders for select using (public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  item_type  text not null check (item_type in ('jacket','pack','bundle')),
  title      text not null,
  size       text,
  quantity   integer not null check (quantity > 0),
  unit_price integer not null,
  line_total integer not null,
  panels     jsonb not null default '[]'::jsonb
);
create index if not exists order_items_order_idx on public.order_items (order_id);
alter table public.order_items enable row level security;
drop policy if exists "items admin read" on public.order_items;
create policy "items admin read" on public.order_items for select using (public.is_admin());

create table if not exists public.order_events (
  id         bigserial primary key,
  order_id   uuid not null references public.orders(id) on delete cascade,
  status     text not null,
  note       text,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id);
alter table public.order_events enable row level security;
drop policy if exists "events admin read" on public.order_events;
create policy "events admin read" on public.order_events for select using (public.is_admin());

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
    subtotal, discount, delivery_fee, total, payment_method, ip_hash
  ) values (
    p_order->>'customer_name', p_order->>'phone', nullif(p_order->>'email',''),
    p_order->>'district', nullif(p_order->>'area',''), p_order->>'address',
    p_order->>'delivery_zone', nullif(p_order->>'note',''),
    (p_order->>'subtotal')::int, coalesce((p_order->>'discount')::int, 0),
    (p_order->>'delivery_fee')::int, (p_order->>'total')::int, 'cod', p_order->>'ip_hash'
  ) returning * into v_order;

  insert into public.order_items (order_id, item_type, title, size, quantity, unit_price, line_total, panels)
  select v_order.id, i->>'item_type', i->>'title', nullif(i->>'size',''), (i->>'quantity')::int,
         (i->>'unit_price')::int, (i->>'line_total')::int, coalesce(i->'panels','[]'::jsonb)
    from jsonb_array_elements(p_items) as i;

  insert into public.order_events (order_id, status, note, created_by)
  values (v_order.id, 'pending', 'Order placed (Cash on Delivery)', 'customer');

  new_order_id := v_order.id;
  new_order_number := v_order.order_number;
  return next;
end $$;
revoke all on function public.place_order(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb) to service_role;

-- Changes an order's status (admins only). Restocks when cancelled/returned.
create or replace function public.set_order_status(p_order_id uuid, p_status text, p_note text default null)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_old   text;
  v_item  record;
  v_panel jsonb;
  v_email text;
  v_dead  text[] := array['cancelled','returned'];
begin
  if not public.is_admin() then
    raise exception 'NOT_ADMIN';
  end if;
  if p_status not in ('pending','confirmed','processing','shipped','delivered','cancelled','returned') then
    raise exception 'BAD_STATUS';
  end if;

  select status into v_old from public.orders where id = p_order_id for update;
  if v_old is null then raise exception 'NOT_FOUND'; end if;
  if v_old = p_status then return; end if;

  -- leaving a live state for cancelled/returned → put stock back
  if p_status = any(v_dead) and not (v_old = any(v_dead)) then
    for v_item in select * from public.order_items where order_id = p_order_id loop
      if v_item.item_type in ('jacket','bundle') then
        update public.jacket_sizes set stock = stock + v_item.quantity where size = v_item.size;
      end if;
      for v_panel in select * from jsonb_array_elements(v_item.panels) loop
        if (v_panel->>'id') ~ '^[0-9a-f-]{36}$' then
          update public.panels set stock = stock + v_item.quantity
           where id = (v_panel->>'id')::uuid and stock is not null;
        end if;
      end loop;
    end loop;
  -- re-opening a cancelled/returned order → take stock again
  elsif v_old = any(v_dead) and not (p_status = any(v_dead)) then
    for v_item in select * from public.order_items where order_id = p_order_id loop
      if v_item.item_type in ('jacket','bundle') then
        update public.jacket_sizes set stock = stock - v_item.quantity where size = v_item.size;
      end if;
      for v_panel in select * from jsonb_array_elements(v_item.panels) loop
        if (v_panel->>'id') ~ '^[0-9a-f-]{36}$' then
          update public.panels set stock = stock - v_item.quantity
           where id = (v_panel->>'id')::uuid and stock is not null;
        end if;
      end loop;
    end loop;
  end if;

  update public.orders
     set status = p_status,
         payment_status = case when p_status = 'delivered' then 'paid' else payment_status end
   where id = p_order_id;

  select email into v_email from auth.users where id = auth.uid();
  insert into public.order_events (order_id, status, note, created_by)
  values (p_order_id, p_status, nullif(p_note, ''), coalesce(v_email, 'admin'));
end $$;
revoke all on function public.set_order_status(uuid, text, text) from public, anon;
grant execute on function public.set_order_status(uuid, text, text) to authenticated;

-- ─── Reviews ─────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  location     text,
  rating       smallint not null check (rating between 1 and 5),
  title        text,
  body         text not null,
  panel_name   text,
  order_number text,
  is_approved  boolean not null default false,
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now()
);
alter table public.reviews enable row level security;
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews for select using (is_approved or public.is_admin());
drop policy if exists "reviews admin write" on public.reviews;
create policy "reviews admin write" on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());

-- ─── Contact messages & newsletter ───────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  phone      text,
  subject    text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages for all
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);
alter table public.subscribers enable row level security;
drop policy if exists "subscribers admin" on public.subscribers;
create policy "subscribers admin" on public.subscribers for all
  using (public.is_admin()) with check (public.is_admin());
