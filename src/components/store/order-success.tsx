"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CheckCircle2, Phone, Truck } from "lucide-react";
import type { CheckoutResult } from "@/actions/checkout";
import { taka } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";
import { LAST_ORDER_KEY } from "./checkout-form";

type Success = Extract<CheckoutResult, { ok: true }>;

const subscribe = () => () => {};
function readOrder(): string | null {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

export function OrderSuccess() {
  const raw = useSyncExternalStore(subscribe, readOrder, () => null);
  const order: Success | null = raw ? JSON.parse(raw) : null;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-paper">
        <CheckCircle2 className="size-10" />
      </div>
      <h1 className="display mt-6 text-5xl sm:text-7xl">Order placed!</h1>
      {order ? (
        <>
          <p className="mt-4 text-lg text-muted">
            Thank you, {order.name.split(" ")[0]}. Your order number is
          </p>
          <p className="mt-2 inline-block rounded-full bg-ink px-6 py-2 font-mono text-2xl font-bold text-primary-light">{order.orderNumber}</p>

          <div className="mt-10 rounded-3xl bg-paper-2 p-6 text-left">
            <ul className="divide-y divide-line">
              {order.items.map((i, n) => (
                <li key={n} className="flex justify-between gap-4 py-3">
                  <div>
                    <p className="font-bold uppercase">{i.title} × {i.qty}</p>
                    {i.panels.length > 0 && <p className="text-xs text-muted">{i.panels.join(", ")}</p>}
                  </div>
                  <p className="font-mono text-sm font-bold">{taka(i.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 font-mono text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{taka(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.delivery ? taka(order.delivery) : "Free"}</dd></div>
              <div className="flex justify-between text-lg font-bold"><dt>Pay on delivery</dt><dd>{taka(order.total)}</dd></div>
            </dl>
          </div>

          <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
            <div className="flex gap-3 rounded-2xl border border-line p-4">
              <Phone className="size-5 shrink-0" />
              <p className="text-sm text-muted">We&apos;ll call <strong className="text-ink">{order.phone}</strong> soon to confirm your order.</p>
            </div>
            <div className="flex gap-3 rounded-2xl border border-line p-4">
              <Truck className="size-5 shrink-0" />
              <p className="text-sm text-muted">Keep <strong className="text-ink">{taka(order.total)}</strong> in cash ready for the rider.</p>
            </div>
          </div>
        </>
      ) : (
        <p className="mt-4 text-lg text-muted">Thank you! We&apos;ll call you soon to confirm your order.</p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/track" className={buttonClass("ink", "lg")}>Track your order</Link>
        <Link href="/panels" className={buttonClass("outline", "lg")}>Keep browsing</Link>
      </div>
    </div>
  );
}
