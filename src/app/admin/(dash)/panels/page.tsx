import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminPanels } from "@/lib/admin-data";
import { cn } from "@/lib/format";
import { EmptyState, Notice, PageHeader } from "@/components/admin/ui";
import { PanelFlagToggle } from "@/components/admin/panel-form";

export const metadata = { title: "Panels" };
export const instant = false;

export default async function AdminPanelsPage(props: PageProps<"/admin/panels">) {
  const sp = await props.searchParams;
  const panels = await getAdminPanels();
  const active = panels.filter((p) => p.is_active).length;

  return (
    <>
      <PageHeader
        title="Art panels"
        description={`${panels.length} panels · ${active} visible in the store`}
        actions={
          <Link href="/admin/panels/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-xs font-bold uppercase tracking-wider text-paper hover:bg-acid hover:text-ink">
            <Plus className="size-4" /> New panel
          </Link>
        }
      />
      {sp.saved && <div className="mb-4"><Notice tone="ok">Panel created. It&apos;s live in the store if it&apos;s set to visible.</Notice></div>}
      {sp.deleted && <div className="mb-4"><Notice tone="ok">Panel deleted.</Notice></div>}

      {panels.length === 0 ? (
        <EmptyState title="No panels yet">Run the seed SQL, or add your first panel.</EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line/80 bg-white">
          <div className="hidden grid-cols-[64px_1fr_140px_90px_80px_80px] gap-4 border-b border-line/70 bg-paper-2/40 px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted md:grid">
            <span />
            <span>Panel</span>
            <span>Category</span>
            <span className="text-right">Stock</span>
            <span className="text-center">Visible</span>
            <span className="text-center">Featured</span>
          </div>
          <ul className="divide-y divide-line/60">
            {panels.map((p) => (
              <li key={p.id} className={cn("grid grid-cols-[56px_1fr_auto] items-center gap-4 px-4 py-3 md:grid-cols-[64px_1fr_140px_90px_80px_80px]", !p.is_active && "bg-paper-2/30")}>
                <Link href={`/admin/panels/${p.id}`} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-paper-2">
                  <Image src={p.image_url} alt="" fill sizes="64px" className={cn("object-cover", !p.is_active && "opacity-50 grayscale")} />
                </Link>
                <div className="min-w-0">
                  <Link href={`/admin/panels/${p.id}`} className="block truncate font-bold hover:underline">{p.name}</Link>
                  <p className="truncate font-mono text-xs text-muted">/{p.slug}{p.badge && <span className="ml-2 rounded bg-acid px-1.5 py-0.5 font-sans text-[0.6rem] font-bold uppercase text-ink">{p.badge}</span>}</p>
                  <p className="text-xs text-muted md:hidden">{p.category} · {p.stock === null ? "∞" : `${p.stock} left`}</p>
                </div>
                <span className="hidden truncate text-sm md:block">{p.category}</span>
                <span className={cn("hidden text-right font-mono text-sm md:block", p.stock !== null && p.stock <= 3 && "font-bold text-rose-700")}>{p.stock === null ? "∞" : p.stock}</span>
                <span className="flex justify-center"><PanelFlagToggle id={p.id} field="is_active" value={p.is_active} label={`Show ${p.name} in store`} /></span>
                <span className="hidden justify-center md:flex"><PanelFlagToggle id={p.id} field="is_featured" value={p.is_featured} label={`Feature ${p.name}`} /></span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
