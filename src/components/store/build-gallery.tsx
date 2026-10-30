"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { ASSETS, asset } from "@/config/assets";
import { cn } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";
import { useWishlist } from "@/store/wishlist";
import { JACKET_ASPECT, JacketBack, type PreviewPanel } from "./jacket-back";

/** `sizes` of the main photo; reuse it for crops of the same photo so the browser shares the download. */
export const GALLERY_SIZES = "(min-width: 1024px) 560px, 92vw";
const THUMB_SIZES = "120px";

type Slide = {
  id: string;
  label: string;
  caption?: string;
  render: (thumb: boolean) => React.ReactNode;
};

/** Jacket-back photo centred in the frame: fills the width on the 4:5 phone frame, the height on the square desktop frame. */
function Back({ panel, thumb }: { panel: PreviewPanel | null; thumb: boolean }) {
  return (
    <div
      className={cn("absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2", !thumb && "lg:h-full lg:w-auto")}
      style={{ aspectRatio: JACKET_ASPECT }}
    >
      <JacketBack panel={panel} rounded={false} sizes={thumb ? THUMB_SIZES : GALLERY_SIZES} eager={!thumb} />
    </div>
  );
}

/**
 * Product gallery for the set builder: a swipeable main image (live jacket preview first),
 * a thumbnail rail and a floating star that saves the previewed art panel to the wishlist.
 * Whenever `panel` changes the gallery jumps back to the live preview.
 */
export function BuildGallery({
  panel,
  caption,
  wish,
}: {
  panel: PreviewPanel | null;
  caption: string;
  /** The catalogue panel the star saves; hidden when null (blank or custom panel). */
  wish: { slug: string; name: string } | null;
}) {
  const mounted = useMounted();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const wished = useWishlist((s) => (wish ? s.slugs.includes(wish.slug) : false));
  const toggleWish = useWishlist((s) => s.toggle);

  const slides: Slide[] = [
    { id: "preview", label: "Live preview of your set", caption, render: (thumb) => <Back panel={panel} thumb={thumb} /> },
    {
      id: "front",
      label: "Front of the jacket",
      render: (thumb) => (
        <Image
          src={asset(ASSETS.jacketFront)}
          alt={thumb ? "" : "Front of the Wronge washed-black denim jacket"}
          fill
          sizes={thumb ? THUMB_SIZES : GALLERY_SIZES}
          className="object-contain"
        />
      ),
    },
    { id: "blank", label: "Back with the blank denim panel", caption: "Matching blank panel · included", render: (thumb) => <Back panel={null} thumb={thumb} /> },
    {
      id: "look",
      label: "Wronge jackets styled on two people",
      render: (thumb) => (
        <Image
          src={asset(ASSETS.hero)}
          alt={thumb ? "" : "Wronge jackets styled on two people"}
          fill
          sizes={thumb ? THUMB_SIZES : GALLERY_SIZES}
          className="object-cover object-[62%_center]"
        />
      ),
    },
  ];

  function show(i: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    setActive(i);
  }

  // A new panel on the jacket: bring the live preview back into view.
  const previewKey = panel ? `${panel.image}-${panel.custom?.zoom ?? 1}` : "blank";
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [previewKey]);

  return (
    <div aria-roledescription="carousel" aria-label="Jacket photos">
      <div
        ref={trackRef}
        onScroll={(e) => {
          const t = e.currentTarget;
          const i = Math.round(t.scrollLeft / t.clientWidth);
          if (i !== active) setActive(i);
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[16px] bg-studio"
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}: ${s.label}`}
            className="relative aspect-[4/5] w-full shrink-0 snap-center overflow-hidden lg:aspect-square"
          >
            {s.render(false)}
            {s.caption && <p className="absolute bottom-3 right-3.5 text-right text-[0.8rem] leading-tight text-ink/85 sm:text-[0.85rem]">{s.caption}</p>}
          </div>
        ))}
      </div>

      <div className="relative mt-3">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => show(i)}
              aria-label={s.label}
              aria-current={active === i}
              className={cn(
                "relative aspect-[6/5] shrink-0 basis-[calc((100%-1.5rem)/4)] overflow-hidden rounded-[10px] border bg-studio transition",
                active === i ? "border-ink/60" : "border-transparent opacity-55 hover:opacity-90",
              )}
            >
              {s.render(true)}
            </button>
          ))}
          {/* lets the last thumb scroll out from under the star */}
          <span className="w-12 shrink-0" aria-hidden />
        </div>
        {wish && (
          <button
            type="button"
            onClick={() => toggleWish(wish.slug)}
            aria-label={mounted && wished ? `Remove ${wish.name} from wishlist` : `Save ${wish.name} to wishlist`}
            aria-pressed={mounted && wished}
            className="absolute right-0 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full border border-primary-border bg-cream shadow-[0_2px_10px_rgb(0_0_0/0.08)] transition hover:scale-105"
          >
            <Star className={cn("size-6", mounted && wished && "fill-ink")} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

