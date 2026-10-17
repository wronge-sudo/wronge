import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/data";
import { taka } from "@/lib/format";
import { ProsePage } from "@/components/ui/prose";

export const metadata: Metadata = {
  title: "Delivery & Exchanges",
  description: "Delivery charges, delivery times, cash on delivery and size exchanges at Wronge.",
};

// ⚠ Delivery times and exchange rules are placeholders — confirm with the brand (see the guide).
export default async function ShippingPage() {
  const s = await getSettings();
  return (
    <ProsePage eyebrow="Help" title="Delivery & exchanges">
      <section>
        <h2>Delivery charges</h2>
        <ul>
          <li>Inside Dhaka city: <strong>{taka(s.delivery_inside_dhaka)}</strong></li>
          <li>Outside Dhaka city (all other areas and districts): <strong>{taka(s.delivery_outside_dhaka)}</strong></li>
          {s.free_delivery_min && <li>Free delivery on orders of <strong>{taka(s.free_delivery_min)}</strong> or more</li>}
        </ul>
      </section>
      <section>
        <h2>Delivery time</h2>
        <p>
          After we confirm your order by phone, delivery usually takes <strong>1–3 days inside Dhaka</strong> and{" "}
          <strong>3–5 days outside Dhaka</strong>. Orders with custom panels need a few extra days for printing. We&apos;ll tell you the timing
          when we call.
        </p>
      </section>
      <section>
        <h2>Cash on delivery</h2>
        <p>
          All orders are cash on delivery. Please check your parcel in front of the rider, then pay the full amount in cash. If we can&apos;t reach
          you on the phone number you gave us, we may cancel the order.
        </p>
      </section>
      <section>
        <h2>Size exchange</h2>
        <ul>
          <li>Contact us within <strong>7 days</strong> of delivery to exchange the size of your jacket.</li>
          <li>The item must be unworn and unwashed, with all tags on.</li>
          <li>You pay the delivery charge for the exchange. We cover it if we sent the wrong item.</li>
          <li>Custom-printed panels can&apos;t be exchanged unless they arrive damaged or misprinted.</li>
        </ul>
      </section>
      <section>
        <h2>Damaged or wrong item?</h2>
        <p>
          Tell us within 48 hours of delivery, with a photo, and we&apos;ll make it right. <Link href="/contact" className="font-semibold text-ink underline">Contact us</Link>.
        </p>
      </section>
    </ProsePage>
  );
}
