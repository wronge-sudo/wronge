import Link from "next/link";
import { Banknote, RefreshCcw, Truck } from "lucide-react";
import { cacheLife } from "next/cache";
import { FOOTER_LINKS, SITE } from "@/config/site";
import { taka } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";
import { NewsletterForm } from "./newsletter-form";
import { Logo } from "./logo";
import { Container } from "@/components/ui/section";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.5-.3Z" />
    </svg>
  );
}

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer({ settings }: { settings: StoreSettings }) {
  const year = await currentYear();
  const socials = [
    settings.facebook_url && { href: settings.facebook_url, label: "Facebook", Icon: FacebookIcon },
    settings.instagram_url && { href: settings.instagram_url, label: "Instagram", Icon: InstagramIcon },
    settings.whatsapp && { href: `https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof FacebookIcon }[];

  const reassurance = [
    { Icon: Banknote, t: "Cash on delivery", b: "Check your jacket, then pay the rider. No card or bKash needed." },
    { Icon: Truck, t: "All 64 districts", b: `Delivery from ${taka(settings.delivery_inside_dhaka)} inside Dhaka, ${taka(settings.delivery_outside_dhaka)} outside.` },
    { Icon: RefreshCcw, t: "7-day size exchange", b: "Wrong size? Swap it within 7 days of delivery." },
  ];

  return (
    <footer className="border-t border-line bg-paper text-ink">
      <Container className="pb-8 pt-10 lg:pt-12">
        <ul className="grid gap-3 md:grid-cols-3">
          {reassurance.map(({ Icon, t, b }) => (
            <li key={t} className="flex items-start gap-3.5 rounded-[10px] border border-line bg-card p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-2">
                <Icon className="size-[18px]" />
              </span>
              <div>
                <p className="text-[1.02rem] font-bold">{t}</p>
                <p className="mt-1 text-[0.9rem] leading-snug text-ink/80">{b}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-8">
          {(
            [
              ["Shop", FOOTER_LINKS.shop, "lg:col-span-3"],
              ["Help", FOOTER_LINKS.help, "lg:col-span-3"],
              ["Wronge", FOOTER_LINKS.brand, "lg:col-span-2"],
            ] as const
          ).map(([title, links, span]) => (
            <div key={title} className={span}>
              <p className="text-[1.05rem] font-bold uppercase">{title}</p>
              <ul className="mt-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-1.5 text-[1.05rem] transition hover:underline hover:underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 lg:col-span-4">
            <p className="text-[1.05rem] font-bold uppercase">Newsletter</p>
            <p className="mt-3 text-[1.05rem]">New art panels and restocks, a few times a month.</p>
            <div className="mt-4 max-w-md">
              <NewsletterForm />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem]">
              {settings.support_phone && <a href={`tel:${settings.support_phone}`} className="hover:underline">{settings.support_phone}</a>}
              {settings.support_email && <a href={`mailto:${settings.support_email}`} className="hover:underline">{settings.support_email}</a>}
              {!settings.support_phone && !settings.support_email && <Link href="/contact" className="hover:underline">Send us a message →</Link>}
              {socials.length > 0 && (
                <div className="flex gap-2">
                  {socials.map(({ href, label, Icon }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-ink/15 bg-card transition hover:border-ink">
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-ink">
        <Container className="flex flex-col gap-4 py-6 text-[0.85rem] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo className="opacity-50 [&_img]:h-[18px] sm:[&_img]:h-[18px]" />
            <span>© {year} {SITE.legalName}. Made in Bangladesh.</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5">
            <Link href="/terms" className="py-1.5 hover:underline">Terms</Link>
            <Link href="/privacy" className="py-1.5 hover:underline">Privacy</Link>
            <Link href="/shipping-returns" className="py-1.5 hover:underline">Delivery & exchanges</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
