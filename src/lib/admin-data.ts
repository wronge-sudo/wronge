import "server-only";
import { requireAdmin } from "./admin-auth";
import type { OrderItemRow, OrderRow, OrderStatus, Panel, Review, SizeRow, StoreSettings } from "./types";
import { DEFAULT_SETTINGS } from "@/config/defaults";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
export const LIVE_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

/** "2026-10-18" in Bangladesh time. */
export function dhakaDay(iso: string | number | Date) {
  return new Date(new Date(iso).getTime() + DHAKA_OFFSET_MS).toISOString().slice(0, 10);
}

/** Start of the Bangladesh day `daysAgo` days back, as a UTC ISO string. */
function dhakaDayStart(daysAgo: number) {
  const todayKey = dhakaDay(Date.now());
  return new Date(new Date(`${todayKey}T00:00:00Z`).getTime() - DHAKA_OFFSET_MS - daysAgo * 86_400_000);
}

type StatOrder = Pick<OrderRow, "id" | "order_number" | "status" | "total" | "subtotal" | "delivery_fee" | "delivery_zone" | "district" | "customer_name" | "created_at"> & {
  order_items: Pick<OrderItemRow, "item_type" | "size" | "quantity" | "line_total" | "panels">[];
};

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export async function getDashboardStats(rangeDays: number) {
  const { supabase } = await requireAdmin();
  const from = dhakaDayStart(rangeDays - 1);
  const prevFrom = dhakaDayStart(rangeDays * 2 - 1);

  // Fetch current + previous period in pages of 1000 (Supabase's default row cap).
  const orders: StatOrder[] = [];
  for (let page = 0; page < 30; page++) {
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total, subtotal, delivery_fee, delivery_zone, district, customer_name, created_at, order_items(item_type, size, quantity, line_total, panels)")
      .gte("created_at", prevFrom.toISOString())
      .order("created_at", { ascending: false })
      .range(page * 1000, page * 1000 + 999);
    if (error) throw new Error(error.message);
    orders.push(...((data ?? []) as StatOrder[]));
    if (!data || data.length < 1000) break;
  }

  const current = orders.filter((o) => new Date(o.created_at) >= from);
  const previous = orders.filter((o) => new Date(o.created_at) < from);

  const summarize = (list: StatOrder[]) => {
    const live = list.filter((o) => LIVE_STATUSES.includes(o.status));
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const delivered = list.filter((o) => o.status === "delivered");
    const failed = list.filter((o) => o.status === "cancelled" || o.status === "returned");
    const items = live.flatMap((o) => o.order_items);
    return {
      orders: list.length,
      liveOrders: live.length,
      revenue,
      collected: delivered.reduce((s, o) => s + o.total, 0),
      aov: live.length ? Math.round(revenue / live.length) : 0,
      jackets: items.filter((i) => i.item_type !== "pack").reduce((s, i) => s + i.quantity, 0),
      successRate: delivered.length + failed.length ? delivered.length / (delivered.length + failed.length) : null,
    };
  };

  const now = summarize(current);
  const before = summarize(previous);
  const delta = (a: number, b: number) => (b ? (a - b) / b : null);

  // Daily series (Dhaka days)
  const series: { day: string; orders: number; revenue: number }[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) series.push({ day: dhakaDay(dhakaDayStart(i).getTime() + 1), orders: 0, revenue: 0 });
  const byDay = new Map(series.map((d) => [d.day, d]));
  for (const o of current) {
    const d = byDay.get(dhakaDay(o.created_at));
    if (!d) continue;
    d.orders += 1;
    if (LIVE_STATUSES.includes(o.status)) d.revenue += o.total;
  }

  // Breakdowns (current period)
  const status: Record<string, number> = {};
  const zones = { inside_dhaka: 0, outside_dhaka: 0 };
  const districts = new Map<string, number>();
  const sizes = new Map<string, number>();
  const panels = new Map<string, { name: string; image: string; qty: number }>();
  const types = { jacket: 0, pack: 0, bundle: 0 };
  let customPanels = 0;

  for (const o of current) {
    status[o.status] = (status[o.status] ?? 0) + 1;
    if (!LIVE_STATUSES.includes(o.status)) continue;
    zones[o.delivery_zone] += 1;
    districts.set(o.district, (districts.get(o.district) ?? 0) + 1);
    for (const it of o.order_items) {
      types[it.item_type] += it.quantity;
      if (it.size) sizes.set(it.size, (sizes.get(it.size) ?? 0) + it.quantity);
      for (const p of it.panels ?? []) {
        if (p.custom) {
          customPanels += it.quantity;
          continue;
        }
        const cur = panels.get(p.slug) ?? { name: p.name, image: p.image, qty: 0 };
        cur.qty += it.quantity;
        panels.set(p.slug, cur);
      }
    }
  }

  const today = dhakaDay(Date.now());
  const todayOrders = current.filter((o) => dhakaDay(o.created_at) === today);

  const [{ count: pendingCount }, { data: lowSizes }, { data: lowPanels }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("jacket_sizes").select("size, stock").eq("is_active", true).lte("stock", 3).order("sort_order"),
    supabase.from("panels").select("id, name, stock").eq("is_active", true).not("stock", "is", null).lte("stock", 3).order("stock"),
  ]);

  return {
    rangeDays,
    now,
    deltas: {
      revenue: delta(now.revenue, before.revenue),
      orders: delta(now.orders, before.orders),
      aov: delta(now.aov, before.aov),
      jackets: delta(now.jackets, before.jackets),
    },
    today: { orders: todayOrders.length, revenue: todayOrders.filter((o) => LIVE_STATUSES.includes(o.status)).reduce((s, o) => s + o.total, 0) },
    pendingCount: pendingCount ?? 0,
    series,
    status,
    zones,
    districts: [...districts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    sizes: [...sizes.entries()],
    topPanels: [...panels.entries()].map(([slug, v]) => ({ slug, ...v })).sort((a, b) => b.qty - a.qty).slice(0, 8),
    customPanels,
    types,
    recent: current.slice(0, 8),
    lowStock: {
      sizes: (lowSizes ?? []) as Pick<SizeRow, "size" | "stock">[],
      panels: (lowPanels ?? []) as Pick<Panel, "id" | "name" | "stock">[],
    },
  };
}

