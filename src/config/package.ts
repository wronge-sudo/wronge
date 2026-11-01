/**
 * What Wronge sells: ONE product, the 4-in-1 package.
 * 1 jacket + 1 blank denim panel + the client-approved art panels below,
 * for the price set in Admin → Settings ("Package price", stored as jacket_price).
 * Every other panel in the catalogue is shown as "Coming soon" and can't be bought.
 */
import type { Panel, PanelRef } from "@/lib/types";

export const PACKAGE_NAME = "The 4-in-1 Package";

/** Art panels that ship in every package, in display order. */
export const PACKAGE_PANEL_SLUGS = ["keep-it-classic", "campfire-night"] as const;

/** Pieces in the box: jacket + blank panel + each art panel. */
export const PACKAGE_PIECES = 2 + PACKAGE_PANEL_SLUGS.length;

/** Looks you can wear: the blank panel + each art panel. */
export const PACKAGE_LOOKS = 1 + PACKAGE_PANEL_SLUGS.length;

export function isPackagePanel(slug: string): boolean {
  return (PACKAGE_PANEL_SLUGS as readonly string[]).includes(slug);
}

/** The package's art panels from a panel list, in PACKAGE_PANEL_SLUGS order. Hidden or missing panels are skipped. */
export function packagePanels(panels: Panel[]): Panel[] {
  return PACKAGE_PANEL_SLUGS.map((slug) => panels.find((p) => p.slug === slug)).filter((p): p is Panel => !!p);
}

/** Package panels first, then the rest (the "coming soon" designs). */
export function packageFirst(panels: Panel[]): Panel[] {
  return [...packagePanels(panels), ...panels.filter((p) => !isPackagePanel(p.slug))];
}

export function toPanelRef(p: Panel): PanelRef {
  return { id: p.id.startsWith("seed-") ? undefined : p.id, slug: p.slug, name: p.name, image: p.image_url };
}
