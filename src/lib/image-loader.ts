/**
 * next/image loader.
 * - Cloudinary URLs get on-the-fly resizing + auto format/quality.
 * - Local files (/public) are returned as-is (they are pre-optimized).
 */
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
  if (src.startsWith("/")) {
    return `${src}?w=${width}`;
  }
  return src;
}
