"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import type { Faq } from "@/config/faq";
import { cn } from "@/lib/format";

export function FaqList({ faqs, dark = false }: { faqs: Faq[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className={cn("divide-y border-y", dark ? "divide-paper/15 border-paper/15" : "divide-line border-line")}>
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-base font-bold uppercase tracking-tight sm:text-lg">{f.q}</span>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border transition-transform duration-300",
                    dark ? "border-paper/30" : "border-ink/20",
                    isOpen && "rotate-45 border-transparent bg-acid text-ink",
                  )}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className={cn("max-w-3xl pb-6 pr-12 text-[0.95rem] leading-relaxed", dark ? "text-paper/70" : "text-muted")}>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
