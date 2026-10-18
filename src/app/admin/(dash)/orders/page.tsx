import Link from "next/link";
import Form from "next/form";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { getOrders } from "@/lib/admin-data";
import { cn, formatDate, STATUS_LABEL, taka } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";
import { adminInput, EmptyState, PageHeader, StatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Orders" };
export const instant = false;

const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const filters = {
    status: str(sp.status) ?? "all",
    q: str(sp.q),
    from: str(sp.from),
    to: str(sp.to),
    page: Number(str(sp.page) ?? 1) || 1,
  };
  const { orders, total, page, pages, counts } = await getOrders(filters);

  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...filters, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v && !(k === "status" && v === "all") && !(k === "page" && v === 1)) p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportQs = new URLSearchParams({ type: "orders", ...(filters.status !== "all" && { status: filters.status }), ...(filters.q && { q: filters.q }), ...(filters.from && { from: filters.from }), ...(filters.to && { to: filters.to }) });

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${total} order${total === 1 ? "" : "s"} found`}
        actions={
          <a href={`/api/admin/export?${exportQs}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wider hover:border-ink">
            <Download className="size-4" /> Export CSV
          </a>
        }
      />

      <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["all", ...ORDER_STATUSES] as const).map((st) => (
          <Link
            key={st}
            href={`/admin/orders${qs({ status: st, page: 1 })}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition",
              filters.status === st ? "bg-ink text-paper" : "border border-line bg-white text-muted hover:border-ink hover:text-ink",
            )}
          >
            {st === "all" ? "All" : STATUS_LABEL[st]}
            <span className={cn("rounded-full px-1.5 font-mono text-[0.65rem]", filters.status === st ? "bg-primary text-paper" : "bg-paper-2")}>{counts[st] ?? 0}</span>
          </Link>
        ))}
      </div>

      <Form action="/admin/orders" className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        {filters.status !== "all" && <input type="hidden" name="status" value={filters.status} />}
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={filters.q} placeholder="Search order no., name or phone" className={cn(adminInput, "pl-9")} />
        </label>
        <input type="date" name="from" defaultValue={filters.from} className={cn(adminInput, "sm:w-40")} aria-label="From date" />
        <input type="date" name="to" defaultValue={filters.to} className={cn(adminInput, "sm:w-40")} aria-label="To date" />
        <button type="submit" className="h-11 rounded-xl bg-ink px-5 text-xs font-bold uppercase tracking-wider text-paper hover:bg-ink-3">Search</button>
      </Form>
      {(filters.q || filters.from || filters.to) && (
        <p className="-mt-2 mb-4 text-xs text-muted">
          Filtered. <Link href={`/admin/orders${filters.status !== "all" ? `?status=${filters.status}` : ""}`} className="font-bold underline">Clear search</Link>
        </p>
      )}

      {orders.length === 0 ? (
        <EmptyState title="No orders here">{filters.status === "all" && !filters.q ? "New orders from the store will appear here." : "Try another filter."}</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line/80 bg-white">
          <table className="hidden w-full text-sm md:table">
            <thead className="border-b border-line/70 bg-paper-2/40 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Order</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">Customer</th>
                <th className="px-4 py-3 font-bold">Area</th>
                <th className="px-4 py-3 text-right font-bold">Items</th>
                <th className="px-4 py-3 text-right font-bold">Total</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {orders.map((o) => (
                <tr key={o.id} className="group relative hover:bg-paper-2/40">
                  <td className="px-4 py-3 font-mono font-bold">
                    <Link href={`/admin/orders/${o.id}`} className="after:absolute after:inset-0">{o.order_number}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(o.created_at, true)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.customer_name}</p>
                    <p className="font-mono text-xs text-muted">{o.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    {o.district}
                    <p className="text-xs text-muted">{o.delivery_zone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{o.order_items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold">{taka(o.total)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                    {o.courier && <p className="mt-1 text-xs text-muted">{o.courier}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-line/60 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="block px-4 py-3.5 active:bg-paper-2/60">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono font-bold">{o.order_number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-1.5 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.customer_name}</p>
                      <p className="text-xs text-muted">{o.district} · {formatDate(o.created_at, true)}</p>
                    </div>
                    <span className="font-mono font-bold">{taka(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-muted">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Link aria-disabled={page <= 1} href={`/admin/orders${qs({ page: page - 1 })}`} className={cn("inline-flex h-10 items-center gap-1 rounded-full border border-line bg-white px-4 font-semibold", page <= 1 && "pointer-events-none opacity-40")}>
              <ChevronLeft className="size-4" /> Prev
            </Link>
            <Link aria-disabled={page >= pages} href={`/admin/orders${qs({ page: page + 1 })}`} className={cn("inline-flex h-10 items-center gap-1 rounded-full border border-line bg-white px-4 font-semibold", page >= pages && "pointer-events-none opacity-40")}>
              Next <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
