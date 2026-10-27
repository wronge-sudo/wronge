"use client";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { taka } from "@/lib/format";
import { useCart } from "@/store/cart";
import { buttonClass } from "@/components/ui/button";
import { SizeGuideButton } from "./size-guide";
import { SizePicker } from "./size-picker";
import { useStoreData } from "./store-data";

export function JacketBuy() {
  const { settings } = useStoreData();
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  function addJacket() {
    if (!size) {
      setError(true);
      return;
    }
    add({ type: "jacket", size, qty });
  }

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="tabular-nums text-3xl font-bold">{taka(settings.jacket_price)}</span>
        {settings.jacket_compare_at && settings.jacket_compare_at > settings.jacket_price && (
          <span className="tabular-nums text-lg text-muted line-through">{taka(settings.jacket_compare_at)}</span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">Includes the matching blank denim panel · Cash on delivery</p>

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
        <button type="button" onClick={addJacket} className={buttonClass("ink", "lg", "flex-1")}>
          <ShoppingBag className="hidden size-4 sm:block" aria-hidden />
          <span className="sm:hidden">Add to bag</span>
          <span className="hidden sm:inline">Add jacket to bag</span>
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-primary-border bg-primary-tint p-5">
        <p className="font-bold uppercase tracking-tight">Make it a {settings.pack_size + 1}-in-1 set</p>
        <p className="mt-1 text-sm text-ink/75">
          Add any {settings.pack_size} art panels for {taka(settings.pack_price)}
          {settings.bundle_discount > 0 ? ` and save ${taka(settings.bundle_discount)}` : ""}. {settings.pack_size + 1} looks in one jacket.
        </p>
        <Link href={size ? `/build?size=${size}` : "/build"} className={buttonClass("ink", "md", "mt-4")}>
          Build my set →
        </Link>
      </div>
    </div>
  );
}
