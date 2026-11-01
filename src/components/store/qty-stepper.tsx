"use client";
import { Minus, Plus } from "lucide-react";

const MAX_QTY = 10;

/** Pill-shaped quantity control, 1 to 10 (the same limits as the bag). */
export function QtyStepper({ value, onChange }: { value: number; onChange: (qty: number) => void }) {
  return (
    <div className="flex h-14 shrink-0 items-center rounded-full border-2 border-line">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="grid size-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <span className="w-6 text-center tabular-nums font-bold" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(Math.min(MAX_QTY, value + 1))} className="grid size-12 place-items-center rounded-full hover:bg-ink/5" aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
