import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getPanels } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const panels = await getPanels();
  const pages = ["", "/panels", "/jacket", "/build", "/custom", "/how-it-works", "/faq", "/reviews", "/about", "/contact", "/track", "/shipping-returns", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...panels.map((p) => ({ url: `${SITE.url}/panels/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
