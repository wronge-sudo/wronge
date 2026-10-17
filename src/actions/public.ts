"use server";
import { z } from "zod";
import { createServiceClient, isServiceConfigured } from "@/lib/supabase/admin";
import { normalizeBdPhone } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export type FormState = { ok: boolean; message: string } | null;

const NOT_READY: FormState = {
  ok: false,
  message: "This form isn't connected yet. Please reach us on Facebook or by phone for now.",
};

/* ───────────── Newsletter ───────────── */
export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  if (form.get("website")) return { ok: true, message: "Thanks! You're on the list." };
  const email = z.string().trim().toLowerCase().email().max(120).safeParse(form.get("email"));
  if (!email.success) return { ok: false, message: "Please enter a valid email address." };
  if (!isServiceConfigured()) return NOT_READY;
  const { error } = await createServiceClient()
    .from("subscribers")
    .upsert({ email: email.data }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return { ok: false, message: "Couldn't subscribe right now. Please try again." };
  return { ok: true, message: "You're in. New drops land in your inbox first." };
}

/* ───────────── Contact ───────────── */
const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(2000),
});

export async function sendMessage(_prev: FormState, form: FormData): Promise<FormState> {
  if (form.get("website")) return { ok: true, message: "Thanks — we'll get back to you soon." };
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;
  if (!d.email && !d.phone) return { ok: false, message: "Leave an email or phone number so we can reply." };
  if (!isServiceConfigured()) return NOT_READY;
  const { error } = await createServiceClient()
    .from("messages")
    .insert({ name: d.name, email: d.email || null, phone: d.phone || null, subject: d.subject || null, message: d.message });
  if (error) return { ok: false, message: "Couldn't send your message. Please try again." };
  return { ok: true, message: "Message received. We usually reply within a day." };
}

/* ───────────── Reviews ───────────── */
const reviewSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(60),
  location: z.string().trim().max(60).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  title: z.string().trim().max(80).optional().or(z.literal("")),
  body: z.string().trim().min(15, "Write at least a sentence or two").max(1500),
  panel_name: z.string().trim().max(80).optional().or(z.literal("")),
  order_number: z.string().trim().max(20).optional().or(z.literal("")),
});

export async function submitReview(_prev: FormState, form: FormData): Promise<FormState> {
  if (form.get("website")) return { ok: true, message: "Thanks for your review!" };
  const parsed = reviewSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  if (!isServiceConfigured()) return NOT_READY;
  const d = parsed.data;
  const { error } = await createServiceClient()
    .from("reviews")
    .insert({
      name: d.name,
      location: d.location || null,
      rating: d.rating,
      title: d.title || null,
      body: d.body,
      panel_name: d.panel_name || null,
      order_number: d.order_number?.toUpperCase() || null,
      is_approved: false,
    });
  if (error) return { ok: false, message: "Couldn't save your review. Please try again." };
  return { ok: true, message: "Thank you! Your review will appear once our team has checked it." };
}

/* ───────────── Order tracking ───────────── */
export type TrackResult =
  | {
      ok: true;
      order: {
        number: string;
        status: OrderStatus;
        createdAt: string;
        total: number;
        deliveryFee: number;
        district: string;
        courier: string | null;
        trackingCode: string | null;
        items: { title: string; quantity: number; panels: string[] }[];
        events: { status: string; at: string }[];
      };
    }
  | { ok: false; message: string }
  | null;

export async function trackOrder(_prev: TrackResult, form: FormData): Promise<TrackResult> {
  const raw = String(form.get("order") ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const number = /^\d+$/.test(raw) ? `WR-${raw}` : raw.startsWith("WR") && !raw.startsWith("WR-") ? `WR-${raw.slice(2)}` : raw;
  const phone = normalizeBdPhone(String(form.get("phone") ?? ""));
  if (!/^WR-\d{3,8}$/.test(number)) return { ok: false, message: "Enter your order number, like WR-1001." };
  if (!phone) return { ok: false, message: "Enter the phone number you used at checkout." };
  if (!isServiceConfigured()) return { ok: false, message: "Order tracking isn't connected yet. Please contact us." };

  const db = createServiceClient();
  const { data: order } = await db
    .from("orders")
    .select("id, order_number, status, created_at, total, delivery_fee, district, courier, tracking_code, phone")
    .eq("order_number", number)
    .eq("phone", phone)
    .maybeSingle();
  if (!order) return { ok: false, message: "We couldn't find an order with that number and phone. Double-check both and try again." };

  const [{ data: items }, { data: events }] = await Promise.all([
    db.from("order_items").select("title, quantity, panels").eq("order_id", order.id),
    db.from("order_events").select("status, created_at").eq("order_id", order.id).order("created_at"),
  ]);

  return {
    ok: true,
    order: {
      number: order.order_number,
      status: order.status,
      createdAt: order.created_at,
      total: order.total,
      deliveryFee: order.delivery_fee,
      district: order.district,
      courier: order.courier,
      trackingCode: order.tracking_code,
      items: (items ?? []).map((i) => ({
        title: i.title,
        quantity: i.quantity,
        panels: ((i.panels as { name: string }[]) ?? []).map((p) => p.name),
      })),
      events: (events ?? []).map((e) => ({ status: e.status, at: e.created_at })),
    },
  };
}
