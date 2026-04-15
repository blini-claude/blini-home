import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await db.siteSettings.upsert({
    where: { id: "main" },
    create: { id: "main" },
    update: {},
  });

  return (
    <>
      <AdminHeader title="Cilësimet" subtitle="Menaxho cilësimet e dyqanit" />
      <div className="p-6 md:p-8">
        <SettingsForm
          settings={{
            ...settings,
            heroSlides: settings.heroSlides as Array<{
              title: string;
              subtitle: string;
              buttonText: string;
              buttonLink: string;
              image: string;
            }>,
          }}
        />
      </div>
    </>
  );
}
