"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Heart, Plus } from "lucide-react";
import type { Panel } from "@/lib/types";
import { cn, taka } from "@/lib/format";
import { usePack } from "@/store/pack";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { JacketBack } from "./jacket-back";
import { toPanelRef } from "./panel-card";
import { useStoreData } from "./store-data";

export function PanelGallery({ panel }: { panel: Panel }) {
  const [view, setView] = useState<"jacket" | "flat">("jacket");
  return (
    <div>
      {view === "jacket" ? (
        <JacketBack panel={{ image: panel.image_url, name: panel.name }} eager />
      ) : (
        <div className="relative mx-auto aspect-[4/7] max-h-[80vh] overflow-hidden rounded-3xl bg-ink">
          <Image src={panel.image_url} alt={`${panel.name} art panel, flat`} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-contain" />
        </div>
      )}
      <div className="mt-3 flex gap-2">
        {(["jacket", "flat"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "h-10 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition",
              view === v ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
            )}
          >
            {v === "jacket" ? "On the jacket" : "Flat panel"}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PanelActions({ panel }: { panel: Panel }) {
  const router = useRouter();
  const mounted = useMounted();
  const { settings } = useStoreData();
  const packPanels = usePack((s) => s.panels);
  const toggle = usePack((s) => s.toggle);
  const add = usePack((s) => s.add);
  const wished = useWishlist((s) => s.slugs.includes(panel.slug));
  const toggleWish = useWishlist((s) => s.toggle);

  const inPack = mounted && packPanels.some((p) => p.slug === panel.slug);
  const full = mounted && packPanels.length >= settings.pack_size;
  const soldOut = panel.stock !== null && panel.stock <= 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-paper">
          Any {settings.pack_size} for {taka(settings.pack_price)}
        </span>
        {panel.stock !== null && panel.stock > 0 && panel.stock <= 10 && (
          <span className="rounded-full bg-signal/10 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-signal">
            Only {panel.stock} left
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={soldOut || (!inPack && full)}
          onClick={() => toggle(toPanelRef(panel), settings.pack_size)}
          className={cn(
            "inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full px-8 text-sm font-bold uppercase tracking-wider transition disabled:opacity-40 sm:flex-none",
            inPack ? "bg-ink text-primary-light" : "bg-primary text-paper shadow-[0_2px_0_0_rgb(11_11_11)] hover:bg-primary-hover hover:shadow-none",
          )}
        >
          {inPack ? <Check className="size-4" /> : <Plus className="size-4" />}
          {soldOut ? "Sold out" : inPack ? "In your pack" : full ? "Pack is full" : "Add to pack"}
        </button>
        <button
          type="button"
          onClick={() => toggleWish(panel.slug)}
          aria-label={wished ? "Remove from saved" : "Save"}
          className="grid size-14 place-items-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper"
        >
          <Heart className={cn("size-5", mounted && wished && "fill-signal text-signal")} />
        </button>
      </div>

      {!soldOut && (
        <button
          type="button"
          onClick={() => {
            add(toPanelRef(panel), settings.pack_size);
            router.push("/build");
          }}
          className="mt-3 text-sm font-semibold underline underline-offset-4 hover:text-muted"
        >
          Build a jacket + pack with this design →
        </button>
      )}

      {mounted && packPanels.length > 0 && (
        <p className="mt-4 text-sm text-muted">
          Your pack: {packPanels.length}/{settings.pack_size} picked
          {packPanels.length < settings.pack_size ? ` — choose ${settings.pack_size - packPanels.length} more.` : " — ready to add to your bag."}
        </p>
      )}
    </div>
  );
}
