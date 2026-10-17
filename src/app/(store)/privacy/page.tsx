import type { Metadata } from "next";
import { ProsePage } from "@/components/ui/prose";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Legal" title="Privacy policy">
      <p>This page explains what information Wronge collects when you use this website, and how we use it.</p>
      <section>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Orders:</strong> your name, phone number, delivery address, optional email, and the items you ordered.</li>
          <li><strong>Custom panels:</strong> images you upload to be printed.</li>
          <li><strong>Messages and reviews:</strong> anything you send us through the contact or review forms.</li>
          <li><strong>Newsletter:</strong> your email address, if you sign up.</li>
          <li><strong>Technical:</strong> a one-way scrambled version of your IP address, used only to stop spam and fake orders.</li>
        </ul>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>
          We use your details only to confirm, deliver and support your order, to answer you, and (if you opted in) to tell you about new drops.
          We share your name, phone and address with our delivery partner so they can deliver your parcel. We never sell your data.
        </p>
      </section>
      <section>
        <h2>Your bag and saved items</h2>
        <p>Your bag, pack and saved panels are stored in your own browser, not on our servers, until you place an order.</p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>You can ask us to see, correct or delete your information at any time through the contact page, and unsubscribe from emails whenever you like.</p>
      </section>
    </ProsePage>
  );
}
