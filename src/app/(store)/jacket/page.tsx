import type { Metadata } from "next";
import { getPanels, getSettings } from "@/lib/data";
import { PACKAGE_LOOKS, packagePanels } from "@/config/package";
import { taka } from "@/lib/format";
import { Container, SectionHeading } from "@/components/ui/section";
import { Arrow, LinkButton } from "@/components/ui/button";
import { FaqList } from "@/components/ui/faq-list";
import { getFaqs } from "@/config/faq";
import { JacketGallery } from "@/components/store/jacket-gallery";
import { JacketBuy } from "@/components/store/jacket-buy";
import { SizeGuideTable } from "@/components/store/size-guide";

export const metadata: Metadata = {
  title: "The Jacket",
  description:
    "The Wronge washed-black denim trucker jacket with a zip-out back panel. The 4-in-1 package: the jacket, a blank denim panel and 2 screen-printed art panels.",
};

// Client product copy (Nov 2026).
const DETAILS = [
  { k: "Fabric", v: "11.5 oz 100% cotton denim." },
  { k: "Pockets", v: "Two front side pockets." },
  { k: "Front", v: "Snap buttons." },
  { k: "Swap panel", v: "One blank denim swap included." },
  { k: "Closure", v: "YKK zipper + Velcro." },
  { k: "Art panels", v: "Screen-printed artwork. Fits every denim base." },
  { k: "Care", v: "Reattach the original blank panel before washing your base. Spot-clean art panels as needed." },
];

export default async function JacketPage() {
  const [settings, panels] = await Promise.all([getSettings(), getPanels()]);
  const included = packagePanels(panels);
  const art = included[0] ?? panels[0];

  return (
    <>
      <Container className="grid grid-cols-1 gap-10 py-8 sm:py-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start">
          <JacketGallery artPanel={art ? { image: art.image_url, name: art.name } : null} />
        </div>
        <div className="lg:col-span-5">
          <p className="eyebrow text-muted">Washed black · Unisex</p>
          <h1 className="display mt-3 text-[2.25rem] sm:text-[2.75rem]">The Wronge denim jacket</h1>
          <p className="mt-4 text-muted">
            A washed-black trucker with a hole in its back, on purpose. Zip in the blank denim panel for an everyday classic, or an art
            panel for a statement. Same jacket, a different jacket.
          </p>
          <div className="mt-8">
            <JacketBuy />
          </div>

          <div className="mt-10">
            <h2 className="display text-[1.6rem] sm:text-[1.9rem]">Details</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {DETAILS.map((d) => (
                <div key={d.k} className="grid grid-cols-3 gap-4 py-4">
                  <dt className="tabular-nums text-xs font-bold uppercase">{d.k}</dt>
                  <dd className="col-span-2 text-sm text-muted">{d.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>

      {/* Size guide */}
      <section id="size-guide" className="border-t border-line py-20 sm:py-24">
        <Container className="max-w-4xl">
          <h2 className="display text-[2rem] sm:text-[2.4rem]">Size guide</h2>
          <div className="mt-8">
            <SizeGuideTable />
          </div>
        </Container>
      </section>

      {/* Compare */}
      <section className="halftone-dark py-20 text-paper sm:py-24">
        <Container>
          <SectionHeading eyebrow="Do the maths" title={<>One jacket vs.<br />three jackets</>} light />
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-paper/20 tabular-nums text-xs uppercase text-paper/60">
                  <th className="py-4 pr-4" />
                  <th className="py-4 pr-4 text-primary-light">Wronge set</th>
                  <th className="py-4">Three regular jackets</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  ["Looks", `${PACKAGE_LOOKS} (more designs coming soon)`, String(PACKAGE_LOOKS)],
                  ["Cost", taka(settings.jacket_price), `${PACKAGE_LOOKS} × a jacket`],
                  ["Wardrobe space", "1 hanger + a few flat panels", `${PACKAGE_LOOKS} hangers`],
                  ["New look", "Swap the back in under a minute", "Buy another jacket"],
                ].map(([k, a, b]) => (
                  <tr key={k} className="border-b border-paper/10">
                    <td className="py-4 pr-4 tabular-nums text-xs uppercase text-paper/60">{k}</td>
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
          <h2 className="display text-[2rem] sm:text-[2.4rem]">Questions</h2>
          <div className="mt-8">
            <FaqList faqs={getFaqs(settings).filter((f) => f.group === "Product" || f.group === "Swapping")} />
          </div>
        </Container>
      </section>
    </>
  );
}
