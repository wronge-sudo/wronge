"use client";
import { cn } from "@/lib/format";
import { useStoreData } from "./store-data";

export function SizePicker({ value, onChange }: { value: string | null; onChange: (size: string) => void }) {
  const { sizes } = useStoreData();
  const active = sizes.filter((s) => s.is_active);
  const selected = active.find((s) => s.size === value);

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {active.map((s) => {
          const out = s.stock <= 0;
          return (
            <button
              key={s.size}
              type="button"
              disabled={out}
              onClick={() => onChange(s.size)}
              aria-pressed={value === s.size}
              className={cn(
                "relative h-12 rounded-xl border-2 font-mono text-sm font-bold transition",
                value === s.size ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink",
                out && "cursor-not-allowed text-muted/60 line-through hover:border-line",
              )}
            >
              {s.size}
              {!out && s.stock <= 3 && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-signal" aria-hidden />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 h-4 text-xs text-muted" aria-live="polite">
        {selected && selected.stock <= 3 ? <span className="font-semibold text-signal">Only {selected.stock} left in {selected.size}</span> : selected ? `${selected.size} is in stock` : ""}
      </p>
    </div>
  );
}
