"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

/**
 * A horizontal scroll-snap track with prev/next arrows.
 * Put `ref` on the scrolling element and `data-rail-item` on each slide.
 */
export function useRail<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ResizeObserver also fires once on observe, which sets the initial arrow state.
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Swapping the slides (e.g. a tab change) changes scrollWidth without a resize or scroll event.
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true });
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const go = useCallback((dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>("[data-rail-item]");
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = item ? item.offsetWidth + gap : el.clientWidth * 0.8;
    // Move by as many whole slides as fit, so a full "page" advances.
    const perPage = Math.max(1, Math.floor((el.clientWidth + gap) / step));
    el.scrollBy({ left: dir * step * perPage, behavior: "smooth" });
  }, []);

  return { ref, edge, go };
}

export function RailArrows({
  edge,
  go,
  label,
  className,
}: {
  edge: { start: boolean; end: boolean };
  go: (dir: 1 | -1) => void;
  label: string;
  className?: string;
}) {
  const btn =
    "grid size-[47px] place-items-center rounded-full border-[1.5px] border-ink text-ink transition-[color,background-color,border-color,opacity,transform] duration-200 hover:bg-ink hover:text-paper active:scale-95 disabled:pointer-events-none disabled:border-ink/30 disabled:text-ink/30";
  return (
    <div className={cn("flex shrink-0 gap-0.5", className)}>
      <button type="button" className={btn} disabled={edge.start} onClick={() => go(-1)} aria-label={`Previous ${label}`}>
        <ChevronLeft className="size-4" strokeWidth={3} />
      </button>
      <button type="button" className={btn} disabled={edge.end} onClick={() => go(1)} aria-label={`Next ${label}`}>
        <ChevronRight className="size-4" strokeWidth={3} />
      </button>
    </div>
  );
}
