"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import { ArrowRight, Banknote, Check, Plus, RectangleVertical, RefreshCcw, Shirt, Star, Tag, Timer, Truck, Upload, X, Zap } from "lucide-react";
import type { Panel, PanelRef } from "@/lib/types";
import { ASSETS, asset } from "@/config/assets";
import { cn, taka } from "@/lib/format";
import { usePack } from "@/store/pack";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { buttonClass } from "@/components/ui/button";
import { BuildGallery, GALLERY_SIZES } from "./build-gallery";
import { BLANK_PANEL_CROP } from "./jacket-back";
import { toPanelRef } from "./panel-card";
import { SizePicker } from "./size-picker";
import { SizeGuideButton } from "./size-guide";
import { useStoreData } from "./store-data";

type Step = "jacket" | "art";
type Icon = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

const COLOR = "Washed Black";
/** `focus` value that pins the blank denim panel on the preview. */
const BLANK = "__blank";

const FEATURES: { Icon: Icon; text: string }[] = [
  { Icon: RefreshCcw, text: "Swap your back panel" },
  { Icon: RectangleVertical, text: "Matching blank panel included" },
  { Icon: Zap, text: "Swap in seconds. No tools." },
];

// Today's date in Dhaka as a day number, read on the client only so the prerendered shell never touches the clock.
const DAY = 86_400_000;
const DHAKA_OFFSET = 6 * 3_600_000; // Bangladesh has no daylight saving
const noSubscribe = () => () => {};
function useDhakaDay() {
  return useSyncExternalStore(
    noSubscribe,
    () => Math.floor((Date.now() + DHAKA_OFFSET) / DAY),
    () => null,
  );
}
const dayLabel = (day: number) =>
  new Date(day * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).replace(" ", "\u00a0");

export function SetBuilderFromParams({ panels }: { panels: Panel[] }) {
  const params = useSearchParams();
  return <SetBuilder panels={panels} initialSize={params.get("size")} initialStep={params.get("step") === "art" ? "art" : "jacket"} />;
}

function preview(p: PanelRef | null) {
  if (!p) return null;
  return { image: p.custom?.url ?? p.image, name: p.custom ? "Your custom panel" : p.name, custom: p.custom };
}

function scrollToEl(el: HTMLElement | null, block: ScrollLogicalPosition = "start") {
  el?.scrollIntoView({ behavior: "smooth", block });
}

/**
 * The "Build your set" product page, in two steps:
 * 1. the jacket (colour + size), 2. any `pack_size` art panels, previewed live on the jacket.
 * Size and step live in the URL so a refresh keeps them and the back button returns to step 1.
 */
