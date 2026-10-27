"use client";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ASSETS, asset } from "@/config/assets";
import { lineTitle, unitPrice, type CartLine } from "@/lib/pricing";
import { taka, cn } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useStoreData } from "./store-data";

function LineThumb({ line }: { line: CartLine }) {
  if (line.type === "jacket") {
    return (
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-studio">
        <Image src={asset(ASSETS.jacketFront)} alt="" fill sizes="80px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center gap-0.5 overflow-hidden rounded-xl bg-ink p-1.5">
      {line.type === "bundle" && (
        <div className="relative h-full w-5 shrink-0 overflow-hidden rounded-sm bg-studio">
          <Image src={asset(ASSETS.jacketFront)} alt="" fill sizes="24px" className="object-cover" />
        </div>
      )}
      {line.panels.slice(0, 4).map((p) => (
        <div key={p.slug} className="relative h-full flex-1 overflow-hidden rounded-sm bg-ink-3">
          <Image src={p.custom?.url ?? p.image} alt="" fill sizes="24px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

export function CartLines({ editable = true, compact = false }: { editable?: boolean; compact?: boolean }) {
  const { settings } = useStoreData();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);

  return (
    <ul className="divide-y divide-line">
      {lines.map((line) => {
        const unit = unitPrice(line, settings);
        return (
          <li key={line.key} className={cn("flex gap-4", compact ? "py-3" : "py-5")}>
            <LineThumb line={line} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold uppercase leading-tight tracking-tight">{lineTitle(line, settings)}</p>
                  {line.type !== "jacket" && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {line.type === "bundle" && "Jacket + blank panel + "}
                      {line.panels.map((p) => (p.custom ? "Your custom panel" : p.name)).join(", ")}
                    </p>
                  )}
                  {line.type === "jacket" && <p className="mt-1 text-xs text-muted">Includes the matching blank denim panel</p>}
                </div>
                <p className="shrink-0 tabular-nums text-sm font-bold">{taka(unit * line.qty)}</p>
              </div>

              {editable ? (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"
                      onClick={() => setQty(line.key, line.qty - 1)}
                      disabled={line.qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center tabular-nums text-sm">{line.qty}</span>
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"
                      onClick={() => setQty(line.key, line.qty + 1)}
                      disabled={line.qty >= 10}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(line.key)}
                    className="flex items-center gap-1 text-xs text-muted hover:text-signal"
                  >
                    <Trash2 className="size-3.5" /> Remove
                  </button>
                </div>
              ) : (
                <p className="mt-1 tabular-nums text-xs text-muted">
                  Qty {line.qty} × {taka(unit)}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
