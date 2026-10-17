import type { Metadata } from "next";
import { Container } from "@/components/ui/section";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="py-10 sm:py-14">
      <p className="eyebrow mb-3 text-muted">Cash on delivery · All over Bangladesh</p>
      <h1 className="display mb-10 text-5xl sm:text-7xl">Checkout</h1>
      <CheckoutForm />
    </Container>
  );
}
