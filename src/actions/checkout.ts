"use server";
import { updateTag } from "next/cache";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS } from "@/config/defaults";
import { DELIVERY_CITY, courierById, paymentSplit } from "@/config/delivery";
import { PACKAGE_PANEL_SLUGS, packagePanels, toPanelRef } from "@/config/package";
import { checkoutSchema } from "@/lib/validation";
import { normalizeBdPhone } from "@/lib/format";
import { lineTitle, priceCart, unitPrice, type CartLine } from "@/lib/pricing";
import { ipHash } from "@/lib/request";
import type { Panel, StoreSettings } from "@/lib/types";

export type CheckoutResult =
  | {
      ok: true;
      orderNumber: string;
      total: number;
      delivery: number;
      subtotal: number;
      courier: string;
      /** Paid before dispatch (after we confirm the order). */
      advance: number;
      /** Collected by the courier. */
      onDelivery: number;
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
    return { ok: false, error: fieldErrors.lines ? "Please update your bag and try again." : "Please check the highlighted fields.", fieldErrors };
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
  const courier = courierById(data.courier)!;

  // 1. Fresh settings (never trust cached or browser prices)
  const { data: settingsRow } = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(settingsRow ?? {}) } as StoreSettings;
  if (!settings.orders_enabled) {
    return { ok: false, error: "We're not taking new orders right now. Please check back soon." };
  }

  // 2. Rebuild every line from the database: the package always ships with the same art panels.
  const [{ data: panelRows, error: panelErr }, { data: sizeRows }] = await Promise.all([
    db.from("panels").select("id, slug, name, image_url, is_active, stock").in("slug", [...PACKAGE_PANEL_SLUGS]),
    db.from("jacket_sizes").select("size, stock, is_active"),
  ]);
  if (panelErr) return { ok: false, error: "Couldn't check availability. Please try again." };
  const included = packagePanels(((panelRows ?? []) as Panel[]).filter((p) => p.is_active)).map(toPanelRef);
  const sizeBy = new Map((sizeRows ?? []).map((s) => [s.size as string, s]));

  const lines: CartLine[] = [];
  for (const l of data.lines) {
    const s = sizeBy.get(l.size);
    if (!s || !s.is_active) return { ok: false, error: `Size ${l.size} is not available.` };
    if (s.stock < l.qty) return { ok: false, error: `Sorry — only ${s.stock} left in size ${l.size}.` };
    lines.push({ key: l.key, type: "package", size: l.size, qty: l.qty });
  }

  // 3. Delivery zone — only an address in the delivery city can be "inside city"
  const zone = data.district === DELIVERY_CITY ? data.zone : "outside_dhaka";
  const totals = priceCart(lines, settings, zone);
  const split = paymentSplit(courier.payment, totals.total, totals.delivery);

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

  // 5. Place the order atomically (stock is decremented inside the database function).
  //    "bundle" is the database's item type for jacket + panels.
  const items = lines.map((l) => {
    const u = unitPrice(l, settings);
    return {
      item_type: "bundle",
      title: lineTitle(l),
      size: l.size,
      quantity: l.qty,
      unit_price: u,
      line_total: u * l.qty,
      panels: included,
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
      payment_method: courier.payment,
      courier: courier.name,
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
      return { ok: false, error: "One of the art panels just sold out. Please try again later or message us." };
    }
    console.error("place_order failed", error);
    return { ok: false, error: "We couldn't place your order. Please try again in a minute." };
  }

  const row = Array.isArray(placed) ? placed[0] : placed;

  // Record the customer's courier and payment terms. Done here as well as in place_order so it also
  // works on databases that still run the older function (which ignores these two fields).
  const { error: metaErr } = await db
    .from("orders")
    .update({ courier: courier.name, payment_method: courier.payment })
    .eq("id", row.new_order_id);
  if (metaErr) console.error("saving courier failed", row.new_order_number, metaErr);

  updateTag("sizes");
  if (included.length) updateTag("panels");

  return {
    ok: true,
    orderNumber: row.new_order_number,
    total: totals.total,
    delivery: totals.delivery,
    subtotal: totals.subtotal,
    courier: courier.name,
    advance: split.advance,
    onDelivery: split.onDelivery,
    phone,
    name: data.name,
    items: items.map((i) => ({
      title: i.title,
      qty: i.quantity,
      lineTotal: i.line_total,
      panels: ["Blank denim panel", ...i.panels.map((p) => p.name)],
    })),
  };
}
