import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { Container, PageHero } from "@/components/ui/section";
import { ContactForm } from "@/components/store/simple-forms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about your order, sizing or custom panels? Talk to the Wronge team.",
};

export default async function ContactPage() {
  const s = await getSettings();
  const channels = [
    s.support_phone && { label: "Call", value: s.support_phone, href: `tel:${s.support_phone}` },
    s.whatsapp && { label: "WhatsApp", value: s.whatsapp, href: `https://wa.me/${s.whatsapp.replace(/[^\d]/g, "")}` },
    s.support_email && { label: "Email", value: s.support_email, href: `mailto:${s.support_email}` },
    s.facebook_url && { label: "Facebook", value: "Message us on Facebook", href: s.facebook_url },
    s.instagram_url && { label: "Instagram", value: "DM us on Instagram", href: s.instagram_url },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <>
      <PageHero eyebrow="Say hi" title="Contact">
        Questions about sizing, an order, or a custom panel idea? Send us a message and we usually reply within a day.
      </PageHero>
      <Container className="grid grid-cols-1 gap-12 py-12 sm:py-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
        <aside className="space-y-4 lg:col-span-5">
          {channels.map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block rounded-2xl border border-line p-5 transition hover:border-ink">
              <p className="eyebrow text-muted">{c.label}</p>
              <p className="mt-1 font-bold">{c.value}</p>
            </a>
          ))}
          <div className="rounded-2xl bg-paper-2 p-5">
            <p className="eyebrow text-muted">Already ordered?</p>
            <p className="mt-1 text-sm">
              Check your order status any time on the <Link href="/track" className="font-semibold underline underline-offset-4">Track order</Link> page.
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
