"use client";
import Image from "next/image";
import { useState } from "react";
import { PHOTOS, type Photo } from "@/config/assets";
import { cn } from "@/lib/format";
import { JACKET_ASPECT, JacketBack } from "./jacket-back";

type Slide =
  | { kind: "photo"; photo: Photo; position?: string }
  | { kind: "flat"; label: string };

/** Studio cutouts stand on the bottom edge of the frame; location shots fill it. */
function fit(photo: Photo, position = "") {
  return photo.cutout ? "object-contain object-bottom" : cn("object-cover", position);
}

const SLIDES: Slide[] = [
  { kind: "photo", photo: PHOTOS.frontModel },
  { kind: "photo", photo: PHOTOS.backModel },
  { kind: "photo", photo: PHOTOS.classicBack },
  { kind: "photo", photo: PHOTOS.campfireDuo, position: "object-[80%_center]" },
  { kind: "photo", photo: PHOTOS.stoolModel },
  { kind: "flat", label: "Back of the jacket laid flat, showing the zip frame around the blank denim panel" },
];

/** Product photos for /jacket: one 4:5 frame (no layout jump between slides) and a thumbnail rail. */
export function JacketGallery() {
  const [i, setI] = useState(0);
  const s = SLIDES[i];

  return (
    <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
      <div className="no-scrollbar order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">
        {SLIDES.map((sl, n) => (
          <button
            key={n}
            type="button"
            onClick={() => setI(n)}
            aria-label={sl.kind === "photo" ? sl.photo.alt : sl.label}
            aria-current={i === n}
            className={cn(
              "relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl bg-studio transition sm:w-full",
              i === n ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-70 hover:opacity-100",
            )}
          >
            {sl.kind === "photo" ? (
              <Image src={sl.photo.src} alt="" fill sizes="88px" className={sl.photo.cutout ? "object-cover object-top" : cn("object-cover", sl.position)} />
            ) : (
              <JacketBack panel={null} sizes="88px" rounded={false} className="h-full" />
            )}
          </button>
        ))}
      </div>
      <div className="order-1 sm:order-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-studio">
          {s.kind === "photo" ? (
            <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(min-width: 1024px) 560px, (min-width: 640px) 80vw, 100vw" loading="eager" className={fit(s.photo, s.position)} />
          ) : (
            <div className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2" style={{ aspectRatio: JACKET_ASPECT }}>
              <JacketBack panel={null} rounded={false} sizes="(min-width: 1024px) 560px, 100vw" />
              <span className="sr-only">{s.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
