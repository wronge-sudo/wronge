"use client";
import Image from "next/image";
import { useState } from "react";
import { ASSETS, ASSET_SIZES, asset } from "@/config/assets";
import { cn } from "@/lib/format";
import { JacketBack } from "./jacket-back";

type Slide =
  | { kind: "image"; src: string; alt: string; ratio: string; cover?: boolean }
  | { kind: "back"; panel: { image: string; name: string } | null; label: string };

export function JacketGallery({ artPanel }: { artPanel: { image: string; name: string } | null }) {
  const slides: Slide[] = [
    { kind: "image", src: asset(ASSETS.jacketFront), alt: "Front of the Wronge washed-black denim jacket", ratio: `${ASSET_SIZES.jacketFront.width}/${ASSET_SIZES.jacketFront.height}` },
    { kind: "back", panel: null, label: "Back with the blank denim panel" },
    ...(artPanel ? [{ kind: "back" as const, panel: artPanel, label: `Back with the ${artPanel.name} panel` }] : []),
    { kind: "image", src: asset(ASSETS.hero), alt: "Wronge jackets styled on two people", ratio: "4/5", cover: true },
  ];
  const [i, setI] = useState(0);
  const s = slides[i];

  return (
    <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
      <div className="no-scrollbar order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
        {slides.map((sl, n) => (
          <button
            key={n}
            type="button"
            onClick={() => setI(n)}
            aria-label={sl.kind === "image" ? sl.alt : sl.label}
            className={cn("relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-studio transition sm:w-full", i === n ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100")}
          >
            {sl.kind === "image" ? (
              <Image src={sl.src} alt="" fill sizes="88px" className="object-cover" />
            ) : (
              <JacketBack panel={sl.panel} sizes="88px" rounded={false} className="h-full" />
            )}
          </button>
        ))}
      </div>
      <div className="order-1 sm:order-2">
        {s.kind === "image" ? (
          <div className="relative overflow-hidden rounded-3xl bg-studio" style={{ aspectRatio: s.ratio }}>
            <Image src={s.src} alt={s.alt} fill sizes="(min-width:1024px) 50vw, 100vw" loading="eager" className={cn("object-cover", s.cover && "object-[62%_center]")} />
          </div>
        ) : (
          <JacketBack panel={s.panel} showLabel eager />
        )}
      </div>
    </div>
  );
}
