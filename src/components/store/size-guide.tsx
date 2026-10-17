"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ruler, X } from "lucide-react";
import { cn } from "@/lib/format";
import { useStoreData } from "./store-data";

const toCm = (v: string) => {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? (n * 2.54).toFixed(0) : v;
};

export function SizeGuideButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn("inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider underline underline-offset-4 hover:text-muted", className)}>
        <Ruler className="size-3.5" /> Size guide
      </button>
      <SizeGuideModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function SizeGuideTable() {
  const { settings } = useStoreData();
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const rows = settings.size_chart;
  const v = (x: string) => (unit === "in" ? x : toCm(x));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">Garment measurements, laid flat. Chest is measured armpit to armpit.</p>
        <div className="flex shrink-0 rounded-full border border-line p-0.5">
          {(["in", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn("h-8 rounded-full px-3 font-mono text-xs font-bold uppercase", unit === u ? "bg-ink text-paper" : "text-muted")}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[460px] text-left text-sm">
          <thead>
            <tr className="border-b-2 border-ink font-mono text-xs uppercase tracking-wider">
              <th className="py-2.5 pr-3">Size</th>
              <th className="py-2.5 pr-3">Chest (flat)</th>
              <th className="py-2.5 pr-3">Length</th>
              <th className="py-2.5 pr-3">Sleeve</th>
              <th className="py-2.5">Fit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-b border-line">
                <td className="py-2.5 pr-3 font-bold">{r.size}</td>
                <td className="py-2.5 pr-3 font-mono">{v(r.chest)}</td>
                <td className="py-2.5 pr-3 font-mono">{v(r.length)}</td>
                <td className="py-2.5 pr-3 font-mono">{v(r.sleeve)}</td>
                <td className="py-2.5 text-muted">{r.fit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted">
        The fit is boxy and relaxed, with dropped shoulders. Between sizes? Take your usual size for a relaxed fit, or size down for a closer fit.
      </p>
    </div>
  );
}

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            className="relative w-full max-w-2xl rounded-[2rem] bg-paper p-6 sm:p-8"
            initial={{ y: 30 }}
            animate={{ y: 0 }}
            exit={{ y: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full hover:bg-ink/5">
              <X className="size-5" />
            </button>
            <h2 className="display text-4xl">Size guide</h2>
            <div className="mt-5">
              <SizeGuideTable />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
