import type { Metadata } from "next";
import { ProsePage } from "@/components/ui/prose";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Legal" title="Terms">
      <p>By using this website or placing an order with Wronge, you agree to these terms.</p>
      <section>
        <h2>Orders and prices</h2>
        <p>
          Prices are in Bangladeshi Taka (BDT) and shown at checkout, including the delivery charge. Placing an order is an offer to buy; we
          confirm it by phone before shipping. We may cancel an order if an item is out of stock, the price was shown in error, or we can&apos;t
          reach you to confirm.
        </p>
      </section>
      <section>
        <h2>Payment</h2>
        <p>
          Full advance payment is required after we confirm your order. With S.A. Paribahan or Sundarban Courier Service, you pay only the delivery
          charge in advance and the rest in cash on delivery. Repeatedly refusing parcels without a valid reason may stop you from ordering again.
        </p>
      </section>
      <section>
        <h2>Designs and content</h2>
        <p>All Wronge designs, photos and text on this site belong to Wronge or its artists and may not be reused without permission.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions about these terms? Reach us through the contact page.</p>
      </section>
    </ProsePage>
  );
}
