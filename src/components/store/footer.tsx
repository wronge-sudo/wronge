import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { ASSETS, asset } from "@/config/assets";
import { FOOTER_LINKS, SITE } from "@/config/site";
import type { StoreSettings } from "@/lib/types";
import { NewsletterForm } from "./newsletter-form";
import { Logo } from "./logo";

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

  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-16 sm:px-6 lg:px-10 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="display text-4xl sm:text-5xl">
              Get first dibs <br /> on new drops<span className="text-acid">.</span>
            </p>
            <p className="mt-4 max-w-md text-sm text-paper/60">
              New art panels, restocks and artist collabs. No spam — just the good stuff, a few times a month.
            </p>
            <div className="mt-6 max-w-md">
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:pl-10">
            {(
              [
                ["Shop", FOOTER_LINKS.shop],
                ["Help", FOOTER_LINKS.help],
                ["Wronge", FOOTER_LINKS.brand],
              ] as const
            ).map(([title, links]) => (
              <div key={title}>
                <p className="eyebrow text-acid">{title}</p>
                <ul className="mt-4 space-y-2.5">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-paper/75 transition hover:text-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-3">
              <p className="eyebrow text-acid">Talk to us</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/75">
                {settings.support_phone && <a href={`tel:${settings.support_phone}`} className="hover:text-paper">{settings.support_phone}</a>}
                {settings.support_email && <a href={`mailto:${settings.support_email}`} className="hover:text-paper">{settings.support_email}</a>}
                {!settings.support_phone && !settings.support_email && <Link href="/contact" className="hover:text-paper">Send us a message →</Link>}
                {socials.length > 0 && (
                  <div className="flex gap-2">
                    {socials.map(({ href, label, Icon }) => (
                      <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full border border-paper/20 transition hover:border-acid hover:text-acid">
                        <Icon className="size-4" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-16 select-none" aria-hidden>
          <Image src={asset(ASSETS.wordmarkWhite)} alt="" width={980} height={210} className="h-auto w-full opacity-[0.08]" />
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-paper/10 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo light className="opacity-80 [&_img]:h-4 sm:[&_img]:h-4" />
            <span>© {year} {SITE.legalName}. Made in Bangladesh.</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-paper/15 px-3 py-1 font-mono uppercase tracking-wider">Cash on delivery</span>
            <span className="rounded-full border border-paper/15 px-3 py-1 font-mono uppercase tracking-wider">64 districts</span>
            <span className="rounded-full border border-paper/15 px-3 py-1 font-mono uppercase tracking-wider">7-day exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
