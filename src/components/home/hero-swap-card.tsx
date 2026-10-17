"use client";
import { useEffect, useState } from "react";
import { JacketBack } from "@/components/store/jacket-back";

type Mini = { image: string; name: string };

/** Small jacket back that keeps zipping in a new panel — the product, explained in 3 seconds. */
export function HeroSwapCard({ panels }: { panels: Mini[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (panels.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % panels.length), 2600);
    return () => clearInterval(t);
  }, [panels.length]);

  const p = panels[i];
  return (
    <div className="w-full rounded-[1.6rem] bg-paper p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)]">
      <JacketBack panel={p ?? null} sizes="260px" rounded={false} className="rounded-[1.2rem]" />
      <div className="flex items-center justify-between gap-2 px-2 pb-1 pt-2.5">
        <p className="truncate font-mono text-[0.62rem] font-bold uppercase tracking-widest">
          Now wearing: <span className="text-muted">{p?.name}</span>
        </p>
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-acid-2 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-acid-2" />
        </span>
      </div>
    </div>
  );
}
