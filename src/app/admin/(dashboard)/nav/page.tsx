import { AdminHeader } from "@/components/admin/admin-header";
import { NavEditor } from "@/components/admin/nav-editor";
import { getNavTaxonomyForAdmin } from "@/lib/nav";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminNavPage() {
  const [categories, collections] = await Promise.all([
    getNavTaxonomyForAdmin(),
    db.collection.findMany({
      orderBy: { sortOrder: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  const initial = categories.map((c) => ({
    label: c.label,
    slug: c.slug,
    color: c.color,
    promoTitle: c.promoTitle ?? "",
    promoSubtitle: c.promoSubtitle ?? "",
    isActive: c.isActive,
    children: c.children.map((ch) => ({
      label: ch.label,
      tag: ch.tag ?? "",
      href: ch.href ?? "",
    })),
  }));

  return (
    <>
      <AdminHeader
        title="Menyja e dyqanit"
        subtitle="Kategoritë dhe nënkategoritë e navigimit në krye të faqes"
      />
      <NavEditor initial={initial} collectionSlugs={collections} />
    </>
  );
}
