"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { priceCart } from "@/lib/pricing";
import { taka } from "@/lib/format";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { buttonClass } from "@/components/ui/button";
import { CartLines } from "./cart-lines";
import { useStoreData } from "./store-data";

export function CartPageClient() {
  const mounted = useMounted();
  const { settings } = useStoreData();
  const lines = useCart((s) => s.lines);

  if (!mounted) return <div className="h-64 animate-pulse rounded-3xl bg-paper-2" />;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <div className="grid size-16 place-items-center rounded-full bg-ink text-primary-light">
          <ShoppingBag className="size-7" />
        </div>
        <p className="display-narrow text-3xl">Your bag is empty</p>
        <p className="max-w-sm text-muted">Start with the jacket, then pick the art you want on your back.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link href="/build" className={buttonClass("primary", "lg")}>Build your set →</Link>
          <Link href="/panels" className={buttonClass("outline", "lg")}>Shop panels</Link>
        </div>
      </div>
    );
  }

  const { subtotal } = priceCart(lines, settings, null);
  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <CartLines />
      </div>
      <aside className="lg:col-span-4">
        <div className="rounded-3xl bg-paper-2 p-6 lg:sticky lg:top-28">
          <p className="display-narrow text-2xl">Summary</p>
          <dl className="mt-5 space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-bold">{taka(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd className="text-right text-xs text-muted">
                {taka(settings.delivery_inside_dhaka)} Dhaka
                <br />
                {taka(settings.delivery_outside_dhaka)} outside
              </dd>
            </div>
          </dl>
          {settings.free_delivery_min && subtotal < settings.free_delivery_min && (
            <p className="mt-3 text-xs text-muted">Add {taka(settings.free_delivery_min - subtotal)} more for free delivery.</p>
          )}
          <Link href="/checkout" className={buttonClass("primary", "lg", "mt-6 w-full")}>
            Checkout →
          </Link>
          <p className="mt-3 text-center text-xs text-muted">Cash on delivery · No advance payment</p>
        </div>
      </aside>
    </div>
  );
}
