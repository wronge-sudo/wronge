"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JACKET_ASPECT, JacketBack } from "@/components/store/jacket-back";
import { RailArrows, useRail } from "@/components/ui/rail";
import { Sticker } from "@/components/ui/sticker";

type Look = { slug: string; name: string; image: string; badge: string | null };

// Each card sits at a slightly different angle, like photos pinned to a board.
const TILTS = [-2, 2, -1, 2, -2, 1, -1];

export function LookCarousel({ looks }: { looks: Look[] }) {
  const { ref, edge, go } = useRail<HTMLDivElement>();

  return (
    <div className="grid gap-2">
      <div className="flex items-end justify-between gap-4">
        <h2 className="display text-[2rem] sm:text-[2.4rem]">Fan favourites</h2>
        <RailArrows edge={edge} go={go} label="looks" className="hidden translate-y-6 sm:flex" />
      </div>

      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto px-[calc(1rem-10.6px)] pb-[17px] pt-[25.5px] sm:-mx-[10.6px] sm:px-0">
        {looks.map((l, i) => (
          <div key={l.slug} data-rail-item className="w-[80%] max-w-[355px] shrink-0 snap-start px-[10.6px] sm:w-[355px]">
            <figure
              className="relative rounded-[10px] bg-card p-[8.5px] shadow-[0_4px_12px_rgb(0_0_0/0.08)] transition-transform duration-500 hover:rotate-0!"
              style={{ rotate: `${TILTS[i % TILTS.length]}deg` }}
            >
              <Link href={`/panels/${l.slug}`} className="block" aria-label={`${l.name} on the Wronge jacket`}>
                <div className="relative aspect-[330/407] overflow-hidden rounded-[10px] bg-studio">
                  {/* Height-fit the jacket flat-lay into the portrait frame (sides crop slightly). */}
                  <div className="absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: JACKET_ASPECT }}>
                    <JacketBack panel={{ image: l.image, name: l.name }} rounded={false} sizes="(min-width: 640px) 380px, 85vw" />
                  </div>
                </div>
              </Link>
              {l.badge && <Sticker className="absolute -right-1 -top-[18px] size-[94px] rotate-12">{l.badge}</Sticker>}
              <figcaption className="px-[6.4px] pb-[8.5px] pt-[14.9px] text-[0.93rem] font-bold leading-[1.43]">
                Washed-black jacket +{" "}
                <Link href={`/panels/${l.slug}`} className="underline-offset-2 hover:underline">
                  {l.name}
                </Link>
              </figcaption>
            </figure>
          </div>
        ))}
      </div>

      <Link
        href="/build"
        className="group mt-2 inline-flex w-fit items-center gap-3 font-display text-[1.2rem] font-black uppercase leading-none tracking-[-0.03em]"
      >
        <span className="underline decoration-2 underline-offset-[6px]">Build your set</span>
        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2.6} aria-hidden />
      </Link>
    </div>
  );
}
