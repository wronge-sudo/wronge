import Image from "next/image";
import Link from "next/link";
import { getAdminPanels, getAdminSizes } from "@/lib/admin-data";
import { cn } from "@/lib/format";
import { Card, PageHeader } from "@/components/admin/ui";
import { PanelStockInput, SizesEditor } from "@/components/admin/inventory-editors";

export const metadata = { title: "Inventory" };
export const instant = false;

export default async function InventoryPage() {
  const [sizes, panels] = await Promise.all([getAdminSizes(), getAdminPanels()]);
  const sorted = [...panels].sort((a, b) => (a.stock ?? Infinity) - (b.stock ?? Infinity));

  return (
    <>
      <PageHeader title="Inventory" description="Stock goes down automatically when an order is placed, and back up if you cancel or return it." />

      <Card title="Jackets by size" className="mb-6">
        <SizesEditor initial={sizes} />
      </Card>

      <Card title="Panel stock" padded={false}>
        <p className="border-b border-line/70 px-5 py-3 text-sm text-muted">
          Leave a panel empty (∞) if you print it on demand. Put a number if you only have a limited run.
        </p>
        <ul className="divide-y divide-line/60">
          {sorted.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-5 py-2.5">
              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-paper-2">
                <Image src={p.image_url} alt="" fill sizes="36px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/admin/panels/${p.id}`} className="block truncate text-sm font-semibold hover:underline">{p.name}</Link>
                <p className={cn("text-xs", p.stock !== null && p.stock <= 3 ? "font-semibold text-rose-700" : "text-muted")}>
                  {p.stock === null ? "Unlimited" : p.stock === 0 ? "Sold out" : `${p.stock} left`}
                  {!p.is_active && " · hidden"}
                </p>
              </div>
              <PanelStockInput id={p.id} stock={p.stock} />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
