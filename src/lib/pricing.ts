/**
 * The ONE place prices are calculated. Used by the cart (for display) and by
 * the checkout server action (for the real total). The server never trusts
 * prices sent from the browser — it recalculates with this file.
 *
 * The store sells one product: the 4-in-1 package (see config/package.ts).
 */
import { PACKAGE_NAME } from "@/config/package";
import type { DeliveryZone, StoreSettings } from "./types";

export type CartLine = { key: string; type: "package"; size: string; qty: number };

export type PricedLine = {
  key: string;
  title: string;
  unitPrice: number;
  lineTotal: number;
};

type PriceSettings = Pick<StoreSettings, "jacket_price" | "delivery_inside_dhaka" | "delivery_outside_dhaka" | "free_delivery_min">;

export function unitPrice(_line: CartLine, s: PriceSettings): number {
  return s.jacket_price;
}

export function lineTitle(line: CartLine): string {
  return `${PACKAGE_NAME} — ${line.size}`;
}

export function deliveryFee(zone: DeliveryZone, subtotal: number, s: PriceSettings): number {
  if (s.free_delivery_min != null && subtotal >= s.free_delivery_min) return 0;
  return zone === "inside_dhaka" ? s.delivery_inside_dhaka : s.delivery_outside_dhaka;
}

export function priceCart(lines: CartLine[], s: PriceSettings, zone: DeliveryZone | null) {
  const priced: PricedLine[] = lines.map((l) => {
    const u = unitPrice(l, s);
    return { key: l.key, title: lineTitle(l), unitPrice: u, lineTotal: u * l.qty };
  });
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const delivery = zone && lines.length ? deliveryFee(zone, subtotal, s) : 0;
  return { lines: priced, subtotal, delivery, total: subtotal + delivery };
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((n, l) => n + l.qty, 0);
}
