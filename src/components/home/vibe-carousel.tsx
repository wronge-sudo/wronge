"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/format";
import { RailArrows, useRail } from "@/components/ui/rail";

/** A category or artist of upcoming designs. Every card shows a "Coming soon" overlay and isn't clickable. */
export type VibeGroup = { name: string; count: number; images: string[] };

// Card tints cycle: butter, peach, stone.
const TINTS = [
  "linear-gradient(145deg, #fae79f 0%, #f5d76e 100%)",
  "linear-gradient(145deg, #ffe6cb 0%, #ffd3a8 100%)",
  "linear-gradient(145deg, #e9e3d7 0%, #dcd3c3 100%)",
];

// Fanned panels: rotate, x/y offset (% of the panel) and stacking, for one, two or three designs.
const FAN = {
  1: [{ r: 0, x: 0, y: 0, z: 3 }],
  2: [
    { r: -5, x: -34, y: 2, z: 1 },
    { r: 5, x: 34, y: -1, z: 2 },
  ],
  3: [
    { r: -6, x: -64, y: 3, z: 1 },
    { r: 0, x: 0, y: -1, z: 3 },
    { r: 6, x: 64, y: 3, z: 2 },
  ],
};

export function VibeCarousel({ categories, artists }: { categories: VibeGroup[]; artists: VibeGroup[] }) {
  const [tab, setTab] = useState<"category" | "artist">("category");
  const { ref, edge, go } = useRail<HTMLDivElement>();
  const groups = tab === "category" ? categories : artists;

  function switchTab(next: "category" | "artist") {
    setTab(next);
    ref.current?.scrollTo({ left: 0 });
  }

  return (
    <div className="grid gap-[34px]">
      <div className="grid gap-[17px]">
        <div className="grid max-w-[697px] gap-[12.75px]">
          <h2 className="display text-[2rem] sm:text-[2.4rem]">Let your back do the talking</h2>
          <p className="text-[1.05rem] leading-[1.55] sm:text-[1.2rem]">More original designs for every mood are on the way.</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-[4.25px] rounded-[8px] bg-card p-[4.25px] shadow-[0_2px_10px_rgb(0_0_0/0.12)]" role="tablist" aria-label="Browse by">
            {(
              [
                ["category", "Vibe"],
                ["artist", "Artists"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => switchTab(id)}
                className={cn(
                  "rounded-[6px] border px-[18.7px] py-[8.5px] text-[1.05rem] font-bold leading-[1.55] transition-colors sm:text-[1.2rem]",
                  tab === id ? "border-ink bg-cream shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-transparent hover:bg-paper",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <RailArrows edge={edge} go={go} label={tab === "category" ? "vibes" : "artists"} className="hidden sm:flex" />
        </div>
      </div>

      <div ref={ref} className="no-scrollbar -mx-4 -my-3 flex snap-x snap-mandatory gap-[25.5px] overflow-x-auto px-4 pb-[17px] pt-[12.75px] sm:mx-0 sm:px-0" role="tabpanel">
        {groups.map((g, i) => {
          const tint = TINTS[i % TINTS.length];
          return (
            <div
              key={`${tab}-${g.name}`}
              data-rail-item
              className="group relative grid w-[82%] max-w-[374px] shrink-0 snap-start overflow-hidden rounded-[10px] bg-card shadow-[0_2px_10px_rgb(0_0_0/0.12)] sm:w-[374px]"
            >
              <div className="relative h-[250px] overflow-hidden sm:h-[306px]" style={{ backgroundImage: tint }}>
                {g.images.slice(0, 3).map((src, j, arr) => {
                  const f = FAN[arr.length as 1 | 2 | 3][j];
                  return (
                    <div
                      key={src}
                      className="absolute left-1/2 top-1/2 aspect-[4/7] w-[37%] overflow-hidden rounded-[4px] shadow-[0_10px_24px_rgb(0_0_0/0.28)] transition-transform duration-500 ease-out [transform:translate(calc(-50%_+_var(--x)),calc(-50%_+_var(--y)))_rotate(var(--r))] group-hover:[transform:translate(calc(-50%_+_var(--hx)),calc(-50%_+_var(--hy)))_rotate(var(--hr))]"
                      style={
                        {
                          zIndex: f.z,
                          "--x": `${f.x}%`,
                          "--y": `${f.y}%`,
                          "--r": `${f.r}deg`,
                          "--hx": `${f.x * 1.18}%`,
                          "--hy": `${f.y - 3}%`,
                          "--hr": `${f.r * 1.4}deg`,
                        } as CSSProperties
                      }
                    >
                      <Image src={src} alt="" fill sizes="140px" className="object-cover" />
                    </div>
                  );
                })}
                <div className="absolute inset-0 z-[4] grid place-items-center bg-ink/35">
                  <span className="rotate-[-4deg] rounded-full border border-ink bg-primary px-5 py-2.5 text-[1.05rem] font-bold leading-none shadow-[2px_2px_0_0_var(--color-ink)]">
                    Coming soon
                  </span>
                </div>
              </div>
              <div className="relative z-[5] p-[19px]">
                <h3 className="display-narrow truncate text-[1.33rem] leading-[0.95]">{g.name}</h3>
                <p className="mt-1 text-[0.8rem] text-muted">
                  {g.count} {g.count === 1 ? "design" : "designs"} coming soon
                </p>
              </div>
            </div>
          );
        })}

        <Link
          href="/panels"
          data-rail-item
          className="group flex w-[82%] max-w-[374px] shrink-0 snap-start flex-col items-center justify-center gap-[25.5px] p-[34px] text-center sm:w-[374px]"
        >
          <span className="grid size-[68px] place-items-center rounded-full bg-primary transition-transform group-hover:scale-105">
            <ArrowRight className="size-7" strokeWidth={2.6} aria-hidden />
          </span>
          <span className="display text-[2.125rem] leading-[1.1]">
            See all
            <br />
            panels
          </span>
        </Link>
      </div>
    </div>
  );
}
