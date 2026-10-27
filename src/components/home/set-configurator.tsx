"use client";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Banknote, ChevronDown, RefreshCcw, Ruler } from "lucide-react";
import { ASSETS, BACK_PANEL_RECT, asset } from "@/config/assets";
import { cn, taka } from "@/lib/format";
import { LinkButton } from "@/components/ui/button";
import { JACKET_ASPECT, JacketBack } from "@/components/store/jacket-back";
import { LOW_STOCK } from "@/components/store/size-picker";
import { useStoreData } from "@/components/store/store-data";

type Art = { slug: string; name: string; image: string };
type OptionId = "jacket" | "set" | "panels";

// Shows the blank denim panel by scaling the jacket-back photo so its zip frame fills the thumb.
const r = BACK_PANEL_RECT;
const BLANK_CROP = {
  width: `${(100 / r.width) * 100}%`,
  height: `${(100 / r.height) * 100}%`,
  left: `${(-r.left / r.width) * 100}%`,
  top: `${(-r.top / r.height) * 100}%`,
};
// Same `sizes` as the big preview, so the browser reuses that download for the thumb.
const PREVIEW_SIZES = "(min-width: 1024px) 480px, 90vw";

/** Home-page "set" card: jacket preview + art rail on the left, size / option picker and total on the right. */
export function SetConfigurator({ art }: { art: Art[] }) {
  const { settings, sizes } = useStoreData();
  const n = settings.pack_size;
  const looks = n + 1;
  const discount = settings.bundle_discount;
  const fullPrice = settings.jacket_price + settings.pack_price;

  const [option, setOption] = useState<OptionId>("set");
  const [preview, setPreview] = useState<Art | null>(art[0] ?? null);
  const [size, setSize] = useState<string | null>(null);
  const [sizeOpen, setSizeOpen] = useState(false);

  const options: Record<
    OptionId,
    { count: number; unit: string; badge?: { text: string; dark: boolean }; offer?: string; price: number; compare?: number; includes: string; cta: string; href: string }
  > = {
    jacket: {
      count: 1,
      unit: "Look",
      price: settings.jacket_price,
      includes: "1 jacket + 1 blank denim panel",
      cta: "Get the jacket",
      href: "/jacket",
    },
    set: {
      count: looks,
      unit: "Looks",
      badge: discount > 0 ? { text: "Best value", dark: true } : undefined,
      offer: discount > 0 ? `Save ${taka(discount)}` : undefined,
      price: fullPrice - discount,
      compare: discount > 0 ? fullPrice : undefined,
      includes: `1 jacket + 1 blank panel + ${n} art panels`,
      cta: "Build my set",
      href: size ? `/build?size=${encodeURIComponent(size)}` : "/build",
    },
    panels: {
      count: n,
      unit: "Panels",
      badge: { text: "Own one?", dark: false },
      price: settings.pack_price,
      includes: `${n} art panels · fit every Wronge jacket`,
      cta: `Pick ${n} panels`,
      href: "/panels",
    },
  };
  const chosen = options[option];
  const shown = option === "jacket" ? null : preview;
  const activeSizes = sizes.filter((s) => s.is_active);

  return (
    <div className="mx-auto max-w-[1220px]">
      <div className="overflow-hidden rounded-[24px] border border-line-warm bg-card">
        <div className="grid gap-5 p-4 sm:p-8 lg:grid-cols-[548fr_526fr] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-[57.6px] lg:gap-y-5 lg:p-[43.2px]">
          {/* offer badge */}
          <header className="flex items-center gap-3 lg:col-start-2 lg:row-start-2">
            <h2 className="inline-flex flex-wrap items-center gap-x-[7px] gap-y-0.5 rounded-full border border-plum bg-[linear-gradient(118deg,#40242f_0%,#5c2c2b_62%,#7a3f22_100%)] px-[17px] py-[11.9px] text-[1.05rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.2rem]">
              <RefreshCcw className="size-[18px] text-peach" strokeWidth={2.8} aria-hidden />
              <span className="text-primary">The {looks}-in-1 set</span>
              <span className="text-cream">{discount > 0 ? `Save ${taka(discount)}` : "Cash on delivery"}</span>
            </h2>
          </header>

          {/* gallery */}
          <figure className="flex flex-col overflow-hidden rounded-[16px] bg-studio lg:col-start-1 lg:row-span-4 lg:row-start-1">
            <div className="relative aspect-[548/456] overflow-hidden">
              <div className="absolute left-1/2 top-1/2 h-[104%] -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: JACKET_ASPECT }}>
                <JacketBack panel={shown && { image: shown.image, name: shown.name }} rounded={false} sizes={PREVIEW_SIZES} />
              </div>
              {/* tilted "looks" card */}
              <div className="absolute bottom-[7px] right-[6px] flex w-[77px] rotate-[7deg] flex-col items-center gap-1 rounded-[10px] border border-ink/12 bg-card px-2 pb-2.5 pt-2 shadow-[0_3px_9px_rgb(0_0_0/0.05)] sm:w-[105px]">
                <Image src={asset(ASSETS.markDark)} alt="" width={64} height={64} className="h-10 w-auto sm:h-14" />
                <span className="flex items-center gap-1">
                  <span className="text-[1.05rem] font-black leading-none tracking-tight sm:text-[1.2rem]">{looks}×</span>
                  <strong className="rounded-full bg-sale px-1.5 py-[3px] text-[0.66rem] font-black uppercase leading-none text-white">Looks</strong>
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-[9px] px-2.5 pt-2" role="group" aria-label="Preview art on the jacket">
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-pressed={!shown}
                className={cn(
                  "relative h-[110px] w-[68px] shrink-0 overflow-hidden rounded-[6px] border border-line-warm transition sm:h-[126px] sm:w-[78px]",
                  !shown && "ring-2 ring-ink ring-offset-2 ring-offset-studio",
                )}
              >
                <span className="absolute" style={BLANK_CROP}>
                  <Image src={asset(ASSETS.jacketBack)} alt="" fill sizes={PREVIEW_SIZES} />
                </span>
                <span className="absolute inset-x-0 bottom-0 bg-white/72 py-[3px] text-[0.68rem] font-semibold leading-none">Included</span>
                <span className="sr-only">Blank denim panel</span>
              </button>
              {art.map((a) => (
                <button
                  key={a.slug}
                  type="button"
                  onClick={() => {
                    setPreview(a);
                    if (option === "jacket") setOption("set");
                  }}
                  aria-pressed={shown?.slug === a.slug}
                  className={cn(
                    "relative h-[110px] w-[68px] shrink-0 overflow-hidden rounded-[6px] border border-line-warm transition sm:h-[126px] sm:w-[78px]",
                    shown?.slug === a.slug ? "ring-2 ring-ink ring-offset-2 ring-offset-studio" : "hover:-translate-y-0.5",
                  )}
                >
                  <Image src={a.image} alt={a.name} fill sizes="78px" className="object-cover" />
                </button>
              ))}
            </div>
            <figcaption className="px-4 pb-4 pt-3 text-center text-[0.75rem] leading-snug">Sample panels shown. Pick your own {n} at the next step.</figcaption>
          </figure>

          {/* controls */}
          <div className="lg:col-start-2 lg:row-start-3">
            {option === "set" && activeSizes.length > 0 && (
              <div className="border-b border-line-warm pb-1.5">
                <button
                  type="button"
                  onClick={() => setSizeOpen((o) => !o)}
                  aria-expanded={sizeOpen}
                  className="flex h-11 w-full items-center justify-between gap-3 text-left"
                >
                  <span className="text-[0.86rem] font-bold">Your size</span>
                  <span className="flex items-center gap-[7px] text-[0.8rem]">
                    {size ?? "Pick now or later"}
                    <ChevronDown className={cn("size-4 transition-transform duration-200", sizeOpen && "rotate-180")} strokeWidth={3.2} />
                  </span>
                </button>
                {sizeOpen && (
                  <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto p-0.5 pb-2">
                    {activeSizes.map((s) => {
                      const out = s.stock <= 0;
                      return (
                        <button
                          key={s.size}
                          type="button"
                          disabled={out}
                          onClick={() => setSize(s.size === size ? null : s.size)}
                          aria-pressed={size === s.size}
                          className={cn(
                            "flex h-16 w-[64px] shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[8px] border-2 transition",
                            size === s.size ? "border-ink bg-cream" : "border-line-warm bg-card hover:border-ink/40",
                            out && "opacity-40",
                          )}
                        >
                          <span className={cn("text-[1.15rem] font-black leading-none", out && "line-through")}>{s.size}</span>
                          <span className="text-[0.7rem] font-medium">{out ? "Sold out" : s.stock <= LOW_STOCK ? `${s.stock} left` : "In stock"}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <fieldset className="grid grid-cols-3 gap-2 pt-[10px]">
              <legend className="sr-only">Choose what to buy</legend>
              {(Object.keys(options) as OptionId[]).map((id) => {
                const o = options[id];
                const active = option === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setOption(id)}
                    aria-pressed={active}
                    className={cn(
                      "relative mt-2.5 flex h-20 flex-col rounded-[9px] border-2 text-center transition-colors",
                      active ? "border-ink bg-primary" : "border-line-warm bg-card hover:border-ink/40",
                    )}
                  >
                    {o.badge && (
                      <span
                        className={cn(
                          "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-1.5 py-[3px] text-[0.68rem] font-extrabold leading-none",
                          o.badge.dark ? "border-ink bg-ink text-cream" : "border-plum bg-primary text-plum",
                        )}
                      >
                        {o.badge.text}
                      </span>
                    )}
                    <span className="flex flex-1 flex-col items-center justify-center gap-[3px] px-[3px] pb-2 pt-2.5">
                      <strong className="text-[1.17rem] font-black leading-none">{o.count}</strong>
                      <span className="text-[0.8rem] font-medium leading-none">{o.unit}</span>
                    </span>
                    {o.offer && (
                      <span className="rounded-b-[7px] bg-sale px-0.5 py-1 text-[0.72rem] font-bold leading-tight text-white">{o.offer}</span>
                    )}
                  </button>
                );
              })}
            </fieldset>

            <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-[5px] border-t border-line-warm pt-[18px]">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[0.8rem]">Total</p>
                {chosen.compare && (
                  <p className="rounded-full bg-sale-deep px-[9px] py-1 text-[0.8rem] font-bold leading-tight text-white">
                    Save {taka(chosen.compare - chosen.price)}
                  </p>
                )}
              </div>
              <p className="flex items-baseline gap-2">
                <strong className="text-[1.25rem] font-extrabold leading-none tracking-tight">{taka(chosen.price)}</strong>
                {chosen.compare && <s className="text-[0.93rem]">{taka(chosen.compare)}</s>}
              </p>
              <p className="col-span-2 text-[0.8rem]">{chosen.includes}</p>
            </div>

            <LinkButton href={chosen.href} variant="cta" size="xl" className="mt-[19px] w-full">
              {chosen.cta}
              <ArrowRight className="ml-2 size-[23px]" strokeWidth={2.4} aria-hidden />
            </LinkButton>
            <p className="mt-[9px] text-center text-[0.75rem]">Cash on delivery all over Bangladesh. Pick your art at the next step.</p>
          </div>
        </div>
      </div>

      <ul className="mt-[19px] grid grid-cols-3 gap-4">
        {[
          { Icon: RefreshCcw, t: "Zip-out back panel" },
          { Icon: Banknote, t: "Cash on delivery" },
          { Icon: Ruler, t: "7-day size exchange" },
        ].map(({ Icon, t }) => (
          <li key={t} className="flex flex-col items-center justify-center gap-2 text-center text-[0.78rem] font-semibold sm:flex-row sm:text-[0.86rem]">
            <Icon className="size-6 shrink-0" strokeWidth={2.4} aria-hidden />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
