"use client";
import { useActionState, useState, useTransition } from "react";
import { Check, ClipboardCopy, Loader2, Printer } from "lucide-react";
import { setOrderStatus, updateOrderMeta, type AdminState } from "@/actions/admin";
import { cn, STATUS_LABEL } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { adminInput, STATUS_DOT } from "./ui";

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; hint: string }>> = {
  pending: { to: "confirmed", label: "Confirm order", hint: "Call the customer first and check the address." },
  confirmed: { to: "processing", label: "Start packing", hint: "Print any custom panels and pack the parcel." },
  processing: { to: "shipped", label: "Mark as shipped", hint: "Add the courier and tracking code below first." },
  shipped: { to: "delivered", label: "Mark as delivered", hint: "The rider collected the cash. Payment becomes Paid." },
};

const COURIERS = ["Steadfast", "Pathao", "RedX", "Paperfly", "Sundarban", "eCourier", "Own rider"];

export function StatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<AdminState>(null);
  const next = NEXT[status];

  const go = (to: string) => {
    if ((to === "cancelled" || to === "returned") && !window.confirm(`Mark this order as ${to}? Stock will be put back.`)) return;
    start(async () => {
      const res = await setOrderStatus(orderId, to, note);
      setMsg(res);
      if (res?.ok) setNote("");
    });
  };

  return (
    <div className="space-y-4">
      {next ? (
        <div>
          <button type="button" disabled={pending} onClick={() => go(next.to)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-primary hover:text-ink disabled:opacity-50">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {next.label}
          </button>
          <p className="mt-2 text-xs text-muted">{next.hint}</p>
        </div>
      ) : (
        <p className="rounded-xl bg-paper-2/70 p-3 text-sm text-muted">
          {status === "delivered" ? "This order is complete." : `This order is ${status}.`}
        </p>
      )}

      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the timeline" maxLength={300} className={adminInput} />

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Or set status</p>
        <div className="flex flex-wrap gap-1.5">
          {ORDER_STATUSES.filter((s) => s !== status).map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => go(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-ink disabled:opacity-50",
                (s === "cancelled" || s === "returned") && "text-rose-700",
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATUS_DOT[s])} /> {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>
      {msg && <p className={cn("text-sm font-semibold", msg.ok ? "text-emerald-700" : "text-rose-700")}>{msg.message}</p>}
    </div>
  );
}

export function OrderMetaForm({
  orderId,
  initial,
}: {
  orderId: string;
  initial: { courier: string | null; tracking_code: string | null; admin_note: string | null; payment_status: string };
}) {
  const [state, action, pending] = useActionState(updateOrderMeta.bind(null, orderId), null);
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Courier</span>
          <input name="courier" list="couriers" defaultValue={initial.courier ?? ""} className={adminInput} placeholder="e.g. Steadfast" />
          <datalist id="couriers">
            {COURIERS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Tracking / consignment ID</span>
          <input name="tracking_code" defaultValue={initial.tracking_code ?? ""} className={cn(adminInput, "font-mono")} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Payment</span>
        <select name="payment_status" defaultValue={initial.payment_status} className={adminInput}>
          <option value="unpaid">Unpaid (cash due on delivery)</option>
          <option value="paid">Paid (cash received)</option>
          <option value="refunded">Refunded</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Private note (customer never sees this)</span>
        <textarea name="admin_note" rows={3} defaultValue={initial.admin_note ?? ""} className={cn(adminInput, "h-auto py-2.5")} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-5 text-xs font-bold uppercase tracking-wider text-paper disabled:opacity-50">
          {pending && <Loader2 className="size-3.5 animate-spin" />} Save
        </button>
        {state && <span className={cn("text-sm font-semibold", state.ok ? "text-emerald-700" : "text-rose-700")}>{state.message}</span>}
      </div>
    </form>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch {}
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-xs font-semibold hover:border-ink"
    >
      {done ? <Check className="size-3.5 text-emerald-600" /> : <ClipboardCopy className="size-3.5" />} {done ? "Copied" : label}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wider hover:border-ink">
      <Printer className="size-4" /> Print invoice
    </button>
  );
}
