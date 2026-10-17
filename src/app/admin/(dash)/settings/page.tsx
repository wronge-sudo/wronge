import { getAdminSettings } from "@/lib/admin-data";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Settings" };
export const instant = false;

export default async function SettingsPage() {
  const settings = await getAdminSettings();
  return (
    <>
      <PageHeader title="Settings" description="Prices, delivery charges, contact details and the size chart." />
      <SettingsForm settings={settings} />
    </>
  );
}
