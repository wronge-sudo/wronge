"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { PACKAGE_PIECES } from "@/config/package";
import { taka } from "@/lib/format";
import { useCart } from "@/store/cart";
import { buttonClass } from "@/components/ui/button";
import { QtyStepper } from "@/components/store/qty-stepper";
import { SizePicker } from "@/components/store/size-picker";
import { useStoreData } from "@/components/store/store-data";

/**
 * Homepage direct order bar: pick a size and quantity, then go straight to checkout without opening the bag drawer.
 * The size is shared with the package card above, so choosing it in one place fills in the other.
 */
export function OrderBar({ size, onSizeChange }: { size: string | null; onSizeChange: (size: string) => void }) {
  const { settings } = useStoreData();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const setOpen = useCart((s) => s.setOpen);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function order() {
    if (!size) {
      setError(true);
      return;
    }
    add({ size, qty });
    setOpen(false);
    startTransition(() => router.push("/checkout"));
  }

  return (
    <section aria-label="Order now" className="mt-6 rounded-[16px] border border-line-warm bg-card p-4 sm:p-5 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-8">
        <div>
          <h3 className="display-narrow text-[1.35rem] leading-none sm:text-[1.5rem]">Order the {PACKAGE_PIECES}-in-1 package</h3>
          <p className="mt-2 text-[0.85rem]">
            <strong className="tabular-nums text-[1.05rem] font-extrabold">{taka(settings.jacket_price * qty)}</strong>
            <span className="ml-2">Your details and courier come next.</span>
          </p>
        </div>

        <div>
          <p className="mb-2 text-[0.86rem] font-bold" aria-live="polite">
            Your size
            {error && !size && <span className="ml-2 font-semibold text-signal">Please choose one</span>}
          </p>
          <SizePicker value={size} onChange={onSizeChange} variant="circles" />
        </div>

        {/* On the narrowest phones the button wraps under the quantity control instead of overflowing. */}
        <div className="flex flex-wrap items-center gap-2">
          <QtyStepper value={qty} onChange={setQty} />
          <button type="button" onClick={order} disabled={pending} className={buttonClass("cta", "lg", "flex-1 px-4 disabled:opacity-60 sm:px-7 lg:flex-none")}>
            Order now
            <ArrowRight className="ml-1.5 hidden size-5 sm:block" strokeWidth={2.4} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
