"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/format";

export type Hotspot = { x: number; y: number; title: string; body: string };

/** An image with numbered, tappable feature points. */
export function Hotspots({
  src,
  alt,
  ratio,
  spots,
}: {
  src: string;
  alt: string;
  ratio: string;
  spots: Hotspot[];
}) {
  const [active, setActive] = useState(0);
  const a = spots[active];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <div className="relative overflow-hidden rounded-3xl bg-studio" style={{ aspectRatio: ratio }}>
        <Image src={src} alt={alt} fill sizes="(min-width:1024px) 45vw, 92vw" className="object-cover" />
        {spots.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setActive(i)}
            aria-label={s.title}
            aria-pressed={active === i}
            className={cn(
              "absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full tabular-nums text-xs font-bold transition",
              active === i ? "scale-110 bg-primary text-ink animate-pulse-ring" : "bg-paper text-ink hover:bg-primary hover:text-ink",
            )}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div>
        <ol className="space-y-2">
          {spots.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full gap-4 rounded-2xl p-4 text-left transition",
                  active === i ? "bg-ink text-paper" : "hover:bg-paper-2",
                )}
              >
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-full tabular-nums text-xs font-bold", active === i ? "bg-primary text-ink" : "bg-paper-2")}>
                  {i + 1}
                </span>
                <span>
                  <span className="block font-bold uppercase tracking-tight">{s.title}</span>
                  <span className={cn("mt-1 block text-sm", active === i ? "text-paper/70" : "text-muted")}>{s.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">{a?.title}</p>
      </div>
    </div>
  );
}
