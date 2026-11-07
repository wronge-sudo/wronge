/**
 * Every static image used by the storefront lives here.
 *
 * Brand files (/public/brand) are mapped to Cloudinary by `npm run images:upload`
 * (`cloudinary-map.json`), and `asset()` returns the Cloudinary URL for them.
 *
 * Product and model photos come from the client's own photoshoot (Nov 2026) and live in /public/photos
 * as WebP. Studio shots are cut out (backdrop removed, transparent); location shots keep their scenery.
 * Each photo has a 640px-wide `-640.webp` sibling that `image-loader.ts` uses for small slots.
 * To swap one: export the new file and its `-640` sibling under the same name, then update its size below.
 */
import cloudinaryMap from "./cloudinary-map.json";

const map = cloudinaryMap as Record<string, string>;

export function asset(path: string): string {
  return map[path] ?? path;
}

export const ASSETS = {
  /** Ghost-mannequin back (cutout). Every art-panel preview is drawn on it: see BACK_PANEL_RECT. */
  jacketBack: "/photos/jacket-back.webp",
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
  jacketBack: { width: 1272, height: 1353 },
  panel: { width: 800, height: 1400 },
  wordmark: { width: 980, height: 210 },
};

/**
 * Where the zip-out panel sits on `jacketBack`, in % of the photo.
 * Measured from the zips and seams of the photo (x 366–844px, y 392–1188px of the 1199×1312 original,
 * then shifted for the cutout's crop and padding).
 * If you replace the back photo, re-measure and update these four numbers.
 */
export const BACK_PANEL_RECT = {
  left: 31.6,
  top: 31.26,
  width: 37.58,
  height: 58.83,
};

/** A photo from the client's shoot. `cutout`: studio backdrop removed (transparent), so place it on a colour. */
export type Photo = { src: string; width: number; height: number; alt: string; cutout: boolean };

export const PHOTOS = {
  frontModel: {
    src: "/photos/front-model.webp",
    width: 778,
    height: 1203,
    alt: "Model wearing the Wronge washed-black denim jacket, front view",
    cutout: true,
  },
  backModel: {
    src: "/photos/back-model.webp",
    width: 609,
    height: 1140,
    alt: "Back of the jacket on the model, with the blank denim panel zipped in",
    cutout: true,
  },
  stoolModel: {
    src: "/photos/stool-model.webp",
    width: 555,
    height: 1275,
    alt: "Model sitting on a stool in the Wronge denim jacket and light-blue jeans",
    cutout: true,
  },
  canvasModel: {
    src: "/photos/canvas-model.webp",
    width: 1142,
    height: 1377,
    alt: "Model looking over his shoulder with the Campfire Night art panel zipped into the back of the jacket",
    cutout: true,
  },
  campfireDuo: {
    src: "/photos/campfire-duo.webp",
    width: 1335,
    height: 1178,
    alt: "Two friends sitting outdoors in Wronge denim jackets, one showing the Campfire Night panel on his back",
    cutout: false,
  },
  classicBack: {
    src: "/photos/classic-back.webp",
    width: 1149,
    height: 1369,
    alt: "Model outdoors with the Keep It Classic art panel on the back of his jacket",
    cutout: false,
  },
  classicDuo: {
    src: "/photos/classic-duo.webp",
    width: 1291,
    height: 1218,
    alt: "Two friends on a painted bench, one wearing the jacket with the Keep It Classic panel",
    cutout: false,
  },
  streetFront: {
    src: "/photos/street-front.webp",
    width: 1151,
    height: 1367,
    alt: "Model in the Wronge washed-black denim jacket standing in front of trees",
    cutout: false,
  },
  skyDuo: {
    src: "/photos/sky-duo.webp",
    width: 1082,
    height: 1454,
    alt: "Two friends in Wronge washed-black denim jackets against a blue sky",
    cutout: false,
  },
} satisfies Record<string, Photo>;

/** Real photos of the package's art panels being worn, by panel slug. Panels without one show the jacket preview. */
export const PANEL_PHOTOS: Partial<Record<string, Photo>> = {
  "keep-it-classic": PHOTOS.classicBack,
  "campfire-night": PHOTOS.canvasModel,
};

/** Centre of the "Swappable panel" callout dot on `PHOTOS.canvasModel`, in % (from the client's original graphic). */
export const CANVAS_CALLOUT = { x: 64.62, y: 57.01 };