export function SetBuilder({
  panels,
  initialSize = null,
  initialStep = "jacket",
}: {
  panels: Panel[];
  initialSize?: string | null;
  initialStep?: Step;
}) {
  const mounted = useMounted();
  const today = useDhakaDay();
  const { settings, sizes } = useStoreData();
  const validInitial = sizes.find((s) => s.size === initialSize && s.is_active && s.stock > 0)?.size ?? null;
  const [size, setSize] = useState<string | null>(validInitial);
  const [sizeError, setSizeError] = useState(false);
  const [step, setStep] = useState<Step>(initialStep);
  const [category, setCategory] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const picked = usePack((s) => s.panels);
  const toggle = usePack((s) => s.toggle);
  const remove = usePack((s) => s.remove);
  const clear = usePack((s) => s.clear);
  const addToCart = useCart((s) => s.add);

  const n = settings.pack_size;
  const looks = n + 1;
  const discount = settings.bundle_discount;
  const fullPrice = settings.jacket_price + settings.pack_price;
  const onArt = step === "art" && !!size;
  const chosen = mounted ? picked : [];
  const categories = useMemo(() => Array.from(new Set(panels.map((p) => p.category))), [panels]);
  const list = category ? panels.filter((p) => p.category === category) : panels;
  const complete = !!size && chosen.length === n;
  const left = n - chosen.length;
  const hasCustom = chosen.some((p) => p.custom);
  const customFee = chosen.filter((p) => p.custom).length * settings.custom_panel_fee;
  const total = fullPrice - discount + customFee;

  // What's on the jacket: the tapped slot, else the latest pick. Step 1 falls back to a sample panel, like a product photo.
  const pick = focus === BLANK ? null : (chosen.find((p) => p.slug === focus) ?? chosen[chosen.length - 1] ?? null);
  const sample = panels.find((p) => p.is_featured) ?? panels[0];
  const shown: PanelRef | null = onArt || pick ? pick : sample ? toPanelRef(sample) : null;
  const caption = !shown
    ? "Blank denim panel · included"
    : !pick
      ? `Sample panel shown · pick any ${n} next`
      : `${onArt ? "Previewing" : "Your pick"}: ${shown.custom ? "your custom panel" : shown.name}`;

  // Back/forward between the two steps.
  useEffect(() => {
    const onPop = () => setStep(new URLSearchParams(window.location.search).get("step") === "art" ? "art" : "jacket");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function writeUrl(next: { size?: string; step?: Step }, mode: "push" | "replace") {
    const q = new URLSearchParams(window.location.search);
    if (next.size) q.set("size", next.size);
    if (next.step === "art") q.set("step", "art");
    if (next.step === "jacket") q.delete("step");
    const url = q.size ? `?${q}` : window.location.pathname;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }

  function chooseSize(s: string) {
    setSize(s);
    setSizeError(false);
    writeUrl({ size: s }, "replace");
  }

  function toArt() {
    if (!size) {
      setSizeError(true);
      scrollToEl(sizeRef.current, "center");
      return;
    }
    setStep("art");
    setAdded(false);
    writeUrl({ size, step: "art" }, "push");
    scrollToEl(stepsRef.current);
  }

  function toJacket() {
    setStep("jacket");
    writeUrl({ step: "jacket" }, "push");
    scrollToEl(stepsRef.current);
  }

  function previewSlot(key: string) {
    setFocus(key);
    // On phones the jacket sits above the picker: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) scrollToEl(galleryRef.current);
  }

  function togglePanel(p: Panel) {
    const result = toggle(toPanelRef(p), n);
    if (result === "added") setFocus(p.slug);
    if (result === "removed" && focus === p.slug) setFocus(null);
  }

  function addSet() {
    if (!complete || !size) return;
    addToCart({ type: "bundle", size, panels: chosen.slice(0, n) });
    clear();
    setFocus(null);
    setAdded(true);
  }

  const steps = (
    <ol className="flex items-center justify-center gap-2 text-[0.88rem] sm:gap-2.5 sm:text-[0.92rem]">
      <li>
        {onArt ? (
          <button type="button" onClick={toJacket} className="-my-2 flex items-center gap-2 py-2 font-semibold hover:underline">
            <span className="grid size-6 place-items-center rounded-full bg-ink text-paper">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            Choose your jacket
          </button>
        ) : (
          <span className="flex items-center gap-2 font-semibold" aria-current="step">
            <span className="grid size-6 place-items-center rounded-full bg-ink text-[0.78rem] font-bold text-paper">1</span>
            Choose your jacket
          </span>
        )}
      </li>
      <li aria-hidden>
        <ArrowRight className="size-4 text-muted" />
      </li>
      <li className={cn("flex items-center gap-2", onArt ? "font-semibold" : "text-muted")} aria-current={onArt ? "step" : undefined}>
        <span className={cn("grid size-6 place-items-center rounded-full text-[0.78rem] font-bold", onArt ? "bg-ink text-paper" : "bg-paper-2 text-muted")}>2</span>
        Choose your art
      </li>
    </ol>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 text-[0.92rem]">
            <li>
              <Link href="/" className="hover:underline">Home</Link>
            </li>
            <li aria-hidden className="text-muted">/</li>
            <li>
              <Link href="/jacket" className="hover:underline">Jacket</Link>
            </li>
            <li aria-hidden className="text-muted">/</li>
            <li aria-current="page">Unisex set</li>
          </ol>
        </nav>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] border border-ink bg-primary px-2.5 py-1 text-[0.9rem] font-bold">
          <Star className="size-4 fill-ink" aria-hidden />
          {looks}-in-1 set
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:mt-4 lg:grid-cols-2 lg:gap-14">
        {/* gallery */}
        <div ref={galleryRef} className="scroll-mt-20">
          <div className="lg:sticky lg:top-24">
            <BuildGallery panel={preview(shown)} caption={caption} wish={shown && !shown.custom ? { slug: shown.slug, name: shown.name } : null} />
          </div>
        </div>

        {/* product info + steps */}
        <div ref={stepsRef} className="mt-5 scroll-mt-20 border-t border-line pt-5 lg:mt-0 lg:border-0 lg:pt-0">
          <h1 className="display text-[2rem] sm:text-[2.4rem]">Build your set</h1>
          <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="tabular-nums text-[1.5rem] font-extrabold leading-none tracking-tight">{taka(fullPrice - discount)}</span>
            {discount > 0 && (
              <>
                <s className="tabular-nums text-muted">{taka(fullPrice)}</s>
                <span className="rounded-full bg-sale px-2 py-0.5 text-xs font-bold text-white">Save {taka(discount)}</span>
              </>
            )}
          </p>

          {!onArt ? (
            <>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/80">
                The washed-black denim trucker with its matching blank panel, plus any {n} zip-in art panels you pick next. {looks} looks, one
                jacket.
              </p>
              <ul className="mt-5 space-y-3">
                {FEATURES.map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-[1.02rem] font-semibold">
                    <Icon className="size-6 shrink-0" strokeWidth={2.2} aria-hidden />
                    {text}
                  </li>
                ))}
              </ul>

              {/* colour + size */}
              <div ref={sizeRef} className="mt-6 scroll-mt-24 rounded-[14px] border border-line bg-card p-4 sm:p-5">
                <p className="text-[0.95rem]">
                  <span className="font-bold">Color:</span> {COLOR}
                </p>
                <span className="mt-2.5 block size-11 rounded-full bg-ink-3 ring-2 ring-ink ring-offset-[3px] ring-offset-card" aria-hidden />
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-[0.95rem]" aria-live="polite">
                    <span className="font-bold">Size:</span> {size}
                    {sizeError && !size && <span className="font-semibold text-signal">Please choose one</span>}
                  </p>
                  <SizeGuideButton plain label="Unisex size guide" />
                </div>
                <div className="mt-2.5">
                  <SizePicker value={size} onChange={chooseSize} variant="circles" />
                </div>
              </div>

              {/* offer */}
              <div className="mt-4 rounded-[14px] border border-primary-border bg-primary-tint p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink">
                      <Tag className="size-5" strokeWidth={2.2} aria-hidden />
                    </span>
                    <div>
                      <p className="text-[1.45rem] font-black uppercase leading-none tracking-tight">{discount > 0 ? `Save ${taka(discount)}` : `${looks} looks`}</p>
                      <p className="mt-1 text-[0.85rem]">{discount > 0 ? "On the full set" : "In one jacket"}</p>
                    </div>
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[0.85rem]">
                    <RefreshCcw className="size-4" aria-hidden />
                    {discount > 0 ? `${looks} looks` : "Swap anytime"}
                  </p>
                </div>
                <p className="mt-3 text-[0.88rem]">{discount > 0 ? "Applied automatically" : `Any ${n} art panels for just ${taka(settings.pack_price)}`}</p>
                <p className="mt-1 text-[0.88rem]">
                  {discount > 0 ? `Any ${n} art panels for ${taka(settings.pack_price)}` : "Or print your own art on any panel"}
                  {discount === 0 && settings.custom_panel_fee > 0 && ` (+${taka(settings.custom_panel_fee)} each)`}
                </p>
              </div>

              <div className="mt-6">{steps}</div>
              <button type="button" onClick={toArt} className={buttonClass(size ? "primary" : "cream", "xl", "mt-4 w-full")}>
                {size ? "Choose your art" : "Choose a size"}
                {size && <ArrowRight className="size-6" strokeWidth={2.6} aria-hidden />}
              </button>
            </>
          ) : (
            <>
              <div className="mt-5">{steps}</div>

              <div className="mt-5 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-card px-4 py-3 sm:px-5">
                <p className="min-w-0 text-[0.95rem]">
                  <span className="font-bold">Jacket:</span> {COLOR} · {size}
                </p>
                <button type="button" onClick={toJacket} className="-my-2 shrink-0 py-2 text-[0.92rem] underline underline-offset-4 hover:text-muted">
                  Change
                </button>
              </div>

              {/* picked slots */}
              <div className="mt-4 rounded-[14px] border border-line bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="display-narrow text-[1.35rem] sm:text-[1.5rem]">Pick any {n} art panels</h2>
                  <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 tabular-nums text-[0.8rem] font-bold text-paper">
                    {chosen.length}/{n}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => previewSlot(BLANK)}
                    aria-pressed={!pick}
                    aria-label="Preview the blank denim panel"
                    className={cn("relative aspect-[4/7] w-16 overflow-hidden rounded-[8px] border-2 sm:w-[76px]", !pick ? "border-ink" : "border-transparent")}
                  >
                    <span className="absolute" style={BLANK_PANEL_CROP}>
                      <Image src={asset(ASSETS.jacketBack)} alt="" fill sizes={GALLERY_SIZES} />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-white/75 py-[3px] text-center text-[0.65rem] font-semibold leading-none">Included</span>
                  </button>
                  {Array.from({ length: n }).map((_, i) => {
                    const p = chosen[i];
                    return p ? (
                      <div key={p.slug} className="relative">
                        <button
                          type="button"
                          onClick={() => previewSlot(p.slug)}
                          aria-pressed={pick?.slug === p.slug}
                          aria-label={`Preview ${p.name}`}
                          className={cn(
                            "relative block aspect-[4/7] w-16 overflow-hidden rounded-[8px] border-2 sm:w-[76px]",
                            pick?.slug === p.slug ? "border-ink" : "border-transparent",
                          )}
                        >
                          <Image src={p.custom?.url ?? p.image} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(p.slug)}
                          aria-label={`Remove ${p.name}`}
                          className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-paper"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        key={`slot-${i}`}
                        type="button"
                        onClick={() => scrollToEl(gridRef.current)}
                        aria-label="Pick a panel"
                        className="grid aspect-[4/7] w-16 place-items-center rounded-[8px] border-2 border-dashed border-line text-muted hover:border-ink/40 sm:w-[76px]"
                      >
                        <Plus className="size-4" />
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-center text-[0.8rem] text-muted">Tap a panel to preview it on the jacket</p>
              </div>

              {/* art grid */}
              <div ref={gridRef} className="scroll-mt-20">
                <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  {[null, ...categories].map((c) => (
                    <button
                      key={c ?? "all"}
                      type="button"
                      onClick={() => setCategory(c)}
                      aria-pressed={category === c}
                      className={cn(
                        "h-10 shrink-0 rounded-full border px-4 text-[0.78rem] font-bold uppercase tracking-wider transition",
                        category === c ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink",
                      )}
                    >
                      {c ?? "All"}
                    </button>
                  ))}
                </div>
                <div className="mt-3.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {list.map((p) => {
                    const isPicked = chosen.some((x) => x.slug === p.slug);
                    const soldOut = p.stock !== null && p.stock <= 0;
                    const disabled = soldOut || (!isPicked && chosen.length >= n);
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        disabled={disabled}
                        onClick={() => togglePanel(p)}
                        aria-pressed={isPicked}
                        className={cn(
                          "relative flex flex-col rounded-[10px] border bg-card p-1.5 text-left transition disabled:cursor-not-allowed",
                          isPicked ? "border-ink shadow-press" : disabled ? "border-line opacity-45" : "border-line hover:border-ink/50",
                        )}
                      >
                        <span className="relative block aspect-[4/7] overflow-hidden rounded-[6px] bg-ink-2">
                          <Image src={p.image_url} alt="" fill sizes="(min-width: 1024px) 130px, (min-width: 640px) 22vw, 30vw" className="object-cover" />
                          {soldOut && (
                            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-ink/85 py-1 text-center text-[0.7rem] font-bold uppercase text-paper">
                              Sold out
                            </span>
                          )}
                        </span>
                        <span className="block truncate px-0.5 pb-0.5 pt-1.5 text-[0.78rem] font-bold leading-tight sm:text-[0.85rem]">{p.name}</span>
                        <span
                          className={cn(
                            "absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full border-2 border-ink",
                            isPicked ? "bg-primary" : "bg-card",
                          )}
                          aria-hidden
                        >
                          {isPicked ? <Check className="size-3.5" strokeWidth={3} /> : <Plus className="size-3.5" strokeWidth={3} />}
                        </span>
                      </button>
                    );
                  })}
                  <Link
                    href="/custom"
                    className="grid min-h-40 place-items-center rounded-[10px] border-2 border-dashed border-ink/30 bg-card p-3 text-center transition hover:border-ink"
                  >
                    <span>
                      <Upload className="mx-auto size-5" />
                      <span className="mt-2 block text-[0.72rem] font-bold uppercase leading-tight">Use your own art</span>
                    </span>
                  </Link>
                </div>
              </div>

              {/* summary */}
              <div className="mt-6 rounded-[14px] border border-primary-border bg-primary-tint p-4 sm:p-5">
                <dl className="space-y-2 tabular-nums text-[0.92rem]">
                  <div className="flex justify-between gap-4">
                    <dt>Jacket · {size} + blank panel</dt>
                    <dd>{taka(settings.jacket_price)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt>
                      {n} art panels ({chosen.length}/{n} picked)
                    </dt>
                    <dd>{taka(settings.pack_price)}</dd>
                  </div>
                  {customFee > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt>Custom print</dt>
                      <dd>{taka(customFee)}</dd>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between gap-4 font-semibold text-sale-deep">
                      <dt>Set saving</dt>
                      <dd>−{taka(discount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-primary-border pt-2.5 text-[1.1rem] font-extrabold">
                    <dt>Total</dt>
                    <dd>{taka(total)}</dd>
                  </div>
                </dl>
                <p className="mt-1.5 text-[0.8rem] text-ink/70">Plus delivery. Pay cash when it arrives.</p>
              </div>

              {added ? (
                <div className="mt-4 rounded-[14px] border-2 border-ink bg-card p-4" role="status">
                  <p className="flex items-center gap-2 font-bold">
                    <Check className="size-5" strokeWidth={3} aria-hidden /> Set added to your bag
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href="/checkout" className={buttonClass("primary", "md", "w-full")}>
                      Checkout
                    </Link>
                    <button type="button" onClick={() => setAdded(false)} className={buttonClass("outline", "md", "w-full")}>
                      Build another
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={complete ? addSet : () => scrollToEl(gridRef.current)}
                  className={buttonClass(complete ? "primary" : "cream", "xl", "mt-4 w-full")}
                >
                  {complete ? "Add set to bag" : `Pick ${left} more panel${left === 1 ? "" : "s"}`}
                </button>
              )}
              <div className="mt-2 flex flex-wrap justify-center gap-x-5 text-[0.85rem] text-muted">
                <Link href="/jacket" className="py-2 underline-offset-4 hover:text-ink hover:underline">
                  Just the jacket
                </Link>
                <Link href="/panels" className="py-2 underline-offset-4 hover:text-ink hover:underline">
                  Just panels (already have a jacket)
                </Link>
              </div>
            </>
          )}

          {/* delivery & trust */}
          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5">
            <Perk Icon={Timer} title={today === null ? "Delivery in 1–5 days" : `Est. delivery ${dayLabel(today + 1 + (hasCustom ? 3 : 0))} – ${dayLabel(today + 5 + (hasCustom ? 3 : 0))}`} />
            <Perk
              Icon={Truck}
              title={
                settings.free_delivery_min
                  ? `Free delivery over ${taka(settings.free_delivery_min)}`
                  : `Delivery from ${taka(Math.min(settings.delivery_inside_dhaka, settings.delivery_outside_dhaka))}`
              }
            />
            <Perk Icon={Shirt} title="7-day size exchange" body="Unworn, with tags on." />
            <Perk Icon={Banknote} title="Cash on delivery" />
          </ul>
        </div>
      </div>
    </div>
  );
}

function Perk({ Icon, title, body }: { Icon: Icon; title: string; body?: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Icon className="size-6 shrink-0" strokeWidth={2} aria-hidden />
      <span className="text-[0.9rem] font-semibold leading-snug">
        {title}
        {body && <span className="mt-0.5 block font-normal">{body}</span>}
      </span>
    </li>
  );
}
