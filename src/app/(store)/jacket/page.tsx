import type { Metadata } from "next";
import { getPanels, getSettings } from "@/lib/data";
import { ASSETS, ASSET_SIZES, asset } from "@/config/assets";
import { taka } from "@/lib/format";
import { Container, SectionHeading } from "@/components/ui/section";
import { Arrow, LinkButton } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { getFaqs } from "@/config/faq";
import { JacketGallery } from "@/components/store/jacket-gallery";
import { JacketBuy } from "@/components/store/jacket-buy";
import { Hotspots } from "@/components/store/hotspots";
import { SizeGuideTable } from "@/components/store/size-guide";

export const metadata: Metadata = {
  title: "The Jacket",
  description:
    "The Wronge washed-black denim trucker jacket with a zip-out back panel. Unisex, boxy fit. Comes with a matching blank denim panel. Cash on delivery in Bangladesh.",
};

const DETAILS = [
  { k: "Fabric", v: "Heavyweight matte washed-black denim with tonal black stitching on every seam." },
  { k: "Front", v: "Full-length placket with five polished silver-tone snap buttons. A pointed turn-down collar and no chest flap pockets keep the front clean." },
  { k: "Pockets", v: "Two angled welt hand pockets at the lower front." },
  { k: "Sleeves", v: "Loose, slightly dropped-shoulder sleeves with structured button cuffs and silver-tone snaps." },
  { k: "Hem", v: "Structured waistband with adjustable cinch tabs and rectangular silver slide buckles on both back hips." },
  { k: "Back", v: "A full centre-back window with a hidden 3-sided zip frame (left, right and bottom). The top edge tucks under the yoke flap." },
  { k: "Fit", v: "Unisex, boxy and relaxed, with dropped shoulders and wide sleeves for easy layering. Standard trucker length, at or just below the belt." },
  { k: "In the box", v: "The jacket, with its matching washed-black denim panel zipped in." },
];

const BACK_SPOTS = [
  { x: 50, y: 31.5, title: "Yoke flap", body: "The top edge of the panel tucks under this overhanging flap, so you never see an edge." },
  { x: 34.7, y: 55, title: "Left zip", body: "Runs the full height of the left back seam, hidden under the seam allowance." },
  { x: 64.4, y: 55, title: "Right zip", body: "The matching zip on the right seam. Both sides lock the panel flat and taut." },
  { x: 50, y: 78.5, title: "Bottom zip", body: "Runs along the top of the waistband to close the frame." },
  { x: 27.6, y: 82.6, title: "Cinch buckles", body: "Adjustable side tabs with silver slide buckles. Pull them in for a cropped, boxy shape." },
];

const FRONT_SPOTS = [
  { x: 40, y: 22, title: "Pointed collar", body: "A classic turn-down trucker collar." },
  { x: 50, y: 47, title: "Silver snaps", body: "Five polished silver-tone metal snaps down a full-length placket." },
  { x: 29.5, y: 64, title: "Welt pockets", body: "Angled side-entry hand pockets at the waist. No bulky chest flaps." },
  { x: 91.5, y: 87, title: "Button cuffs", body: "Structured cuffs with silver-tone snap hardware." },
];

export default async function JacketPage() {
  const [settings, panels] = await Promise.all([getSettings(), getPanels()]);
  const art = panels.find((p) => p.is_featured) ?? panels[0];

  return (
    <>
      <Container className="grid gap-10 py-8 sm:py-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <JacketGallery artPanel={art ? { image: art.image_url, name: art.name } : null} />
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow text-muted">Washed black · Unisex</p>
            <h1 className="display mt-3 text-5xl sm:text-6xl">The Wronge denim jacket</h1>
            <p className="mt-4 text-muted">
              A heavyweight trucker with a hole in its back, on purpose. Zip in the matching denim panel for an everyday classic, or any
              art panel for a statement. Same jacket, a different jacket.
            </p>
            <div className="mt-8">
              <JacketBuy />
            </div>
          </div>
        </div>
      </Container>

      {/* Anatomy — back */}
      <section className="border-t border-line py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Anatomy" title="The swap system">
            Tap the numbers. Everything that makes the back swappable is hidden in the seams.
          </SectionHeading>
          <div className="mt-10">
            <Hotspots src={asset(ASSETS.jacketBack)} alt="Back of the jacket with the blank panel" ratio={`${ASSET_SIZES.jacketBack.width}/${ASSET_SIZES.jacketBack.height}`} spots={BACK_SPOTS} />
          </div>
        </Container>
      </section>

      {/* Anatomy — front */}
      <section className="bg-paper-2 py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Up front" title="Clean on the front" />
          <div className="mt-10">
            <Hotspots src={asset(ASSETS.jacketFront)} alt="Front of the jacket" ratio={`${ASSET_SIZES.jacketFront.width}/${ASSET_SIZES.jacketFront.height}`} spots={FRONT_SPOTS} />
          </div>
        </Container>
      </section>

      {/* Details + size */}
      <section className="py-20 sm:py-24">
        <Container className="grid gap-14 lg:grid-cols-2">
          <div>
            <h2 className="display text-4xl sm:text-5xl">Details</h2>
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {DETAILS.map((d) => (
                <div key={d.k} className="grid grid-cols-3 gap-4 py-4">
                  <dt className="font-mono text-xs font-bold uppercase tracking-wider">{d.k}</dt>
                  <dd className="col-span-2 text-sm text-muted">{d.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div id="size-guide">
            <h2 className="display text-4xl sm:text-5xl">Size guide</h2>
            <div className="mt-8">
              <SizeGuideTable />
            </div>
          </div>
        </Container>
      </section>

      {/* Compare */}
      <section className="halftone-dark py-20 text-paper sm:py-24">
        <Container>
          <SectionHeading eyebrow="Do the maths" title={<>One jacket vs.<br />four jackets</>} light />
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-paper/20 font-mono text-xs uppercase tracking-wider text-paper/60">
                  <th className="py-4 pr-4" />
                  <th className="py-4 pr-4 text-primary-light">Wronge set</th>
                  <th className="py-4">Four regular jackets</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Looks", `${settings.pack_size + 1} (and counting)`, "4"],
                  ["Cost", taka(settings.jacket_price + settings.pack_price - settings.bundle_discount), "4 × a jacket"],
                  ["Wardrobe space", "1 hanger + a few flat panels", "4 hangers"],
                  ["New look", `Any ${settings.pack_size} panels for ${taka(settings.pack_price)}`, "Buy another jacket"],
                  ["Your own art", "Yes, upload it", "No"],
                ].map(([k, a, b]) => (
                  <tr key={k} className="border-b border-paper/10">
                    <td className="py-4 pr-4 font-mono text-xs uppercase tracking-wider text-paper/60">{k}</td>
                    <td className="py-4 pr-4 font-bold">{a}</td>
                    <td className="py-4 text-paper/60">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <LinkButton href="/build" size="lg" className="mt-10">
            Build your set <Arrow />
          </LinkButton>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container className="max-w-4xl">
          <h2 className="display text-4xl sm:text-5xl">Questions</h2>
          <div className="mt-8">
            <FaqList faqs={getFaqs(settings).filter((f) => f.group === "Product" || f.group === "Swapping")} />
          </div>
        </Container>
      </section>
    </>
  );
}
