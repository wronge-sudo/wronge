/**
 * FAQ copy (client revisions, Nov 2026). Prices & fees are pulled from Admin → Settings automatically.
 * ⚠ Delivery times, exchange rules and care steps are sensible defaults —
 *   confirm them with the brand before launch (see the guide).
 */
import { DELIVERY_CITY } from "@/config/delivery";
import { taka } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";

export type Faq = { q: string; a: string; group: "Swapping" | "Ordering" | "Delivery" | "Product" };

export function getFaqs(s: StoreSettings): Faq[] {
  return [
    {
      group: "Swapping",
      q: "How does the back panel swap work?",
      a: "Lift the flap under the shoulder yoke, unzip the two side zips and the bottom zip, and slide the panel out. Zip the new panel in the same way and tuck its top edge back under the flap. The zips sit hidden under the seams, so it looks clean when you're done. Most people get it done in under a minute.",
    },
    {
      group: "Swapping",
      q: "What comes with the jacket?",
      a: "The jacket comes with its matching washed-black denim panel already zipped in, so it works as a plain everyday jacket straight away. The 4-in-1 package also includes two art panels: Keep It Classic and Campfire Night.",
    },
    {
      group: "Swapping",
      q: "Can I wear it with no design panel at all?",
      a: "Yes. Zip in the blank denim panel that comes with the jacket and you have a plain washed-black denim jacket for every day. Swap in an art panel whenever you want a statement.",
    },
    {
      group: "Ordering",
      q: "How much does it cost?",
      a: `The full 4-in-1 package is ${taka(s.jacket_price)}: the jacket, the blank denim panel and two art panels. Delivery is extra.`,
    },
    {
      group: "Ordering",
      q: "How do I pay?",
      a: "After we call you to confirm your order, full advance payment is required. The only exception is S.A. Paribahan or Sundarban Courier Service: with those couriers you pay just the delivery charge in advance, and the rest in cash on delivery.",
    },
    {
      group: "Delivery",
      q: "How much is delivery and how long does it take?",
      a: `Delivery is ${taka(s.delivery_inside_dhaka)} inside ${DELIVERY_CITY} city and ${taka(s.delivery_outside_dhaka)} everywhere else in Bangladesh${s.free_delivery_min ? `, and free on orders over ${taka(s.free_delivery_min)}` : ""}. Inside ${DELIVERY_CITY} usually takes 1–3 days, and outside ${DELIVERY_CITY} 3–5 days after we confirm your order. You can choose Pathao, Steadfast, S.A. Paribahan or Sundarban Courier Service at checkout.`,
    },
    {
      group: "Delivery",
      q: "Can I exchange the size?",
      a: "Yes. If the size isn't right, contact us within 7 days of delivery. The jacket must be unworn and unwashed, with its tags on. We'll arrange an exchange, and you only pay the delivery charge.",
    },
    {
      group: "Product",
      q: "What is the jacket made of?",
      a: "11.5 oz 100% cotton denim, with snap buttons and two front side pockets. The back panel attaches with a YKK zipper and Velcro, and the art panels are screen-printed.",
    },
    {
      group: "Product",
      q: "How do I care for it?",
      a: "Reattach the original blank panel before washing your base jacket. Spot-clean art panels as needed.",
    },
  ];
}
