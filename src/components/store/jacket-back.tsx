"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ASSETS, ASSET_SIZES, BACK_PANEL_RECT, asset } from "@/config/assets";
import { cn } from "@/lib/format";

export type PreviewPanel = {
  image: string;
  name?: string;
  custom?: { zoom: number; x: number; y: number };
};

const NOISE = "url(/brand/noise.png)";

/** CSS aspect-ratio of the back photo, for wrappers that size JacketBack by height. */
export const JACKET_ASPECT = `${ASSET_SIZES.jacketBack.width} / ${ASSET_SIZES.jacketBack.height}`;

/**
 * The jacket back flat-lay with an art panel "zipped" into the centre frame.
 * Pass `panel={null}` to show the matching blank denim panel.
 */
export function JacketBack({
  panel,
  className,
  sizes = "(min-width: 1024px) 45vw, 92vw",
  eager = false,
  showLabel = false,
  rounded = true,
}: {
  panel: PreviewPanel | null;
  className?: string;
  sizes?: string;
  eager?: boolean;
  showLabel?: boolean;
  rounded?: boolean;
}) {
  const r = BACK_PANEL_RECT;
  const key = panel ? `${panel.image}-${panel.custom?.zoom ?? 1}` : "blank";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-studio",
        rounded && "rounded-3xl",
        className,
      )}
      style={{ aspectRatio: JACKET_ASPECT }}
    >
      <Image
        src={asset(ASSETS.jacketBack)}
        alt="Back of the Wronge washed-black denim jacket"
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="object-cover"
      />

      <div
        className="absolute"
        style={{ left: `${r.left}%`, top: `${r.top}%`, width: `${r.width}%`, height: `${r.height}%` }}
      >
        <AnimatePresence initial={false}>
          {panel && (
            <motion.div
              key={key}
              className="absolute inset-0 overflow-hidden bg-ink"
              initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0, transition: { duration: 0.25, delay: 0.45 } }}
              transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
            >
              <div className="absolute inset-[3.5%] overflow-hidden">
                <Image
                  src={panel.image}
                  alt={panel.name ? `${panel.name} art panel` : "Art panel"}
                  fill
                  sizes="(min-width: 1024px) 18vw, 40vw"
                  unoptimized={panel.image.startsWith("blob:")}
                  className="object-cover"
                  style={
                    panel.custom
                      ? {
                          transform: `translate(${panel.custom.x}%, ${panel.custom.y}%) scale(${panel.custom.zoom})`,
                        }
                      : undefined
                  }
                />
              </div>
              {/* fabric feel: grain + soft inner shading + shadow under the yoke flap */}
              <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-multiply" style={{ backgroundImage: NOISE }} />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_14px_rgba(0,0,0,0.65)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[9%] bg-gradient-to-b from-black/70 to-transparent" />
              {/* zipper pull travelling down while it "zips" in */}
              <motion.span
                aria-hidden
                className="absolute left-1/2 h-[3%] w-[9%] -translate-x-1/2 rounded-sm bg-zinc-300 shadow"
                initial={{ top: "0%", opacity: 1 }}
                animate={{ top: "97%", opacity: 0 }}
                transition={{ duration: 0.65, ease: [0.65, 0, 0.35, 1] }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <div className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-3 py-1.5 tabular-nums text-[0.7rem] uppercase text-paper backdrop-blur">
          {panel?.name ? `Panel: ${panel.name}` : "Blank denim panel"}
        </div>
      )}
    </div>
  );
}
