/**
 * Public, cached reads for the storefront.
 * Admin edits call `updateTag("panels" | "settings" | "sizes" | "reviews")`
 * so changes show up immediately.
 */
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_SETTINGS, DEFAULT_SIZES, SEED_PANELS } from "@/config/defaults";
import { isSupabaseConfigured } from "./env";
import { createPublicClient } from "./supabase/public";
import type { Panel, Review, SizeRow, StoreSettings } from "./types";

export async function getSettings(): Promise<StoreSettings> {
  "use cache";
  cacheTag("settings");
  if (!isSupabaseConfigured) {
    cacheLife("minutes");
    return DEFAULT_SETTINGS;
  }
  const { data, error } = await createPublicClient()
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    cacheLife("minutes");
    return DEFAULT_SETTINGS;
  }
  cacheLife("hours");
  return { ...DEFAULT_SETTINGS, ...data } as StoreSettings;
}

export async function getSizes(): Promise<SizeRow[]> {
  "use cache";
  cacheTag("sizes");
  if (!isSupabaseConfigured) {
    cacheLife("minutes");
    return DEFAULT_SIZES;
  }
  const { data, error } = await createPublicClient()
    .from("jacket_sizes")
    .select("*")
    .order("sort_order");
  if (error || !data?.length) {
    cacheLife("minutes");
    return DEFAULT_SIZES;
  }
  cacheLife("minutes");
  return data as SizeRow[];
}

export async function getPanels(): Promise<Panel[]> {
  "use cache";
  cacheTag("panels");
  if (!isSupabaseConfigured) {
    cacheLife("minutes");
    return SEED_PANELS;
  }
  const { data, error } = await createPublicClient()
    .from("panels")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error || !data) {
    cacheLife("minutes");
    return SEED_PANELS;
  }
  cacheLife("hours");
  return data as Panel[];
}

export async function getPanel(slug: string): Promise<Panel | null> {
  const panels = await getPanels();
  return panels.find((p) => p.slug === slug) ?? null;
}

export async function getApprovedReviews(): Promise<Review[]> {
  "use cache";
  cacheTag("reviews");
  if (!isSupabaseConfigured) {
    cacheLife("minutes");
    return [];
  }
  const { data, error } = await createPublicClient()
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);
  if (error || !data) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("hours");
  return data as Review[];
}

export function categoriesOf(panels: Panel[]): string[] {
  return Array.from(new Set(panels.map((p) => p.category)));
}