export async function getSidebarCounts() {
  const { supabase } = await requireAdmin();
  const [o, m, r] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_approved", false),
  ]);
  return { orders: o.count ?? 0, messages: m.count ?? 0, reviews: r.count ?? 0 };
}

export type OrderFilters = { status?: string; q?: string; page?: number; from?: string; to?: string };
export const ORDERS_PER_PAGE = 25;

export async function getOrders(f: OrderFilters) {
  const { supabase } = await requireAdmin();
  const page = Math.max(1, f.page ?? 1);
  let query = supabase
    .from("orders")
    .select("id, order_number, status, customer_name, phone, district, delivery_zone, total, payment_status, courier, created_at, order_items(quantity, item_type)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE - 1);
  query = applyOrderFilters(query, f);
  const [{ data, count, error }, counts] = await Promise.all([query, getStatusCounts()]);
  if (error) throw new Error(error.message);
  return {
    orders: (data ?? []) as (Pick<OrderRow, "id" | "order_number" | "status" | "customer_name" | "phone" | "district" | "delivery_zone" | "total" | "payment_status" | "courier" | "created_at"> & {
      order_items: { quantity: number; item_type: string }[];
    })[],
    total: count ?? 0,
    page,
    pages: Math.max(1, Math.ceil((count ?? 0) / ORDERS_PER_PAGE)),
    counts,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyOrderFilters<Q extends { eq: any; or: any; gte: any; lt: any }>(query: Q, f: OrderFilters): Q {
  let q = query;
  if (f.status && f.status !== "all") q = q.eq("status", f.status);
  if (f.q) {
    const term = f.q.trim().replace(/[%,()*]/g, " ").trim();
    if (term) {
      const digits = term.replace(/\D/g, "");
      const parts = [`order_number.ilike.%${term}%`, `customer_name.ilike.%${term}%`];
      if (digits.length >= 4) parts.push(`phone.ilike.%${digits.slice(-10)}%`);
      q = q.or(parts.join(","));
    }
  }
  if (f.from) q = q.gte("created_at", new Date(`${f.from}T00:00:00+06:00`).toISOString());
  if (f.to) q = q.lt("created_at", new Date(new Date(`${f.to}T00:00:00+06:00`).getTime() + 86_400_000).toISOString());
  return q;
}

async function getStatusCounts() {
  const { supabase } = await requireAdmin();
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
  const res = await Promise.all(statuses.map((s) => supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", s)));
  const counts: Record<string, number> = {};
  statuses.forEach((s, i) => (counts[s] = res[i].count ?? 0));
  counts.all = Object.values(counts).reduce((a, b) => a + b, 0);
  return counts;
}

export async function getOrder(id: string) {
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const [{ data: order }, { data: items }, { data: events }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: false }),
  ]);
  if (!order) return null;
  // Other orders from the same phone (repeat customer / fake-order check)
  const { data: history } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("phone", order.phone)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(10);
  return {
    order: order as OrderRow,
    items: (items ?? []) as OrderItemRow[],
    events: (events ?? []) as { id: number; status: string; note: string | null; created_by: string | null; created_at: string }[],
    history: (history ?? []) as Pick<OrderRow, "id" | "order_number" | "status" | "total" | "created_at">[],
  };
}

export async function getAdminPanels() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("panels").select("*").order("sort_order").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Panel[];
}

export async function getAdminPanel(id: string) {
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data } = await supabase.from("panels").select("*").eq("id", id).maybeSingle();
  return (data as Panel) ?? null;
}

export async function getAdminSizes() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("jacket_sizes").select("*").order("sort_order");
  return (data ?? []) as SizeRow[];
}

export async function getAdminSettings(): Promise<StoreSettings> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) } as StoreSettings;
}

export async function getAdminReviews() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("reviews").select("*").order("is_approved").order("created_at", { ascending: false }).limit(300);
  return (data ?? []) as (Review & { order_number: string | null })[];
}

export async function getMessages() {
  const { supabase } = await requireAdmin();
  const [{ data: messages }, { data: subs, count }] = await Promise.all([
    supabase.from("messages").select("*").order("is_read").order("created_at", { ascending: false }).limit(300),
    supabase.from("subscribers").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(500),
  ]);
  return {
    messages: (messages ?? []) as { id: string; name: string; email: string | null; phone: string | null; subject: string | null; message: string; is_read: boolean; created_at: string }[],
    subscribers: (subs ?? []) as { id: string; email: string; created_at: string }[],
    subscriberCount: count ?? 0,
  };
}
