"use client";
import { cn } from "@/lib/format";
import { useStoreData } from "./store-data";

/** At or below this many in stock, a size is flagged as running low. */
export const LOW_STOCK = 3;

/** `tiles` is the 6-column grid; `circles` is the round chip row used in the product size card. */
export function SizePicker({
  value,
  onChange,
  variant = "tiles",
}: {
  value: string | null;
  onChange: (size: string) => void;
  variant?: "tiles" | "circles";
}) {
  const { sizes } = useStoreData();
  const active = sizes.filter((s) => s.is_active);
  const selected = active.find((s) => s.size === value);
  const round = variant === "circles";

  return (
    <div>
      <div className={round ? "flex flex-wrap gap-[5px] sm:gap-2" : "grid grid-cols-6 gap-2"}>
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
                "relative tabular-nums transition",
                round ? "grid size-11 place-items-center rounded-full border text-[0.95rem] sm:size-[50px]" : "h-12 rounded-xl border-2 text-sm font-bold",
                value === s.size
                  ? "border-ink bg-ink font-bold text-paper"
                  : round
                    ? "border-line-warm bg-sand font-medium hover:border-ink"
                    : "border-line bg-paper hover:border-ink",
                out && (round ? "cursor-not-allowed text-muted/60 line-through hover:border-line-warm" : "cursor-not-allowed text-muted/60 line-through hover:border-line"),
              )}
            >
              {s.size}
              {!out && s.stock <= LOW_STOCK && (
                <span className={cn("absolute size-2.5 rounded-full bg-signal", round ? "right-0 top-0" : "-right-1 -top-1")} aria-hidden />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 h-4 text-xs text-muted" aria-live="polite">
        {selected && selected.stock <= LOW_STOCK ? <span className="font-semibold text-signal">Only {selected.stock} left in {selected.size}</span> : selected ? `${selected.size} is in stock` : ""}
      </p>
    </div>
  );
}
