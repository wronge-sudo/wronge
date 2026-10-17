"use client";

export type UploadResult = { url: string; publicId: string; width: number; height: number };

export const MAX_UPLOAD_MB = 10;
export const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/** Signed, direct-to-Cloudinary upload. `kind` decides the folder (admin-only for "panel" / "site"). */
export async function uploadImage(file: File, kind: "custom" | "panel" | "site"): Promise<UploadResult> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a JPG, PNG or WEBP image.");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`Images must be under ${MAX_UPLOAD_MB} MB.`);

  const sigRes = await fetch("/api/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
  });
  const sig = await sigRes.json();
  if (!sigRes.ok) throw new Error(sig.error ?? "Upload is not available right now.");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);
  form.append("allowed_formats", sig.allowed_formats);

  const up = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body: form });
  const data = await up.json();
  if (!up.ok) throw new Error(data?.error?.message ?? "Upload failed. Please try again.");
  return { url: data.secure_url, publicId: data.public_id, width: data.width, height: data.height };
}
