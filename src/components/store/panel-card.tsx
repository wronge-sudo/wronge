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
    <article className={cn("group relative flex flex-col", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-ink-2 ring-offset-2 ring-offset-paper transition",
          (selected || active) && "ring-[3px] ring-ink",
        )}
      >
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
          <span className="absolute left-2.5 top-2.5 rounded-full bg-acid px-2.5 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-widest text-ink">
            {panel.badge}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/85 py-2 text-center font-mono text-xs uppercase tracking-widest text-paper">
            Sold out
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleWish(panel.slug)}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-paper/90 text-ink backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn("size-4", mounted && wished && "fill-signal text-signal")} />
        </button>

        <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2">
          {onPreview && (
            <button
              type="button"
              onClick={() => onPreview(panel)}
              className="flex-1 rounded-full bg-paper/90 py-2 text-[0.65rem] font-bold uppercase tracking-wider text-ink backdrop-blur transition hover:bg-paper"
            >
              Try on
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => toggle(toPanelRef(panel), settings.pack_size)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-full py-2 text-[0.65rem] font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50",
              selected ? "bg-ink text-acid" : "bg-acid text-ink hover:bg-ink hover:text-acid",
            )}
          >
            {selected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {selected ? "In pack" : "Add"}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <Link href={`/panels/${panel.slug}`} className="block truncate font-bold uppercase tracking-tight hover:underline">
            {panel.name}
          </Link>
          <p className="truncate text-xs text-muted">{panel.category}</p>
        </div>
      </div>
    </article>
  );
}
