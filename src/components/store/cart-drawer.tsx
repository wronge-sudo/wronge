"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBag, Truck, X } from "lucide-react";
import { priceCart } from "@/lib/pricing";
import { taka } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { buttonClass } from "@/components/ui/button";
import { CartLines } from "./cart-lines";
import { useStoreData } from "./store-data";

export function CartDrawer() {
  const mounted = useMounted();
  const { settings } = useStoreData();
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  if (!mounted) return null;
  const { subtotal } = priceCart(lines, settings, null);
  const freeMin = settings.free_delivery_min;
  const toFree = freeMin ? Math.max(0, freeMin - subtotal) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-paper shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <p className="display-narrow text-2xl">Your bag</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close bag" className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
                <X className="size-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-ink text-acid">
                  <ShoppingBag className="size-7" />
                </div>
                <p className="display-narrow text-2xl">Your bag is empty</p>
                <p className="text-sm text-muted">Start with the jacket, then pick the art you want to wear on your back.</p>
                <Link href="/build" onClick={() => setOpen(false)} className={buttonClass("acid", "lg", "mt-2")}>
                  Build your set →
                </Link>
              </div>
            ) : (
              <>
                {toFree !== null && (
                  <div className="border-b border-line bg-paper-2 px-5 py-3 text-xs">
                    <p className="flex items-center gap-2 font-semibold">
                      <Truck className="size-4" />
                      {toFree > 0 ? `Add ${taka(toFree)} more for free delivery` : "You've unlocked free delivery"}
                    </p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${Math.min(100, (subtotal / (freeMin || 1)) * 100)}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto px-5">
                  <CartLines />
                </div>
                <div className="border-t border-line bg-paper px-5 py-5">
                  <div className="flex items-center justify-between">
                    <span className="eyebrow text-muted">Subtotal</span>
                    <span className="font-mono text-lg font-bold">{taka(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Delivery: {taka(settings.delivery_inside_dhaka)} inside Dhaka · {taka(settings.delivery_outside_dhaka)} outside. Pay cash when it arrives.
                  </p>
                  <Link href="/checkout" onClick={() => setOpen(false)} className={buttonClass("acid", "lg", "mt-4 w-full")}>
                    Checkout · Cash on delivery
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-xs font-semibold uppercase tracking-wider underline-offset-4 hover:underline">
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
