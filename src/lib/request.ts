import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";

/** A one-way hash of the visitor's IP, used only for spam / abuse limits. */
export async function ipHash(): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim();
  const salt = process.env.SUPABASE_SECRET_KEY ?? "wronge";
  return createHmac("sha256", salt).update(ip).digest("hex").slice(0, 32);
}
