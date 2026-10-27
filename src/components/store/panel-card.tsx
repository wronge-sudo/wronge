"use client";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Plus } from "lucide-react";
import type { Panel } from "@/lib/types";
import { cn } from "@/lib/format";
import { usePack } from "@/store/pack";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { useStoreData } from "./store-data";

export function toPanelRef(p: Panel) {
  return { id: p.id.startsWith("seed-") ? undefined : p.id, slug: p.slug, name: p.name, image: p.image_url };
}

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
  const { settings } = useStoreData();
  const inPack = usePack((s) => s.panels.some((p) => p.slug === panel.slug));
  const packFull = usePack((s) => s.panels.length >= settings.pack_size);
  const toggle = usePack((s) => s.toggle);
  const wished = useWishlist((s) => s.slugs.includes(panel.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const soldOut = panel.stock !== null && panel.stock <= 0;

  const selected = mounted && inPack;
  const disabled = soldOut || (mounted && packFull && !inPack);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[10px] border bg-card p-2 transition-[border-color,box-shadow] duration-200 hover:shadow-[0_6px_20px_rgb(0_0_0/0.08)]",
        selected || active ? "border-ink shadow-press" : "border-line",
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

        {panel.badge && (
          <span className="absolute left-2 top-2 rounded-full border-2 border-ink bg-primary px-2.5 py-0.5 text-[0.72rem] font-bold text-ink">
            {panel.badge}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/85 py-2 text-center text-sm font-bold uppercase text-paper">
            Sold out
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
          <button
            type="button"
            disabled={disabled}
            onClick={() => toggle(toPanelRef(panel), settings.pack_size)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full border-2 border-ink py-1.5 font-display text-[0.8rem] font-black uppercase tracking-[-0.02em] transition disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "bg-ink text-paper" : "bg-primary text-ink hover:bg-primary-hover",
            )}
          >
            {selected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {selected ? "Added" : "Add"}
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-3">
        <div className="min-w-0">
          <Link href={`/panels/${panel.slug}`} className="block truncate text-[1.02rem] font-bold leading-tight hover:underline">
            {panel.name}
          </Link>
          <p className="mt-0.5 truncate text-[0.85rem] text-muted">{panel.category}</p>
        </div>
      </div>
    </article>
  );
}
