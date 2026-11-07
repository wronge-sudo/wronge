/**
 * next/image loader.
 * - Cloudinary URLs get on-the-fly resizing + auto format/quality.
 * - Photoshoot files (/public/photos) come in two widths: name.webp and a 640px-wide name-640.webp,
 *   so thumbnails and small slots download the small one.
 * - Other local files (/public) are returned as-is (they are pre-optimized).
 */
const SMALL_PHOTO = 640;

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const t = `f_auto,q_${quality ?? "auto"},c_limit,w_${width}`;
    return src.replace("/upload/", `/upload/${t}/`);
  }
  if (src.startsWith("/photos/")) {
    const file = width <= SMALL_PHOTO ? src.replace(/\.webp$/, `-${SMALL_PHOTO}.webp`) : src;
    return `${file}?w=${width}`;
  }
  if (src.startsWith("/")) {
    return `${src}?w=${width}`;
  }
  return src;
}
