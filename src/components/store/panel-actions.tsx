"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import type { Panel } from "@/lib/types";
import { PANEL_PHOTOS } from "@/config/assets";
import { PACKAGE_PIECES, isPackagePanel } from "@/config/package";
import { cn, taka } from "@/lib/format";
import { useWishlist } from "@/store/wishlist";
import { useMounted } from "@/lib/use-mounted";
import { JacketBack } from "./jacket-back";
import { useStoreData } from "./store-data";

const VIEW_LABEL = { worn: "Worn", jacket: "On the jacket", flat: "Flat panel" } as const;

export function PanelGallery({ panel }: { panel: Panel }) {
  // Panels with a real photo from the shoot open on it.
  const photo = PANEL_PHOTOS[panel.slug];
  const views: (keyof typeof VIEW_LABEL)[] = photo ? ["worn", "jacket", "flat"] : ["jacket", "flat"];
  const [view, setView] = useState(views[0]);
  return (
    <div>
      {view === "worn" && photo ? (
        <div className={cn("relative aspect-[4/5] overflow-hidden rounded-3xl", photo.cutout ? "bg-sand" : "bg-studio")}>
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 640px, 92vw"
            className={photo.cutout ? "object-contain object-bottom" : "object-cover"}
          />
        </div>
      ) : view === "flat" ? (
        <div className="relative mx-auto aspect-[4/7] max-h-[80vh] overflow-hidden rounded-3xl bg-ink">
          <Image src={panel.image_url} alt={`${panel.name} art panel, flat`} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-contain" />
        </div>
      ) : (
        <JacketBack panel={{ image: panel.image_url, name: panel.name }} eager />
      )}
      <div className="mt-3 flex gap-2">
        {views.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "h-10 rounded-full border px-4 text-xs font-bold uppercase tracking-wider transition",
              view === v ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
            )}
          >
            {VIEW_LABEL[v]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PanelActions({ panel }: { panel: Panel }) {
  const mounted = useMounted();
  const { settings } = useStoreData();
  const wished = useWishlist((s) => s.slugs.includes(panel.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const available = isPackagePanel(panel.slug);
  const soldOut = available && panel.stock !== null && panel.stock <= 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-3.5 py-1.5 tabular-nums text-xs font-bold uppercase text-ink">
          {available ? `In the ${PACKAGE_PIECES}-in-1 package · ${taka(settings.jacket_price)}` : "Coming soon"}
        </span>
        {available && panel.stock !== null && panel.stock > 0 && panel.stock <= 10 && (
          <span className="rounded-full bg-signal/10 px-3.5 py-1.5 tabular-nums text-xs font-bold uppercase text-signal">
            Only {panel.stock} left
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {available && !soldOut ? (
          <Link
            href="/build"
            className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold uppercase tracking-wider text-ink shadow-[0_2px_0_0_rgb(11_11_11)] transition hover:bg-primary-hover hover:shadow-none sm:flex-none"
          >
            Get the {PACKAGE_PIECES}-in-1 set
          </Link>
        ) : (
          <span className="inline-flex h-14 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-ink px-8 text-sm font-bold uppercase tracking-wider text-primary-light sm:flex-none">
            {soldOut ? "Sold out" : "Coming soon"}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggleWish(panel.slug)}
          aria-label={wished ? "Remove from saved" : "Save"}
          className="grid size-14 place-items-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper"
        >
          <Heart className={cn("size-5", mounted && wished && "fill-signal text-signal")} />
        </button>
      </div>

      <p className="mt-4 text-sm text-muted">
        {available
          ? "Comes with the jacket, a blank denim panel and our other launch design."
          : "This design isn't on sale yet. Save it and check back soon."}
      </p>
    </div>
  );
}
