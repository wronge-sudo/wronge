import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminPanel, getAdminPanels } from "@/lib/admin-data";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { categoriesOf } from "@/lib/data";
import { PageHeader } from "@/components/admin/ui";
import { PanelForm } from "@/components/admin/panel-form";

export const metadata = { title: "Edit panel" };
export const instant = false;

export default async function EditPanelPage(props: PageProps<"/admin/panels/[id]">) {
  const { id } = await props.params;
  const [panel, panels] = await Promise.all([getAdminPanel(id), getAdminPanels()]);
  if (!panel) notFound();
  return (
    <>
      <Link href="/admin/panels" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All panels
      </Link>
      <PageHeader
        title={panel.name}
        actions={
          panel.is_active && (
            <Link href={`/panels/${panel.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-xs font-bold uppercase tracking-wider hover:border-ink">
              View in store <ExternalLink className="size-3.5" />
            </Link>
          )
        }
      />
      <PanelForm panel={panel} categories={categoriesOf(panels)} uploadsEnabled={isCloudinaryConfigured()} />
    </>
  );
}
