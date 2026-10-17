import { NextResponse } from "next/server";
import { CLOUDINARY_FOLDERS, createUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { ipHash } from "@/lib/request";

// Tiny best-effort limiter (per server instance) so the public custom-upload
// signature can't be hammered. Real abuse protection: Cloudinary usage alerts.
const hits = new Map<string, { n: number; reset: number }>();
const LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

function limited(key: string) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  h.n += 1;
  return h.n > LIMIT;
}

async function isAdmin() {
  if (!isSupabaseConfigured) return false;
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  return !!row;
}

export async function POST(request: Request) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Image uploads are not set up yet." }, { status: 503 });
  }
  const body = (await request.json().catch(() => ({}))) as { kind?: string };
  const kind = body.kind === "panel" || body.kind === "site" ? body.kind : "custom";

  if (kind === "custom") {
    if (limited(await ipHash())) {
      return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }
    return NextResponse.json(createUploadSignature(CLOUDINARY_FOLDERS.custom));
  }

  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  return NextResponse.json(createUploadSignature(kind === "panel" ? CLOUDINARY_FOLDERS.panels : CLOUDINARY_FOLDERS.site));
}
