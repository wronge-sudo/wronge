"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Plus, Shuffle, Square } from "lucide-react";
import type { Panel } from "@/lib/types";
import { cn, taka } from "@/lib/format";
import { usePack } from "@/store/pack";
import { useMounted } from "@/lib/use-mounted";
import { JacketBack } from "./jacket-back";
import { toPanelRef } from "./panel-card";
import { useStoreData } from "./store-data";

/** Interactive try-on: click a panel, watch it zip into the jacket back. */
export function SwapStudio({ panels, dark = true }: { panels: Panel[]; dark?: boolean }) {
  const mounted = useMounted();
  const { settings } = useStoreData();
  const [current, setCurrent] = useState<Panel | null>(panels[0] ?? null);
  const packPanels = usePack((s) => s.panels);
  const toggle = usePack((s) => s.toggle);

  const inPack = mounted && !!current && packPanels.some((p) => p.slug === current.slug);
  const full = mounted && packPanels.length >= settings.pack_size;

  function shuffle() {
    if (panels.length < 2) return;
    let next = current;
    while (next === current) next = panels[Math.floor(Math.random() * panels.length)];
    setCurrent(next);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:sticky lg:top-28 lg:col-span-6">
        <JacketBack panel={current ? { image: current.image_url, name: current.name } : null} showLabel />
        <div className="mt-4 flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={() => setCurrent(null)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border-2 px-5 text-xs font-bold uppercase tracking-wider transition",
              !current
                ? "border-primary bg-primary text-paper"
                : dark
                  ? "border-paper/30 text-paper hover:border-primary-light hover:text-primary-light"
                  : "border-ink hover:bg-ink hover:text-paper",
            )}
          >
            <Square className="size-4" /> Blank denim
          </button>
          {current && (
            <button
              type="button"
              disabled={!inPack && full}
              onClick={() => toggle(toPanelRef(current), settings.pack_size)}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-full px-5 text-xs font-bold uppercase tracking-wider transition disabled:opacity-40",
                inPack ? "bg-paper text-ink" : "bg-primary text-paper hover:bg-primary-hover",
              )}
            >
              {inPack ? <Check className="size-4" /> : <Plus className="size-4" />}
              {inPack ? "In your pack" : full ? "Pack is full" : "Add to pack"}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className={cn("eyebrow", dark ? "text-primary-light" : "text-muted")}>{panels.length} designs · tap to try on</p>
            {current && (
              <p className={cn("mt-2 text-sm", dark ? "text-paper/70" : "text-muted")}>
                <span className={cn("font-bold uppercase", dark ? "text-paper" : "text-ink")}>{current.name}</span> — {current.category}
              </p>
            )}
          </div>
          <Link href="/panels" className={cn("shrink-0 text-xs font-bold uppercase tracking-wider underline-offset-4 hover:underline", dark ? "text-paper" : "text-ink")}>
            All panels →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-3">
          {panels.map((p) => {
            const active = current?.slug === p.slug;
            const picked = mounted && packPanels.some((x) => x.slug === p.slug);
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setCurrent(p)}
                aria-label={`Try on ${p.name}`}
                aria-pressed={active}
                className={cn(
                  "group relative aspect-[4/7] overflow-hidden rounded-xl transition",
                  active ? cn("ring-[3px] ring-offset-2", dark ? "ring-primary-light" : "ring-primary") : "opacity-80 hover:opacity-100",
                  dark ? "ring-offset-ink" : "ring-offset-paper",
                )}
              >
                <Image src={p.image_url} alt="" fill sizes="(min-width: 1024px) 9vw, 22vw" className="object-cover transition duration-300 group-hover:scale-105" />
                {picked && (
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-paper">
                    <Check className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className={cn("mt-6 rounded-2xl border p-5", dark ? "border-paper/15 bg-ink-2" : "border-line bg-paper-2")}>
          <p className={cn("text-sm", dark ? "text-paper/80" : "text-ink")}>
            <span className="font-bold">Pick any {settings.pack_size} for {taka(settings.pack_price)}.</span> Your picks wait in the tray at the
            bottom of the screen until the pack is complete.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/build" className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-xs font-bold uppercase tracking-wider text-paper transition hover:bg-primary-hover">
              Build jacket + pack →
            </Link>
            <Link
              href="/custom"
              className={cn(
                "inline-flex h-11 items-center rounded-full border-2 px-5 text-xs font-bold uppercase tracking-wider transition",
                dark ? "border-paper/30 text-paper hover:border-paper" : "border-ink hover:bg-ink hover:text-paper",
              )}
            >
              Upload your own art
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
