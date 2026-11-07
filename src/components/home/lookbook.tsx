import Image from "next/image";
import { PHOTOS, type Photo } from "@/config/assets";
import { cn } from "@/lib/format";
import { Arrow, LinkButton } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

/** Shots from the client's photoshoot: a location shot, the studio cutout on a yellow tile, then another location shot. */
const SHOTS: { photo: Photo; fit: string; tile: string }[] = [
  { photo: PHOTOS.streetFront, fit: "object-cover object-[center_30%]", tile: "bg-studio" },
  { photo: PHOTOS.stoolModel, fit: "object-contain object-bottom", tile: "bg-primary" },
  { photo: PHOTOS.skyDuo, fit: "object-cover object-[center_30%]", tile: "bg-studio" },
];

/** Home-page lookbook: swipeable on phones, three across from `sm`. */
export function Lookbook() {
  return (
    <section className="bg-sand py-12 sm:py-14" aria-labelledby="lookbook-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <p className="eyebrow">Lookbook</p>
            <h2 id="lookbook-title" className="display mt-3 text-[2rem] sm:text-[2.4rem]">
              Washed black.
              <br />
              Worn every day.
            </h2>
          </div>
          <LinkButton href="/jacket" variant="outline" size="md">
            See the jacket <Arrow />
          </LinkButton>
        </div>
        <ul className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-[17px] sm:overflow-visible sm:px-0">
          {SHOTS.map(({ photo, fit, tile }) => (
            <li key={photo.src} className={cn("relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-[16px] sm:w-auto", tile)}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1185px) 380px, (min-width: 640px) 32vw, 78vw" className={fit} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
