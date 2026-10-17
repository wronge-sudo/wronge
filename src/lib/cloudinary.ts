import "server-only";
import { createHash } from "node:crypto";
import { CLOUDINARY_CLOUD_NAME } from "./env";

export const CLOUDINARY_FOLDERS = {
  panels: "wronge/panels",
  custom: "wronge/custom-uploads",
  site: "wronge/site",
} as const;

export function isCloudinaryConfigured() {
  return Boolean(
    CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  );
}

/** Signs upload params exactly the way Cloudinary expects (SHA-1, sorted, + secret). */
export function signParams(params: Record<string, string | number>) {
  const secret = process.env.CLOUDINARY_API_SECRET!;
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(toSign + secret).digest("hex");
}

/** Returns everything the browser needs for a direct, signed upload. */
export function createUploadSignature(folder: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    allowed_formats: "jpg,jpeg,png,webp",
    folder,
    timestamp,
  };
  return {
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    signature: signParams(params),
    ...params,
  };
}

/** Only accept image URLs that live in OUR Cloudinary folder. */
export function isOurCloudinaryUrl(url: string, folder: string) {
  return url.startsWith(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`) && url.includes(`/${folder}/`);
}
