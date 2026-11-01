"use client";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { taka } from "@/lib/format";
import { useCart } from "@/store/cart";
import { buttonClass } from "@/components/ui/button";
import { SizeGuideButton } from "./size-guide";
import { SizePicker } from "./size-picker";
import { useStoreData } from "./store-data";

export function JacketBuy() {
  const { settings, packagePanels } = useStoreData();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  function addPackage() {
    if (!size) {
      setError(true);
      return;
    }
    add({ size, qty });
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="tabular-nums text-3xl font-bold">{taka(settings.jacket_price)}</span>
        {settings.jacket_compare_at && settings.jacket_compare_at > settings.jacket_price && (
          <span className="tabular-nums text-lg text-muted line-through">{taka(settings.jacket_compare_at)}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        4-in-1 package: the jacket, a blank denim panel
        {packagePanels.length > 0 && ` and ${packagePanels.length} art panels (${packagePanels.map((p) => p.name).join(", ")})`}
      </p>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow">
            Size {error && !size && <span className="ml-2 normal-case tracking-normal text-signal">— please choose a size</span>}
          </p>
          <SizeGuideButton />
        </div>
        <SizePicker
          value={size}
          onChange={(s) => {
            setSize(s);
            setError(false);
          }}
        />
      </div>

      <div className="mt-6 flex gap-2">
        <div className="flex h-14 items-center rounded-full border-2 border-line">
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="grid size-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Decrease quantity">
            <Minus className="size-4" />
          </button>
          <span className="w-6 text-center tabular-nums font-bold">{qty}</span>
          <button type="button" onClick={() => setQty(Math.min(10, qty + 1))} className="grid size-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Increase quantity">
            <Plus className="size-4" />
          </button>
        </div>
        <button type="button" onClick={addPackage} className={buttonClass("ink", "lg", "flex-1")}>
          <ShoppingBag className="hidden size-4 sm:block" aria-hidden />
          Add to bag
        </button>
      </div>
    </div>
  );
}
