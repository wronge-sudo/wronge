import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminPanels } from "@/lib/admin-data";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { categoriesOf } from "@/lib/data";
import { PageHeader } from "@/components/admin/ui";
import { PanelForm } from "@/components/admin/panel-form";

export const metadata = { title: "New panel" };
export const instant = false;

export default async function NewPanelPage() {
  const panels = await getAdminPanels();
  return (
    <>
      <Link href="/admin/panels" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All panels
      </Link>
      <PageHeader title="New panel" description="Upload the art, give it a name and category, and it's in the store." />
      <PanelForm panel={null} categories={categoriesOf(panels)} uploadsEnabled={isCloudinaryConfigured()} />
    </>
  );
}
