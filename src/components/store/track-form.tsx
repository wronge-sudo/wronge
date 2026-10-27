"use client";
import { useActionState } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { trackOrder, type TrackResult } from "@/actions/public";
import { cn, formatDate, STATUS_LABEL, taka } from "@/lib/format";
import { buttonClass } from "@/components/ui/button";

const FLOW = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
const FLOW_TEXT: Record<string, string> = {
  pending: "We've received your order",
  confirmed: "We called you and confirmed it",
  processing: "Being packed (and custom panels printed)",
  shipped: "With the courier, on its way",
  delivered: "Delivered. Enjoy your jacket!",
};

export function TrackForm() {
  const [state, action, pending] = useActionState<TrackResult, FormData>(trackOrder, null);
  const order = state?.ok ? state.order : null;
  const stopped = order && (order.status === "cancelled" || order.status === "returned");
  const reached = order ? FLOW.indexOf(order.status as (typeof FLOW)[number]) : -1;
  const eventAt = (s: string) => order?.events.filter((e) => e.status === s).pop()?.at;

  return (
    <div className="mx-auto max-w-3xl">
      <form action={action} className="grid gap-3 rounded-3xl bg-paper-2 p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Order number</span>
          <input name="order" required placeholder="WR-1001" className="h-12 w-full rounded-xl border-2 border-line bg-paper px-4 tabular-nums uppercase outline-none focus:border-ink" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Phone number</span>
          <input name="phone" type="tel" required placeholder="01XXXXXXXXX" className="h-12 w-full rounded-xl border-2 border-line bg-paper px-4 tabular-nums outline-none focus:border-ink" />
        </label>
        <button type="submit" disabled={pending} className={buttonClass("ink", "lg", "self-end")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Track
        </button>
      </form>

      {state && !state.ok && (
        <p className="mt-4 rounded-2xl border-2 border-signal bg-signal/10 p-4 text-sm font-semibold text-signal" role="alert">{state.message}</p>
      )}

      {order && (
        <div className="mt-8 rounded-3xl border border-line p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-muted">Order</p>
              <p className="tabular-nums text-2xl font-bold">{order.number}</p>
              <p className="text-sm text-muted">Placed {formatDate(order.createdAt, true)} · {order.district}</p>
            </div>
            <span className={cn("rounded-full px-4 py-2 tabular-nums text-xs font-bold uppercase", stopped ? "bg-signal text-white" : order.status === "delivered" ? "bg-ok text-white" : "bg-primary text-ink")}>
              {STATUS_LABEL[order.status]}
            </span>
          </div>

          {stopped ? (
            <p className="mt-8 flex items-center gap-3 rounded-2xl bg-paper-2 p-4 text-sm">
              <X className="size-5 text-signal" /> This order was {order.status}. Questions? Contact us any time.
            </p>
          ) : (
            <ol className="mt-8 space-y-0">
              {FLOW.map((s, i) => {
                const done = i <= reached;
                const at = eventAt(s);
                return (
                  <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < FLOW.length - 1 && <span className={cn("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5", i < reached ? "bg-ink" : "bg-line")} />}
                    <span className={cn("relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2", done ? "border-ink bg-ink text-primary-light" : "border-line bg-paper")}>
                      {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-line" />}
                    </span>
                    <div className="pt-1">
                      <p className={cn("font-bold uppercase tracking-tight", !done && "text-muted")}>{STATUS_LABEL[s]}</p>
                      <p className="text-sm text-muted">{FLOW_TEXT[s]}{at && done ? ` · ${formatDate(at, true)}` : ""}</p>
                      {s === "shipped" && done && (order.courier || order.trackingCode) && (
                        <p className="mt-1 tabular-nums text-xs">
                          {order.courier}{order.trackingCode && ` · Tracking: ${order.trackingCode}`}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="mt-8 border-t border-line pt-6">
            <ul className="space-y-2 text-sm">
              {order.items.map((i, n) => (
                <li key={n} className="flex justify-between gap-4">
                  <span>
                    <span className="font-semibold">{i.title} × {i.quantity}</span>
                    {i.panels.length > 0 && <span className="block text-xs text-muted">{i.panels.join(", ")}</span>}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between tabular-nums font-bold">
              <span>Cash on delivery</span>
              <span>{taka(order.total)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
