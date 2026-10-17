"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Plus, Upload, X } from "lucide-react";
import type { Panel, PanelRef } from "@/lib/types";
import { cn, taka } from "@/lib/format";
import { usePack } from "@/store/pack";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { JacketBack } from "./jacket-back";
import { toPanelRef } from "./panel-card";
import { SizePicker } from "./size-picker";
import { SizeGuideButton } from "./size-guide";
import { useStoreData } from "./store-data";

export function SetBuilderFromParams({ panels }: { panels: Panel[] }) {
  const params = useSearchParams();
  return <SetBuilder panels={panels} initialSize={params.get("size")} />;
}

function preview(p: PanelRef | null) {
  if (!p) return null;
  return { image: p.custom?.url ?? p.image, name: p.custom ? "Your custom panel" : p.name, custom: p.custom };
}

export function SetBuilder({ panels, initialSize = null }: { panels: Panel[]; initialSize?: string | null }) {
  const mounted = useMounted();
  const { settings, sizes } = useStoreData();
  const validInitial = sizes.find((s) => s.size === initialSize && s.is_active && s.stock > 0)?.size ?? null;
  const [size, setSize] = useState<string | null>(validInitial);
  const [category, setCategory] = useState<string | null>(null);
  const [focus, setFocus] = useState<PanelRef | null>(null);
  const [added, setAdded] = useState(false);
  const picked = usePack((s) => s.panels);
  const toggle = usePack((s) => s.toggle);
  const remove = usePack((s) => s.remove);
  const clear = usePack((s) => s.clear);
  const addToCart = useCart((s) => s.add);

  const n = settings.pack_size;
  const chosen = mounted ? picked : [];
  const categories = useMemo(() => Array.from(new Set(panels.map((p) => p.category))), [panels]);
  const list = category ? panels.filter((p) => p.category === category) : panels;
  const complete = !!size && chosen.length === n;
  const customFee = chosen.filter((p) => p.custom).length * settings.custom_panel_fee;
  const total = settings.jacket_price + settings.pack_price - settings.bundle_discount + customFee;
  const shown = focus && chosen.some((p) => p.slug === focus.slug) ? focus : (chosen[chosen.length - 1] ?? null);

  function pick(p: Panel) {
    const ref = toPanelRef(p);
    const result = toggle(ref, n);
    if (result === "added") setFocus(ref);
    if (result === "removed" && focus?.slug === p.slug) setFocus(null);
  }

  function addSet() {
    if (!complete || !size) return;
    addToCart({ type: "bundle", size, panels: chosen.slice(0, n) });
    clear();
    setFocus(null);
    setAdded(true);
  }

  const step = (num: number, title: string, done: boolean, extra?: React.ReactNode) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className={cn("grid size-9 place-items-center rounded-full font-mono text-sm font-bold", done ? "bg-acid text-ink" : "bg-ink text-paper")}>
          {done ? <Check className="size-4" /> : num}
        </span>
        <h2 className="display-narrow text-2xl sm:text-3xl">{title}</h2>
      </div>
      {extra}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* live preview */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <JacketBack panel={preview(shown)} showLabel eager />
          <div className="mt-4 grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setFocus(null)}
              className={cn("relative aspect-[4/7] overflow-hidden rounded-lg border-2 bg-ink-3", !shown ? "border-ink" : "border-transparent")}
              aria-label="Preview blank panel"
            >
              <span className="absolute inset-0 grid place-items-center p-1 text-center font-mono text-[0.55rem] uppercase leading-tight text-paper/70">Blank denim</span>
            </button>
            {Array.from({ length: n }).map((_, i) => {
              const p = chosen[i];
              return p ? (
                <div key={p.slug} className="relative">
                  <button
                    type="button"
                    onClick={() => setFocus(p)}
                    className={cn("relative block aspect-[4/7] w-full overflow-hidden rounded-lg border-2", shown?.slug === p.slug ? "border-ink" : "border-transparent")}
                    aria-label={`Preview ${p.name}`}
                  >
                    <Image src={p.custom?.url ?? p.image} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                  <button type="button" onClick={() => remove(p.slug)} aria-label={`Remove ${p.name}`} className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-paper">
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <div key={`slot-${i}`} className="grid aspect-[4/7] place-items-center rounded-lg border-2 border-dashed border-line text-muted">
                  <Plus className="size-4" />
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-xs text-muted">Tap a slot to preview it on the jacket</p>
        </div>
      </div>

      {/* steps */}
      <div className="space-y-12 pb-10 lg:col-span-7">
        <section aria-label="Choose your size">
          {step(1, "Choose your size", !!size, <SizeGuideButton />)}
          <div className="mt-5">
            <SizePicker value={size} onChange={setSize} />
          </div>
        </section>

        <section aria-label="Pick your art panels">
          {step(2, `Pick any ${n} art panels`, chosen.length === n, <span className="font-mono text-sm font-bold">{chosen.length}/{n}</span>)}
          <div className="no-scrollbar -mx-1 mt-5 flex gap-2 overflow-x-auto px-1">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "all"}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-[0.7rem] font-bold uppercase tracking-wider transition",
                  category === c ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                )}
              >
                {c ?? "All"}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4 xl:grid-cols-5">
            {list.map((p) => {
              const isPicked = chosen.some((x) => x.slug === p.slug);
              const soldOut = p.stock !== null && p.stock <= 0;
              const disabled = soldOut || (!isPicked && chosen.length >= n);
              return (
                <button
                  key={p.slug}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(p)}
                  aria-pressed={isPicked}
                  className={cn(
                    "group relative aspect-[4/7] overflow-hidden rounded-xl text-left transition disabled:cursor-not-allowed",
                    isPicked ? "ring-[3px] ring-ink ring-offset-2 ring-offset-paper" : disabled ? "opacity-40" : "hover:-translate-y-0.5",
                  )}
                >
                  <Image src={p.image_url} alt="" fill sizes="(min-width:1280px) 9vw, (min-width:640px) 14vw, 30vw" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-2 pt-6 text-[0.65rem] font-bold uppercase leading-tight text-paper">
                    {p.name}
                  </span>
                  <span className={cn("absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full transition", isPicked ? "bg-acid text-ink" : "bg-paper/85 text-ink opacity-0 group-hover:opacity-100")}>
                    {isPicked ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                  </span>
                </button>
              );
            })}
            <Link
              href="/custom"
              className="grid aspect-[4/7] place-items-center rounded-xl border-2 border-dashed border-ink/30 p-3 text-center transition hover:border-ink hover:bg-paper-2"
            >
              <span>
                <Upload className="mx-auto size-5" />
                <span className="mt-2 block text-[0.65rem] font-bold uppercase leading-tight">Use your own art</span>
              </span>
            </Link>
          </div>
        </section>

        <section aria-label="Review your set" className="rounded-3xl bg-ink p-6 text-paper sm:p-8">
          {step(3, "Your set", complete)}
          <dl className="mt-6 space-y-2.5 font-mono text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-paper/70">Jacket {size ? `· ${size}` : ""} + blank panel</dt>
              <dd>{taka(settings.jacket_price)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-paper/70">{n} art panels ({chosen.length}/{n} picked)</dt>
              <dd>{taka(settings.pack_price)}</dd>
            </div>
            {customFee > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-paper/70">Custom print</dt>
                <dd>{taka(customFee)}</dd>
              </div>
            )}
            {settings.bundle_discount > 0 && (
              <div className="flex justify-between gap-4 text-acid">
                <dt>Set saving</dt>
                <dd>−{taka(settings.bundle_discount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4 border-t border-paper/15 pt-3 text-lg font-bold">
              <dt>Total</dt>
              <dd>{taka(total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-paper/50">Plus delivery. Pay cash when it arrives.</p>

          {added ? (
            <div className="mt-6 rounded-2xl bg-acid p-4 text-ink">
              <p className="font-bold">Set added to your bag! 🎉</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/checkout" className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-xs font-bold uppercase tracking-wider text-paper">
                  Checkout →
                </Link>
                <button type="button" onClick={() => setAdded(false)} className="inline-flex h-11 items-center rounded-full border-2 border-ink px-5 text-xs font-bold uppercase tracking-wider">
                  Build another
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={addSet}
                disabled={!complete}
                className="mt-6 h-14 w-full rounded-full bg-acid text-sm font-bold uppercase tracking-wider text-ink transition hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
              >
                {complete ? "Add set to bag" : !size ? "Choose a size first" : `Pick ${n - chosen.length} more panel${n - chosen.length === 1 ? "" : "s"}`}
              </button>
              <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-paper/60">
                <Link href="/jacket" className="underline-offset-4 hover:text-paper hover:underline">Just the jacket</Link>
                <Link href="/panels" className="underline-offset-4 hover:text-paper hover:underline">Just panels (already have a jacket)</Link>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
