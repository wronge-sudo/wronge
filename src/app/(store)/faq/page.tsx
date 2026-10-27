import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { getFaqs } from "@/config/faq";
import { Container, PageHero } from "@/components/ui/section";
import { FaqList } from "@/components/ui/faq-list";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about swapping panels, sizing, cash on delivery, delivery times and exchanges.",
};

export default async function FaqPage() {
  const settings = await getSettings();
  const faqs = getFaqs(settings);
  const groups = Array.from(new Set(faqs.map((f) => f.group)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero eyebrow="Help" title={<>Good<br />questions</>}>
        Can&apos;t find what you need?{" "}
        <Link href="/contact" className="font-semibold text-ink underline underline-offset-4">Message us</Link>.
      </PageHero>
      <Container className="grid grid-cols-1 gap-12 py-12 sm:py-16 lg:grid-cols-12">
        <nav className="hidden lg:col-span-3 lg:block" aria-label="FAQ sections">
          <ul className="sticky top-28 space-y-2">
            {groups.map((g) => (
              <li key={g}>
                <a href={`#${g.toLowerCase()}`} className="eyebrow text-muted hover:text-ink">{g}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-14 lg:col-span-9">
          {groups.map((g) => (
            <section key={g} id={g.toLowerCase()} className="scroll-mt-28">
              <h2 className="display-narrow mb-4 text-3xl">{g}</h2>
              <FaqList faqs={faqs.filter((f) => f.group === g)} />
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
