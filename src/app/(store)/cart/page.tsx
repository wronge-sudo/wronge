import type { Metadata } from "next";
import { Container } from "@/components/ui/section";
import { CartPageClient } from "@/components/store/cart-page";

export const metadata: Metadata = { title: "Your Bag", robots: { index: false } };

export default function CartPage() {
  return (
    <Container className="py-10 sm:py-14">
      <h1 className="display mb-8 text-[2.4rem] sm:text-[3rem]">Your bag</h1>
      <CartPageClient />
    </Container>
  );
}
