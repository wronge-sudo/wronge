"use server";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { CLOUDINARY_CLOUD_NAME } from "@/lib/env";
import { ORDER_STATUSES } from "@/lib/types";

export type AdminState = { ok: boolean; message: string; fieldErrors?: Record<string, string> } | null;

const fail = (message: string, fieldErrors?: Record<string, string>): AdminState => ({ ok: false, message, fieldErrors });
const uuid = z.string().uuid();

function zodFieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

/* ───────────── Auth ───────────── */
export async function signOutAdmin() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ───────────── Orders ───────────── */
export async function setOrderStatus(orderId: string, status: string, note?: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(orderId).success || !ORDER_STATUSES.includes(status as never)) return fail("Invalid request.");
  const { error } = await supabase.rpc("set_order_status", { p_order_id: orderId, p_status: status, p_note: note?.slice(0, 300) || null });
  if (error) return fail(error.message.includes("stock") ? "Not enough stock to re-open this order." : "Couldn't update the status.");
  updateTag("sizes");
  updateTag("panels");
  refresh();
  return { ok: true, message: "Status updated." };
}

const orderMetaSchema = z.object({
  courier: z.string().trim().max(60),
  tracking_code: z.string().trim().max(80),
  admin_note: z.string().trim().max(2000),
  payment_status: z.enum(["unpaid", "paid", "refunded"]),
});

export async function updateOrderMeta(orderId: string, _prev: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(orderId).success) return fail("Invalid order.");
  const parsed = orderMetaSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail("Please check the fields.", zodFieldErrors(parsed.error));
  const d = parsed.data;
  const { error } = await supabase
    .from("orders")
    .update({ courier: d.courier || null, tracking_code: d.tracking_code || null, admin_note: d.admin_note || null, payment_status: d.payment_status })
    .eq("id", orderId);
  if (error) return fail("Couldn't save.");
  refresh();
  return { ok: true, message: "Saved." };
}

