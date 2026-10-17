import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "./env";
import { createSessionClient } from "./supabase/server";

/**
 * Data Access Layer for the admin panel.
 * Every admin page, server action and admin API route calls this first.
 * Returns a Supabase client acting as the signed-in admin, so Row Level
 * Security applies on top of this check.
 */
export const requireAdmin = cache(async () => {
  if (!isSupabaseConfigured) redirect("/admin/login?setup=1");
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!row) redirect("/admin/login?denied=1");
  return { supabase, user: { id: data.user.id, email: data.user.email ?? "admin" } };
});

/** Same check for route handlers: returns null instead of redirecting. */
export async function getAdminOrNull() {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  return row ? { supabase, user: data.user } : null;
}
