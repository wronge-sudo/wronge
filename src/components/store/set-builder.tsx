"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type SVGProps } from "react";
import { ArrowRight, Check, RectangleVertical, RefreshCcw, Shirt, Star, Tag, Timer, Truck, Wallet, Zap } from "lucide-react";
import type { Panel } from "@/lib/types";
import { ASSETS, asset } from "@/config/assets";
import { DELIVERY_CITY } from "@/config/delivery";
import { PACKAGE_LOOKS, PACKAGE_NAME, PACKAGE_PIECES } from "@/config/package";
import { cn, taka } from "@/lib/format";
import { useCart } from "@/store/cart";
import { buttonClass } from "@/components/ui/button";
import { BuildGallery, GALLERY_SIZES } from "./build-gallery";
import { BLANK_PANEL_CROP } from "./jacket-back";
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
  { Icon: RectangleVertical, text: "Blank denim panel included" },
  { Icon: Zap, text: "Swap in seconds. No tools." },
];

// Today's date in Bangladesh as a day number, read on the client only so the prerendered shell never touches the clock.
const DAY = 86_400_000;
const BANGLADESH_OFFSET = 6 * 3_600_000; // Bangladesh has no daylight saving
const noSubscribe = () => () => {};
function useBangladeshDay() {
  return useSyncExternalStore(
    noSubscribe,
    () => Math.floor((Date.now() + BANGLADESH_OFFSET) / DAY),
    () => null,
  );
}
const dayLabel = (day: number) =>
  new Date(day * DAY).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).replace(" ", " ");

export function SetBuilderFromParams({ panels }: { panels: Panel[] }) {
  const params = useSearchParams();
  return <SetBuilder panels={panels} initialSize={params.get("size")} initialStep={params.get("step") === "art" ? "art" : "jacket"} />;
}

function scrollToEl(el: HTMLElement | null, block: ScrollLogicalPosition = "start") {
  el?.scrollIntoView({ behavior: "smooth", block });
}

