import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, Banknote, PackageCheck, Shirt, ShoppingBag, TrendingUp } from "lucide-react";
import { getDashboardStats } from "@/lib/admin-data";
import { cn, formatDate, STATUS_LABEL, taka } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";
import { RevenueChart, StatusBar } from "@/components/admin/charts";
import { BarList, Card, Delta, Notice, PageHeader, STATUS_DOT, StatCard, StatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Dashboard" };
export const instant = false;

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default async function DashboardPage(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  const range = RANGES.find((r) => String(r.days) === sp.range)?.days ?? 30;
  const s = await getDashboardStats(range);
  const mixTotal = s.types.jacket + s.types.pack + s.types.bundle;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Last ${range} days · Bangladesh time · cancelled and returned orders are left out of revenue`}
        actions={
          <div className="flex rounded-full border border-line bg-white p-1">
            {RANGES.map((r) => (
              <Link
                key={r.days}
                href={r.days === 30 ? "/admin" : `/admin?range=${r.days}`}
                className={cn("rounded-full px-3.5 py-1.5 text-xs font-bold", r.days === range ? "bg-ink text-paper" : "text-muted hover:text-ink")}
              >
                {r.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="mb-6 space-y-2">
        {s.pendingCount > 0 && (
          <Notice tone="warn">
            <AlertTriangle className="size-4" />
            <strong>{s.pendingCount} order{s.pendingCount > 1 ? "s" : ""} waiting for confirmation.</strong>
            <span>Call each customer, then confirm.</span>
            <Link href="/admin/orders?status=pending" className="ml-auto font-bold underline underline-offset-2">Open pending orders →</Link>
          </Notice>
        )}
        {(s.lowStock.sizes.length > 0 || s.lowStock.panels.length > 0) && (
          <Notice tone="info">
            <AlertTriangle className="size-4" />
            <strong>Low stock:</strong>
            <span>
              {[...s.lowStock.sizes.map((z) => `Jacket ${z.size} (${z.stock})`), ...s.lowStock.panels.map((p) => `${p.name} (${p.stock})`)].join(" · ")}
            </span>
            <Link href="/admin/inventory" className="ml-auto font-bold underline underline-offset-2">Update stock →</Link>
          </Notice>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent label="Revenue" icon={<TrendingUp className="size-4" />} value={taka(s.now.revenue)} sub={<span className="text-xs text-paper/60">{taka(s.now.collected)} cash collected (delivered)</span>} />
        <StatCard label="Orders" icon={<ShoppingBag className="size-4" />} value={s.now.orders} sub={<Delta value={s.deltas.orders} />} />
        <StatCard label="Avg. order value" icon={<Banknote className="size-4" />} value={taka(s.now.aov)} sub={<Delta value={s.deltas.aov} />} />
        <StatCard label="Jackets sold" icon={<Shirt className="size-4" />} value={s.now.jackets} sub={<Delta value={s.deltas.jackets} />} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line/80 bg-white px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Today</p>
          <p className="mt-1 font-mono text-lg font-bold">{s.today.orders} orders · {taka(s.today.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Revenue change</p>
          <div className="mt-1.5"><Delta value={s.deltas.revenue} /></div>
        </div>
        <div className="rounded-2xl border border-line/80 bg-white px-5 py-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted">
            <PackageCheck className="size-3.5" /> Delivery success
          </p>
          <p className="mt-1 font-mono text-lg font-bold">
            {s.now.successRate === null ? "—" : `${Math.round(s.now.successRate * 100)}%`}
            <span className="ml-2 font-sans text-xs font-normal text-muted">delivered vs cancelled + returned</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Revenue per day" className="xl:col-span-2">
          <RevenueChart series={s.series} />
        </Card>
        <Card title="Order status">
          <StatusBar status={s.status} colors={STATUS_DOT} />
          <ul className="mt-5 space-y-2.5">
            {ORDER_STATUSES.map((st) => (
              <li key={st}>
                <Link href={`/admin/orders?status=${st}`} className="flex items-center justify-between text-sm hover:underline">
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2.5 rounded-full", STATUS_DOT[st])} />
                    {STATUS_LABEL[st]}
                  </span>
                  <span className="font-mono font-semibold">{s.status[st] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card title="Top panels">
          {s.topPanels.length === 0 ? (
            <p className="text-sm text-muted">No panels sold yet.</p>
          ) : (
            <ol className="space-y-3">
              {s.topPanels.map((p, i) => (
                <li key={p.slug} className="flex items-center gap-3">
                  <span className="w-4 font-mono text-xs text-muted">{i + 1}</span>
                  <div className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md bg-paper-2">
                    {p.image && <Image src={p.image} alt="" fill sizes="36px" className="object-cover" />}
                  </div>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
                  <span className="font-mono text-sm font-bold">{p.qty}</span>
                </li>
              ))}
            </ol>
          )}
          {s.customPanels > 0 && <p className="mt-4 border-t border-line pt-3 text-sm text-muted">+ {s.customPanels} custom panel{s.customPanels > 1 ? "s" : ""}</p>}
        </Card>
        <Card title="Jacket sizes sold">
          <BarList rows={s.sizes.map(([label, value]) => ({ label, value }))} empty="No jackets sold yet." />
        </Card>
        <Card title="Where orders go">
          <div className="mb-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-paper-2/70 p-3">
              <p className="font-mono text-xl font-bold">{s.zones.inside_dhaka}</p>
              <p className="text-xs text-muted">Inside Dhaka</p>
            </div>
            <div className="rounded-xl bg-paper-2/70 p-3">
              <p className="font-mono text-xl font-bold">{s.zones.outside_dhaka}</p>
              <p className="text-xs text-muted">Outside Dhaka</p>
            </div>
          </div>
          <BarList rows={s.districts.map(([label, value]) => ({ label, value }))} empty="No deliveries yet." />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="What people buy">
          {mixTotal === 0 ? (
            <p className="text-sm text-muted">Nothing sold yet.</p>
          ) : (
            <BarList
              rows={[
                { label: "4-in-1 sets (jacket + panels)", value: s.types.bundle },
                { label: "Jacket only", value: s.types.jacket },
                { label: "Panel packs", value: s.types.pack },
              ]}
            />
          )}
        </Card>
        <Card title="Latest orders" className="xl:col-span-2" padded={false} action={<Link href="/admin/orders" className="text-xs font-bold underline underline-offset-2">All orders →</Link>}>
          {s.recent.length === 0 ? (
            <p className="p-5 text-sm text-muted">No orders yet. Share the store link and they&apos;ll appear here.</p>
          ) : (
            <ul className="divide-y divide-line/70">
              {s.recent.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-paper-2/40">
                    <span className="w-20 font-mono font-bold">{o.order_number}</span>
                    <span className="min-w-0 flex-1 truncate">{o.customer_name} <span className="text-muted">· {o.district}</span></span>
                    <span className="hidden text-xs text-muted sm:block">{formatDate(o.created_at, true)}</span>
                    <span className="w-20 text-right font-mono font-semibold">{taka(o.total)}</span>
                    <StatusBadge status={o.status} className="hidden md:inline-flex" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
