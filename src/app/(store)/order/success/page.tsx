import type { Metadata } from "next";
import { Container } from "@/components/ui/section";
import { OrderSuccess } from "@/components/store/order-success";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default function OrderSuccessPage() {
  return (
    <Container className="py-16 sm:py-24">
      <OrderSuccess />
    </Container>
  );
}