/**
 * The "Build your set" product page for the 4-in-1 package, in two steps:
 * 1. the jacket (colour + size), 2. the art that comes with it (`panels`, from config/package.ts), previewed live on the jacket.
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
  const today = useBangladeshDay();
  const { settings, sizes } = useStoreData();
  const validInitial = sizes.find((s) => s.size === initialSize && s.is_active && s.stock > 0)?.size ?? null;
  const [size, setSize] = useState<string | null>(validInitial);
  const [sizeError, setSizeError] = useState(false);
  const [step, setStep] = useState<Step>(initialStep);
  const [focus, setFocus] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const addToCart = useCart((s) => s.add);

  const price = settings.jacket_price;
  const compareAt = settings.jacket_compare_at && settings.jacket_compare_at > price ? settings.jacket_compare_at : null;
  const onArt = step === "art" && !!size;
  const panelNames = panels.map((p) => p.name);

  // What's on the jacket: the tapped slot, else the package's first art panel.
  const shown = focus === BLANK ? null : (panels.find((p) => p.slug === focus) ?? panels[0] ?? null);
  const caption = shown ? `${onArt ? "Previewing" : "Included"}: ${shown.name}` : "Blank denim panel · included";

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
    // On phones the jacket sits above the slots: bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) scrollToEl(galleryRef.current);
  }

  function addSet() {
    if (!size) return;
    addToCart({ size });
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
        Your art
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
          {PACKAGE_PIECES}-in-1 set
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:mt-4 lg:grid-cols-2 lg:gap-14">
        {/* gallery */}
        <div ref={galleryRef} className="scroll-mt-20">
          <div className="lg:sticky lg:top-24">
            <BuildGallery
              panel={shown ? { image: shown.image_url, name: shown.name } : null}
              caption={caption}
              wish={shown ? { slug: shown.slug, name: shown.name } : null}
            />
          </div>
        </div>

        {/* product info + steps */}
        <div ref={stepsRef} className="mt-5 scroll-mt-20 border-t border-line pt-5 lg:mt-0 lg:border-0 lg:pt-0">
          <h1 className="display text-[2rem] sm:text-[2.4rem]">Build your set</h1>
          <p className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="tabular-nums text-[1.5rem] font-extrabold leading-none tracking-tight">{taka(price)}</span>
            {compareAt && <s className="tabular-nums text-muted">{taka(compareAt)}</s>}
          </p>

          {!onArt ? (
            <>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/80">
                The washed-black denim trucker with its blank denim panel, plus {panelNames.join(" and ")}. {PACKAGE_LOOKS} looks, one jacket.
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
                      <p className="text-[1.45rem] font-black uppercase leading-none tracking-tight">{PACKAGE_LOOKS} looks</p>
                      <p className="mt-1 text-[0.85rem]">In one jacket</p>
                    </div>
                  </div>
                  <p className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[0.85rem]">
                    <RefreshCcw className="size-4" aria-hidden />
                    Swap anytime
                  </p>
                </div>
                <p className="mt-3 text-[0.88rem]">
                  {PACKAGE_PIECES} pieces for {taka(price)}: the jacket, a blank denim panel and {panels.length} art panels
                </p>
                <p className="mt-1 text-[0.88rem]">More designs are coming soon</p>
              </div>

              <div className="mt-6">{steps}</div>
              <button type="button" onClick={toArt} className={buttonClass(size ? "primary" : "cream", "xl", "mt-4 w-full")}>
                {size ? "See your art" : "Choose a size"}
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

              {/* what's in the box */}
              <div className="mt-4 rounded-[14px] border border-line bg-card p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="display-narrow text-[1.35rem] sm:text-[1.5rem]">Your art panels</h2>
                  <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 tabular-nums text-[0.8rem] font-bold text-paper">{PACKAGE_PIECES} pieces</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => previewSlot(BLANK)}
                    aria-pressed={!shown}
                    aria-label="Preview the blank denim panel"
                    className={cn("relative aspect-[4/7] w-20 overflow-hidden rounded-[8px] border-2 sm:w-24", !shown ? "border-ink" : "border-transparent")}
                  >
                    <span className="absolute" style={BLANK_PANEL_CROP}>
                      <Image src={asset(ASSETS.jacketBack)} alt="" fill sizes={GALLERY_SIZES} />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-white/75 py-[3px] text-center text-[0.65rem] font-semibold leading-none">Blank</span>
                  </button>
                  {panels.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => previewSlot(p.slug)}
                      aria-pressed={shown?.slug === p.slug}
                      aria-label={`Preview ${p.name}`}
                      className={cn(
                        "relative block aspect-[4/7] w-20 overflow-hidden rounded-[8px] border-2 sm:w-24",
                        shown?.slug === p.slug ? "border-ink" : "border-transparent",
                      )}
                    >
                      <Image src={p.image_url} alt="" fill sizes="96px" className="object-cover" />
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-center text-[0.8rem] text-muted">Tap a panel to preview it on the jacket. All of them come in the box.</p>
              </div>

              {/* summary */}
              <div className="mt-6 rounded-[14px] border border-primary-border bg-primary-tint p-4 sm:p-5">
                <dl className="space-y-2 tabular-nums text-[0.92rem]">
                  <div className="flex justify-between gap-4">
                    <dt>
                      {PACKAGE_NAME} · {size}
                    </dt>
                    <dd>{taka(price)}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Includes</dt>
                    <dd className="text-ink/70">Jacket + blank denim panel + {panelNames.join(" + ")}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-primary-border pt-2.5 text-[1.1rem] font-extrabold">
                    <dt>Total</dt>
                    <dd>{taka(price)}</dd>
                  </div>
                </dl>
                <p className="mt-1.5 text-[0.8rem] text-ink/70">Plus delivery. Choose your courier at checkout.</p>
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
                      Add another
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={addSet} className={buttonClass("primary", "xl", "mt-4 w-full")}>
                  Add set to bag
                </button>
              )}
            </>
          )}

          {/* delivery & trust */}
          <ul className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5">
            <Perk Icon={Timer} title={today === null ? "Delivery in 1–5 days" : `Est. delivery ${dayLabel(today + 1)} – ${dayLabel(today + 5)}`} />
            <Perk Icon={Truck} title={`Delivery ${taka(settings.delivery_inside_dhaka)} inside ${DELIVERY_CITY}`} body={`${taka(settings.delivery_outside_dhaka)} outside.`} />
            <Perk Icon={Shirt} title="7-day size exchange" body="Unworn, with tags on." />
            <Perk Icon={Wallet} title="Advance payment" body="Terms depend on your courier." />
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
