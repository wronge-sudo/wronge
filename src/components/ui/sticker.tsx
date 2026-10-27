import type { ReactNode } from "react";
import { cn } from "@/lib/format";

// Zig-zag starburst outline in a 100×100 box.
const POINTS = Array.from({ length: 40 }, (_, i) => {
  const r = i % 2 ? 43 : 49;
  const a = (Math.PI * i) / 20 - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

/** Yellow starburst badge ("NEW", "HOT" …). Size and position it with className. */
export function Sticker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("pointer-events-none grid place-items-center", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
        <polygon points={POINTS} fill="var(--color-primary)" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <span className="relative max-w-[72%] text-center text-[1.05rem] font-bold uppercase leading-none tracking-[-0.03em] text-ink">
        {children}
      </span>
    </span>
  );
}
