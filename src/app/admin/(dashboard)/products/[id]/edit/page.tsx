import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminHeader } from "@/components/admin/admin-header";
import { ProductEditor } from "@/components/admin/product-editor";

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const [product, collections, distinctCategories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        collections: { select: { collectionId: true } },
      },
    }),
    db.collection.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, title: true, slug: true, isActive: true },
    }),
    db.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const initial = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    category: product.category,
    tags: product.tags,
    stock: product.stock,
    images: product.images,
    thumbnail: product.thumbnail,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    sourceStore: product.sourceStore,
    sourceUrl: product.sourceUrl,
    collectionIds: product.collections.map((c) => c.collectionId),
  };

  const categories = distinctCategories
    .map((r) => r.category)
    .filter((c): c is string => Boolean(c));

  return (
    <>
      <AdminHeader title="Ndrysho produktin" subtitle={product.title} />
      <ProductEditor
        product={initial}
        collections={collections}
        categories={categories}
        backHref={from ? `/admin/products?page=${encodeURIComponent(from)}` : "/admin/products"}
      />
    </>
  );
}
