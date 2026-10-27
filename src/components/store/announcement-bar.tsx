"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, ChevronRight } from "lucide-react";
import { taka } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";

const ROTATE_MS = 4500;

/** Yellow strip above the header. Shows one message at a time and cycles through them all. */
export function AnnouncementBar({ settings }: { settings: StoreSettings }) {
  const custom = (settings.announcement || "Cash on delivery all over Bangladesh")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const items = [
    ...new Set([
      ...custom,
      `Any ${settings.pack_size} art panels for ${taka(settings.pack_price)}`,
      settings.free_delivery_min
        ? `Free delivery over ${taka(settings.free_delivery_min)}`
        : `Delivery ${taka(settings.delivery_inside_dhaka)} inside Dhaka`,
      "Swap your back panel in under a minute",
    ]),
  ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [paused, count]);

  const message = items[index % count];

  return (
    <div
      className="bg-primary text-ink"
      role="region"
      aria-label="Announcements"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto flex h-10 max-w-[1440px] items-center justify-center gap-3 px-4 text-center text-[0.86rem] leading-tight sm:h-9">
        <span className="grid size-[22px] shrink-0 place-items-center rounded-full border border-ink" aria-hidden>
          <Banknote className="size-3" strokeWidth={2.4} />
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.strong
            key={message}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="line-clamp-2 font-bold tracking-[-0.02em]"
          >
            {message}
          </motion.strong>
        </AnimatePresence>
        <span className="hidden h-3.5 w-px bg-ink/40 md:block" aria-hidden />
        <Link href="/build" className="-my-2 hidden items-center gap-0.5 py-2 underline-offset-2 hover:underline md:inline-flex">
          Build your set <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
