"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus, X } from "lucide-react";
import type { Panel } from "@/lib/types";
import { cn } from "@/lib/format";
import { usePack } from "@/store/pack";
import { JacketBack } from "./jacket-back";
import { toPanelRef } from "./panel-card";
import { useStoreData } from "./store-data";

export function TryOnModal({ panel, onClose }: { panel: Panel | null; onClose: () => void }) {
  const { settings } = useStoreData();
  const inPack = usePack((s) => !!panel && s.panels.some((p) => p.slug === panel.slug));
  const full = usePack((s) => s.panels.length >= settings.pack_size);
  const toggle = usePack((s) => s.toggle);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, onClose]);

  return (
    <AnimatePresence>
      {panel && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Try on ${panel.name}`}
            className="relative grid w-full max-w-4xl gap-6 overflow-hidden rounded-[2rem] bg-paper p-4 sm:grid-cols-2 sm:p-6"
            initial={{ y: 40, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-paper/90 hover:bg-ink hover:text-paper">
              <X className="size-5" />
            </button>
            <JacketBack panel={{ image: panel.image_url, name: panel.name }} sizes="(min-width: 640px) 440px, 90vw" className="max-h-[52vh] sm:max-h-none" />
            <div className="flex flex-col justify-center pb-2">
              <p className="eyebrow text-muted">{panel.category}</p>
              <h2 className="display mt-2 text-4xl sm:text-5xl">{panel.name}</h2>
              {panel.description && <p className="mt-4 text-muted">{panel.description}</p>}
              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">Art by {panel.artist}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!inPack && full}
                  onClick={() => toggle(toPanelRef(panel), settings.pack_size)}
                  className={cn(
                    "inline-flex h-12 items-center gap-2 rounded-full px-6 text-xs font-bold uppercase tracking-wider transition disabled:opacity-40",
                    inPack ? "bg-ink text-acid" : "bg-acid text-ink hover:bg-ink hover:text-acid",
                  )}
                >
                  {inPack ? <Check className="size-4" /> : <Plus className="size-4" />}
                  {inPack ? "In your pack" : full ? "Pack is full" : "Add to pack"}
                </button>
                <Link href={`/panels/${panel.slug}`} className="inline-flex h-12 items-center rounded-full border-2 border-ink px-6 text-xs font-bold uppercase tracking-wider hover:bg-ink hover:text-paper">
                  Details
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
