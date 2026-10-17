import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

/**
 * Service-role client: bypasses Row Level Security. SERVER ONLY.
 * Used for placing orders, order tracking, contact form, reviews and newsletter —
 * always after validating input on the server.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !key) {
    throw new Error("STORE_NOT_CONFIGURED");
  }
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isServiceConfigured() {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}
