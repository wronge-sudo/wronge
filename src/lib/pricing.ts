/**
 * The ONE place prices are calculated. Used by the cart (for display) and by
 * the checkout server action (for the real total). The server never trusts
 * prices sent from the browser — it recalculates with this file.
 */
import type { DeliveryZone, PanelRef, StoreSettings } from "./types";

export type CartLine =
  | { key: string; type: "jacket"; size: string; qty: number }
  | { key: string; type: "pack"; panels: PanelRef[]; qty: number }
  | { key: string; type: "bundle"; size: string; panels: PanelRef[]; qty: number };

export type PricedLine = {
  key: string;
  title: string;
  unitPrice: number;
  lineTotal: number;
};

type PriceSettings = Pick<
  StoreSettings,
  | "jacket_price"
  | "pack_price"
  | "pack_size"
  | "bundle_discount"
  | "custom_panel_fee"
  | "delivery_inside_dhaka"
  | "delivery_outside_dhaka"
  | "free_delivery_min"
>;

function customFees(panels: PanelRef[], s: PriceSettings) {
  return panels.filter((p) => p.custom).length * s.custom_panel_fee;
}

export function unitPrice(line: CartLine, s: PriceSettings): number {
  switch (line.type) {
    case "jacket":
      return s.jacket_price;
    case "pack":
      return s.pack_price + customFees(line.panels, s);
    case "bundle":
      return s.jacket_price + s.pack_price - s.bundle_discount + customFees(line.panels, s);
  }
}

export function lineTitle(line: CartLine, s: Pick<StoreSettings, "pack_size">): string {
  switch (line.type) {
    case "jacket":
      return `Wronge Denim Jacket — ${line.size}`;
    case "pack":
      return `${s.pack_size}-Panel Art Pack`;
    case "bundle":
      return `The ${s.pack_size + 1}-in-1 Set — ${line.size}`;
  }
}

export function deliveryFee(zone: DeliveryZone, subtotal: number, s: PriceSettings): number {
  if (s.free_delivery_min != null && subtotal >= s.free_delivery_min) return 0;
  return zone === "inside_dhaka" ? s.delivery_inside_dhaka : s.delivery_outside_dhaka;
}

export function priceCart(lines: CartLine[], s: PriceSettings, zone: DeliveryZone | null) {
  const priced: PricedLine[] = lines.map((l) => {
    const u = unitPrice(l, s);
    return { key: l.key, title: lineTitle(l, s), unitPrice: u, lineTotal: u * l.qty };
  });
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const delivery = zone && lines.length ? deliveryFee(zone, subtotal, s) : 0;
  return { lines: priced, subtotal, delivery, total: subtotal + delivery };
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
