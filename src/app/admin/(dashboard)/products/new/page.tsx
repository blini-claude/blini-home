import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductEditor } from "@/components/admin/product-editor";
import { getNavTaxonomy } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [collections, distinctCategories, navTaxonomy] = await Promise.all([
    db.collection.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, slug: true, isActive: true },
    }),
    db.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    getNavTaxonomy(),
  ]);

  const categories = distinctCategories
    .map((r) => r.category)
    .filter((c): c is string => Boolean(c));

  const navCategories = navTaxonomy.map((n) => ({
    label: n.label,
    slug: n.slug,
    children: n.children.map((c) => ({ label: c.label, tag: c.tag ?? "" })),
  }));

  return (
    <>
      <AdminHeader title="Produkt i ri" subtitle="Shto një produkt të ri në dyqan" />
      <ProductEditor
        collections={collections}
        categories={categories}
        navCategories={navCategories}
        backHref="/admin/products"
      />
    </>
  );
}
