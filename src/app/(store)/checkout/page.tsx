import type { Metadata } from "next";
import { Container } from "@/components/ui/section";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="display mb-10 text-[2.4rem] sm:text-[3rem]">Checkout</h1>
      <CheckoutForm />
    </Container>
  );
}
