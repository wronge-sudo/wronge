import type { Metadata } from "next";
import { getPanels } from "@/lib/data";
import { Container, PageHero, SectionHeading } from "@/components/ui/section";
import { Arrow, LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SWAP_STEPS, SwapDiagram } from "@/components/store/swap-diagram";
import { SwapStudio } from "@/components/store/swap-studio";

export const metadata: Metadata = {
  title: "How It Swaps",
  description: "How the Wronge zip-out back panel works: lift the flap, unzip three sides, zip in new art, tuck and go.",
};

export default async function HowItWorksPage() {
  const panels = await getPanels();
  return (
    <>
      <PageHero eyebrow="The swap system" title={<>How it<br />swaps</>}>
        The middle of the back is an open window. A hidden three-sided zip frame holds whichever panel you choose: the matching denim for an
        everyday look, or art for a statement.
      </PageHero>

      <section className="py-16 sm:py-24">
        <Container className="space-y-6">
          {SWAP_STEPS.map((s, i) => (
            <Reveal key={s.title}>
              <div className="grid items-center gap-8 rounded-[2rem] bg-ink p-6 text-paper sm:p-10 md:grid-cols-2">
                <div className={i % 2 ? "md:order-2" : ""}>
                  <SwapDiagram step={(i + 1) as 1 | 2 | 3 | 4} className="mx-auto max-w-sm" />
                </div>
                <div>
                  <p className="font-mono text-sm font-bold text-acid">Step 0{i + 1}</p>
                  <h2 className="display mt-3 text-4xl sm:text-6xl">{s.title}</h2>
                  <p className="mt-4 max-w-md text-paper/70 sm:text-lg">{s.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="bg-paper-2 py-16 sm:py-24">
        <Container className="grid gap-10 lg:grid-cols-3">
          {[
            {
              t: "Self-supporting frame",
              b: "The collar, shoulders, yoke, side panels and waistband form a firm frame. The jacket holds its shape even with the panel out, so you can wear it open-backed over a hoodie.",
            },
            {
              t: "Hidden hardware",
              b: "The side and bottom zips sit under overlapping seam allowances, and the top edge hides under the yoke flap. Zipped in, it looks like one clean jacket.",
            },
            {
              t: "One standard size",
              b: "Every panel is cut to the same rectangle with the same black zipper tape, so every panel fits every Wronge jacket we make, now and later.",
            },
          ].map((c) => (
            <div key={c.t}>
              <h3 className="display-narrow text-3xl">{c.t}</h3>
              <p className="mt-3 text-muted">{c.b}</p>
            </div>
          ))}
        </Container>
      </section>

      <section className="halftone-dark py-16 text-paper sm:py-24">
        <Container>
          <SectionHeading eyebrow="Try it" title="Now you swap" light />
          <div className="mt-10">
            <SwapStudio panels={panels} />
          </div>
        </Container>
      </section>

      <section className="py-16 text-center sm:py-24">
        <Container>
          <h2 className="display text-5xl sm:text-7xl">Ready?</h2>
          <LinkButton href="/build" size="lg" className="mt-8">
            Build your set <Arrow />
          </LinkButton>
        </Container>
      </section>
    </>
  );
}
