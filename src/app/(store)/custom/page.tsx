import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/section";
import { buttonClass } from "@/components/ui/button";
import { NewsletterForm } from "@/components/store/newsletter-form";

export const metadata: Metadata = {
  title: "Custom Panels — Coming Soon",
  description: "Custom Wronge back panels with your own art are coming soon. Join the newsletter to hear first.",
};

export default function CustomPage() {
  return (
    <>
      <section className="border-b border-line bg-ink text-paper">
        <Container className="py-12 sm:py-16">
          <p className="eyebrow mb-3 text-primary-light">Custom panels · Coming soon</p>
          <h1 className="display text-[2.5rem] sm:text-[3.5rem]">
            Your art.
            <br />
            Your back.
          </h1>
          <p className="mt-5 max-w-xl text-paper/70 sm:text-lg">
            Soon you&apos;ll be able to turn a drawing, a photo or your band&apos;s logo into a zip-in back panel. We&apos;re not taking custom
            orders yet.
          </p>
        </Container>
      </section>
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="display-narrow text-2xl sm:text-3xl">Hear about it first</h2>
          <p className="mt-3 max-w-md text-muted">Join the newsletter and we&apos;ll tell you when custom panels open.</p>
          <div className="mt-5 max-w-md">
            <NewsletterForm />
          </div>
        </div>
        <div className="rounded-3xl border-2 border-line bg-card p-6 sm:p-8">
          <p className="font-bold">In the meantime</p>
          <p className="mt-2 text-muted">
            The 4-in-1 package comes with the jacket, a blank denim panel and our two launch designs: Keep It Classic and Campfire Night.
          </p>
          <Link href="/build" className={buttonClass("primary", "lg", "mt-5")}>
            Build your set →
          </Link>
        </div>
      </Container>
    </>
  );
}
