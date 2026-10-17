/**
 * Site-wide copy & links. Edit freely — nothing here is secret.
 * Prices / delivery fees / phone numbers shown to customers live in the
 * database (Admin → Settings) so they can be changed without a redeploy.
 */
export const SITE = {
  name: "WRONGE",
  legalName: "Wronge",
  tagline: "One jacket. Endless backs.",
  description:
    "Wronge makes a washed-black denim trucker jacket with a zip-out back panel. Wear it plain, or zip in original art panels and change your look in seconds. Cash on delivery all over Bangladesh.",
  // On Vercel, falls back to the project's production domain (custom domain once one is added).
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  currency: "BDT",
  locale: "en-BD",
};

export const NAV_LINKS = [
  { href: "/panels", label: "Art Panels" },
  { href: "/jacket", label: "The Jacket" },
  { href: "/build", label: "Build Your Set" },
  { href: "/custom", label: "Custom" },
  { href: "/how-it-works", label: "How It Swaps" },
];

export const FOOTER_LINKS = {
  shop: [
    { href: "/build", label: "Build your set" },
    { href: "/jacket", label: "The jacket" },
    { href: "/panels", label: "All art panels" },
    { href: "/custom", label: "Create your own panel" },
  ],
  help: [
    { href: "/track", label: "Track your order" },
    { href: "/shipping-returns", label: "Delivery & exchanges" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact us" },
  ],
  brand: [
    { href: "/about", label: "About Wronge" },
    { href: "/how-it-works", label: "How it swaps" },
    { href: "/reviews", label: "Reviews" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
