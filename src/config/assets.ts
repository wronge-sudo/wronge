/**
 * Every static image used by the storefront lives here.
 *
 * Paths starting with "/" are served from /public (the optimized fallbacks).
 * After running `npm run images:upload`, `cloudinary-map.json` is filled in and
 * `asset()` automatically returns the Cloudinary URL instead.
 *
 * To swap an image: replace the file in /public/seed (same name) and re-run
 * `npm run images:upload`, or paste a Cloudinary URL directly below.
 */
import cloudinaryMap from "./cloudinary-map.json";

const map = cloudinaryMap as Record<string, string>;

export function asset(path: string): string {
  return map[path] ?? path;
}

export const ASSETS = {
  hero: "/seed/hero.webp",
  jacketFront: "/seed/jacket-front.webp",
  jacketBack: "/seed/jacket-back.webp",
  textureDark: "/brand/texture-dark.webp",
  profileDark: "/brand/profile-dark.webp",
  profileLight: "/brand/profile-light.webp",
  wordmarkBlack: "/brand/wordmark-black.png",
  wordmarkWhite: "/brand/wordmark-white.png",
  markDark: "/brand/mark-dark.png",
  markLight: "/brand/mark-light.png",
  logoBox: "/brand/logo-box.png",
} as const;

/** Intrinsic sizes (used by next/image to avoid layout shift). */
export const ASSET_SIZES = {
  hero: { width: 1672, height: 941 },
  jacketFront: { width: 1025, height: 1057 },
  jacketBack: { width: 1025, height: 1087 },
  panel: { width: 800, height: 1400 },
  wordmark: { width: 980, height: 210 },
};

/**
 * Where the zip-out panel sits on `jacketBack`, in % of the photo.
 * Measured from the seams of the flat-lay (x 356–660px, y 345–852px of 1025×1087).
 * If you replace the back photo, re-measure and update these four numbers.
 */
export const BACK_PANEL_RECT = {
  left: 34.73,
  top: 31.74,
  width: 29.66,
  height: 46.64,
};
