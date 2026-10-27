"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { taka, cn } from "@/lib/format";
import { useCart } from "@/store/cart";
import { usePack } from "@/store/pack";
import { useMounted } from "@/lib/use-mounted";
import { useStoreData } from "./store-data";

const HIDE_ON = ["/build", "/cart", "/checkout", "/order", "/custom"];

/** Shows the floating pack tray everywhere except pages that have their own builder. */
export function PackTrayGate() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <PackTray />;
}

/** Floating bar that shows the panels picked for the current pack. */
export function PackTray({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const mounted = useMounted();
  const { settings } = useStoreData();
  const panels = usePack((s) => s.panels);
  const remove = usePack((s) => s.remove);
  const clear = usePack((s) => s.clear);
  const addToCart = useCart((s) => s.add);

  if (!mounted) return null;
  const size = settings.pack_size;
  const visible = alwaysShow || panels.length > 0;
  const left = size - panels.length;
  const full = left <= 0;
  const fee = panels.filter((p) => p.custom).length * settings.custom_panel_fee;

  function addPack() {
    addToCart({ type: "pack", panels: panels.slice(0, size) });
    clear();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl rounded-3xl border border-line-dark bg-ink p-3 text-paper shadow-2xl sm:bottom-5 sm:p-4"
          role="region"
          aria-label="Your panel pack"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex gap-1.5 sm:gap-2">
              {Array.from({ length: size }).map((_, i) => {
                const p = panels[i];
                return (
                  <div
                    key={p?.slug ?? `empty-${i}`}
                    className={cn(
                      "relative h-14 w-9 overflow-hidden rounded-md sm:h-16 sm:w-10",
                      p ? "bg-ink-3" : "border border-dashed border-paper/30",
                    )}
                  >
                    {p ? (
                      <>
                        <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                        <button
                          type="button"
                          onClick={() => remove(p.slug)}
                          aria-label={`Remove ${p.name}`}
                          className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-ink/80"
                        >
                          <X className="size-2.5" />
                        </button>
                      </>
                    ) : (
                      <span className="grid h-full place-items-center text-paper/30">
                        <Plus className="size-3.5" />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="min-w-0 flex-1">
              <p className="eyebrow whitespace-nowrap text-primary-light">
                <span className="sm:hidden">Pack</span>
                <span className="hidden sm:inline">{size}-panel pack</span> · {taka(settings.pack_price + fee)}
              </p>
              <p className="line-clamp-2 text-[0.8rem] leading-snug text-paper/80 sm:line-clamp-1 sm:text-sm">
                {full
                  ? "Pack complete. Add it to your bag."
                  : panels.length === 0
                    ? `Pick any ${size} art panels.`
                    : `Pick ${left} more ${left === 1 ? "panel" : "panels"}.`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {panels.length > 0 && (
                <button type="button" onClick={clear} className="hidden text-xs uppercase tracking-wider text-paper/60 hover:text-paper sm:block">
                  Clear
                </button>
              )}
              {full ? (
                <button
                  type="button"
                  onClick={addPack}
                  className="h-11 whitespace-nowrap rounded-full bg-primary px-3.5 text-xs font-bold uppercase tracking-wider text-ink transition hover:bg-primary-hover sm:px-6"
                >
                  Add pack
                </button>
              ) : (
                <Link
                  href="/panels"
                  className="h-11 content-center rounded-full border border-paper/30 px-3.5 text-xs font-bold uppercase tracking-wider text-paper/80 hover:border-paper sm:px-5"
                >
                  Browse
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
