"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Info, Loader2, Lock, Phone } from "lucide-react";
import { placeOrder } from "@/actions/checkout";
import { COURIERS, DELIVERY_CITY, PAYMENT_SHORT, ZONE_LABEL, paymentSplit, type CourierId } from "@/config/delivery";
import { ALL_DISTRICTS } from "@/lib/bd";
import { priceCart } from "@/lib/pricing";
import { cn, taka } from "@/lib/format";
import type { DeliveryZone } from "@/lib/types";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { buttonClass } from "@/components/ui/button";
import { CartLines } from "./cart-lines";
import { useStoreData } from "./store-data";

const DISTRICTS = [DELIVERY_CITY, ...ALL_DISTRICTS.filter((d) => d !== DELIVERY_CITY)];
export const LAST_ORDER_KEY = "wronge-last-order";

const inputCls = (err?: string) =>
  cn(
    "h-12 w-full rounded-xl border-2 bg-paper px-4 text-[0.95rem] outline-none transition placeholder:text-muted/60 focus:border-ink",
    err ? "border-signal" : "border-line",
  );

function Field({ label, error, optional, children, htmlFor }: { label: string; error?: string; optional?: boolean; children: React.ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-signal">{error}</p>}
    </div>
  );
}

export function CheckoutForm() {
  const mounted = useMounted();
  const router = useRouter();
  const { settings } = useStoreData();
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);
  const [pending, start] = useTransition();
  const [district, setDistrict] = useState(DELIVERY_CITY);
  const [zone, setZone] = useState<DeliveryZone>("inside_dhaka");
  const [courierId, setCourierId] = useState<CourierId | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  if (!mounted) return <div className="h-96 animate-pulse rounded-3xl bg-paper-2" />;

  if (lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="display-narrow text-3xl">Your bag is empty</p>
        <Link href="/build" className={buttonClass("primary", "lg", "mt-6")}>Build your set →</Link>
      </div>
    );
  }

  const effectiveZone: DeliveryZone = district === DELIVERY_CITY ? zone : "outside_dhaka";
  const totals = priceCart(lines, settings, effectiveZone);
  const courier = COURIERS.find((c) => c.id === courierId) ?? null;
  const split = courier ? paymentSplit(courier.payment, totals.total, totals.delivery) : null;

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setErrors({});
    const f = new FormData(e.currentTarget);
    const payload = {
      name: String(f.get("name") ?? ""),
      phone: String(f.get("phone") ?? ""),
      email: String(f.get("email") ?? ""),
      district,
      area: String(f.get("area") ?? ""),
      address: String(f.get("address") ?? ""),
      zone: effectiveZone,
      courier: courierId ?? "",
      note: String(f.get("note") ?? ""),
      website: String(f.get("website") ?? ""),
      lines,
    };
    start(async () => {
      try {
        const res = await placeOrder(payload);
        if (!res.ok) {
          setErrors(res.fieldErrors ?? {});
          setFormError(res.error);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        try {
          sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(res));
        } catch {}
        clearCart();
        router.push(`/order/success?n=${encodeURIComponent(res.orderNumber)}`);
      } catch {
        setFormError("Something went wrong. Please check your connection and try again.");
      }
    });
  }

  if (!settings.orders_enabled) {
    return (
      <div className="rounded-3xl bg-paper-2 p-8 text-center">
        <p className="display-narrow text-3xl">Orders are paused</p>
        <p className="mt-2 text-muted">We&apos;re not taking new orders right now. Please check back soon, or message us.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7">
        {formError && (
          <div className="rounded-2xl border-2 border-signal bg-signal/10 p-4 text-sm font-semibold text-signal" role="alert">
            {formError}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="display-narrow mb-2 text-2xl">Your details</legend>
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <input id="name" name="name" autoComplete="name" required className={inputCls(errors.name)} placeholder="Your name" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mobile number" htmlFor="phone" error={errors.phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={inputCls(errors.phone)} placeholder="01XXXXXXXXX" />
            </Field>
            <Field label="Email" htmlFor="email" optional error={errors.email}>
              <input id="email" name="email" type="email" autoComplete="email" className={inputCls(errors.email)} placeholder="you@email.com" />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="display-narrow mb-2 text-2xl">Delivery address</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="District" htmlFor="district" error={errors.district}>
              <select
                id="district"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  if (e.target.value !== DELIVERY_CITY) setZone("outside_dhaka");
                }}
                className={inputCls(errors.district)}
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Area / Thana" htmlFor="area" optional>
              <input id="area" name="area" className={inputCls()} placeholder="e.g. Panchlaish" />
            </Field>
          </div>
          <Field label="Full address" htmlFor="address" error={errors.address}>
            <textarea
              id="address"
              name="address"
              rows={3}
              autoComplete="street-address"
              required
              className={cn(inputCls(errors.address), "h-auto py-3")}
              placeholder="House, road, block, landmark"
            />
          </Field>

          <div>
            <p className="mb-2 text-sm font-semibold">Delivery area</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["inside_dhaka", settings.delivery_inside_dhaka],
                  ["outside_dhaka", settings.delivery_outside_dhaka],
                ] as const
              ).map(([value, fee]) => {
                const disabled = value === "inside_dhaka" && district !== DELIVERY_CITY;
                const active = effectiveZone === value;
                return (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3.5 transition",
                      active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                      disabled && "cursor-not-allowed opacity-40 hover:border-line",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input type="radio" name="zone" value={value} checked={active} disabled={disabled} onChange={() => setZone(value)} className="accent-primary" />
                      <span className="text-sm font-semibold">{ZONE_LABEL[value]}</span>
                    </span>
                    <span className="tabular-nums text-sm font-bold">{totals.subtotal >= (settings.free_delivery_min ?? Infinity) ? "Free" : taka(fee)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Field label="Order note" htmlFor="note" optional>
            <input id="note" name="note" className={inputCls()} placeholder="Anything we should know? (e.g. best time to call)" />
          </Field>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </fieldset>

        <fieldset>
          <legend className="display-narrow mb-3 text-2xl">Courier</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {COURIERS.map((c) => {
              const active = courierId === c.id;
              return (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3.5 transition",
                    active ? "border-ink bg-ink text-paper" : errors.courier ? "border-signal hover:border-ink" : "border-line hover:border-ink",
                  )}
                >
                  <input type="radio" name="courier" value={c.id} checked={active} onChange={() => setCourierId(c.id)} className="mt-1 accent-primary" />
                  <span>
                    <span className="block text-sm font-semibold">{c.name}</span>
                    <span className={cn("block text-xs", active ? "text-paper/75" : "text-muted")}>{PAYMENT_SHORT[c.payment]}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {errors.courier && <p className="mt-1.5 text-xs font-semibold text-signal">{errors.courier}</p>}

          <div className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-line bg-card p-4" role="note" aria-label="How you pay">
            <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div className="space-y-1.5 text-sm">
              <p className="font-bold">How you pay</p>
              <p className={cn(courier?.payment === "delivery_fee_advance" && "text-muted")}>
                <strong>Pathao or Steadfast:</strong> full advance payment. After we confirm your order, you pay the full amount before we ship it.
              </p>
              <p className={cn(courier?.payment === "full_advance" && "text-muted")}>
                <strong>S.A. Paribahan or Sundarban Courier Service:</strong> pay only the delivery charge in advance, then pay the rest in cash on
                delivery.
              </p>
            </div>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted">
            <Phone className="size-3.5" /> We&apos;ll call you to confirm your order and share payment details before we ship it.
          </p>
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="rounded-[21px] border border-line bg-card p-6 lg:sticky lg:top-28">
          <div className="flex items-center justify-between">
            <p className="display-narrow text-2xl">Your order</p>
            <Link href="/cart" className="text-xs font-bold uppercase tracking-wider underline underline-offset-4">Edit</Link>
          </div>
          <div className="mt-2 max-h-[40vh] overflow-y-auto">
            <CartLines editable={false} compact />
          </div>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 tabular-nums text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{taka(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery ({effectiveZone === "inside_dhaka" ? "inside" : "outside"} {DELIVERY_CITY})</dt>
              <dd>{totals.delivery === 0 ? "Free" : taka(totals.delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-bold">
              <dt>Total</dt>
              <dd>{taka(totals.total)}</dd>
            </div>
            {split && (
              <>
                <div className="flex justify-between">
                  <dt className="text-muted">Pay in advance</dt>
                  <dd className="font-bold">{taka(split.advance)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Pay on delivery</dt>
                  <dd className="font-bold">{taka(split.onDelivery)}</dd>
                </div>
              </>
            )}
          </dl>
          <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "mt-6 w-full")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            {pending ? "Placing order…" : `Place order · ${taka(totals.total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            By placing an order you agree to our{" "}
            <Link href="/terms" className="underline">terms</Link> and{" "}
            <Link href="/shipping-returns" className="underline">delivery & exchange policy</Link>.
          </p>
        </div>
      </aside>
    </form>
  );
}
