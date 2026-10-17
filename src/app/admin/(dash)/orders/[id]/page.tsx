import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ExternalLink, MessageCircle, Phone } from "lucide-react";
import { ASSETS, asset } from "@/config/assets";
import { getAdminSettings, getOrder } from "@/lib/admin-data";
import { cn, formatDate, STATUS_LABEL, taka } from "@/lib/format";
import { Card, StatusBadge } from "@/components/admin/ui";
import { CopyButton, OrderMetaForm, PrintButton, StatusControl } from "@/components/admin/order-controls";

export const metadata = { title: "Order" };
export const instant = false;

export default async function OrderDetailPage(props: PageProps<"/admin/orders/[id]">) {
  const { id } = await props.params;
  const [data, settings] = await Promise.all([getOrder(id), getAdminSettings()]);
  if (!data) notFound();
  const { order: o, items, events, history } = data;
  const failedBefore = history.filter((h) => h.status === "cancelled" || h.status === "returned").length;
  const intlPhone = `880${o.phone.replace(/^0/, "")}`;
  const courierText = [
    o.customer_name,
    o.phone,
    [o.address, o.area, o.district].filter(Boolean).join(", "),
    `COD: ${o.total} BDT`,
    `Ref: ${o.order_number}`,
  ].join("\n");

  return (
    <>
      {/* ───────── Screen view ───────── */}
      <div className="print:hidden">
        <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
          <ArrowLeft className="size-4" /> All orders
        </Link>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="display-narrow font-mono text-3xl sm:text-4xl">{o.order_number}</h1>
          <StatusBadge status={o.status} />
          <span className="text-sm text-muted">Placed {formatDate(o.created_at, true)}</span>
          <div className="ml-auto">
            <PrintButton />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <Card title={`Items (${items.reduce((s, i) => s + i.quantity, 0)})`} padded={false}>
              <ul className="divide-y divide-line/70">
                {items.map((it) => (
                  <li key={it.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold uppercase tracking-tight">
                          {it.title} <span className="font-mono text-muted">× {it.quantity}</span>
                        </p>
                        {it.size && <p className="mt-0.5 text-sm">Size <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-xs font-bold text-acid">{it.size}</span></p>}
                      </div>
                      <div className="text-right font-mono text-sm">
                        <p className="font-bold">{taka(it.line_total)}</p>
                        <p className="text-xs text-muted">{taka(it.unit_price)} each</p>
                      </div>
                    </div>
                    {it.panels.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {it.panels.map((p, i) => (
                          <div key={i} className="w-[92px]">
                            <div className={cn("relative aspect-[3/4] overflow-hidden rounded-lg bg-paper-2", p.custom && "ring-2 ring-signal")}>
                              <Image src={p.image} alt={p.name} fill sizes="92px" className="object-cover" />
                            </div>
                            <p className="mt-1 truncate text-xs font-semibold">{p.name}</p>
                            {p.custom && (
                              <>
                                <a href={p.custom.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-signal underline">
                                  Original file <ExternalLink className="size-3" />
                                </a>
                                <p className="font-mono text-[0.6rem] text-muted">zoom {p.custom.zoom.toFixed(2)} · x {p.custom.x} · y {p.custom.y}</p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <dl className="space-y-1.5 border-t border-line/70 bg-paper-2/30 px-5 py-4 font-mono text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{taka(o.subtotal)}</dd></div>
                {o.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>−{taka(o.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted">Delivery ({o.delivery_zone === "inside_dhaka" ? "inside Dhaka" : "outside Dhaka"})</dt><dd>{o.delivery_fee ? taka(o.delivery_fee) : "Free"}</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Cash to collect</dt><dd>{taka(o.total)}</dd></div>
                <div className="flex justify-between text-xs"><dt className="text-muted">Payment</dt><dd className={o.payment_status === "paid" ? "text-emerald-700" : ""}>{o.payment_status.toUpperCase()}</dd></div>
              </dl>
            </Card>

            <Card title="Courier & notes">
              <OrderMetaForm orderId={o.id} initial={{ courier: o.courier, tracking_code: o.tracking_code, admin_note: o.admin_note, payment_status: o.payment_status }} />
            </Card>

            <Card title="Timeline">
              <ol className="space-y-4">
                {events.map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" />
                    <div>
                      <p className="text-sm font-semibold">{STATUS_LABEL[e.status] ?? e.status}{e.note && <span className="font-normal text-muted"> · {e.note}</span>}</p>
                      <p className="text-xs text-muted">{formatDate(e.created_at, true)} · {e.created_by ?? "system"}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Update status">
              <StatusControl orderId={o.id} status={o.status} />
            </Card>

            <Card title="Customer">
              <p className="text-lg font-bold">{o.customer_name}</p>
              <p className="font-mono text-sm">{o.phone}</p>
              {o.email && <p className="text-sm text-muted">{o.email}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`tel:${o.phone}`} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-paper"><Phone className="size-3.5" /> Call</a>
                <a href={`https://wa.me/${intlPhone}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-xs font-semibold text-white"><MessageCircle className="size-3.5" /> WhatsApp</a>
              </div>
              <div className="mt-5 border-t border-line/70 pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">Deliver to</p>
                <p className="mt-1 text-sm leading-relaxed">
                  {o.address}
                  {o.area && <>, {o.area}</>}
                  <br />
                  <strong>{o.district}</strong> · {o.delivery_zone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                </p>
                <div className="mt-3"><CopyButton text={courierText} label="Copy for courier" /></div>
              </div>
              {o.note && (
                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Customer note</p>
                  <p className="mt-0.5">{o.note}</p>
                </div>
              )}
            </Card>

            <Card title="Order history (same phone)">
              {failedBefore > 0 && (
                <p className="mb-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {failedBefore} earlier order{failedBefore > 1 ? "s were" : " was"} cancelled or returned. Confirm carefully.
                </p>
              )}
              {history.length === 0 ? (
                <p className="text-sm text-muted">First order from this number.</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((h) => (
                    <li key={h.id}>
                      <Link href={`/admin/orders/${h.id}`} className="flex items-center justify-between gap-2 text-sm hover:underline">
                        <span className="font-mono font-semibold">{h.order_number}</span>
                        <span className="text-xs text-muted">{formatDate(h.created_at)}</span>
                        <StatusBadge status={h.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* ───────── Printable invoice ───────── */}
      <div className="hidden bg-white text-black print:block">
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <Image src={asset(ASSETS.wordmarkBlack)} alt="Wronge" width={980} height={210} className="h-8 w-auto" />
            <p className="mt-2 text-xs">{[settings.support_phone, settings.support_email].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black uppercase">Invoice</p>
            <p className="font-mono text-lg font-bold">{o.order_number}</p>
            <p className="text-xs">{formatDate(o.created_at, true)}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-bold uppercase">Deliver to</p>
            <p className="mt-1 font-bold">{o.customer_name}</p>
            <p className="font-mono">{o.phone}</p>
            <p>{[o.address, o.area, o.district].filter(Boolean).join(", ")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase">Payment</p>
            <p className="mt-1 font-bold">Cash on delivery</p>
            {o.courier && <p>{o.courier}{o.tracking_code && ` · ${o.tracking_code}`}</p>}
          </div>
        </div>
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-black text-left text-xs uppercase">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Size</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-black/20 align-top">
                <td className="py-2">
                  <p className="font-bold">{it.title}</p>
                  {it.panels.length > 0 && <p className="text-xs">{it.panels.map((p) => p.name).join(", ")}</p>}
                </td>
                <td className="py-2 text-center">{it.size ?? "—"}</td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-right">{taka(it.unit_price)}</td>
                <td className="py-2 text-right">{taka(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ml-auto mt-4 w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{taka(o.subtotal)}</span></div>
          {o.discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{taka(o.discount)}</span></div>}
          <div className="flex justify-between"><span>Delivery</span><span>{taka(o.delivery_fee)}</span></div>
          <div className="flex justify-between border-t-2 border-black pt-1 text-lg font-black"><span>Collect</span><span>{taka(o.total)}</span></div>
        </div>
        <p className="mt-10 text-center text-xs">Thank you for wearing it Wronge. Size exchange within 7 days, unworn with tags.</p>
      </div>
    </>
  );
}
