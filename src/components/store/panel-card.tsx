"use client";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Panel } from "@/lib/types";
import { isPackagePanel } from "@/config/package";
import { cn } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";

/**
 * Panel tile. Only the 4-in-1 package's art panels are on sale (they come with the jacket);
 * every other design shows "Coming soon".
 */
export function PanelCard({
  panel,
  onPreview,
  active,
  className,
}: {
  panel: Panel;
  onPreview?: (p: Panel) => void;
  active?: boolean;
  className?: string;
}) {
  const mounted = useMounted();
  const wished = useWishlist((s) => s.slugs.includes(panel.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const available = isPackagePanel(panel.slug);
  const soldOut = available && panel.stock !== null && panel.stock <= 0;
  const badge = available ? "In the 4-in-1" : panel.badge;

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[10px] border bg-card p-2 transition-[border-color,box-shadow] duration-200 hover:shadow-[0_6px_20px_rgb(0_0_0/0.08)]",
        active ? "border-ink shadow-press" : "border-line",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[6px] bg-ink-2">
        <Link href={`/panels/${panel.slug}`} className="block" aria-label={`View ${panel.name}`}>
          <div className="relative aspect-[4/7]">
            <Image
              src={panel.image_url}
              alt={`${panel.name} art panel`}
              fill
              sizes="(min-width: 1280px) 18vw, (min-width: 768px) 28vw, 46vw"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          </div>
        </Link>

        {badge && (
          <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-primary px-2.5 py-0.5 text-[0.72rem] font-bold text-ink">
            {badge}
          </span>
        )}
        {(soldOut || !available) && (
          <span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/85 py-2 text-center text-sm font-bold uppercase text-paper">
            {soldOut ? "Sold out" : "Coming soon"}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWish(panel.slug)}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-card text-ink shadow-sm transition hover:scale-110"
        >
          <Heart className={cn("size-4", mounted && wished && "fill-signal text-signal")} />
        </button>

        <div className="absolute inset-x-2 bottom-2 flex gap-1.5">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(panel)}
              className="flex-1 whitespace-nowrap rounded-full border-2 border-ink bg-card py-1.5 font-display text-[0.8rem] font-black uppercase tracking-[-0.02em] text-ink transition hover:bg-paper-2"
            >
              Try on
            </button>
          )}
          {available && !soldOut && (
            <Link
              href="/build"
              className="flex flex-1 items-center justify-center whitespace-nowrap rounded-full border-2 border-ink bg-primary py-1.5 font-display text-[0.8rem] font-black uppercase tracking-[-0.02em] text-ink transition hover:bg-primary-hover"
            >
              Get it
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-3">
        <div className="min-w-0">
          <Link href={`/panels/${panel.slug}`} className="block truncate text-[1.02rem] font-bold leading-tight hover:underline">
            {panel.name}
          </Link>
          <p className="mt-0.5 truncate text-[0.85rem] text-muted">{available ? panel.category : `${panel.category} · Coming soon`}</p>
        </div>
      </div>
    </article>
  );
}
