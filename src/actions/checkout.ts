"use server";
import { updateTag } from "next/cache";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";
import { CLOUDINARY_FOLDERS, isOurCloudinaryUrl } from "@/lib/cloudinary";
import { DEFAULT_SETTINGS } from "@/config/defaults";
import { checkoutSchema } from "@/lib/validation";
import { normalizeBdPhone } from "@/lib/format";
import { lineTitle, priceCart, unitPrice, type CartLine } from "@/lib/pricing";
import { ipHash } from "@/lib/request";
import type { Panel, PanelRef, StoreSettings } from "@/lib/types";

export type CheckoutResult =
  | {
      ok: true;
      orderNumber: string;
      total: number;
      delivery: number;
      subtotal: number;
      phone: string;
      name: string;
      items: { title: string; qty: number; lineTotal: number; panels: string[] }[];
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const MAX_ORDERS_PER_PHONE_PER_DAY = 5;
const MAX_ORDERS_PER_IP_PER_DAY = 12;

export async function placeOrder(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  if (data.website) return { ok: false, error: "Something went wrong. Please try again." };

  if (!isServiceConfigured()) {
    return {
      ok: false,
      error: "The store isn't connected to its database yet, so orders can't be placed. Please contact us directly.",
    };
  }

  const db = createServiceClient();
  const phone = normalizeBdPhone(data.phone)!;

  // 1. Fresh settings (never trust cached or browser prices)
  const { data: settingsRow } = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(settingsRow ?? {}) } as StoreSettings;
  if (!settings.orders_enabled) {
    return { ok: false, error: "We're not taking new orders right now. Please check back soon." };
  }

  // 2. Rebuild every line from the database
  const slugs = new Set<string>();
  for (const l of data.lines) if (l.type !== "jacket") l.panels.forEach((p) => !p.custom && slugs.add(p.slug));
  const { data: panelRows, error: panelErr } = slugs.size
    ? await db.from("panels").select("id, slug, name, image_url, is_active, stock").in("slug", [...slugs])
    : { data: [] as Pick<Panel, "id" | "slug" | "name" | "image_url" | "is_active" | "stock">[], error: null };
  if (panelErr) return { ok: false, error: "Couldn't check panel availability. Please try again." };
  const panelBySlug = new Map((panelRows ?? []).map((p) => [p.slug, p]));

  const { data: sizeRows } = await db.from("jacket_sizes").select("size, stock, is_active");
  const sizeBy = new Map((sizeRows ?? []).map((s) => [s.size as string, s]));

  const lines: CartLine[] = [];
  for (const l of data.lines) {
    if (l.type === "jacket" || l.type === "bundle") {
      const s = sizeBy.get(l.size);
      if (!s || !s.is_active) return { ok: false, error: `Size ${l.size} is not available.` };
      if (s.stock < l.qty) return { ok: false, error: `Sorry — only ${s.stock} left in size ${l.size}.` };
    }
    if (l.type === "jacket") {
      lines.push({ key: l.key, type: "jacket", size: l.size, qty: l.qty });
      continue;
    }
    if (l.panels.length !== settings.pack_size) {
      return { ok: false, error: `Each pack needs exactly ${settings.pack_size} panels. Please update your bag.` };
    }
    const seen = new Set<string>();
    const panels: PanelRef[] = [];
    for (const p of l.panels) {
      if (seen.has(p.slug)) return { ok: false, error: "A pack can't contain the same design twice." };
      seen.add(p.slug);
      if (p.custom) {
        if (!isOurCloudinaryUrl(p.custom.url, CLOUDINARY_FOLDERS.custom)) {
          return { ok: false, error: "Your custom panel image couldn't be verified. Please upload it again." };
        }
        panels.push({ slug: p.slug.slice(0, 80), name: "Custom panel", image: p.custom.url, custom: p.custom });
        continue;
      }
      const row = panelBySlug.get(p.slug);
      if (!row || !row.is_active) return { ok: false, error: `"${p.name}" is no longer available. Please remove it from your bag.` };
      if (row.stock !== null && row.stock < l.qty) return { ok: false, error: `"${row.name}" just sold out.` };
      panels.push({ id: row.id, slug: row.slug, name: row.name, image: row.image_url });
    }
    lines.push({ key: l.key, type: l.type, ...(l.type === "bundle" ? { size: l.size } : {}), panels, qty: l.qty } as CartLine);
  }

  // 3. Delivery zone — only Dhaka district can be "inside Dhaka"
  const zone = data.district === "Dhaka" ? data.zone : "outside_dhaka";
  const totals = priceCart(lines, settings, zone);

  // 4. Simple abuse limits
  const hash = await ipHash();
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [{ count: phoneCount }, { count: ipCount }] = await Promise.all([
    db.from("orders").select("id", { count: "exact", head: true }).eq("phone", phone).gte("created_at", since),
    db.from("orders").select("id", { count: "exact", head: true }).eq("ip_hash", hash).gte("created_at", since),
  ]);
  if ((phoneCount ?? 0) >= MAX_ORDERS_PER_PHONE_PER_DAY || (ipCount ?? 0) >= MAX_ORDERS_PER_IP_PER_DAY) {
    return { ok: false, error: "We've received several orders from you today. Please call or message us to place another." };
  }

  // 5. Place the order atomically (stock is decremented inside the database function)
  const items = lines.map((l) => {
    const u = unitPrice(l, settings);
    return {
      item_type: l.type,
      title: lineTitle(l, settings),
      size: l.type === "pack" ? null : l.size,
      quantity: l.qty,
      unit_price: u,
      line_total: u * l.qty,
      panels: l.type === "jacket" ? [] : l.panels,
    };
  });

  const { data: placed, error } = await db.rpc("place_order", {
    p_order: {
      customer_name: data.name,
      phone,
      email: data.email || null,
      district: data.district,
      area: data.area || null,
      address: data.address,
      delivery_zone: zone,
      note: data.note || null,
      subtotal: totals.subtotal,
      discount: 0,
      delivery_fee: totals.delivery,
      total: totals.total,
      ip_hash: hash,
    },
    p_items: items,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("OUT_OF_STOCK_SIZE")) {
      return { ok: false, error: `Sorry — size ${msg.split(":").pop()?.trim()} just sold out.` };
    }
    if (msg.includes("panels_stock_check") || msg.includes("violates check constraint")) {
      return { ok: false, error: "One of your panels just sold out. Please update your bag." };
    }
    console.error("place_order failed", error);
    return { ok: false, error: "We couldn't place your order. Please try again in a minute." };
  }

  const row = Array.isArray(placed) ? placed[0] : placed;
  updateTag("sizes");
  if (items.some((i) => i.panels.length)) updateTag("panels");

  return {
    ok: true,
    orderNumber: row.new_order_number,
    total: totals.total,
    delivery: totals.delivery,
    subtotal: totals.subtotal,
    phone,
    name: data.name,
    items: items.map((i) => ({
      title: i.title,
      qty: i.quantity,
      lineTotal: i.line_total,
      panels: (i.panels as PanelRef[]).map((p) => p.name),
    })),
  };
}
