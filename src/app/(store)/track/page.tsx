import type { Metadata } from "next";
import { PageHero, Container } from "@/components/ui/section";
import { TrackForm } from "@/components/store/track-form";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the status of your Wronge order with your order number and phone number.",
};

export default function TrackPage() {
  return (
    <>
      <PageHero eyebrow="Where's my jacket?" title="Track order">
        Enter the order number from your confirmation (like WR-1001) and the phone number you ordered with.
      </PageHero>
      <Container className="py-12 sm:py-16">
        <TrackForm />
      </Container>
    </>
  );
}
