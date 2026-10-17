/**
 * FAQ copy. Prices & fees are pulled from Admin → Settings automatically.
 * ⚠ Delivery times, exchange rules and care steps are sensible defaults —
 *   confirm them with the brand before launch (see the guide).
 */
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
      a: `The jacket comes with its matching washed-black denim panel already zipped in, so it works as a plain everyday jacket straight away. Art panels are sold separately in packs: pick any ${s.pack_size} for ${taka(s.pack_price)}.`,
    },
    {
      group: "Swapping",
      q: "Can I wear it with no panel at all?",
      a: "Yes. The collar, shoulders, yoke and waistband form a firm frame, so the jacket keeps its shape with the panel removed. The back is open and shows what you're wearing underneath, which looks great over a hoodie or a bold tee.",
    },
    {
      group: "Swapping",
      q: "Will my panels fit future Wronge jackets?",
      a: "Yes. Every Wronge panel is cut to the same standard size with the same zipper tape, so your art collection moves with you to every new jacket we make.",
    },
    {
      group: "Ordering",
      q: "How much does it cost?",
      a: `The jacket is ${taka(s.jacket_price)} and includes the blank denim panel. Art panels are ${taka(s.pack_price)} for any ${s.pack_size}. ${s.bundle_discount > 0 ? `Buy the jacket and a pack together and you save ${taka(s.bundle_discount)}.` : "Build a jacket and a pack together on the Build Your Set page."}`,
    },
    {
      group: "Ordering",
      q: "How do I pay?",
      a: "Cash on delivery only. You don't pay anything online. Pay the delivery rider in cash when your parcel arrives. We'll call you to confirm your order before we ship it.",
    },
    {
      group: "Ordering",
      q: "Can I create my own panel?",
      a: `Yes! Go to the Custom page, upload your artwork or photo, and position it on the panel. It takes one slot in your pack${s.custom_panel_fee > 0 ? ` (custom panels add ${taka(s.custom_panel_fee)} each)` : ""}. Our team checks every design for print quality and will contact you before printing.`,
    },
    {
      group: "Ordering",
      q: "How do I track my order?",
      a: "Use the Track Order page with your order number (like WR-1001) and the phone number you ordered with. You'll see every step, from confirmed to delivered.",
    },
    {
      group: "Delivery",
      q: "How much is delivery and how long does it take?",
      a: `Delivery is ${taka(s.delivery_inside_dhaka)} inside Dhaka and ${taka(s.delivery_outside_dhaka)} everywhere else in Bangladesh${s.free_delivery_min ? `, and free on orders over ${taka(s.free_delivery_min)}` : ""}. Inside Dhaka usually takes 1–3 days, and outside Dhaka 3–5 days after we confirm your order.`,
    },
    {
      group: "Delivery",
      q: "Can I exchange the size?",
      a: "Yes. If the size isn't right, contact us within 7 days of delivery. The jacket must be unworn and unwashed, with its tags on. We'll arrange an exchange, and you only pay the delivery charge.",
    },
    {
      group: "Product",
      q: "What is the jacket made of?",
      a: "Heavyweight matte washed-black denim with tonal black stitching, five silver-tone snap buttons, angled welt hand pockets, button cuffs, and adjustable cinch tabs with metal slide buckles on the back hem. The fit is unisex: boxy and relaxed, with dropped shoulders.",
    },
    {
      group: "Product",
      q: "How do I care for it?",
      a: "Unzip the art panel before washing. Wash the jacket inside out in cold water and hang it to dry. Spot-clean art panels, or hand-wash them gently in cold water and dry them flat. Don't tumble-dry, and never iron directly on a print.",
    },
  ];
}
