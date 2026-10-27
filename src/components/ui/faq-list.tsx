"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/config/faq";
import { cn } from "@/lib/format";

export function FaqList({ faqs, dark = false }: { faqs: Faq[]; dark?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul
      className={cn(
        "divide-y rounded-[21.25px] border px-4 py-1 sm:px-[17px]",
        dark ? "divide-paper/15 border-paper/15 bg-ink-2" : "divide-ink/10 border-ink/10 bg-paper shadow-[0_3px_10px_rgb(0_0_0/0.07)]",
      )}
    >
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 px-1 py-[17px] text-left"
              >
                <span className="text-[1rem] font-semibold leading-snug sm:text-[1.01rem]">{f.q}</span>
                <ChevronDown className={cn("size-5 shrink-0 transition-transform duration-300", isOpen && "rotate-180")} strokeWidth={2.8} />
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
                  <p className={cn("max-w-3xl pb-5 pr-10 text-[1rem] leading-relaxed", dark ? "text-paper/75" : "text-ink/80")}>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
