import type { Metadata } from "next";
import Image from "next/image";
import { ASSETS, asset } from "@/config/assets";
import { Container } from "@/components/ui/section";
import { Arrow, LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "Wronge is a Bangladeshi streetwear label built around one idea: one great jacket, endless backs.",
};

export default function AboutPage() {
  return (
    <>
      <section className="halftone-dark text-paper">
        <Container className="py-20 sm:py-28">
          <p className="eyebrow mb-4 text-acid">About Wronge</p>
          <h1 className="display max-w-5xl text-5xl sm:text-7xl lg:text-8xl">
            Rules say one jacket, one look. We read that wrong.
          </h1>
        </Container>
      </section>

      <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-6 text-lg text-muted">
          <p>
            <strong className="text-ink">Wronge</strong> started with a simple frustration: you love a jacket, you wear it to death, and then you
            want something new, so you buy another jacket. And another.
          </p>
          <p>
            So we built one really good washed-black denim trucker and cut a window in its back. A hidden three-sided zip frame lets you swap the
            centre panel in under a minute. Wear the matching denim on Monday and a moody night sky on Friday. Wear your campus, your favourite
            song or your own drawing.
          </p>
          <p>
            Every panel is the same standard size, so your art collection grows with you and moves to every Wronge jacket we ever make. Less
            stuff, more expression.
          </p>
          <p className="text-ink">Designed in Bangladesh. Made to be worn wrong.</p>
          <LinkButton href="/build" size="lg">
            Build your set <Arrow />
          </LinkButton>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-ink">
          <Image src={asset(ASSETS.profileDark)} alt="Wronge logo" fill sizes="(min-width:1024px) 45vw, 92vw" className="object-cover" />
        </div>
      </Container>

      <section className="border-t border-line bg-paper-2 py-16 sm:py-20">
        <Container className="grid gap-8 sm:grid-cols-3">
          {[
            ["One jacket", "Built to last, designed to be worn constantly."],
            ["Endless backs", "Original art panels, new drops, and your own designs."],
            ["Zero fuss", "Cash on delivery across all 64 districts."],
          ].map(([t, b]) => (
            <div key={t}>
              <p className="display-narrow text-3xl">{t}</p>
              <p className="mt-2 text-muted">{b}</p>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
