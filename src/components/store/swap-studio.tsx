"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Shuffle, Square } from "lucide-react";
import type { Panel } from "@/lib/types";
import { PACKAGE_PIECES } from "@/config/package";
import { cn, taka } from "@/lib/format";
import { JacketBack } from "./jacket-back";
import { useStoreData } from "./store-data";

/** Interactive try-on: click a panel, watch it zip into the jacket back. Pass the package's panels. */
export function SwapStudio({ panels, dark = true }: { panels: Panel[]; dark?: boolean }) {
  const { settings } = useStoreData();
  const [current, setCurrent] = useState<Panel | null>(panels[0] ?? null);

  function shuffle() {
    if (panels.length < 2) return;
    let next = current;
    while (next === current) next = panels[Math.floor(Math.random() * panels.length)];
    setCurrent(next);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:sticky lg:top-28 lg:col-span-6">
        <JacketBack panel={current ? { image: current.image_url, name: current.name } : null} showLabel />
        <div className="mt-4 flex flex-wrap gap-2">
          {panels.length > 1 && (
            <button
              type="button"
              onClick={shuffle}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full border-2 px-5 text-xs font-bold uppercase tracking-wider transition",
                dark ? "border-paper/30 text-paper hover:border-primary-light hover:text-primary-light" : "border-ink hover:bg-ink hover:text-paper",
              )}
            >
              <Shuffle className="size-4" /> Shuffle
            </button>
          )}
          <button
            type="button"
            onClick={() => setCurrent(null)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border-2 px-5 text-xs font-bold uppercase tracking-wider transition",
              !current
                ? "border-primary bg-primary text-ink"
                : dark
                  ? "border-paper/30 text-paper hover:border-primary-light hover:text-primary-light"
                  : "border-ink hover:bg-ink hover:text-paper",
            )}
          >
            <Square className="size-4" /> Blank denim
          </button>
        </div>
      </div>

      <div className="lg:col-span-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={cn("eyebrow", dark ? "text-primary-light" : "text-muted")}>
              {panels.length} {panels.length === 1 ? "design" : "designs"} · tap to try on
            </p>
            {current && (
              <p className={cn("mt-2 text-sm", dark ? "text-paper/70" : "text-muted")}>
                <span className={cn("font-bold uppercase", dark ? "text-paper" : "text-ink")}>{current.name}</span> — {current.category}
              </p>
            )}
          </div>
          <Link href="/panels" className={cn("-my-2 shrink-0 py-2 text-xs font-bold uppercase tracking-wider underline-offset-4 hover:underline", dark ? "text-paper" : "text-ink")}>
            All panels →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {panels.map((p) => {
            const active = current?.slug === p.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setCurrent(p)}
                aria-label={`Try on ${p.name}`}
                aria-pressed={active}
                className={cn(
                  "group relative aspect-[4/7] overflow-hidden rounded-xl transition",
                  active ? cn("ring-[3px] ring-offset-2", dark ? "ring-primary-light" : "ring-ink") : "opacity-80 hover:opacity-100",
                  dark ? "ring-offset-ink" : "ring-offset-paper",
                )}
              >
                <Image src={p.image_url} alt="" fill sizes="(min-width: 1024px) 15vw, 30vw" className="object-cover transition duration-300 group-hover:scale-105" />
              </button>
            );
          })}
          <div
            className={cn(
              "grid aspect-[4/7] place-items-center rounded-xl border-2 border-dashed p-3 text-center text-[0.7rem] font-bold uppercase leading-tight",
              dark ? "border-paper/25 text-paper/60" : "border-ink/25 text-muted",
            )}
          >
            More designs coming soon
          </div>
        </div>

        <div className={cn("mt-6 rounded-2xl border p-5", dark ? "border-paper/15 bg-ink-2" : "border-line bg-paper-2")}>
          <p className={cn("text-sm", dark ? "text-paper/80" : "text-ink")}>
            <span className="font-bold">
              Both designs come with the jacket. {taka(settings.jacket_price)} for all {PACKAGE_PIECES} pieces,
            </span>{" "}
            blank denim panel included.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/build" className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-primary-hover">
              Build your set →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