/* ───────────── Panels ───────────── */
const panelSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug is required")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and dashes"),
  artist: z.string().trim().max(80).default("Wronge Studio"),
  category: z.string().trim().min(2, "Category is required").max(40),
  badge: z.string().trim().max(20),
  description: z.string().trim().max(1000),
  image_url: z
    .string()
    .trim()
    .min(1, "Upload an image")
    .refine((u) => u.startsWith("/") || u.startsWith(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/`), "Image must be uploaded here"),
  image_public_id: z.string().trim().max(200),
  stock: z.string().trim().regex(/^\d*$/, "Whole number, or leave empty for unlimited"),
  sort_order: z.coerce.number().int().min(0).max(100000),
});

export async function savePanel(panelId: string | null, _prev: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  const parsed = panelSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail("Please fix the highlighted fields.", zodFieldErrors(parsed.error));
  const d = parsed.data;
  const row = {
    name: d.name,
    slug: d.slug,
    artist: d.artist || "Wronge Studio",
    category: d.category,
    badge: d.badge || null,
    description: d.description || null,
    image_url: d.image_url,
    image_public_id: d.image_public_id || null,
    stock: d.stock === "" ? null : Number(d.stock),
    sort_order: d.sort_order,
    is_active: form.get("is_active") === "on",
    is_featured: form.get("is_featured") === "on",
  };
  const { error } = panelId
    ? await supabase.from("panels").update(row).eq("id", panelId)
    : await supabase.from("panels").insert(row);
  if (error) {
    if (error.code === "23505") return fail("That slug is already used by another panel.", { slug: "Already taken" });
    return fail("Couldn't save the panel.");
  }
  updateTag("panels");
  if (!panelId) redirect("/admin/panels?saved=1");
  refresh();
  return { ok: true, message: "Panel saved." };
}

export async function togglePanelFlag(panelId: string, field: "is_active" | "is_featured", value: boolean): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(panelId).success || !["is_active", "is_featured"].includes(field)) return fail("Invalid request.");
  const { error } = await supabase.from("panels").update({ [field]: value }).eq("id", panelId);
  if (error) return fail("Couldn't update.");
  updateTag("panels");
  refresh();
  return { ok: true, message: "Updated." };
}

export async function deletePanel(panelId: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(panelId).success) return fail("Invalid request.");
  const { error } = await supabase.from("panels").delete().eq("id", panelId);
  if (error) return fail("Couldn't delete the panel.");
  updateTag("panels");
  redirect("/admin/panels?deleted=1");
}

/* ───────────── Inventory ───────────── */
const sizesSchema = z
  .array(
    z.object({
      size: z.string().trim().toUpperCase().min(1).max(8).regex(/^[A-Z0-9]+$/),
      stock: z.coerce.number().int().min(0).max(100000),
      is_active: z.boolean(),
      sort_order: z.number().int(),
    }),
  )
  .max(20);

export async function saveSizes(json: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return fail("Invalid data.");
  }
  const parsed = sizesSchema.safeParse(raw);
  if (!parsed.success) return fail("Sizes must be short codes like M or XXL, and stock a whole number.");
  const rows = parsed.data;
  if (new Set(rows.map((r) => r.size)).size !== rows.length) return fail("Each size can only appear once.");

  const { data: existing } = await supabase.from("jacket_sizes").select("size");
  const removed = (existing ?? []).map((r) => r.size).filter((s) => !rows.some((r) => r.size === s));
  if (rows.length) {
    const { error } = await supabase.from("jacket_sizes").upsert(rows, { onConflict: "size" });
    if (error) return fail("Couldn't save sizes.");
  }
  if (removed.length) await supabase.from("jacket_sizes").delete().in("size", removed);
  updateTag("sizes");
  refresh();
  return { ok: true, message: "Jacket stock saved." };
}

export async function setPanelStock(panelId: string, stock: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(panelId).success || !/^\d*$/.test(stock.trim())) return fail("Stock must be a whole number or empty.");
  const { error } = await supabase
    .from("panels")
    .update({ stock: stock.trim() === "" ? null : Number(stock) })
    .eq("id", panelId);
  if (error) return fail("Couldn't save.");
  updateTag("panels");
  refresh();
  return { ok: true, message: "Saved." };
}

/* ───────────── Reviews ───────────── */
export async function moderateReview(id: string, patch: { is_approved?: boolean; is_featured?: boolean }): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid request.");
  const clean: Record<string, boolean> = {};
  if (typeof patch.is_approved === "boolean") clean.is_approved = patch.is_approved;
  if (typeof patch.is_featured === "boolean") clean.is_featured = patch.is_featured;
  const { error } = await supabase.from("reviews").update(clean).eq("id", id);
  if (error) return fail("Couldn't update.");
  updateTag("reviews");
  refresh();
  return { ok: true, message: "Updated." };
}

export async function deleteReview(id: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid request.");
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return fail("Couldn't delete.");
  updateTag("reviews");
  refresh();
  return { ok: true, message: "Deleted." };
}

/* ───────────── Messages & subscribers ───────────── */
export async function markMessage(id: string, isRead: boolean): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid request.");
  await supabase.from("messages").update({ is_read: isRead }).eq("id", id);
  refresh();
  return { ok: true, message: "Updated." };
}

export async function deleteMessage(id: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid request.");
  await supabase.from("messages").delete().eq("id", id);
  refresh();
  return { ok: true, message: "Deleted." };
}

export async function deleteSubscriber(id: string): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return fail("Invalid request.");
  await supabase.from("subscribers").delete().eq("id", id);
  refresh();
  return { ok: true, message: "Removed." };
}

/* ───────────── Settings ───────────── */
const money = z.coerce.number().int("Whole taka only").min(0, "Can't be negative").max(1_000_000);
const optionalText = (max: number) => z.string().trim().max(max);

const settingsSchema = z.object({
  jacket_price: money,
  jacket_compare_at: z.string().trim().regex(/^\d*$/, "Whole number or empty"),
  pack_price: money,
  pack_size: z.coerce.number().int().min(1).max(12),
  bundle_discount: money,
  custom_panel_fee: money,
  delivery_inside_dhaka: money,
  delivery_outside_dhaka: money,
  free_delivery_min: z.string().trim().regex(/^\d*$/, "Whole number or empty"),
  announcement: optionalText(300),
  support_phone: optionalText(30),
  support_email: z.string().trim().email("Invalid email").max(120).or(z.literal("")),
  whatsapp: optionalText(30),
  facebook_url: z.string().trim().url("Must start with https://").max(300).or(z.literal("")),
  instagram_url: z.string().trim().url("Must start with https://").max(300).or(z.literal("")),
  size_chart: z.string(),
});

const sizeChartSchema = z
  .array(
    z.object({
      size: z.string().trim().min(1).max(8),
      chest: z.string().trim().max(12),
      length: z.string().trim().max(12),
      sleeve: z.string().trim().max(12),
      fit: z.string().trim().max(40),
    }),
  )
  .max(20);

export async function saveSettings(_prev: AdminState, form: FormData): Promise<AdminState> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail("Please fix the highlighted fields.", zodFieldErrors(parsed.error));
  const d = parsed.data;
  let chart: z.infer<typeof sizeChartSchema>;
  try {
    chart = sizeChartSchema.parse(JSON.parse(d.size_chart || "[]"));
  } catch {
    return fail("The size chart has an invalid row.", { size_chart: "Check the size chart" });
  }
  const { error } = await supabase
    .from("store_settings")
    .update({
      jacket_price: d.jacket_price,
      jacket_compare_at: d.jacket_compare_at === "" ? null : Number(d.jacket_compare_at),
      pack_price: d.pack_price,
      pack_size: d.pack_size,
      bundle_discount: d.bundle_discount,
      custom_panel_fee: d.custom_panel_fee,
      delivery_inside_dhaka: d.delivery_inside_dhaka,
      delivery_outside_dhaka: d.delivery_outside_dhaka,
      free_delivery_min: d.free_delivery_min === "" ? null : Number(d.free_delivery_min),
      announcement: d.announcement || null,
      orders_enabled: form.get("orders_enabled") === "on",
      support_phone: d.support_phone || null,
      support_email: d.support_email || null,
      whatsapp: d.whatsapp || null,
      facebook_url: d.facebook_url || null,
      instagram_url: d.instagram_url || null,
      size_chart: chart,
    })
    .eq("id", 1);
  if (error) return fail("Couldn't save settings.");
  updateTag("settings");
  refresh();
  return { ok: true, message: "Settings saved. The store is updated." };
}
